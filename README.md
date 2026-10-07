# EGI Rental

Site da EGI Rental: locação de containers em São Luís/MA, do Grupo Almeida Andrade.

- **Catálogo** atualizado do banco do OMNIS (view `v_site_containers`), por modelo: escritório, almoxarifado, sanitário, cozinha, stand, escritório + almoxarifado.
- **Sob medida**: página própria e chamada em destaque.
- **Pedidos** pelo WhatsApp ou e-mail, com a mensagem já montada; nada é gravado no site.

## Rodar

```bash
cp .env.example .env.local   # e preencher
npm install
npm run dev
```

Testes: `npm test` (unidade) e `npm run build && npm run test:e2e` (navegador).

Regras do projeto em [CLAUDE.md](CLAUDE.md). Créditos das fotos em `/creditos`.
