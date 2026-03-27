import { readFile } from 'node:fs/promises';

const [versionTxtRaw, swRaw, pkgRaw, metadataRaw] = await Promise.all([
  readFile(new URL('../version.txt', import.meta.url), 'utf8'),
  readFile(new URL('../sw.js', import.meta.url), 'utf8'),
  readFile(new URL('../package.json', import.meta.url), 'utf8'),
  readFile(new URL('../metadata.json', import.meta.url), 'utf8')
]);

const versionTxt = versionTxtRaw.trim();
const swMatch = swRaw.match(/APP_VERSION\s*=\s*['\"]([^'\"]+)['\"]/);
const swVersion = swMatch?.[1];
const pkgVersion = JSON.parse(pkgRaw).version;
const metadataVersion = JSON.parse(metadataRaw).versioning?.current;

const report = {
  'version.txt': versionTxt,
  'sw.js APP_VERSION': swVersion,
  'package.json version': pkgVersion,
  'metadata.json versioning.current': metadataVersion
};

const unique = new Set(Object.values(report));

if (unique.size !== 1) {
  console.error('Versões fora de sincronia:');
  console.error(report);
  process.exit(1);
}

console.log('Versões sincronizadas:', versionTxt);
