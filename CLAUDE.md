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
- **O site lê só a view `v_site_containers`** (migração 0222 do OMNIS): `uso`, `tamanho_pes`, `fabricacao`. É a única porta `anon` de container no banco. Dono, valores, local (tem nome de cliente), locatário e situação nunca vêm para cá; coluna nova na view é decisão do dono e migração nova lá.
- **O catálogo é por MODELO (uso × tamanho), nunca por container.** A frota está "a conferir" no OMNIS e a situação de cada unidade não é confiável: o site não mostra disponibilidade ("consulte"). Ligar a contagem de livres é decisão do dono, depois do pente fino.
- **Banco fora do ar não derruba o site**: `buscarCatalogo` cai na `FROTA_RESERVA` (`lib/catalogo.ts`) e avisa no log.
- Os valores de `Uso`, `Tamanho` e `Fabricacao` (`lib/modelos.ts`) são os do `check` da tabela `containers` do OMNIS: valor novo lá entra aqui também (uso desconhecido cai em "outro").
- **A frota não tem 40 pés**: `Tamanho` é só 10 e 20, e linha de 40 que venha do banco fica fora do catálogo (`ehTamanho`). Voltar a ter 40 é decisão do dono.
- Todas as páginas revalidam a cada 1 h (`revalidate` no layout, porque o rodapé lista o catálogo).

### Contato e pedidos
- **Todo contato sai de `CONTATO` (`lib/site.ts`).** O WhatsApp é o (98) 99102-2068. Número em componente fica velho sem ninguém ver.
- **O formulário não grava nada**: monta a mensagem (`lib/pedido.ts`) e abre o WhatsApp ou o e-mail de quem pediu. Guardar pedido é feature nova, com LGPD e tabela própria.

### Código
- Conta e regra em `lib/`, com teste em `tests/` (pasta espelhada). `lib/dados/*` e `lib/supabase/*` são I/O e ficam sem teste.
- `'use client'` só na folha: hoje só `MenuPrincipal` e `FormularioPedido`. Prop para o cliente é estreita (o formulário recebe só os nomes dos modelos).
- Comentário só para restrição que o código não expressa, seco, no presente.

### Identidade e movimento (o que tira a cara de site genérico)
- **Uma família só, Archivo** (largura variável faz o papel de título, `font-stretch` 118–125%), e a **Big Shoulders Stencil** só em número e código, como as marcações pintadas nos containers (classe global `.marcacao`). Nada de Inter, gradiente roxo, vidro fosco, palavra colorida no título nem rótulo em caixa alta em toda seção.
- **Movimento com motivo**: um momento orquestrado na abertura (as portas do container se abrem uma vez por visita, `Abertura` + `PortasDeAbertura`), interação que informa (comparador em escala, troca de foto nas aplicações, prévia da mensagem no formulário) e rolagem que conta algo (caminhão na rota, desenho técnico traçado). Nada de "aparece ao rolar" em todo bloco.
- **Movimento reduzido encurta, nunca desliga**: `--tempo` (multiplica durações) e `--deslocar` (zera deslocamentos) em `tokens.css`. Animação nova usa as duas variáveis. O Windows do dono reporta movimento reduzido: testar as duas versões (Playwright com `reducedMotion: 'no-preference'`).
- **Abertura da home** (`ContainerAbrindo`, capítulos em `capitulosDaAbertura`): um trilho alto com o palco preso na tela; a linha do tempo do anime.js (0 a 1000) segue a rolagem por `onScroll` e só mexe em variáveis CSS (`--giro`, `--porta`, `--avanco`…) e em opacidade: a geometria 3D é toda do CSS. O trilho só fica alto com `data-viva` (sem JS, a abertura é uma tela só, com o h1 e os botões). Nunca `opacity`/`filter` num ancestral da caixa 3D (achata o `preserve-3d`) nem `preserve-3d` nas folhas (a camada escura atravessa a porta). Com movimento reduzido a rolagem fica sem inércia, nunca desligada.
- **Comparador** (`ComparadorTamanhos`, `lib/plantas.ts`, `lib/medidas.ts`): duas vistas (de lado e de frente) de 7,75 m cada (`VISTA_M` = `--vista-m`), lado a lado no computador e uma embaixo da outra no palco estreito, tudo em `cqi` na mesma escala; as plantas são EXEMPLO de uso (o site diz isso) e o teste trava peça fora do container e móvel sobreposto. Modelo novo na frota ganha planta em `PLANTAS`, senão cai em "espaço livre".
- **Números do setor** (`lib/numeros.ts`, `NumerosModular`): só número com fonte conferida na página original, e o texto diz que são do setor, não da EGI Rental. Custo da McKinsey não entra (eles dizem que ainda é exceção).
- **Transição entre páginas**: a foto do cartão vira a foto da ficha por `ViewTransition name="foto-<slug>" share="morph" default="none"` nos dois lados. Nome repetido na mesma página quebra o morph.
- **Bibliotecas**: Kokonut UI e Bklit UI exigem Tailwind/shadcn, então só as técnicas vieram (CSS Modules). **anime.js** entra por `import()` dinâmico e só no que o CSS não faz: a mola do encaixe da régua do comparador e a cascata das peças da planta (`stagger` a partir do centro). Motion não está instalado.
- **Dicas dos gráficos** (`Grafico` em `NumerosModular`): todo ponto com valor leva `data-dica` e `tabIndex={0}`; a dica segue o ponteiro, vira de lado perto da borda direita e o resto esmaece. Gráfico novo usa o mesmo componente.

