// Production server: serves the built app from dist/ and the Ask Alba endpoint.
// Usage: npm run build && npm start   (reads ANTHROPIC_API_KEY from .env if present)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleChat } from './chat.mjs';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT) || 8787;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.otf': 'font/otf',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

async function serveStatic(req, res) {
  const url = new URL(req.url, 'http://x');
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
  if (path.startsWith('..')) path = '';
  let file = join(root, path);
  try {
    if (!(await stat(file)).isFile()) file = join(root, 'index.html');
  } catch {
    file = join(root, 'index.html');
  }
  const body = await readFile(file);
  res.setHeader('Content-Type', TYPES[extname(file)] || 'application/octet-stream');
  if (file.includes('/assets/') || file.includes('/fonts/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  res.end(body);
}

createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/chat')) return await handleChat(req, res);
    await serveStatic(req, res);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end('Server error');
  }
}).listen(port, () => {
  console.log(`Alba on http://localhost:${port}`);
  if (!process.env.ANTHROPIC_API_KEY) console.log('Ask Alba is off: set ANTHROPIC_API_KEY in .env');
});
