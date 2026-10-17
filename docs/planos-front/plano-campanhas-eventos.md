# AUcolher — Plano: campanhas, doações e eventos das ONGs

> Complementa a seção 10 de `regras-de-negocios.md`. Documento vivo: atualizar conforme as fases forem entregues.

## Contexto

Hoje campanhas e eventos são só vitrine: listas lidas de arrays mockados (`mockCampanhas.js`, `mockEventos.js`), sem vínculo com a ONG dona, sem CRUD, sem página de detalhe, com chave PIX estática fixa no `DonationModal` e presença em evento salva por usuário no localStorage. O backend Spring Boot ainda não tem nada disso (só auth + `PUT /api/usuarios/me`). Criar/editar e o painel da ONG são placeholders; todas as datas dos eventos mock já passaram, então `/eventos` aparece vazio.

Objetivo: modelar o domínio completo (campanha, doação via Mercado Pago PIX, evento, presença), implementar no frontend persistindo em localStorage com uma camada de serviço que espelha o contrato REST — ligar na API vira trocar uma flag — e entregar o contrato documentado para o parceiro de backend.

Caminhos abaixo são relativos a `src/` salvo indicação.

## 1. Decisões de produto

### Doações — Mercado Pago PIX (Orders API)
- Só PIX. Login obrigatório. Dinheiro vai para uma conta única da plataforma por enquanto; modelo pronto para OAuth por ONG depois (mudança só no backend).
- Qualquer conta logada doa (ONG inclusive), **exceto na própria campanha** — lá aparece "Gerenciar". "Meu impacto" passa a mostrar doações também para ONGs.
- Valores em **reais inteiros**; doação mínima **R$ 5**; chips R$ 10/25/50/100 + "outro valor".
- Fluxo: valor → `POST /api/campanhas/{id}/doacoes` → backend cria a order no MP → devolve QR + copia‑e‑cola → modal faz polling de `GET /api/doacoes/{id}` → aprovada (webhook ou consulta ao MP) → backend soma em `valorArrecadado` → modal mostra sucesso e a barra cresce.
- Status: `PENDENTE → APROVADA | EXPIRADA | CANCELADA`. Pendente expira em 30 min.
- A chamada ao MP é sempre no backend (o Access Token é secreto, nunca vai para o navegador).
- Modo mock: gateway falso gera código EMV fictício; botão "Simular pagamento (modo teste)" (só em dev + mock) aprova. No sandbox real: `payer.first_name = "APRO"` aprova o PIX automaticamente.
- Em desenvolvimento local o webhook do MP não alcança `localhost` (precisa de ngrok); por isso `GET /api/doacoes/{id}` também consulta o status no MP enquanto estiver `PENDENTE`.

### Campanha
- `ATIVA → ENCERRADA` (ONG encerra, ou vence o `prazo` opcional — status calculado na leitura).
- Meta atingida mostra "Meta atingida!" e continua aceitando doações. Encerrada é somente leitura.
- Excluir é sempre permitido: sem doações aprovadas → exclusão real; com doações → exclusão lógica (some de todas as telas, mas fica no banco para o histórico do doador, auditoria do pagamento e total do admin). Encerrar/excluir cancela as doações pendentes.

### Evento
- Confirmar/cancelar presença, contador de confirmados, `vagas` opcional ("Vagas esgotadas"), ONG vê a lista de confirmados.
- Não há presença no próprio evento nem em evento que já passou.
- Excluir: sem confirmados → real; com confirmados → lógica, status `CANCELADO`, e quem confirmou vê "Evento cancelado" em Minha conta.

### Verificação da ONG
Toda ONG só loga após aprovação do admin e já nasce verificada, então não há bloqueio por verificação na criação. O selo `VerifiedBadge` aparece nos cards/detalhes a partir de `ong.isVerificado` (seeds `true`).

### Extras
Só as abas "Campanhas" e "Eventos" no perfil público da ONG. (Descartados por ora: atualizações da campanha, mural de apoiadores, botão de compartilhar.)

## 2. Arquitetura

```
componente → hook React Query → fachada (xxxService.js: escolhe adaptador + mappers DTO↔modelo)
                                   ├─ xxxApi.js   (axios → Spring Boot: é o contrato em código)
                                   └─ xxxMock.js  (mesmas assinaturas, mesmos DTOs em português, localStorage)
```

