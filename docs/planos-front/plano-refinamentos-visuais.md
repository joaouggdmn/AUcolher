# AUcolher — Plano: refinamentos visuais e de fluxo

> Documento vivo: marcar os blocos (✅) conforme forem entregues e registrar desvios.

## Contexto

Lista de ajustes pedida em 2026-10-17. A maior parte é visual e só no front. Quatro decisões foram tomadas na conversa, e três delas tocam o backend:

| Tema | Decisão | Onde |
|---|---|---|
| Categorias | Eventos ganham **Arrecadação**, **Passeio e encontro** e **Outro**. Campanhas ganham **Castração**, **Resgate** e **Outro**. Com "Outro", a ONG escreve um nome curto (até 30 caracteres) que aparece no selo. No filtro, "Outro" agrupa todos esses. | Eventos: back + front. Campanhas: só front (mock). |
| Urgência | Fica, com limite: **1 campanha urgente ativa por ONG** | Só front (mock) + contrato |
| Chat | Botão **"Ainda não recebi"** para o adotante. O pedido volta para ACCEPTED e o chat é desbloqueado. | Back + front |
| Cidades | Endpoint novo `GET /api/animals/cities`. No AUmatch, as cidades saem do próprio deck. | Back + front |
| Marcar como adotado | **Sai do front** (recomendação minha, alinhada com a sua). O status ADOPTED passa a vir só da conclusão do pedido. Animal adotado fora da plataforma: "Tirar do ar". | Só front + regras |

Branches:
- front `feature/refinamentos-visuais`;
- back `feature/refinamentos`.

O modo de commit (eu commito ou passo os comandos) será perguntado antes do primeiro bloco.

---

## Front, parte 1 (sem depender do back)

### R1. Travessões

- Trocar `—`/`–` em **todo texto visível**: JSX, toasts, `aria-label`, `title`, mensagens de status e textos de seed/mock que aparecem na tela.
- A pontuação substituta muda caso a caso: vírgula, ponto, dois-pontos ou parênteses.
  - Ex.: `"Cancelado — pet adotado por outra pessoa"` → `"Cancelado: pet adotado por outra pessoa"`.
  - Ex.: `© 2026 AUcolher — Feito com carinho` → `© 2026 AUcolher · Feito com carinho`.
- Não mexer em:
  - comentários;
  - o `'—'` sozinho usado como "valor vazio" em números (`OverviewTiles`, `ReturnRateCard`, `AccountActivity`, `PublicProfileHeader`, `LevelIndicator`). É símbolo, não pontuação de frase. Se você quiser, troco por "–" ou "0".
- Arquivos principais (lista do grep):
  - `ResolvedRequestRow.jsx`, `Footer.jsx`, `AuthForm.jsx`, `Navbar.jsx`, `PlatformSidebar.jsx`, `UserAvatarMenu.jsx`;
  - `matchScore.js`, `chatService.js`, `requestStatus.js`, `MyInterestsPage.jsx`, `StepBasicInfo.jsx`, `EventForm.jsx`;
  - `CampaignFormPage.jsx`, `EventFormPage.jsx`, `OngAccountForm.jsx`, `PersonAccountForm.jsx`, `VisitingHoursEditor.jsx`, `LifestyleForm.jsx`;
  - `FavoritesEmptyState`, `FinalCtaSection.jsx`, `TrustJourneySection.jsx`, `quizQuestions.js`, `seedEventos.js`, `adocaoService.js`.
- Verificação: grep final por `—|–` sem comentários. Só podem sobrar os placeholders de número.

### R2. Home

- **Números do hero:**
  - remover `<PlatformStatsBar />` de `features/home/components/Hero/HeroSection.jsx:50`;
  - apagar `PlatformStatsBar.jsx` e `usePlatformStats.js` se ficarem órfãos;
  - `useHomeAnimals` continua só se outra seção usar.
- **"Participar do evento"** na vitrine das ONGs (`OngShowcase/OngEventItem.jsx`):
  - reaproveitar `features/eventos/components/AttendanceButton.jsx`. Ele já trata login, ADMIN, evento da própria ONG, lotado/passado e toast;
  - adicionar um tamanho `sm` em `SIZES` com o mesmo visual da pílula "Doar" (`h-10 rounded-full px-4 text-sm`);
  - adicionar a prop opcional `idleLabel`. Na home o texto é "Participar do evento"; confirmado, continua "Presença confirmada";
  - a linha do evento quebra o botão para baixo no mobile.

