async function carregarTCCs() {
  const list = document.getElementById('tcc-list');

  try {
    const res = await fetch('/data/tccs.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Falha HTTP ${res.status}`);

    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];

    if (items.length === 0) {
      list.innerHTML = '<li>Nenhum TCC cadastrado ainda.</li>';
      return;
    }

    list.innerHTML = items
      .map((item) => `<li><strong>${item.titulo}</strong> — ${item.autor} (${item.ano})</li>`)
      .join('');
  } catch (error) {
    list.innerHTML = '<li>Não foi possível carregar os TCCs no momento.</li>';
    console.error('[TCC Hub] erro ao carregar dados', error);
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