- **Um trio por módulo**: `doacoes` (campanhas + doações) e `eventos` (eventos + presenças). As fachadas são os arquivos vazios já existentes `features/doacoes/services/doacaoService.js` e `features/eventos/services/eventoService.js`.
- **Flags** em `core/utils/constants.js`: `USE_MOCK_CAMPANHAS` / `USE_MOCK_EVENTOS` = `import.meta.env.VITE_USE_MOCK_... !== 'false'` (padrão mock). Migra módulo a módulo, como pede o §12 das regras.
- **Mock = servidor falso**: guarda linhas como o banco (status, totais e resumo da ONG calculados na leitura), lê o usuário logado de `aucolher_user` (simula o JWT), valida dono/papel/regras e lança erros no formato axios `{ response: { status, data: { mensagem } } }` — `core/utils/apiError.js#getErrorMessage` funciona igual nos dois modos. Lê/grava o localStorage a cada chamada (sem cache em memória) e faz o read‑modify‑write num bloco síncrono depois do `delay`.
- **Mappers** mantêm os nomes que os componentes já usam (`title`, `raisedAmount`, `goalAmount`, `coverUrl`, `ong.name`, `date`, `location.venue/city`, `organizer.name`) e acrescentam os novos. Padrão igual a `core/services/authService.js#toFrontendProfile`.
- **React Query** (padrão de `perfil/services/userService.js` + `usePublicProfile.js`): chaves centralizadas em `core/services/queryKeys.js`; chaves "me" incluem `userId` (o cache não é limpo no logout); `staleTime` 30 s para campanhas/eventos; status da doação com `staleTime: 0` e `refetchInterval` 3 s enquanto `PENDENTE`; `retry` global sem repetir 4xx (`main.jsx`). Mutations invalidam listas/detalhes/"me".
- **Sync entre abas (só mock)**: `core/hooks/useMockStorageSync.js` escuta `storage` e invalida as chaves correspondentes; montado em `App.jsx`.
- **Presença**: uma query `GET /usuarios/me/presencas` (só logado) alimenta todos os `EventCard` e "Eventos participados". `useEventAttendance` é reescrito por dentro mantendo o retorno `{ attendedIds, isAttending, toggleAttendance }` (+ `isPending`, `error`).
- **Imagens**: capa via `compressImage` (≈1000 px, q 0.7); snapshots de ONG/usuário no mock só guardam URL http (nada de data‑URL). Estouro de cota vira erro 400 legível.
- **Datas**: `LocalDateTime` sem `Z` (nunca `toISOString()` para "agora"); mapper aceita `HH:mm:ss` e corta para `HH:mm`. Seeds com datas relativas ao dia do seed; tabela versionada (subir a versão re‑semeia).
- **Lint** no código novo: nada de `setState` dentro de effect (derivar estado; formulários de edição com `key={id}` + `useState(() => ...)`), e `.jsx` só exporta componentes.

## 3. Modelo (DTO da API → modelo do frontend)

**Campanha**
`{ id, titulo, descricao, categoria (SAUDE|ALIMENTACAO|ESTRUTURA), isUrgente, metaValor, valorArrecadado, totalDoacoes, capaUrl, prazo (YYYY-MM-DD|null), status (ATIVA|ENCERRADA), dataCriacao, dataEncerramento, ong: { id, nome, isVerificado, cidade, estado } }`
→ `{ id, title, description, category, isUrgent, goalAmount, raisedAmount, donationsCount, coverUrl, deadline, status, isGoalReached, createdAt, closedAt, ong: { id, name, isVerified, city, state } }`.
Sai `isEmergency` (banner SOS = urgente ativa mais recente).

**Doação**
`{ id, valor, status, dataCriacao, dataAprovacao, pix: { qrCode, qrCodeBase64, ticketUrl, expiraEm } | null, campanha: { id, titulo, removida }, doador?: { id, nome } }`.
QR renderizado a partir de `qrCode` com `qrcode.react` (o base64 pode vir vazio).

