const CHAVE_SESSAO = 'tcc_hub_sessao_usuario_v1';

const telaLogin = document.getElementById('tela-login');
const telaApp = document.getElementById('tela-app');
const formLogin = document.getElementById('form-login');
const loginStatus = document.getElementById('login-status');
const perfilUsuario = document.getElementById('perfil-usuario');
const btnSair = document.getElementById('btn-sair');
const listaTcc = document.getElementById('tcc-list');

function limparLista(list) {
  while (list.firstChild) list.removeChild(list.firstChild);
}

function criarItemMensagem(texto) {
  const li = document.createElement('li');
  li.textContent = texto;
  return li;
}

function normalizarItem(item) {
  if (!item || typeof item !== 'object') return null;

  const titulo = typeof item.titulo === 'string' ? item.titulo.trim() : '';
  const autor = typeof item.autor === 'string' ? item.autor.trim() : '';
  const ano = Number.isInteger(item.ano) ? item.ano : Number.parseInt(item.ano, 10);

  if (!titulo || !autor || !Number.isInteger(ano)) return null;
  return { titulo, autor, ano };
}

function renderizarItens(items) {
  if (!listaTcc) return;
  limparLista(listaTcc);

  if (items.length === 0) {
    listaTcc.appendChild(criarItemMensagem('Nenhum TCC cadastrado ainda.'));
    return;
  }

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = item.titulo;
    li.appendChild(strong);
    li.appendChild(document.createTextNode(` — ${item.autor} (${item.ano})`));
    fragment.appendChild(li);
  });

  listaTcc.appendChild(fragment);
}

function obterSessao() {
  try {
    const raw = localStorage.getItem(CHAVE_SESSAO);
    if (!raw) return null;
    const sessao = JSON.parse(raw);
    return sessao?.email ? sessao : null;
  } catch {
    return null;
  }
}

function salvarSessao(email) {
  const nomeBase = email.split('@')[0] || 'Utilizador';
  const nome = nomeBase
    .split(/[._-]/)
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ');

  const sessao = {
    email,
    nome: nome || 'Utilizador',
    loginEm: new Date().toISOString()
  };

  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  return sessao;
}

function encerrarSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
  mostrarTelaLogin();
}

function mostrarTelaLogin() {
  telaLogin?.classList.remove('hidden');
  telaApp?.classList.add('hidden');
  if (formLogin) formLogin.reset();
  if (loginStatus) loginStatus.textContent = '';
}

function mostrarTelaApp(sessao) {
  if (perfilUsuario) {
    perfilUsuario.textContent = `${sessao.nome} • ${sessao.email}`;
  }

  telaLogin?.classList.add('hidden');
  telaApp?.classList.remove('hidden');
  carregarTCCs();
}

async function carregarTCCs() {
  if (!listaTcc) return;
  listaTcc.setAttribute('aria-busy', 'true');

  try {
    const res = await fetch('/data/tccs.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Falha HTTP ${res.status}`);

    const data = await res.json();
    const itensBrutos = Array.isArray(data?.items) ? data.items : [];
    const itensValidos = itensBrutos.map(normalizarItem).filter(Boolean);
    renderizarItens(itensValidos);
  } catch (error) {
    limparLista(listaTcc);
    listaTcc.appendChild(criarItemMensagem('Não foi possível carregar os TCCs no momento.'));
    console.error('[TCC Hub] erro ao carregar dados', error);
  } finally {
    listaTcc.setAttribute('aria-busy', 'false');
  }
}

function configurarLogin() {
  if (!formLogin || !loginStatus) return;

  formLogin.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = String(formLogin.email?.value || '').trim().toLowerCase();
    const password = String(formLogin.password?.value || '');

    if (!email || !password || password.length < 6) {
      loginStatus.textContent = 'Preencha e-mail e palavra-passe válidos.';
      return;
    }

    loginStatus.textContent = 'A autenticar e carregar perfil...';
    await new Promise((resolve) => setTimeout(resolve, 500));

    const sessao = salvarSessao(email);
    loginStatus.textContent = '';
    mostrarTelaApp(sessao);
  });
}

function configurarSaida() {
  btnSair?.addEventListener('click', () => {
    encerrarSessao();
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch (error) {
      console.error('[TCC Hub] erro ao registrar SW', error);
    }
  });
}

function iniciar() {
  configurarLogin();
  configurarSaida();

  const sessao = obterSessao();
  if (!sessao) {
    mostrarTelaLogin();
    return;
  }

  mostrarTelaApp(sessao);
}

iniciar();
