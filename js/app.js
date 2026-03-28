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

  if (!titulo || !autor || !Number.isInteger(ano)) {
    return null;
  }

  return { titulo, autor, ano };
}

function renderizarItens(list, items) {
  limparLista(list);

  if (items.length === 0) {
    list.appendChild(criarItemMensagem('Nenhum TCC cadastrado ainda.'));
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

  list.appendChild(fragment);
}

async function carregarTCCs() {
  const list = document.getElementById('tcc-list');
  if (!list) return;

  list.setAttribute('aria-busy', 'true');

  try {
    const res = await fetch('/data/tccs.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Falha HTTP ${res.status}`);

    const data = await res.json();
    const itensBrutos = Array.isArray(data?.items) ? data.items : [];
    const itensValidos = itensBrutos.map(normalizarItem).filter(Boolean);

    renderizarItens(list, itensValidos);
  } catch (error) {
    limparLista(list);
    list.appendChild(criarItemMensagem('Não foi possível carregar os TCCs no momento.'));
    console.error('[TCC Hub] erro ao carregar dados', error);
  } finally {
    list.setAttribute('aria-busy', 'false');
  }
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

carregarTCCs();
