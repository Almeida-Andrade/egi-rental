# EGI Rental · site

Site público da EGI Rental (locação de containers, Grupo Almeida Andrade, São Luís/MA). Lê o catálogo do banco do OMNIS (`yamjyyidqtkbwujnaiec`) pela chave pública. Irmão do site da EGI (`C:\Projetos\site-egi`), mesma stack: Next 16 App Router, CSS Modules com tokens, Vitest e Playwright, tudo em português.

## Comandos

```bash
npm run dev        # http://localhost:3000 (no OMNIS, a entrada egi-rental do launch.json sobe na 3007)
npm test           # vitest (lib/ puro)
npm run lint
npx tsc --noEmit
npm run build && npm run test:e2e   # Playwright contra o build, porta 3008
```

## Regras

### Dados
- **O site lê só a view `v_site_containers`** (migração 0221 do OMNIS): `uso`, `tamanho_pes`, `fabricacao`. É a única porta `anon` de container no banco. Dono, valores, local (tem nome de cliente), locatário e situação nunca vêm para cá; coluna nova na view é decisão do dono e migração nova lá.
- **O catálogo é por MODELO (uso × tamanho), nunca por container.** A frota está "a conferir" no OMNIS e a situação de cada unidade não é confiável: o site não mostra disponibilidade ("consulte"). Ligar a contagem de livres é decisão do dono, depois do pente fino.
- **Banco fora do ar não derruba o site**: `buscarCatalogo` cai na `FROTA_RESERVA` (`lib/catalogo.ts`) e avisa no log.
- Os valores de `Uso`, `Tamanho` e `Fabricacao` (`lib/modelos.ts`) são os do `check` da tabela `containers` do OMNIS: valor novo lá entra aqui também (uso desconhecido cai em "outro").
- Todas as páginas revalidam a cada 1 h (`revalidate` no layout, porque o rodapé lista o catálogo).

### Contato e pedidos
- **Todo contato sai de `CONTATO` (`lib/site.ts`).** O WhatsApp é o (98) 99102-2068. Número em componente fica velho sem ninguém ver.
- **O formulário não grava nada**: monta a mensagem (`lib/pedido.ts`) e abre o WhatsApp ou o e-mail de quem pediu. Guardar pedido é feature nova, com LGPD e tabela própria.

### Código
- Conta e regra em `lib/`, com teste em `tests/` (pasta espelhada). `lib/dados/*` e `lib/supabase/*` são I/O e ficam sem teste.
- `'use client'` só na folha: hoje só `MenuPrincipal` e `FormularioPedido`. Prop para o cliente é estreita (o formulário recebe só os nomes dos modelos).
- Comentário só para restrição que o código não expressa, seco, no presente.

### Imagens
- Fotos em `public/fotos`, do Unsplash (licença livre para uso comercial). **Foto nova entra em `lib/creditos.ts`**: o teste trava arquivo sem crédito e crédito sem arquivo.
- Logo: `public/marca` (PNG transparente, normal e branca, vertical e horizontal, tirados do arquivo original). Cores medidas da logo: aço `#597B97`, azul `#2B4EA2`, tinta `#080C18`. A curva grande num canto só (`--raio-marca`) e o quadrado azul são os da logo.
- `app/icon.svg` é o símbolo redesenhado em vetor; `app/apple-icon.png` e `public/og.jpg` são gerados a partir dos PNGs.

### Segurança
- Cabeçalhos em `next.config.ts`; a CSP só vale em produção. Página estática não tem nonce, então `script-src` leva `'unsafe-inline'`. Serviço de fora novo (mapa, vídeo, analytics) entra na diretiva certa, senão o navegador bloqueia calado.
- `.env.local` só com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chave pública). Nunca service role.

## Deploy
Ainda sem projeto na Vercel nem domínio. Quando houver: projeto no mesmo time do OMNIS, região `gru1`, envs acima mais `NEXT_PUBLIC_URL_SITE`, e o autor do commit com o e-mail corporativo (`git config --local`). Deploy só com ordem do dono.