**Evento**
`{ id, titulo, descricao, categoria (FEIRA|SAUDE|BAZAR|WORKSHOP), data, horaInicio, horaFim|null, localNome, cep, logradouro, numero, complemento, bairro, cidade, estado, vagas|null, totalConfirmados, capaUrl, status (ATIVO|CANCELADO), dataCriacao, ong: { id, nome, isVerificado } }`
→ `{ ..., date, startTime, endTime, location: { venue, cep, street, number, complement, district, city, state }, capacity, confirmedCount, spotsLeft, isFull, isPast, status, organizer: { id, name, isVerified } }`.
Sai `time` (string única) e `isFeatured` (hero = próximo evento).

**Presença** (lista da ONG): `{ usuario: { id, nome, fotoUrl }, dataConfirmacao }`.

## 4. Contrato REST

| Método | Rota | Quem | Observação |
|---|---|---|---|
| GET | `/api/campanhas?ongId=&status=` | público | padrão `ATIVA`; excluídas nunca aparecem |
| GET | `/api/campanhas/{id}` | público | 404 se excluída |
| POST | `/api/campanhas` | ONG | 201 |
| PUT | `/api/campanhas/{id}` | ONG dona | 400 se encerrada |
| POST | `/api/campanhas/{id}/encerrar` | ONG dona | cancela pendentes |
| DELETE | `/api/campanhas/{id}` | ONG dona | 204; real ou lógica |
| GET | `/api/usuarios/me/campanhas` | ONG | ativas + encerradas |
| POST | `/api/campanhas/{id}/doacoes` `{ valor }` | logado | 201 com `pix`; 400 se própria/encerrada/valor < 5 |
| GET | `/api/doacoes/{id}` | doador | se `PENDENTE`, backend consulta o MP |
| GET | `/api/usuarios/me/doacoes` | logado | histórico do doador |
| GET | `/api/usuarios/me/doacoes-recebidas` | ONG | aprovadas, com doador + campanha |
| POST | `/api/webhooks/mercadopago` | MP | só backend; valida assinatura |
| GET | `/api/eventos?ongId=` | público | `ATIVO`, data ≥ hoje |
| GET | `/api/eventos/{id}` | público | 404 se excluído |
| POST | `/api/eventos` | ONG | 201 |
| PUT | `/api/eventos/{id}` | ONG dona | `vagas` ≥ confirmados |
| DELETE | `/api/eventos/{id}` | ONG dona | real ou lógica (`CANCELADO`) |
| GET | `/api/usuarios/me/eventos` | ONG | inclui passados |
| POST / DELETE | `/api/eventos/{id}/presencas` | logado | idempotentes; devolvem o evento atualizado; 400 se lotado/passado/cancelado/próprio |
| GET | `/api/eventos/{id}/presencas` | ONG dona | confirmados |
| GET | `/api/usuarios/me/presencas` | logado | eventos confirmados, incl. passados/cancelados |

Sem PATCH (o CORS do backend não permite); listas são arrays simples (filtros de categoria/período continuam no cliente).

**Notas para o backend**
- `permitAll` para os GETs públicos de campanhas/eventos e para o webhook (hoje é `anyRequest().authenticated()`).
- Exceções novas mapeadas para 403 (não é dono / papel errado) e 404 (não existe / excluído) — hoje só há `BusinessException` → 400.
- Aprovação atômica: `UPDATE doacoes SET status='APROVADA' WHERE id=? AND status='PENDENTE'` e, só se 1 linha mudou, `valor_arrecadado = valor_arrecadado + ?` — webhook e polling juntos nunca somam duas vezes.
- `X-Idempotency-Key` em cada order criada no MP.
- Vagas: travar a linha do evento, contar e inserir; `UNIQUE (evento_id, usuario_id)`.
- Pagamento que chegar depois do cancelamento é aprovado mesmo assim (o dinheiro entrou).
- Booleans com `@JsonProperty("isUrgente")`, como já é feito com `isVerificado`.
- Rascunho SQL: `campanhas`, `doacoes` (`mp_order_id` UNIQUE, valores `NUMERIC(12,2)`), `eventos`, `evento_presencas` (PK composta).

## 5. Fases

Trabalhar na branch `feature/ong-campanhas-eventos`. Baseline de lint: 12 erros (critério: nenhum novo).

