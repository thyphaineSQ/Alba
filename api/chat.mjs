// Vercel serverless function: same Ask Alba proxy as the Node server, served at /api/chat.
import { handleChat } from '../server/chat.mjs';

export default function handler(req, res) {
  return handleChat(req, res);
}
