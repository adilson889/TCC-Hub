import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ARQUIVO_PADRAO = 'data/tccs.json';

function obterArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function temFlag(flag) {
  return process.argv.includes(flag);
}

function parsearCsv(csv) {
  const linhas = [];
  let linha = [];
  let celula = '';
  let entreAspas = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"') {
      if (entreAspas && next === '"') {
        celula += '"';
        i += 1;
      } else {
        entreAspas = !entreAspas;
      }
      continue;
    }

    if (char === ',' && !entreAspas) {
      linha.push(celula);
      celula = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !entreAspas) {
      if (char === '\r' && next === '\n') i += 1;
      linha.push(celula);
      celula = '';
      if (linha.some((valor) => valor.trim() !== '')) {
        linhas.push(linha);
      }
      linha = [];
      continue;
    }

    celula += char;
  }

  if (celula.length > 0 || linha.length > 0) {
    linha.push(celula);
    if (linha.some((valor) => valor.trim() !== '')) {
      linhas.push(linha);
    }
  }

  return linhas;
}

function normalizarCabecalho(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function escolherValor(registro, aliases) {
  for (const alias of aliases) {
    if (registro[alias]) return registro[alias].trim();
  }
  return '';
}

function normalizarAno(valor) {
  const ano = Number.parseInt(String(valor || '').trim(), 10);
  if (!Number.isInteger(ano) || ano < 1900 || ano > 3000) return null;
  return ano;
}

function paraRegistro(cabecalhos, linha) {
  const registro = {};
  cabecalhos.forEach((cabecalho, idx) => {
    registro[cabecalho] = String(linha[idx] ?? '').trim();
  });
  return registro;
}

function mapearParaItem(registro, index) {
  const titulo = escolherValor(registro, ['titulo', 'titulo do tcc', 'tema']);
  const autor = escolherValor(registro, ['autor', 'autor(a)', 'nome', 'aluno', 'nome completo']);
  const ano = normalizarAno(escolherValor(registro, ['ano', 'ano de defesa']));

  if (!titulo || !autor || !ano) {
    return null;
  }

  const curso = escolherValor(registro, ['curso']);
  const instituicao = escolherValor(registro, ['instituicao', 'instituição']);
  const resumo = escolherValor(registro, ['resumo', 'descricao', 'descrição']);
  const link = escolherValor(registro, ['link', 'link pdf', 'pdf']);

  return {
    id: `tcc-${index + 1}`,
    titulo,
    autor,
    ano,
    ...(curso ? { curso } : {}),
    ...(instituicao ? { instituicao } : {}),
    ...(resumo ? { resumo } : {}),
    ...(link ? { link } : {})
  };
}

function montarUrlCsvPorIdDaPlanilha() {
  const idPlanilha = process.env.PLANILHA_ID_GOOGLE;
  if (!idPlanilha) return null;

  const gid = process.env.PLANILHA_ABA_GID || '0';
  return `https://docs.google.com/spreadsheets/d/${idPlanilha}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

async function carregarCsv() {
  const deArquivo = obterArg('--from-file');
  if (deArquivo) {
    const caminho = resolve(process.cwd(), deArquivo);
    return readFile(caminho, 'utf8');
  }

  const urlDireta = process.env.URL_CSV_PLANILHA || process.env.GOOGLE_SHEET_CSV_URL;
  const urlPorId = montarUrlCsvPorIdDaPlanilha();
  const url = urlDireta || urlPorId;

  if (!url) {
    throw new Error('Defina URL_CSV_PLANILHA ou PLANILHA_ID_GOOGLE (opcionalmente PLANILHA_ABA_GID).');
  }

  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error(`Falha ao baixar CSV: HTTP ${resposta.status}`);
  }

  return resposta.text();
}

async function main() {
  const csv = await carregarCsv();
  const linhas = parsearCsv(csv);

  if (linhas.length < 2) {
    throw new Error('CSV sem dados suficientes (é necessário cabeçalho + ao menos 1 linha).');
  }

  const cabecalhos = linhas[0].map(normalizarCabecalho);
  const items = linhas
    .slice(1)
    .map((linha) => paraRegistro(cabecalhos, linha))
    .map((registro, idx) => mapearParaItem(registro, idx))
    .filter(Boolean);

  const payload = {
    updatedAt: new Date().toISOString().slice(0, 10),
    fonte: temFlag('--from-file') ? 'arquivo-csv' : 'planilha-google-csv',
    items
  };

  const caminhoSaida = resolve(process.cwd(), process.env.CAMINHO_SAIDA_TCC || ARQUIVO_PADRAO);

  if (temFlag('--dry-run')) {
    console.log(JSON.stringify(payload, null, 2));
    console.log(`\nItens válidos encontrados: ${items.length}`);
    return;
  }

  await writeFile(caminhoSaida, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Arquivo atualizado: ${caminhoSaida}`);
  console.log(`Itens válidos salvos: ${items.length}`);
}

main().catch((error) => {
  console.error('[sync-tccs] erro:', error.message);
  process.exit(1);
});
