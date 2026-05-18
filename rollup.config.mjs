import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const production = process.env.BUILD === 'production';

const external = (id) =>
  id === 'lit' ||
  id.startsWith('lit/') ||
  id === '@awesome.me/webawesome' ||
  id.startsWith('@awesome.me/webawesome/');

export default {
  input: {
    'existdb-launcher': 'src/existdb-launcher.js',
    'existdb-launcher-app': 'src/existdb-launcher-app.js',
    'existdb-login': 'src/existdb-login.js'
  },
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: '[name].js',
    sourcemap: !production
  },
  external,
  plugins: [
    resolve({ browser: true }),
    production &&
      terser({
        ecma: 2022,
        module: true,
        format: { comments: false }
      })
  ]
};
