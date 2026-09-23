import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Mounts the Ask Alba proxy on the Vite dev and preview servers,
// so `npm run dev` gives the full app including live answers.
function askAlba(): Plugin {
  const mount = (server: { middlewares: { use: (path: string, fn: (req: any, res: any) => void) => void } }) => {
    server.middlewares.use('/api/chat', async (req, res) => {
      // @ts-ignore plain ESM module shared with the production server
      const { handleChat } = await import('./server/chat.mjs');
      handleChat(req, res);
    });
  };
  return { name: 'ask-alba', configureServer: mount, configurePreviewServer: mount };
}

export default defineConfig(({ mode }) => {
  // Expose server-only keys to the Node side (never to the client bundle).
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'ALBA_MODEL']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }
  return {
    base: './',
    plugins: [react(), askAlba()],
  };
});
