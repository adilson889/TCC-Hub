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
- `admin.html`: painel para gerir TCCs e gerar JSON sem edição manual.
- `css/style.css`: estilos base.
- `js/app.js`: lógica principal do frontend.
- `js/admin.js`: lógica do painel administrativo.
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

### Atualização automática do `data/tccs.json` (Google Form → Google Sheets)

Para não editar JSON manualmente, use o script de sincronização.

Se você não encontra “link CSV” no painel de respostas, use o **ID da planilha**:

1. Abra a planilha de respostas do Google Form.
2. Copie o ID da URL da planilha (trecho entre `/d/` e `/edit`).
3. No terminal, defina:

```bash
export PLANILHA_ID_GOOGLE='COLE_O_ID_AQUI'
# opcional, se a aba não for a primeira:
export PLANILHA_ABA_GID='0'
```

4. Rode:

```bash
npm run sync:tccs
```

Também funciona com URL CSV direta (quando disponível):

```bash
export URL_CSV_PLANILHA='URL_CSV_AQUI'
npm run sync:tccs
```

Para testar sem gravar arquivo:

```bash
npm run sync:tccs:dry
```

Teste local com arquivo CSV:

```bash
node ./scripts/sync-tccs-from-google-sheet.mjs --from-file ./respostas.csv --dry-run
```

Campos mínimos esperados no cabeçalho: `titulo`, `autor`, `ano`.

---


### Alternativa sem Google Sheets: `admin.html`

Se você só tem o link do formulário e quer gerenciar manualmente em uma tela, use:

- `https://repositorioaberto.xo.je/admin.html` (ou `/admin.html` no projeto local).

No painel você consegue:

1. Cadastrar, editar e excluir TCCs.
2. Gerar JSON automaticamente no formato do projeto.
3. Copiar ou baixar o arquivo `tccs.json`.

Depois é só substituir `data/tccs.json` no repositório/host com o arquivo gerado.

---

### Publicação (InfinityFree)

1. Fazer commit das mudanças no Git.
2. Subir os arquivos para o host (File Manager/FTP).
3. Confirmar que `version.txt` está atualizado para forçar ciclo de atualização no SW.

---

### Reportar problema

[https://github.com/adilson889/tcc-hub/issues](https://github.com/adilson889/tcc-hub/issues)
