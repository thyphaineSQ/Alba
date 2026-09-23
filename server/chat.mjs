// Ask Alba: server-side proxy to the Claude API.
// The API key never reaches the browser. The client sends the page it is on,
// the live figures shown there, and the conversation; we stream text back as SSE.
import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.ALBA_MODEL || 'claude-opus-5';
const MAX_MESSAGES = 20;
const MAX_CHARS = 1200;
const RATE_LIMIT = 15; // requests per minute per client
const hits = new Map();

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return null;
  if (!client) client = new Anthropic();
  return client;
}

function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 64_000) reject(new Error('Body too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const clip = (s, n) => String(s ?? '').slice(0, n);

function systemPrompt({ firstName, context }) {
  return [
    'You are Alba, the in-app guide of Alba by Swissquote, a calm investing app for beginners in Switzerland (mostly women, not only).',
    `The user is ${firstName}. Today is September 2026 and they have been investing monthly since September 2024.`,
    `What the user sees on this page: ${context}`,
    'Answer in plain, warm words, at most 70 words. Amounts in CHF with Swiss apostrophes (CHF 1’200).',
    'Explain, never give personal buy or sell advice and never promise returns.',
    'Never use the em dash character. No markdown, no lists, no headings.',
    'Latency-sensitive; begin your visible answer immediately.',
  ].join(' ');
}

export async function handleChat(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const anthropic = getClient();
  if (!anthropic) return json(res, 503, { error: 'not_configured' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'local';
  if (limited(ip)) return json(res, 429, { error: 'rate_limited' });

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { error: 'bad_request' });
  }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .slice(-MAX_MESSAGES)
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string' && m.text.trim())
    .map(m => ({ role: m.role, content: clip(m.text, MAX_CHARS) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return json(res, 400, { error: 'bad_request' });
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  const controller = new AbortController();
  res.on('close', () => controller.abort());

  try {
    const stream = anthropic.beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 4096,
        output_config: { effort: 'low' },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: systemPrompt({
          firstName: clip(body.firstName || 'Camille', 40),
          context: clip(body.context, 2000),
        }),
        messages,
      },
      { signal: controller.signal },
    );

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        send('delta', { text: event.delta.text });
      }
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') send('refusal', {});
    send('done', {});
  } catch (err) {
    if (controller.signal.aborted) return;
    const status = err instanceof Anthropic.APIError ? err.status : undefined;
    console.error('[ask-alba]', status ?? '', err?.message ?? err);
    send('error', { status: status ?? 500 });
  }
  res.end();
}