**Ordem de entrega**: primeiro **eventos** de ponta a ponta (fatias de eventos das fases 0–5, painel da ONG só com a aba Eventos), depois campanhas/doações. Blocos pequenos, 1 commit testado por bloco; o usuário roda os comandos git. Contrato de eventos já escrito em `docs/api-campanhas-eventos.md` (v1).

**Eventos** (5 commits na branch):
1. Camada de dados (`mockStore`, `queryKeys`, seed relativo, `eventosApi`/`eventosMock`/`eventoService`, hooks).
2. Vitrine, card, home, detalhe e presença (`AttendanceButton`); Minha conta com cancelados; `mockEventos.js` apagado.
3. Formulário criar/editar (`EventForm`, `CoverImageInput`, validação compartilhada com o mock).
4. Painel da ONG (`DashboardSections` genérico, confirmados, `DeleteEventDialog`/`ConfirmDialog`), atalho na sidebar.
5. Aba "Eventos" no perfil público da ONG.

Desvios do plano: a reescrita de `useEventAttendance` foi para o bloco 2 (junto com a troca de ids); o mock guarda eventos e presenças numa chave só (`aucolher_mock_eventos`, `createMockStore`); o DTO do evento ganhou `ong.fotoUrl`; lint baixou de 12 para 11 erros.

Para campanhas, já prontos para reaproveitar: `createMockStore`, `ConfirmDialog`, `CoverImageInput`, `LoadErrorState`, `DashboardSections` (nova aba), `queryKeys`/`useMockStorageSync` (nova chave). Pendência vista: a foto `photo-1517849845537` usada em `mockCampanhas.js` está quebrada.

**Atualização**: a branch recebeu o `main` (API de animais em inglês). A API inteira passou para inglês, então o contrato de eventos virou v2 em inglês (`/api/events`, `ADOPTION_FAIR|HEALTH|BAZAAR|WORKSHOP`, `ACTIVE|CANCELLED`; mock na versão 2) e campanhas nascem em inglês (`docs/api-campanhas-eventos.md` §6). Os nomes em português das seções abaixo (`/api/campanhas`, `titulo`, `ATIVA`...) valem só como histórico. A partir de agora o usuário faz os commits e pushes; o Claude entrega os comandos ao fim de cada bloco.

**Campanhas — ordem dos blocos** (mesmo formato de eventos, 1 commit por bloco):
1. ✅ Camada de dados: `campanhaRules.js`, `seedCampanhas.js` (13 campanhas, ~260 doações fictícias, foto quebrada trocada), `doacoesApi`/`doacoesMock`/`doacaoService`, `useCampanhas`/`useDoacoes`, flag `VITE_USE_MOCK_CAMPANHAS`, chaves e sync entre abas. Categorias `HEALTH|FOOD|INFRASTRUCTURE`; o arrecadado é a soma das doações aprovadas; o mock gera um "copia e cola" EMV fictício e só aprova por `simulateDonationApproval`.
2. ✅ Páginas públicas: lista com hook, filtros (urgente / quase lá / meta atingida), card com link, chips "Meta atingida!"/"Encerrada", prazo e botão "Gerenciar" na própria; banner SOS = urgente ativa mais recente; home com urgentes primeiro; detalhe `/campanhas/:id`; `mockCampanhas.js` apagado (lint 10 → 9).
3. ✅ Doação: `qrcode.react`; modal em portal com etapas derivadas (login → valor → PIX com QR, copia e cola, contagem e polling de 3 s também em segundo plano → aprovada / expirada com "Gerar novo PIX" / cancelada); "Simular pagamento" só em dev + mock; "Meu impacto" com doações aprovadas reais, também para ONG; `mockUserDonations.js` apagado.
4. ✅ Formulários: `CampaignForm` (categoria, urgente, meta, prazo opcional, capa) + criar `/campanhas/criar` e editar `/campanhas/editar/:id` (bloqueia outra ONG e encerrada); toast no detalhe.
5. ✅ Painel da ONG com 3 abas (Eventos, Campanhas, Doações recebidas); encerrar e excluir (real/lógica) com `ConfirmDialog`, também pelo detalhe.
6. ✅ Aba "Campanhas (n)" no perfil público da ONG (só ativas).

