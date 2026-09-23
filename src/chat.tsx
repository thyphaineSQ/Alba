import { AnimatePresence, motion } from 'motion/react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ASK, TABS, chf, type Tab } from './data';
import { learnProgress, useApp, type Derived, type State } from './store';
import { Sheet, SheetHeader, Sparkle, ease } from './ui';

type Msg = { role: 'user' | 'assistant'; text: string; error?: boolean };
type ChatCtx = { openChat: (question?: string) => void };
const Ctx = createContext<ChatCtx>({ openChat: () => {} });
export const useChat = () => useContext(Ctx);

const FIRST_NAME = 'Camille';

/* ---------- what the assistant knows about the page ---------- */
function pageContext(tab: Tab, s: State, d: Derived): string {
  const h = d.holdings, g = d.gains;
  const pay = s.paused ? 'Monthly payments are paused.' : `Next payment 1 Oct, ${chf(s.monthly)}.`;
  switch (tab) {
    case 'home':
      return `Home: balance ${chf(d.balance)}, +${chf(d.yearGain)} this year, ${chf(d.paidIn)} paid in since Sep 2024 at ${chf(s.amount)}/month. Projection to 2034 at about 4% a year: about ${chf(d.projection)}. ${pay} Meet-up "Coffee & first investments", Zürich, 24 Sep 18:30. Amina asked the circle "Is 200 too little?".`;
    case 'wealth':
      return `Wealth ${chf(d.balance)}: ETFs ${chf(d.etfs)} (World fund ${chf(h.world)} ${g.world >= 0 ? '+' : ''}${g.world}, Swiss fund ${chf(h.swiss)} +${g.swiss}), Themes ${chf(d.themes)} (Climate Transition ${chf(h.climate)} +${g.climate}, Women in Leadership ${chf(h.women)} ${g.women}), Pension 3a ${chf(h.pension)} (+${g.pension}, CHF 6’400 left to save tax-free this year), Cash ${chf(h.cash)} ${s.cashInvested ? '(just invested into the World fund)' : 'not invested'}. ${pay}`;
    case 'discover':
      return `Discover lists ETFs (world, regions, sectors, bonds, dividends, sustainable) and themes, each with fee, members holding it, recent change and a risk label Calm, Steady or Bold (movement, not quality). The user's pace is ${d.pace} (${d.worldPct}% world funds) and their themes are ${d.picked.map(t => t.short).join(', ') || 'none'}. In their mix: ${s.mix.join(', ') || 'nothing added yet'}.`;
    case 'circle':
      return `Circle: events (meet-up Zürich 24 Sep, 3a webinar 2 Oct), investors to follow showing only percentages (Sophie +7.4%, Marta +5.9%, Lena +6.8%), posts: Amina "Markets dipped and I did nothing", Sophie "Two years today, CHF 4’800 in", Daniel "Asked my first question last month". Threads: worrying when prices drop, how much cash to keep, 3a when self-employed. Posting is anonymous.`;
    case 'learn': {
      const p = learnProgress(s);
      return `Learn: short videos in 6 chapters (Getting started, ETFs, Themes and shares, Pension 3a and taxes, When markets fall, Building your own mix). ${p.done} of ${p.total} watched. Current video id ${s.currentVideo}; chapter 1 is done and chapter 2 starts with "What is an ETF?".`;
    }
  }
}

