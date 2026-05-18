import { defineConfig } from 'vite';

const isCypress = !!process.env.CYPRESS;

export default defineConfig({
  root: '.',
  resolve: {
    dedupe: ['@awesome.me/webawesome']
  },
  server: {
    port: 5173,
    open: isCypress ? false : '/demo/index.html',
    cors: true
  },
  optimizeDeps: isCypress
    ? {
        entries: ['test/cypress/support/component-index.html'],
        noDiscovery: true
      }
    : {}
});
