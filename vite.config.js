// Vite settings. "base: './'" makes the finished site work from any folder or free host.
// The AI bridge plugin adds "Sign in with ChatGPT" to the dev server only (npm run dev); see tools/vite-ai-bridge.mjs.
import { defineConfig } from 'vite';
import aiBridge from './tools/vite-ai-bridge.mjs';

export default defineConfig({
  base: './',
  plugins: [aiBridge()],
  build: { chunkSizeWarningLimit: 1500 },
  server: { watch: { ignored: ['**/.local/**', '**/mcp/**'] } },
});