/* ---------- streaming client ---------- */
async function streamAnswer(
  body: unknown,
  onDelta: (t: string) => void,
  signal: AbortSignal,
): Promise<'ok' | 'refusal' | 'offline' | 'busy' | 'error' | 'config'> {
  let res: Response;
  try {
    res = await fetch(`${import.meta.env.BASE_URL}api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    return signal.aborted ? 'ok' : 'offline';
  }
  if (res.status === 429) return 'busy';
  if (!res.ok || !res.body || !res.headers.get('content-type')?.includes('text/event-stream')) return 'offline';

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '', outcome: 'ok' | 'refusal' | 'error' | 'config' = 'ok';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let cut;
    while ((cut = buffer.indexOf('\n\n')) >= 0) {
      const chunk = buffer.slice(0, cut);
      buffer = buffer.slice(cut + 2);
      const event = /^event: (.*)$/m.exec(chunk)?.[1];
      const data = /^data: (.*)$/m.exec(chunk)?.[1];
      if (event === 'delta' && data) onDelta(JSON.parse(data).text);
      if (event === 'refusal') outcome = 'refusal';
      if (event === 'error') outcome = [401, 403].includes(JSON.parse(data ?? '{}').status) ? 'config' : 'error';
    }
  }
  return outcome;
}

const FALLBACK = {
  offline: 'Ask Alba isn’t connected in this demo. Run it with an ANTHROPIC_API_KEY on the server to get live answers.',
  busy: 'Lots of questions at once. Give me a minute and ask again.',
  config: 'Ask Alba can’t sign in to the Claude API. Check the ANTHROPIC_API_KEY on the server.',
  error: 'I can’t answer right now. Try again in a moment.',
  refusal: 'That’s not something I can help with here. Try asking it another way, or ask your circle.',
};

/* ---------- provider, button and sheet ---------- */
export function ChatProvider({ children }: { children: ReactNode }) {
  const { s, d } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const tab = (TABS as readonly string[]).includes(s.screen) ? (s.screen as Tab) : 'home';

  // A new page means a new conversation, as in the design.
  useEffect(() => {
    abort.current?.abort();
    setOpen(false);
    setMessages([]);
    setInput('');
    setLoading(false);
  }, [s.screen]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const ask = useCallback(async (raw: string, history: Msg[]) => {
    const text = raw.trim();
    if (!text) return;
    const next: Msg[] = [...history.filter(m => !m.error), { role: 'user', text }];
    setMessages([...next, { role: 'assistant', text: '' }]);
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    abort.current = controller;
    const outcome = await streamAnswer(
      { firstName: FIRST_NAME, page: tab, context: pageContext(tab, s, d), messages: next },
      delta => {
        setLoading(false);
        setMessages(m => {
          const copy = m.slice();
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, text: (last.text + delta).replace(/\u2014/g, ',') };
          return copy;
        });
      },
      controller.signal,
    );
    if (controller.signal.aborted) return;
    setLoading(false);
    setMessages(m => {
      const last = m[m.length - 1];
      if (outcome === 'ok' && last.text) return m;
      const reason = outcome === 'ok' ? 'error' : outcome;
      return [...m.slice(0, -1), { role: 'assistant', text: last.text ? `${last.text}\n\n${FALLBACK[reason]}` : FALLBACK[reason], error: true }];
    });
  }, [tab, s, d]);

  const openChat = useCallback((question?: string) => {
    setOpen(true);
    if (question) window.setTimeout(() => ask(question, []), 250);
  }, [ask]);

  const close = useCallback(() => {
    abort.current?.abort();
    setLoading(false);
    setOpen(false);
  }, []);

  const suggestions = ASK[tab].q.map(q => q.replace('CHF 200', chf(s.monthly)));
  const showFab = (TABS as readonly string[]).includes(s.screen) && !open;
  const value = useMemo(() => ({ openChat }), [openChat]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <AnimatePresence>
        {showFab && (
          <motion.button
            key="fab"
            onClick={() => setOpen(true)}
            aria-label="Ask Alba"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26, delay: 0.1 }}
            style={{
              position: 'absolute', right: 18, bottom: 96, zIndex: 15, width: 52, height: 52, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 24px -8px rgba(250,91,53,.7), 0 2px 6px rgba(0,0,0,.12)',
            }}
          ><Sparkle /></motion.button>
        )}
      </AnimatePresence>

      <Sheet open={open} onClose={close} label="Ask Alba">
        <SheetHeader
          icon={<span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkle size={17} small={false} /></span>}
          title="Ask Alba"
          sub={ASK[tab].ctx}
          onClose={close}
        />
        <div ref={scroller} style={{ flex: 1, overflowY: 'auto', padding: '4px 22px 12px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 120 }}>
          {messages.length === 0 && (
            <>
              <div className="label" style={{ paddingTop: 4 }}>Suggested for this page</div>
              {suggestions.map((q, i) => (
                <motion.button
                  key={q}
                  onClick={() => ask(q, [])}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease, delay: 0.12 + i * 0.05 }}
                  whileHover={{ borderColor: '#FA5B35' }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 18, border: '1px solid var(--stroke)', width: '100%' }}
                >
                  <span style={{ flex: 1, fontSize: 14.5, lineHeight: 1.35 }}>{q}</span>
                  <svg viewBox="0 0 14 14" style={{ width: 12, height: 12, flex: 'none' }} aria-hidden><path d="M3 7 H11 M7.5 3.5 L11 7 L7.5 10.5" fill="none" stroke="#FA5B35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </motion.button>
              ))}
            </>
          )}
          {messages.map((m, i) =>
            m.role === 'assistant' && !m.text ? null : (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25, ease }}
                style={m.role === 'user'
                  ? { alignSelf: 'flex-end', maxWidth: '82%', background: 'var(--ink)', color: '#fff', borderRadius: '18px 18px 4px 18px', padding: '11px 14px', fontSize: 14, lineHeight: 1.45, transformOrigin: 'bottom right' }
                  : { alignSelf: 'flex-start', maxWidth: '88%', background: 'var(--field)', color: m.error ? 'var(--ink-2)' : undefined, borderRadius: '18px 18px 18px 4px', padding: '11px 14px', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', textWrap: 'pretty', transformOrigin: 'bottom left' }}
              >{m.text}</motion.div>
            ),
          )}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start', background: 'var(--field)', borderRadius: '18px 18px 18px 4px', padding: '14px 16px', display: 'flex', gap: 5 }} aria-label="Thinking">
              {[0, 1, 2].map(i => (
                <motion.span key={i} animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)' }} />
              ))}
            </motion.div>
          )}
        </div>
        <form
          onSubmit={e => { e.preventDefault(); if (!loading) ask(input, messages); }}
          style={{ padding: '10px 18px 26px', borderTop: '1px solid rgba(0,0,0,.08)', display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <div className="field" style={{ padding: '6px 6px 6px 16px', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything about your money" aria-label="Ask anything about your money" style={{ fontSize: 14 }} />
            <motion.button
              type="submit" whileTap={{ scale: 0.9 }} aria-label="Send" disabled={loading || !input.trim()}
              style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading || !input.trim() ? 0.5 : 1, transition: 'opacity .2s' }}
            >
              <svg viewBox="0 0 14 14" style={{ width: 13, height: 13 }} aria-hidden><path d="M7 11.5 V2.5 M3 6.5 L7 2.5 L11 6.5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </motion.button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--faint)', textAlign: 'center' }}>Alba explains, it doesn’t give personal advice.</div>
        </form>
      </Sheet>
    </Ctx.Provider>
  );
}
