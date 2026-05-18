import openWc from '@open-wc/eslint-config';
import cypress from 'eslint-plugin-cypress';
import prettier from 'eslint-config-prettier';

export default [
  ...openWc,
  prettier,
  {
    files: ['test/cypress/**/*.js', 'cypress.config.js'],
    plugins: { cypress },
    languageOptions: {
      globals: {
        ...cypress.configs.globals.globals
      }
    }
  },
  {
    files: ['gulpfile.mjs', 'scripts/**/*.mjs'],
    rules: {
      'import-x/no-extraneous-dependencies': 'off'
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'bower_components/**', 'build/**']
  }
];
