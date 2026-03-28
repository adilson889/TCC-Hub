import { readFile } from 'node:fs/promises';

const files = ['manifest.json', 'metadata.json', 'package.json'];

for (const file of files) {
  const raw = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
  try {
    JSON.parse(raw);
    console.log(`JSON válido: ${file}`);
  } catch (error) {
    console.error(`JSON inválido em ${file}:`, error.message);
    process.exit(1);
  }
}
