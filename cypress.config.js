import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'cypress';

function listLauncherComponentsSync() {
  const srcDir = path.resolve(import.meta.dirname, 'src');
  const tags = [
    'existdb-launcher',
    'existdb-launcher-app',
    'existdb-login',
    'existdb-branding',
    'existdb-version',
    'launcher-app'
  ];
  try {
    return fs
      .readdirSync(srcDir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.js') && e.name !== 'existdb-styles.js')
      .map((e) => {
        const abs = path.join(srcDir, e.name);
        const src = fs.readFileSync(abs, 'utf8');
        const m = src.match(/customElements\.define\(\s*['"`]([^'"`]+)['"`]/);
        if (!m || !tags.includes(m[1])) return null;
        return { file: e.name, tag: m[1] };
      })
      .filter(Boolean);
  } catch (e) {
    console.error('listLauncherComponentsSync failed:', e);
    return [];
  }
}

export default defineConfig({
  includeShadowDom: true,
  retries: 1,
  screenshotsFolder: 'test/cypress/screenshots',
  videosFolder: 'test/cypress/videos',
  fixturesFolder: 'test/cypress/fixtures',
  downloadsFolder: 'test/cypress/downloads',
  component: {
    devServer: {
      framework: 'vite',
      bundler: 'vite',
      viteConfig: {
        server: { open: false }
      }
    },
    specPattern: 'test/cypress/component/**/*.cy.{js,ts}',
    supportFile: 'test/cypress/support/component.js',
    indexHtmlFile: 'test/cypress/support/component-index.html',
    env: {
      components: listLauncherComponentsSync()
    }
  },
  e2e: {
    baseUrl: process.env.CYPRESS_baseUrl || 'http://localhost:5173',
    specPattern: 'test/cypress/e2e/**/*.cy.{js,ts}',
    supportFile: 'test/cypress/support/e2e.js'
  }
});
