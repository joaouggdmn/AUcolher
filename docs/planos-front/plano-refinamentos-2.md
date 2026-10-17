# AUcolher: refinamentos 2 (só front)

> Primeiro passo da execução: copiar este plano para `frontend/AUcolher/docs/planos-front/plano-refinamentos-2.md` e pôr uma linha no `docs/README.md`. Marcar os blocos (✅) conforme forem entregues.

## Contexto

Mais uma rodada de ajustes, pedida em 2026-10-17 depois do merge dos PRs (front #22, back #15). Tudo é visual ou de navegação, só no front. Nenhuma API muda: o back e os contratos ficam como estão.

- Branch: `feature/refinamentos-2`, saindo da `main` atualizada.
- Commits: eu commito cada bloco. Push e PR ficam com você.

---

## N1. "Seja o primeiro…" para quem não pode participar

**Problema.** A ONG que acabou de criar uma campanha vê "Seja o primeiro a doar" na própria campanha. Com evento é igual: ela vê "Seja o primeiro a confirmar". Ela não pode doar nem confirmar presença no que é dela. O admin também não participa.

**Onde estão os textos:**
- `features/doacoes/utils/campaignDisplay.js` → `formatDonationsCount(count)`;
- `features/eventos/utils/eventDisplay.js` → `getAttendanceSummary(event)`.

**Mudança:**
- Os dois ganham um segundo parâmetro opcional, `{ invite = true }`.
- Com `invite: false`, o texto vira neutro:
  - campanha: "Nenhuma doação ainda";
  - evento: "Nenhum confirmado ainda".
- **Card e detalhe** passam `invite: !isOwner && !isAdmin`:
  - `CampaignCard.jsx`, `CampaignDetailPage.jsx`, `EventCard.jsx`, `EventDetailPage.jsx`;
  - o "dono" usa os helpers que já existem: `isCampaignOwner` / `isAdminAccount` (campaignDisplay); no evento, a mesma checagem de `EventDetailPage.jsx:124`.
- **Painel da ONG e admin** passam sempre `invite: false`. Ali quem vê é sempre o dono ou o admin:
  - `OngCampaignsPanel`, `OngEventsPanel`, `EventParticipantsModal`;
  - `AdminCampaignRow`, `AdminEventRow`.

## N2. Atalhos da ONG na sidebar

`core/components/layout/PlatformSidebar.jsx` (lista `shortcuts`). Para `userType === 'ONG'`:

| Atalho | Destino |
|---|---|
| **Meus animais** | `PANEL_PATHS.animals` |
| **Cadastrar animal** | `PANEL_PATHS.animalNew`, no lugar do `/animais/criar`, igual ao CTA de `AnimaisListPage` |
| **Criar evento** | `PANEL_PATHS.eventNew` (ícone `FaCalendarPlus`) |
| **Criar campanha** | `PANEL_PATHS.campaignNew` (ícone `FaHandHoldingHeart`) |

- `PANEL_PATHS` vem de `features/ong/panel/panelPaths.js`.
- Ordem para a ONG: Painel, Favoritos, Meus animais, Cadastrar animal, Criar evento, Criar campanha, Meus interesses, Interesses recebidos, Chat.
- A pessoa continua exatamente como está. O admin também (só o painel).

## N3. Foto no banner "Próximo evento"

`features/eventos/components/HeroEventBanner.jsx`, no mesmo esquema do `HeroSosBanner.jsx` de campanhas:
- `section` com `bg-emerald-950`.
- Com `event.coverUrl`: foto de fundo (`-z-20 bg-cover bg-center opacity-70`) e o degradê `from-emerald-950/95 via-emerald-950/70 to-emerald-950/20` por cima.
- Sem foto: continua o degradê verde com pontinhos de hoje.
- O selo de data (`CalendarDateBadge`) continua à direita no desktop. Ele fica sobre a parte mais clara da foto, mas o selo é branco e sólido, então continua legível.

## N4. AUmatch: painel que abre e fecha ao lado do deck

**O que você pediu:**
- o painel de filtros volta para o lugar antigo, uma coluna à esquerda do deck;
- um botão no canto superior esquerdo mostra e esconde o painel;
- ao abrir:
  - o painel entra deslizando da esquerda;
  - o deck e os botões andam para a direita;
  - o título "AUmatch / Arraste para encontrar seu match" sai do centro e desliza para a esquerda;
- ao guardar, tudo volta ao centro.

**Desktop (`lg+`), em `features/aumatch/pages/AumatchPage.jsx`:**
- **Estado** `isPanelOpen`:
  - começa fechado;
  - fica lembrado no navegador (`localStorage` com try/catch; se falhar, só começa fechado).
- **Coluna do painel:**
  - um wrapper com transição de largura: `lg:w-0` fechado, `lg:w-[30%] lg:max-w-sm` + margem aberto;
  - dentro, o painel faz `-translate-x-full opacity-0` → `translate-x-0 opacity-100`;
  - fechado, ele fica `inert` (o Tab não entra nele);
  - o conteúdo é o do antigo `MatchPreferencesSidebar`: vidro, título, "N pets na sua fila" e `MatchPreferencesPanel`. Recrio o componente a partir do git (`3708eae^`), com prop de aberto/fechado.
- **Deck:**
  - continua `flex-1` e centralizado na própria coluna;
  - como a coluna do painel cresce aos poucos, o deck desliza para a direita sozinho, sem animação extra.
- **Título:**
  - o bloco do header vira `w-fit`, com posição relativa;
  - fechado: `left: 50%` + `translateX(-50%)`, centralizado;
  - aberto: `left: 0` + `translateX(0)`, à esquerda;
  - os dois têm transição, com a mesma duração do painel. O alinhamento interno (centro → esquerda) troca junto.
- **Botão:**
  - fica no canto superior esquerdo da área do deck/painel: "Filtros e preferências", com o contador de filtros ativos;
  - aberto, vira "Guardar filtros", com ícone de seta para a esquerda;
  - o botão de hoje, no canto direito do deck, sai.
- **Animação:**
  - `duration-500 ease-out` em tudo, para andar junto;
  - `motion-reduce:transition-none`.

**Mobile e tablet (`< lg`):**
- Não há espaço para coluna lateral, então continua a gaveta (`MatchPreferencesDrawer`), aberta pelo mesmo botão do canto esquerdo.
- O título fica sempre centralizado.
- O botão decide pelo tamanho da tela: `matchMedia('(min-width: 1024px)')` abre a coluna; senão, abre a gaveta.
- A gaveta volta a ter `lg:hidden`, para não aparecer junto da coluna.

---

## Arquivos principais

- `features/doacoes/utils/campaignDisplay.js`, `features/eventos/utils/eventDisplay.js` e os 9 lugares que os chamam.
- `core/components/layout/PlatformSidebar.jsx`.
- `features/eventos/components/HeroEventBanner.jsx`.
- `features/aumatch/pages/AumatchPage.jsx`:
  - novo `features/aumatch/components/filters/MatchPreferencesSidebar.jsx`;
  - `MatchPreferencesDrawer.jsx` (`lg:hidden`).
- Docs: o plano em `docs/planos-front/` e a linha no `docs/README.md`. Os contratos não mudam.

## Ordem

N1 → N2 → N3 → N4, um commit por bloco, e o plano marcado como entregue no fim.

## Verificação

- `npm run lint` (os 5 erros antigos são a linha de base) e `npm run build` a cada bloco. Revisão do diff.
- **Grep** de travessão nos textos novos, para não reintroduzir.
- **N4 no navegador.** É o único bloco em que a animação só se confere vendo. Se você quiser, abro o `npm run dev` e confiro:
  - no desktop: abrir e guardar o painel; o título e o deck deslizam;
  - em 375px: abre a gaveta.

  Sem o seu ok, fico em lint + build e aviso que não testei.
