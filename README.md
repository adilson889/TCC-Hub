## Repositório Aberto de TCC

Repositório aberto para compartilhamento de Trabalhos de Conclusão de Curso (TCC), com foco em publicação estática e versionamento claro de artefatos PWA.

---

### Acesse o site

[https://repositorioaberto.xo.je](https://repositorioaberto.xo.je)

---

### Objetivo deste repositório

Este repositório mantém os arquivos-base do projeto (manifesto PWA, service worker, versionamento e metadados) para facilitar manutenção, auditoria e evolução contínua.

---

### Estrutura

- `sw.js`: Service Worker com cache e verificação de atualização.
- `manifest.json`: Metadados PWA de instalação.
- `version.txt`: Versão pública atual da aplicação.
- `metadata.json`: Metadados de release e governança técnica.
- `package.json`: Scripts utilitários para validação local.
- `CHANGELOG.md`: Histórico de mudanças do repositório.
- `CONTRIBUTING.md`: Guia de contribuição.

---

### Fluxo recomendado de versionamento

1. Atualizar `version.txt` quando houver release.
2. Ajustar `APP_VERSION` em `sw.js` para a mesma versão.
3. Atualizar `metadata.json` com `releaseDate`, `commitPolicy` e notas.
4. Registrar mudanças no `CHANGELOG.md`.
5. Validar localmente com `npm run validate`.

---

### Reportar problema

[https://github.com/adilson889/tcc-hub/issues](https://github.com/adilson889/tcc-hub/issues)
