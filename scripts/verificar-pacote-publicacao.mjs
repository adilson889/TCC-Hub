import { access, mkdir, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const arquivosPublicacao = [
  'index.html',
  'admin.html',
  'mobile.html',
  'css/style.css',
  'js/app.js',
  'js/admin.js',
  'data/tccs.json',
  'sw.js',
  'manifest.json',
  'version.txt',
  'icons/icon.png'
];

async function existe(caminho) {
  try {
    await access(caminho, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const faltando = [];

  for (const arquivo of arquivosPublicacao) {
    const caminho = resolve(process.cwd(), arquivo);
    const ok = await existe(caminho);
    if (!ok) faltando.push(arquivo);
  }

  if (faltando.length > 0) {
    console.error('Arquivos ausentes para publicação:');
    faltando.forEach((item) => console.error(`- ${item}`));
    process.exit(1);
  }

  const pastaSaida = resolve(process.cwd(), '.deploy');
  const arquivoLista = resolve(pastaSaida, 'arquivos-publicacao.txt');
  const conteudo = `${arquivosPublicacao.join('\n')}\n`;

  await mkdir(pastaSaida, { recursive: true });
  await writeFile(arquivoLista, conteudo, 'utf8');

  console.log('Pacote de publicação validado com sucesso.');
  console.log(`Lista salva em: ${arquivoLista}`);
}

main().catch((error) => {
  console.error('[verificar-publicacao] erro:', error.message);
  process.exit(1);
});