### Montador 3D (`/sob-medida/montar`)
- **three.js + @react-three/fiber + drei, com versão exata** (o three muda API em versão "menor"). A cena (`components/montador/Cena.tsx`) entra por `next/dynamic` com `ssr: false`: o 3D só baixa nesta rota. Se o WebGL falhar, o limite de erro manda para o formulário.
- **Lado a lado** (`Modulos`, no máximo 2, decisão do dono): containers juntos pela lateral sem a parede do meio; a largura interna é `dimensoesJuntas` (`lib/medidas.ts`), a mesma conta no montador, na planta do comparador e na tabela de medidas. O encaixe de 5 cm vem ANTES do limite (`limitar`): com 4,79 m de largura, encaixar depois empurrava a peça 1 cm para fora.
- **Toda regra mora em `lib/montador.ts`** (peças e medidas, limites, encaixe de 5 cm, conflitos, lugar livre, link, resumo, pontos de partida), com teste. A cena só desenha e devolve o item movido. A busca de lugar livre testa só a peça nova (`conflitaCom`): recalcular todos os conflitos a cada posição travava o clique com o container cheio.
- **Conflito é aviso, nunca bloqueio**: móvel sobre móvel, peças sobrepostas na mesma parede e móvel na área de abrir da porta (0,8 m) ficam vermelhos.
- **O projeto vive no link** (`?p=`, base64url de `[1, tamanho, cor, itens]`): é o que vai no WhatsApp e o que a equipe abre. Link é entrada não confiável: `decodificar` limita tamanho, tipos, quantidade (`MAX_ITENS`) e posição, e descarta o resto. Mudar o formato pede versão nova (o `1` na frente) e manter a leitura da antiga.
- Paredes entre a câmera e o interior ficam translúcidas (`VigiaDasParedes`), e as peças de parede somem junto. Material que alterna entre opaco e translúcido troca de `key`: o three.js não recompila quando `transparent` muda.
- Sem `Html` do drei: os rótulos flutuantes davam erro de desmontagem no React 19. Informação vai nos painéis HTML em volta do canvas.
- `public/montador/previa.jpg` é captura do próprio montador (ponto de partida "escritório"), não foto de banco: fica fora de `CREDITOS`.

### Aviso de ilustração (evitar propaganda enganosa)
- **Toda foto de modelo, medida, planta, desenho e projeto 3D vem com o aviso de que é meramente ilustrativo** e com o caminho para confirmar com a equipe: `AvisoIlustrativo` (texto em `AVISO_ILUSTRATIVO`, `lib/site.ts`) perto do conteúdo, e o texto completo no rodapé de todas as páginas. Seção nova com imagem de container ou medida ganha o aviso.
- Número do setor sempre com a fonte e no melhor caso dito como tal ("a partir de", "no melhor caso"), nunca como promessa da EGI Rental.