### R3. Animais (visual)

- `features/animais/components/AnimalCard.jsx:32`: tirar `transition-transform duration-500 ease-in-out group-hover:scale-110` da foto. A sombra do card e a animação do "Conhecer" (linhas 105 e 110) ficam.
- Final de `AnimaisListPage.jsx`, depois do `ShowMoreButton`: um `CreateEntityCta` (`core/components/ui/CreateEntityCta.jsx`), no mesmo padrão de `EventsListPage.jsx:184-193`. "Tem um animal para doar? Cadastre e encontre um lar para ele."
  - Pessoa → `/animais/criar`.
  - ONG → `PANEL_PATHS.animalNew`.
  - Visitante → `onNeedsLogin`.
  - ADMIN → não aparece (admin não participa).

### R4. Eventos e campanhas (cards e subtítulo)

- Tirar o zoom da capa:
  - `features/eventos/components/EventCard.jsx:45` (`group-hover:scale-110`);
  - `features/doacoes/components/CampaignCard.jsx:77`.
  - A sombra e o anel do card ficam, igual ao card de animal.
- `EventsListPage.jsx:121-130`: subtítulo curto abaixo do `<h1>`, com a mesma classe das outras páginas (`<p className="max-w-xl text-slate-600">`): "Feiras, mutirões e encontros das ONGs perto de você."

### R5. Campanhas (banner + urgência + categorias)

- **Banner SOS** (`features/doacoes/components/HeroSosBanner.jsx`):
  - foto `opacity-40` → `opacity-70`;
  - degradê `from-emerald-950 via-emerald-950/95 to-emerald-950/60` → `from-emerald-950/95 via-emerald-950/70 to-emerald-950/20`;
  - o texto da esquerda continua legível.
- **Limite de urgência:**
  - em `CampaignForm.jsx:101-110`, procurar entre as campanhas da própria ONG outra urgente ativa (não encerrada, `id` diferente);
  - se houver, o `ToggleSwitch` fica desligado com o aviso "Você já tem uma campanha urgente ativa: {título}." e um link para ela;
  - o mock (`doacoesMock.js`) também recusa (create/update), simulando a regra do back;
  - entra no contrato de campanhas em `docs/entrega-final/`.
- **Categorias:**
  - `features/doacoes/components/filters/filterOptions.js`: + `NEUTERING` "Castração", `RESCUE` "Resgate", `OTHER` "Outro", com ícone/cor no meta;
  - campo `customCategory`: no form (aparece com "Outro", obrigatório, máx. 30), em `campaignForm.js`, no mapper de `doacaoService.js` e no mock/seed;
  - helper `getCategoryLabel(campaign)` que devolve `customCategory` quando `OTHER`, usado no card, no detalhe, na home e no admin;
  - contrato atualizado.

### R6. Sidebar, badges e barra de rolagem

- **Badges** (`core/components/layout/PlatformSidebar.jsx:148-156`):
  - tirar a variante `neutral` (rose-50/rose-600). Todos ficam `bg-red-500 text-white` com `formatBadge` ("9+");
  - por coerência, o coração da Navbar (`Navbar.jsx:196`, `bg-rose-500`) e o `PanelNav.jsx:85` também passam para `bg-red-500`.
- **Barra de rolagem dos modais:**
  - nova utilidade `.scrollbar-soft` em `styles/global.css`, ao lado de `.scrollbar-hide` e `.scrollbar-dark`:
    - `scrollbar-width: thin`;
    - `scrollbar-color: slate-300 transparent`;
    - `::-webkit-scrollbar` de 6px com thumb arredondado;
    - `::-webkit-scrollbar-track { margin-block: 1.25rem }`, para a barra não encostar nos cantos `rounded-3xl`.
  - Aplicar em:
    - `PetDetailModal`, `MatchReasonsModal`, `ReviewForm`, `RegisterReturnModal`;
    - `DonationModal`, `ReportModal`, `HowToReportDialog`, `EventParticipantsModal` (container interno);
    - nos 4 drawers de filtro e no `PlatformSidebar`.
  - Modais de fundo escuro usam o `.scrollbar-dark` que já existe.

### R7. AUmatch (sem cidades)