Tudo entregue, um commit por bloco, push na branch. PR para o `main` só depois dos testes do usuário.

**Fase 0 — Contrato e regras (só docs)**
- Novo `docs/api-campanhas-eventos.md` (hoje `contratos-prontos/api-eventos.md` e `entrega-final/api-campanhas-doacoes.md`) (seções 3 e 4 + fluxo MP + SQL) e cópia em `backend/Api_loginAdocao/adocao-api/docs/` (a pasta `docs/` do frontend é ignorada pelo git).
- `docs/regras-de-negocios.md`: reescrever §10 com as decisões acima; §12 com os novos módulos mockados e flags.

**Fase 1 — Fundação de dados (sem mudança visual)**
- `core/utils/constants.js` (flags, polling, expiração, chips, mínimo), `core/utils/storageKeys.js` (chaves das tabelas; remove `eventAttendanceStorageKey`).
- Novo `core/services/mock/mockTable.js`: `createMockTable({ key, version, seed })`, `nextId`, `mockDelay`, `mockHttpError`, `getMockSession`, `nowLocalIso`, `todayLocalIso`.
- Novos `core/services/queryKeys.js`, `core/hooks/useMockStorageSync.js` (montado em `App.jsx`); `main.jsx` com `retry` sem 4xx.
- Seeds novos `features/doacoes/data/seedCampanhas.js` e `features/eventos/data/seedEventos.js` com `ongId` 1/4/5 (`perfil/data/mockPublicProfiles.js`), datas relativas e todos os estados (urgente, meta atingida, encerrada, prazo vencido, evento lotado/quase lotado/passado, doadores e confirmados fictícios).
- `doacoesApi.js` + `doacoesMock.js` (EMV falso, expiração preguiçosa, `simulateDonationApproval`) + `doacaoService.js`; `eventosApi.js` + `eventosMock.js` + `eventoService.js`.
- Hooks `features/doacoes/hooks/useCampanhas.js`, `useDoacoes.js`, `features/eventos/hooks/useEventos.js`; reescrever `useEventAttendance.js`.
- `filterOptions.js` (dos dois módulos): `getCategoriaMeta()` com fallback; eventos ganham `buildCidadeOptions(events)`.

**Fase 2 — Páginas públicas de leitura**
- `doacoes/pages/CampaignsListPage.jsx`, `eventos/pages/EventsListPage.jsx`: hooks + loading/erro; hero SOS e hero de evento derivados; cidades vindas dos dados; resetar paginação nos handlers (remove 2 erros de lint).
- `CampaignCard.jsx` (link p/ detalhe, chips "Meta atingida!"/"Encerrada", selo, botão "Gerenciar" na própria), `DonationProgress.jsx` (meta 0), `EventCard.jsx` (faixa de horário, confirmados/vagas), `HeroEventBanner.jsx`, `SaveToCalendarMenu.jsx` (início/fim reais, endereço completo) — helper `formatTimeRange` em `eventos/utils/dateHelpers.js`.
- Home: `CampaignsPreviewSection.jsx`, `EventsPreviewSection.jsx` via hooks.
- Preencher `CampaignDetailPage.jsx` e `EventDetailPage.jsx` (capa, card da ONG com link para o perfil, link do Maps, estado "não encontrado"); ligar em `routers/publicRoutes.jsx`.
- Apagar `mockCampanhas.js` e `mockEventos.js`; `useAccountActivity.js`/`AttendedEventsPanel.jsx` deixam de importá‑los.

**Fase 3 — Doação e presença**
- `npm i qrcode.react` (v4, `QRCodeSVG`).
- Reescrever `DonationModal.jsx` com etapa derivada do estado (sem effect): login → valor (`DonationForm.jsx`, hoje vazio) → PIX (QR, copia‑e‑cola, contagem regressiva, polling) → sucesso/expirado; invalida campanha ao aprovar.
- Presença via mutation no `EventCard` e no detalhe, com toasts de erro (`InfoToast`/`SuccessToast`).
- `perfil/hooks/useAccountActivity.js`: doações de `useMinhasDoacoes` (só `APROVADA`, também para ONG), eventos da query de presenças; apagar `perfil/data/mockUserDonations.js`; `AttendedEventsPanel.jsx` mostra chip "Evento cancelado" sem link.

