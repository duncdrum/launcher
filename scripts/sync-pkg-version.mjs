import { readFileSync, writeFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const pkgPath = 'expath-pkg.xml';
const xml = readFileSync(pkgPath, 'utf8');
const updated = xml.replace(/version="[^"]+"/, `version="${pkg.version}"`);

if (updated === xml) {
  console.log(`expath-pkg.xml already at version ${pkg.version}`);
} else {
  writeFileSync(pkgPath, updated);
  console.log(`expath-pkg.xml synced to version ${pkg.version}`);
}
