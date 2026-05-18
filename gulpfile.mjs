import gulp from 'gulp';
import { createClient } from '@existdb/gulp-exist';
import zip from 'gulp-zip';
import { promises as fs, existsSync, readFileSync } from 'node:fs';
import { XMLParser } from 'fast-xml-parser';

const PRODUCTION = process.env.NODE_ENV === 'production';

console.log('Production? %s', PRODUCTION);

const exClient = createClient({
  host: 'localhost',
  port: '8080',
  path: '/exist/xmlrpc',
  secure: false,
  basic_auth: { user: 'admin', pass: '' }
});

const html5TargetConfiguration = {
  target: '/db/apps/launcher',
  html5AsBinary: true
};

const targetConfiguration = {
  target: '/db/apps/launcher/'
};

function getPackageInfo() {
  const xmlContent = readFileSync('./expath-pkg.xml', 'utf-8');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true
  });
  const result = parser.parse(xmlContent);
  const pkg = result.package;
  return {
    name: pkg['@_name'],
    version: pkg['@_version'],
    abbrev: pkg['@_abbrev']
  };
}

const packageInfo = getPackageInfo();
const xarName = `${packageInfo.abbrev || 'launcher'}-${packageInfo.version}.xar`;

gulp.task('clean', async () => {
  await fs.rm('build', { recursive: true, force: true });
});

gulp.task('copy:scripts', () => {
  return gulp
    .src(
      [
        'dist/**/*',
        'node_modules/lit/**/*.js',
        'node_modules/@lit/**/*.js',
        'node_modules/lit-html/**/*.js',
        'node_modules/lit-element/**/*.js',
        'node_modules/@awesome.me/webawesome/dist/**/*'
      ],
      { base: '.' }
    )
    .pipe(gulp.dest('build/resources/scripts'));
});

gulp.task('copy:project', () => {
  const projectFiles = [
    '*.xml',
    '*.xql',
    'index.html',
    'icon.svg',
    'modules/**/*',
    'resources/**/*',
    'demo/*.html',
    '!gulpfile.mjs',
    '!rollup.config.mjs',
    '!vite.config.js',
    '!cypress.config.js',
    '!eslint.config.js'
  ];

  return gulp.src(projectFiles, { base: '.' }).pipe(gulp.dest('build'));
});

gulp.task('build', gulp.series('clean', 'copy:scripts', 'copy:project'));

gulp.task(
  'xar',
  gulp.series('build', () => {
    return gulp.src('build/**/*', { base: 'build' }).pipe(zip(xarName)).pipe(gulp.dest('build'));
  })
);

gulp.task(
  'install',
  gulp.series('xar', () => {
    return gulp.src(`build/${xarName}`, { encoding: false }).pipe(exClient.install());
  })
);

const otherPaths = ['*.xql', 'modules/**/*', 'resources/**/*'];

gulp.task('deploy:other', () => {
  return gulp
    .src(otherPaths, { base: './' })
    .pipe(exClient.newer(targetConfiguration))
    .pipe(exClient.dest(targetConfiguration));
});

const componentPaths = ['index.html', 'dist/**/*.js', 'resources/scripts/**/*'];

gulp.task('deploy:components', () => {
  return gulp
    .src(componentPaths, { base: './' })
    .pipe(exClient.newer(html5TargetConfiguration))
    .pipe(exClient.dest(html5TargetConfiguration));
});

gulp.task('deploy', gulp.parallel('deploy:other', 'deploy:components'));

gulp.task('watch', () => {
  gulp.watch(otherPaths, gulp.series('deploy:other'));
  gulp.watch(['index.html', 'dist/**/*.js'], gulp.series('deploy:components'));
});

gulp.task('default', gulp.series('watch'));