**Fase 4 — Painel e formulários da ONG**
- Novos `core/components/ui/ConfirmDialog.jsx` (variante perigo, estado processando; mesmo visual de `ConfirmAdoptionModal`) e `CoverImageInput.jsx` (`compressImage` + limite).
- `doacoes/components/CampaignForm.jsx` (novo) + `CampaignCreatePage.jsx` + novo `CampaignEditPage.jsx`; `eventos/components/EventForm.jsx` (CEP como em `OngAccountForm`: `CepField` + `useCepLookup`, `core/utils/brazilianStates.js`, vagas opcional, fim > início) + `EventCreatePage.jsx` + `EventEditPage.jsx`. Reusar `FormField`, `TextAreaField`, `PillToggleGroup`, `ToggleSwitch`, `core/utils/masks.js`.
- `ong/pages/OngDashboardPage.jsx` + `ong/components/dashboard/*`: cards de resumo que funcionam como abas (layout de `perfil/components/activity/AccountActivity.jsx`) — Campanhas / Eventos / Doações recebidas — e `EventParticipantsModal.jsx`; ações ver/editar/encerrar/excluir com `ConfirmDialog` explicando exclusão real vs lógica.
- `routers/protectedRoutes.jsx`: ligar as 5 páginas + nova rota `campanhas/editar/:id`. Página de edição checa dono (outra ONG → mensagem de permissão).
- Atalho "Painel da ONG" em `core/components/layout/PlatformSidebar.jsx` (Navbar passa `isOng`). Detalhes mostram ações de dono.

**Fase 5 — Perfil público da ONG**
- `perfil/pages/PublicProfilePage.jsx`: abas "Campanhas (n)" (com `DonationModal`) e "Eventos (n)" usando `useCampanhas({ ongId })` / `useEventos({ ongId })` com `enabled` só para ONG (hooks antes dos early returns); estados vazios.
- `docs/regras-de-negocios.md` §13: remover os placeholders entregues.

## 6. Verificação

- Toda fase: `npm run lint` (sem erros novos além do baseline; fase 2 reduz em 2) e `npm run build`.
- F1: tabelas semeadas aparecem no localStorage (DevTools); subir a versão re‑semeia; app idêntico ao atual.
- F2: `/eventos` lista futuros + hero; filtros e cidades funcionam; detalhes abrem; id inválido → "não encontrado". Com `VITE_USE_MOCK_EVENTOS=false`, a aba Network mostra as rotas `/api/eventos...` corretas (vão falhar até o backend existir — esperado).
- F3 (`npm run dev`, manual): deslogado → convite de login; doar → simular pagamento → sucesso e a barra sobe na lista e na home; esperar/forçar expiração → estado expirado; "Meu impacto" soma; presença alterna, contador e Minha conta atualizam; evento lotado bloqueia; duas abas sincronizam; ONG não vê doar/confirmar no que é seu.
- F4: criar/editar/encerrar/excluir (real e, após doação aprovada, lógica) refletindo nas páginas públicas; usuário comum em `/campanhas/editar/1` é redirecionado; encerrar cancela PIX pendente aberto; excluir evento com confirmados mostra "cancelado" para quem confirmou; lista de participantes e doações recebidas preenchidas.
- F5: `/ong/1` mostra as duas abas; perfil de pessoa não mostra; a própria ONG vê o que criou.

## 7. Fora do escopo

Implementação backend (endpoints, integração MP, webhook), OAuth por ONG, fluxo de aprovação de ONG, métricas do admin (§9.3) e o bug do `AdminRoute` (`user.role`). Limitação conhecida do mock: ids 1/4/5 das ONGs seed podem coincidir com ids reais do banco local.

## Referências

- [Pix – Orders API (Mercado Pago)](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-integration/pix)
- [Testar compra com Pix](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/integration-test/pix)
- [Pix no ambiente de teste](https://www.mercadopago.com.br/ajuda/pagar-pix-ambiente-de-teste_36545)
- [Split de pagamentos / marketplace (OAuth por ONG, fase futura)](https://www.mercadopago.com.br/developers/pt/docs/split-payments/split-1-1/integration-configuration/integrate-marketplace)