### Desempenho (medir antes e depois)
- **Aparelho fraco desliga efeitos, nunca a experiência**: `nivelDoAparelho` (`lib/desempenho.ts`, sinais do navegador) decide o nível ao abrir, e `quadrosLentos` (mediana acima de 20 ms ou mais de 10% acima de 33 ms) rebaixa no meio do uso. Na abertura da home, `data-leve` tira chapa ondulada, sombra do pátio e brilho da tela; no montador, sombra, antialias e resolução acima de 1.
- **Animação que roda sozinha só roda na tela** (IntersectionObserver ou `animation-play-state`), e os gráficos dos números têm o botão de pausa (WCAG 2.2.2). No CSS Modules, `animation` sem nome no atalho sai do build como `none`: usar as propriedades separadas.
- **Animação por rolagem escreve `transform`/`opacity` direto nas peças que mudam**, nunca variável CSS no palco: variável herdada recalculava o estilo da cena inteira a cada quadro (6,5 s em 3 s de rolagem com CPU 4x).
- **Montador**: geometria única por forma e material do cache (`material()` em `Pecas3D`), sombra calculada só quando o projeto muda (`SombraSobDemanda`), mapa de 1024 ajustado ao container, `dpr` até 1,5, sem `preserveDrawingBuffer` (a imagem é capturada logo depois de um render), eventos desligados enquanto a câmera gira e `PecaNaCena` memorizada.
- **Foto escondida por cortina ou opacidade carrega por proximidade** (IntersectionObserver), nem preguiçosa (não baixa enquanto escondida) nem eager no servidor (vira preload no topo da página).
- **Medir**: build de produção (`npm run build && npm run start`), Chrome com a GPU (`--use-angle=d3d11 --enable-gpu`), CPU 4x pelo DevTools Protocol, intervalos de `requestAnimationFrame` e `Performance.getMetrics`. Lighthouse sempre com o cache de imagens aquecido: a primeira otimização do `/_next/image` na mesma máquina atrasa a pintura e falseia a nota.

### Imagens
- Fotos em `public/fotos`, do Unsplash (licença livre para uso comercial). **Foto nova entra em `lib/creditos.ts`**: o teste trava arquivo sem crédito e crédito sem arquivo.
- Logo: `public/marca` (PNG transparente, normal e branca, vertical e horizontal, tirados do arquivo original). Cores medidas da logo: aço `#597B97`, azul `#2B4EA2`, tinta `#080C18`. A curva grande num canto só (`--raio-marca`) e o quadrado azul são os da logo.
- `app/icon.svg` é o símbolo redesenhado em vetor; `app/apple-icon.png` e `public/og.jpg` são gerados a partir dos PNGs.

### Segurança
- Cabeçalhos em `next.config.ts`; a CSP só vale em produção. Página estática não tem nonce, então `script-src` leva `'unsafe-inline'`. Serviço de fora novo (mapa, vídeo, analytics) entra na diretiva certa, senão o navegador bloqueia calado.
- `.env.local` só com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chave pública). Nunca service role.

## Deploy
- Repositório: `github.com/Almeida-Andrade/egi-rental` (**público**: segredo nunca em código nem em arquivo versionado; só nos envs da Vercel e no `.env.local`). Autor do commit com o e-mail corporativo no `git config --local`.
- **Vercel**: projeto `egi-rental` no time do OMNIS, funções em `gru1` (`vercel.json`), **ligado ao GitHub: push na `main` publica**. Por isso merge e push na `main` só com ordem do dono, e trabalho grande vai em branch (a Vercel faz prévia dela). Deploy à mão, se precisar: `npx --yes vercel@latest deploy --prod --yes --scope team_lnZ2DJVblrHx9HLbAY6ZQjYj` (sem `--scope` responde "Not authorized").
- Envs de produção: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_URL_SITE=https://egi.rental.grupoaandrade.com.br` (canonical, sitemap e Open Graph saem dela).
- **Domínio `egi.rental.grupoaandrade.com.br`**: o DNS de `grupoaandrade.com.br` está no provedor (`ns1/ns2.bugatti.sevenjidc.com.br`), não no Cloudflare; o registro é `CNAME egi.rental → 6c04e65e8f56a1ff.vercel-dns-017.com` e o certificado é emitido pela Vercel.