- **Painel oculto:**
  - tirar `MatchPreferencesSidebar` do layout (`AumatchPage.jsx:266-267`);
  - o botão "Filtros e preferências" que hoje é só mobile (linhas 271-283) passa a aparecer em todos os tamanhos, no canto superior direito da área do deck, com um ponto quando houver filtro ativo;
  - ele abre o `MatchPreferencesDrawer`, que já existe;
  - o deck fica centralizado;
  - apagar `MatchPreferencesSidebar.jsx` se ficar órfão.
- **Sem ordenação:**
  - tirar o select "Ordenar matches" (`MatchPreferencesPanel.jsx:86-105`), as opções de `matchFilterOptions.js:5-8` e o ramo `RECENT` de `utils/matchFilters.js`;
  - o default fica `{ city: '' }`;
  - `useMatchPreferences` ignora o `sort` já salvo no localStorage.
- **"Meus interesses":** link no painel para `/meus-interesses` ("Ver meus interesses").

### R8. Minha conta

- **Menos texto.** Ficam o título de cada seção e os avisos que mudam comportamento ou privacidade. Saem:
  - as descrições dos grupos "Perfil público" e "Dados da conta" (`PersonAccountForm.jsx:36-40, 70-74`). Viram um selo curto "Público" / "Só você vê" ao lado do título;
  - descrições que repetem o título: "Foto, nome e algumas linhas sobre você"; "E-mail e senha usados para entrar"; "Por segurança, a senha não é exibida."; "Isso alimenta o algoritmo…";
  - o texto do cabeçalho de `AccountActivity.jsx:97-100` e as `description` dos 4 cards (o título e o número bastam);
  - o mesmo critério em `OngAccountForm.jsx` (linhas 84, 93, 106, 132, 146, 249, 313).
- **Ficam:** "E-mail não pode ser alterado por aqui", o texto do link de redefinição de senha e o aviso da exclusão de conta.
- **"Marcar como adotado" sai:**
  - o botão em `animais/components/owner/OwnerAnimalRow.jsx:110-120`;
  - o trecho de adotado em `OwnerListingPanel.jsx:71-129`;
  - os confirms em `ListedAnimalsTab.jsx:206-216` e na ONG `AnimalsPage.jsx:166-176`;
  - as props `onMarkAdopted`.
  - O texto de `MyAnimalsPanel.jsx:46-48` vira "Editar ou tirar do ar".
  - O back continua aceitando o PATCH; só o front deixa de oferecer.
  - Atualizar `docs/regras-de-negocios.md`: ADOPTED só vem da conclusão do pedido, o que também evita inflar o número de "adotados" do admin.

### R9. Interesses recebidos

- `adocao/components/ReceivedRequestCard.jsx:143-178`. Hoje os botões ficam desalinhados por quatro motivos:
  - um tem borda e o outro não;
  - "Confirmar Entrega" quebra a linha no grid de 3 colunas;
  - os ícones têm tamanhos diferentes (13 e 14);
  - o `hover:-translate-y-0.5` só levanta um dos dois.
- **Correção:**
  - empilhar os botões (`flex-col gap-2`, cada um `w-full h-10`): "Confirmar entrega" em cima e "Ir para o chat" embaixo;
  - borda transparente no primário, ícones de 13;
  - tirar o translate;
  - textos em minúscula ("Confirmar entrega", "Ir para o chat");
  - aplicar o mesmo na linha AWAITING_DELIVERY.

---

## Back (`feature/refinamentos`)

### B1. Categorias de evento

- `event/entity/EventCategory.java`: + `COLLECTION`, `MEETUP`, `OTHER`.
- `Event.java`: + `customCategory` (`custom_category VARCHAR(30)`).
- `EventRequestDTO`: + `customCategory` (`@Size(max = 30)`).
- `EventResponseDTO`: + `customCategory`.
- `EventService`:
  - com `OTHER`, o `customCategory` é obrigatório, com mensagem em pt-BR;
  - com outra categoria, ele é zerado;
  - o mesmo vale na edição do admin, se ela usar um DTO próprio.
- `sql/migrations/017_event_categories.sql`:
  - `DROP CONSTRAINT events_category_check`;
  - novo CHECK com as 7 categorias;
  - `ADD COLUMN custom_category VARCHAR(30)`.
- Atualizar `sql/schema.sql`.

### B2. Cidades dos animais

