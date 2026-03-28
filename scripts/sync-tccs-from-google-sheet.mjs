import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const DEFAULT_OUTPUT = 'data/tccs.json';

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      cell = '';
      if (row.some((value) => value.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

function normalizeHeader(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function pickValue(record, aliases) {
  for (const alias of aliases) {
    if (record[alias]) return record[alias].trim();
  }
  return '';
}

function normalizeYear(value) {
  const year = Number.parseInt(String(value || '').trim(), 10);
  if (!Number.isInteger(year) || year < 1900 || year > 3000) return null;
  return year;
}

function toRecord(headers, row) {
  const record = {};
  headers.forEach((header, idx) => {
    record[header] = String(row[idx] ?? '').trim();
  });
  return record;
}

function mapToItem(record, index) {
  const titulo = pickValue(record, ['titulo', 'titulo do tcc', 'tema', 'title']);
  const autor = pickValue(record, ['autor', 'autor(a)', 'nome', 'aluno', 'nome completo']);
  const ano = normalizeYear(pickValue(record, ['ano', 'ano de defesa', 'year']));

  if (!titulo || !autor || !ano) {
    return null;
  }

  const curso = pickValue(record, ['curso']);
  const instituicao = pickValue(record, ['instituicao', 'instituição']);
  const resumo = pickValue(record, ['resumo', 'descricao', 'descrição']);
  const link = pickValue(record, ['link', 'link pdf', 'pdf', 'url']);

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

async function loadCsv() {
  const fromFile = getArg('--from-file');
  if (fromFile) {
    const filePath = resolve(process.cwd(), fromFile);
    return readFile(filePath, 'utf8');
  }

  const url = process.env.GOOGLE_SHEET_CSV_URL;
  if (!url) {
    throw new Error('Defina GOOGLE_SHEET_CSV_URL ou use --from-file <arquivo.csv>.');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao baixar CSV: HTTP ${response.status}`);
  }

  return response.text();
}

async function main() {
  const csv = await loadCsv();
  const rows = parseCsv(csv);

  if (rows.length < 2) {
    throw new Error('CSV sem dados suficientes (é necessário cabeçalho + ao menos 1 linha).');
  }

  const headers = rows[0].map(normalizeHeader);
  const items = rows
    .slice(1)
    .map((row) => toRecord(headers, row))
    .map((record, idx) => mapToItem(record, idx))
    .filter(Boolean);

  const payload = {
    updatedAt: new Date().toISOString().slice(0, 10),
    source: hasFlag('--from-file') ? 'csv:file' : 'google-sheets:csv',
    items
  };

  const outputPath = resolve(process.cwd(), process.env.TCC_OUTPUT_PATH || DEFAULT_OUTPUT);

  if (hasFlag('--dry-run')) {
    console.log(JSON.stringify(payload, null, 2));
    console.log(`\nItens válidos encontrados: ${items.length}`);
    return;
  }

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Arquivo atualizado: ${outputPath}`);
  console.log(`Itens válidos salvos: ${items.length}`);
}

main().catch((error) => {
  console.error('[sync-tccs] erro:', error.message);
  process.exit(1);
});
