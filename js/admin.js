const CHAVE_SESSAO = 'tcc_hub_sessao_usuario_v1';
const CHAVE_LOCAL = 'tcc_hub_admin_items_v1';

const form = document.getElementById('tcc-form');
const botaoLimpar = document.getElementById('limpar-form');
const lista = document.getElementById('admin-lista');
const status = document.getElementById('status-admin');
const saidaJson = document.getElementById('saida-json');
const botaoCopiar = document.getElementById('copiar-json');
const botaoBaixar = document.getElementById('baixar-json');

let items = [];
let indiceEdicao = null;

function sessaoValida() {
  try {
    const raw = localStorage.getItem(CHAVE_SESSAO);
    if (!raw) return false;
    const sessao = JSON.parse(raw);
    return Boolean(sessao?.email);
  } catch {
    return false;
  }
}

function normalizarTexto(valor) {
  return String(valor || '').trim();
}

function carregarLocalStorage() {
  try {
    const raw = localStorage.getItem(CHAVE_LOCAL);
    if (!raw) return [];

    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function carregarDoJsonPublicado() {
  try {
    const resposta = await fetch('/data/tccs.json', { cache: 'no-store' });
    if (!resposta.ok) return [];

    const data = await resposta.json();
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

function salvarLocalStorage() {
  localStorage.setItem(CHAVE_LOCAL, JSON.stringify(items));
}

function montarPayload() {
  return {
    updatedAt: new Date().toISOString().slice(0, 10),
    fonte: 'painel-admin-local',
    items: items.map((item, idx) => ({
      id: `tcc-${idx + 1}`,
      titulo: item.titulo,
      autor: item.autor,
      ano: item.ano,
      ...(item.curso ? { curso: item.curso } : {}),
      ...(item.instituicao ? { instituicao: item.instituicao } : {}),
      ...(item.resumo ? { resumo: item.resumo } : {}),
      ...(item.link ? { link: item.link } : {})
    }))
  };
}

function atualizarSaidaJson() {
  saidaJson.value = `${JSON.stringify(montarPayload(), null, 2)}\n`;
}

function preencherFormulario(item) {
  form.titulo.value = item.titulo || '';
  form.autor.value = item.autor || '';
  form.ano.value = item.ano || '';
  form.curso.value = item.curso || '';
  form.instituicao.value = item.instituicao || '';
  form.resumo.value = item.resumo || '';
  form.link.value = item.link || '';
}

function limparFormulario() {
  form.reset();
  indiceEdicao = null;
}

function removerItem(index) {
  items.splice(index, 1);
  salvarLocalStorage();
  renderizarLista();
  atualizarSaidaJson();
  limparFormulario();
}

function editarItem(index) {
  indiceEdicao = index;
  preencherFormulario(items[index]);
}

function criarAcao(label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function renderizarLista() {
  while (lista.firstChild) lista.removeChild(lista.firstChild);

  if (items.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Nenhum item cadastrado.';
    lista.appendChild(li);
    status.textContent = '0 itens cadastrados.';
    return;
  }

  status.textContent = `${items.length} item(ns) cadastrado(s).`;

  items.forEach((item, index) => {
    const li = document.createElement('li');
    const texto = document.createElement('p');
    texto.textContent = `${item.titulo} — ${item.autor} (${item.ano})`;

    const acoes = document.createElement('div');
    acoes.className = 'actions';
    acoes.appendChild(criarAcao('Editar', () => editarItem(index)));
    acoes.appendChild(criarAcao('Excluir', () => removerItem(index)));

    li.appendChild(texto);
    li.appendChild(acoes);
    lista.appendChild(li);
  });
}

function lerFormulario() {
  return {
    titulo: normalizarTexto(form.titulo.value),
    autor: normalizarTexto(form.autor.value),
    ano: Number.parseInt(form.ano.value, 10),
    curso: normalizarTexto(form.curso.value),
    instituicao: normalizarTexto(form.instituicao.value),
    resumo: normalizarTexto(form.resumo.value),
    link: normalizarTexto(form.link.value)
  };
}

function itemValido(item) {
  return item.titulo && item.autor && Number.isInteger(item.ano) && item.ano >= 1900 && item.ano <= 3000;
}

function baixarArquivoJson() {
  const blob = new Blob([saidaJson.value], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tccs.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function copiarJson() {
  try {
    await navigator.clipboard.writeText(saidaJson.value);
    status.textContent = 'JSON copiado para a área de transferência.';
  } catch {
    status.textContent = 'Não foi possível copiar automaticamente. Use o copiar manual.';
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const item = lerFormulario();

  if (!itemValido(item)) {
    status.textContent = 'Preencha título, autor e ano válido.';
    return;
  }

  if (indiceEdicao === null) {
    items.push(item);
  } else {
    items[indiceEdicao] = item;
  }

  salvarLocalStorage();
  renderizarLista();
  atualizarSaidaJson();
  limparFormulario();
  status.textContent = 'Item salvo com sucesso.';
});

botaoLimpar.addEventListener('click', () => {
  limparFormulario();
  status.textContent = 'Formulário limpo.';
});

botaoCopiar.addEventListener('click', copiarJson);
botaoBaixar.addEventListener('click', baixarArquivoJson);

async function iniciar() {
  if (!sessaoValida()) {
    window.location.href = '/index.html';
    return;
  }

  const local = carregarLocalStorage();

  if (local.length > 0) {
    items = local;
    status.textContent = 'Dados carregados do navegador.';
  } else {
    const publicados = await carregarDoJsonPublicado();
    items = publicados;
    salvarLocalStorage();
    status.textContent = publicados.length > 0
      ? 'Dados carregados do data/tccs.json.'
      : 'Nenhum item inicial encontrado.';
  }

  renderizarLista();
  atualizarSaidaJson();
}

iniciar();