- `GET /api/animals/cities` → `List<String>`: cidades distintas (do dono) dos animais que aparecem na listagem pública, com o mesmo filtro base do `GET /api/animals`, ordenadas.
- Query no `AnimalRepository`. A rota é pública, igual à listagem; conferir o `SecurityConfig`.

### B3. "Ainda não recebi"

- `AdoptionRequestService.changeStatus`, caso `ACCEPTED`:
  - dono: continua como está (PENDING → ACCEPTED);
  - adotante: só a partir de `AWAITING_DELIVERY`, chamando um novo `request.returnToAccepted()`.
- Mensagens em pt-BR. O resto não muda.

---

## Front, parte 2 (depois do back)

### R10. Categorias de evento

- `features/eventos/components/filters/filterOptions.js`: + `COLLECTION` "Arrecadação", `MEETUP` "Passeio e encontro", `OTHER` "Outro", com meta de ícone/cor.
- `EventForm.jsx:103-107`: campo "Nome da categoria" aparece com "Outro".
- `utils/eventForm.js`, `toFrontendEvent`/payload e mock: carregar `customCategory`.
- Helper `getCategoryLabel(event)` usado em:
  - `EventCard`, `EventCover`, `EventDetailPage`;
  - `AttendedEventsPanel`, `AdminEventRow`, `AdminEventsPage`, `AdminEventEditPage`.
- Filtro: "Outro" agrupa todos os personalizados.
- Contrato de eventos em `docs/contratos-prontos/` atualizado.

### R11. Cidades reais

- Hook `useAnimalCities()` (React Query, chamando `GET /api/animals/cities` em `animaisApi.js`/`animalService.js`).
- `FiltersPanel.jsx:107-111` usa o hook, com "Todas as cidades" primeiro.
- AUmatch: as opções saem das cidades distintas do deck (`pet.city`, ordenadas com `localeCompare('pt-BR')`), num `buildCityOptions(pets)`.
- Apagar `CITY_OPTIONS` (`animais/components/filters/filterOptions.js:31-39`) se ficar órfão.

### R12. Chat: "Ainda não recebi"

- `AdoptionRequestContext.jsx`: `declineDelivery(id)`, que manda PATCH `ACCEPTED`.
- `useConcludeAdoption.js`: nova ação, com evento de sistema `DELIVERY_DECLINED` em `chatService.js`: "{Adotante} avisou que {pet} ainda não chegou. O chat foi liberado para vocês combinarem a entrega."
- `ConfirmAdoptionModal.jsx`: modo `decline-delivery`. O texto explica que o pedido volta para "Aceito" e sugere denunciar em caso de suspeita de golpe.
- `ChatConversationPanel.jsx:346-358`: ao lado de "Confirmar chegada do pet", o botão secundário "Ainda não recebi" e o link "Denunciar" (reaproveitando o `ReportModal` de usuário).
- `SentRequestCard.jsx` (AWAITING_DELIVERY): o mesmo botão.
- `requestStatus.js`: texto do status sem travessão.
- Contrato de adoção (`docs/contratos-prontos/`) e `regras-de-negocios.md` atualizados.

### Docs (junto com os blocos)

- `docs/regras-de-negocios.md`:
  - urgência (1 por ONG);
  - categorias + Outro;
  - ADOPTED só pela conclusão;
  - "Ainda não recebi".
- Contratos de eventos e adoção.
- Contrato de campanhas em `entrega-final/`.
- `docs/script_banco_aucolher.sql` copiado do `schema.sql` novo.

## Ordem

R1 → R9 (front, independentes) → B1–B3 (back) → R10–R12 (front que depende do back).

## Verificação

- **Front:** `npm run lint` (os 9 erros antigos são a linha de base) e `npm run build` a cada bloco. Revisão do diff. Sem navegador por padrão: digo isso no relatório e ofereço E2E só para o R12 (fluxo do chat), se você quiser.
- **Back:** `mvn compile` e os testes existentes.
- **Migration 017:** aplicar no `aucolher_db` local só depois do seu ok.
- **Checagens rápidas:**
  - grep de travessão sem resultados de texto;
  - `GET /api/animals/cities` devolve as cidades do seed;
  - PATCH ACCEPTED pelo adotante em AWAITING_DELIVERY volta o pedido;
  - pelo dono, a regra antiga continua.
