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

### Fluxo de acesso (login obrigatório)

A aplicação agora exige login inicial no `index.html` para abrir o conteúdo.

- Sem sessão válida, só a tela de login é exibida.
- Após login, o perfil é carregado e os TCCs ficam disponíveis.
- O `admin.html` também exige sessão ativa e redireciona para `index.html` se não houver login.

Para testar local antes de publicar:

```bash
python -m http.server 8080
```

Depois abra `http://localhost:8080/index.html`.

---

### Se o `admin.html` não aparecer no site

Isso normalmente acontece por **publicação incompleta** ou **cache antigo**.

Checklist rápido:

1. Rodar localmente:

```bash
npm run publicacao:check
```

2. Confirmar upload no InfinityFree dos arquivos abaixo (mínimo):
   - `admin.html`
   - `js/admin.js`
   - `css/style.css`
   - `sw.js`
   - `version.txt`
3. Depois do upload, abrir o site e fazer atualização forçada (`Ctrl+F5`).
4. Se ainda não aparecer, fechar todas as abas do site e abrir novamente.

A lista completa de publicação é gerada em `.deploy/arquivos-publicacao.txt`.

---

### Como atualizar tudo (passo a passo rápido)

1. Abra `/admin.html` e atualize os TCCs.
2. Clique em **Baixar tccs.json**.
3. Substitua o arquivo `data/tccs.json` no projeto local pelo arquivo baixado.
4. Rode validação:

```bash
npm run validate
```

5. Faça commit das alterações no Git.
6. Envie para o InfinityFree os arquivos alterados (`data/tccs.json`, HTML/CSS/JS quando houver mudança).
7. No navegador, faça atualização forçada (Ctrl+F5) para garantir atualização de cache.
8. Se ainda aparecer conteúdo antigo, feche e abra novamente o site para o Service Worker buscar a versão atual.

### Publicação (InfinityFree)

1. Fazer commit das mudanças no Git.
2. Subir os arquivos para o host (File Manager/FTP).
3. Confirmar que `version.txt` está atualizado para forçar ciclo de atualização no SW.

---

### Reportar problema

[https://github.com/adilson889/tcc-hub/issues](https://github.com/adilson889/tcc-hub/issues)
