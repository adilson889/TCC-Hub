## Repositório Aberto de TCC

Repositório aberto para compartilhamento de Trabalhos de Conclusão de Curso (TCC), com foco em publicação estática, versionamento claro e rastreabilidade do código-fonte.

---

### Acesse o site

[https://repositorioaberto.xo.je](https://repositorioaberto.xo.je)

---

### Objetivo deste repositório

Este repositório agora está preparado para manter **todos os arquivos do site** (HTML, CSS, JS, dados e PWA), facilitando evolução, rollback e auditoria técnica.

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

### Publicação (InfinityFree)

1. Fazer commit das mudanças no Git.
2. Subir os arquivos para o host (File Manager/FTP).
3. Confirmar que `version.txt` está atualizado para forçar ciclo de atualização no SW.

---

### Reportar problema

[https://github.com/adilson889/tcc-hub/issues](https://github.com/adilson889/tcc-hub/issues)
