## Repositório Aberto de TCC

Repositório aberto para compartilhamento de Trabalhos de Conclusão de Curso (TCC), com foco em publicação estática, versionamento claro e rastreabilidade do código-fonte.

---

### Acesse o site

[https://repositorioaberto.xo.je](https://repositorioaberto.xo.je)

---

### Objetivo deste repositório

Este repositório está preparado para manter **todos os arquivos do site** (HTML, CSS, JS, dados e PWA), facilitando evolução, rollback e auditoria técnica.

> Estado atual: como os arquivos originais estão no InfinityFree, qualquer arquivo provisório no Git deve ser substituído assim que a versão oficial do host for sincronizada para este repositório.

---

### Estrutura

- `index.html`: entrada principal da aplicação.
- `mobile.html`: fallback/redirect para clientes móveis.
- `css/style.css`: estilos base.
- `js/app.js`: lógica principal do frontend.
- `data/tccs.json`: base de dados dos TCCs.
- `sw.js`: Service Worker com cache e atualização.
- `manifest.json`: metadados PWA.
- `version.txt`: versão pública atual.
- `metadata.json`: metadados de release e governança.
- `package.json`: scripts utilitários de validação.

---

### Fluxo recomendado de versionamento

1. Atualizar `version.txt` quando houver release.
2. Ajustar `APP_VERSION` em `sw.js` para a mesma versão.
3. Ajustar `version` em `package.json` e `versioning.current` em `metadata.json`.
4. Registrar mudanças no `CHANGELOG.md`.
5. Executar `npm run validate` antes de publicar.

---

### Fluxo quando não for possível enviar arquivos pelo chat

Se não for possível anexar `.zip` ou arquivos diretamente na conversa:

1. Atualize os arquivos originais no InfinityFree (ou exporte o conteúdo por FTP/File Manager).
2. Copie e cole aqui os arquivos em blocos de texto, sempre com o caminho no topo (ex.: `js/app.js`).
3. Eu aplico as alterações neste repositório, ajusto metadados/versão e valido consistência.
4. Você publica novamente no InfinityFree a partir da versão validada no Git.

Esse fluxo garante que o histórico de mudanças fique auditável no Git mesmo quando o host é a fonte operacional temporária.

---

### Publicação (InfinityFree)

1. Fazer commit das mudanças no Git.
2. Subir os arquivos para o host (File Manager/FTP).
3. Confirmar que `version.txt` está atualizado para forçar ciclo de atualização no SW.

---

### Reportar problema

[https://github.com/adilson889/tcc-hub/issues](https://github.com/adilson889/tcc-hub/issues)
