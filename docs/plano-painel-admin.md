# AUcolher — Plano: painel do admin e denúncias

> Plano aprovado em 2026-10-10. Complementa as seções 8 e 9 de `regras-de-negocios.md`. Documento vivo: marcar os blocos (✅) conforme forem entregues e registrar desvios.
>
> **Status em 2026-10-11:** branch 1 (backend) mergeada, com a migração 003 aplicada no `aucolher_db`. Branch 2 (`feature/painel-admin`) mergeada no PR #6. Branch 3 (`feature/denuncias`) começou: decisões e blocos D1–D4 na seção 4.

## Contexto

As áreas de usuário e de ONG estão prontas (painel da ONG em `/ong/painel`, PR #5). Falta o papel **admin**, que hoje não existe em lugar nenhum:

- `core/guards/AdminRoute.jsx` checa `user.role`, que nunca é preenchido (o campo certo é `userType`). Por isso todo `/admin/*` volta para `/`.
- O backend (`UserType`) e o banco (`chk_users_user_type`) só aceitam `NGO | PERSON`.
- `features/admin/**` e `features/denuncias/**` existem, mas todos os arquivos estão vazios (0 B). As rotas `/admin/*` mostram `PlaceholderPage`.
- A API não lista contas nem animais adotados/fora do ar: a vitrine pública força `AVAILABLE`.

Caminhos abaixo são relativos a `src/` (frontend) ou a `src/main/java/com/aucolher/api/` (backend), salvo indicação.

## 1. Decisões (2026-10-10)

### Organização
- **Três branches, uma depois da outra**, cada uma com PR próprio:
  1. Backend `feature/admin-login` (repositório `backend/api-aucolher`).
  2. Frontend `feature/painel-admin`.
  3. Frontend `feature/denuncias`, criada a partir da `main` depois do merge da 2.
- Um bloco por vez. Ao fim de cada bloco o Claude para e entrega os comandos `git add` / `git commit` / `git push`, e o usuário roda. Commits sem atribuição ao Claude.

### Admin
- **Login real no backend** (exceção à regra "só frontend"): `ADMIN` entra no enum e no banco.
  - A primeira conta é criada na subida da API, a partir das variáveis de ambiente `ADMIN_EMAIL` / `ADMIN_PASSWORD` (`ADMIN_NAME` é opcional).
  - Sem as variáveis, nada é criado e o log avisa. Nenhuma senha vai para o Git.
- O cadastro público continua só para `PERSON` e `NGO`. O Google (OAuth2) continua criando `PERSON`.
- `/api/admin/**` fica restrito a `ROLE_ADMIN` desde já, mesmo sem endpoints ainda.
- Depois do login, o admin cai em `/admin`. No site, ele ganha o link "Painel do admin" (onde a ONG vê "Painel da ONG") e não tem checklist de perfil.

### ONGs
- **A ONG loga direto, sem aprovação do admin.** Saem a fila de aprovação (antiga §7) e o bloco "ONGs aguardando aprovação" (antiga §9.1).
- **Toda ONG é verificada**, aplicado no backend: o cadastro grava `is_verified = true` e a migração 003 marca as ONGs existentes. O campo continua existindo, caso um dia o selo precise ser retirado.

### Painel do admin
- Tela própria em `/admin`, igual ao painel da ONG: barra lateral escura, sem a navbar do site, gaveta no celular.
- Seções: **Visão geral** (números, gráficos e exportar PDF), **Usuários**, **Animais**, **Campanhas**, **Eventos** e, na 3ª branch, **Denúncias**.
- **PDF**: o botão "Exportar PDF" abre a impressão do navegador (`window.print()`) com um layout de impressão próprio, e o admin escolhe "Salvar como PDF". Não entra dependência nova.
- **De onde vêm os dados** enquanto não existem os endpoints `/api/admin/*`:

| Dado | Origem no modo mock |
|---|---|
| Animais | API real (`GET /api/animals`, todas as páginas, só disponíveis) mais as adoções concluídas tiradas dos snapshots dos pedidos. A situação vem de `withAdoptionStatus` |
| Contas (pessoas e ONGs) | Mock novo do admin: os 7 perfis de `perfil/data/mockPublicProfiles.js`, cerca de 25 contas geradas com datas espalhadas em 12 meses e os donos dos animais reais (upsert por id) |
| Pedidos de adoção | `aucolher_adoption_requests` (contexto global, localStorage) |
| Campanhas e doações | `doacoesMock`: todas as ONGs e todos os status, inclusive excluídas |
| Eventos | `eventosMock`: todas as ONGs, inclusive passados e cancelados |
| Denúncias (3ª branch) | Mock novo `reportsMock` |

### Denúncias (3ª branch)
- Banir e remover **já têm efeito no site no modo mock** (detalhes na seção 5).

## 2. Arquitetura (frontend)

Mesmo trio dos outros módulos mockados:

```
componente → hook React Query (features/admin/hooks/useAdmin.js)
           → fachada adminService.js (escolhe o adaptador + mappers DTO → modelo)
                ├─ adminApi.js  (axios → /api/admin/*: é o contrato em código)
                └─ adminMock.js (mesmas assinaturas e DTOs, "servidor falso" no localStorage)
```

- **Configuração do módulo:**
  - flag `USE_MOCK_ADMIN` em `core/utils/constants.js` (`VITE_USE_MOCK_ADMIN !== 'false'`; o padrão é mock);
  - chave `MOCK_ADMIN_STORE_KEY` em `core/utils/storageKeys.js`;
  - entrada no `MOCK_STORE_QUERIES` de `core/hooks/useMockStorageSync.js`;
  - prefixo `admin` em `core/services/queryKeys.js`.
- **Como o `adminMock` funciona:**
  - usa `createMockStore`, `mockDelay`, `mockHttpError` e `getMockSession` (`core/services/mock/mockStore.js`), mais um `requireAdmin()` que devolve 403 se a sessão não for `ADMIN`;
  - para ler dados de outros módulos, `doacoesMock.js` e `eventosMock.js` exportam funções de leitura "de admin" (todas as linhas, todos os status). Eles continuam donos das próprias tabelas e do `toDto`; o `adminMock` só junta os resultados;
  - também chama a API real de animais, o único dado de admin que já existe de verdade.
- **Peças comuns dos painéis vão para `core/`** (bloco F1). O painel da ONG passa a usar as mesmas peças, sem mudança visual:
  - `core/components/panel/`: `PanelShell`, `PanelNav`, `PanelPage`;
  - `core/components/charts/`: `ChartCard`, `ColumnChart`, `BarList`, `StackedBar`, `ChartTooltip`.
- **Regras de sempre:**
  - a animação de troca de seção é **só de opacidade**, porque um transform prende os modais `fixed`;
  - modais do painel usam `ConfirmDialog` (portal);
  - nada de `setState` dentro de effect;
  - arquivos `.jsx` só exportam componentes.

## 3. Contrato `/api/admin/*` (rascunho, detalhado em `docs/api-admin.md` no bloco F3)

| Método | Rota | Quem | Observação |
|---|---|---|---|
| GET | `/api/admin/stats` | ADMIN | Totais e séries mensais num DTO só (alimenta a Visão geral e o PDF) |
| GET | `/api/admin/users?type=&status=` | ADMIN | Todas as contas, menos admins |
| GET | `/api/admin/animals` | ADMIN | Todos os status (`AVAILABLE`, `ADOPTED`, `INACTIVE`), com o dono |
| GET | `/api/admin/campaigns` | ADMIN | Ativas, encerradas e excluídas, com o arrecadado |
| GET | `/api/admin/events` | ADMIN | Próximos, passados e cancelados, com confirmados |
| POST | `/api/reports` | logado | 3ª branch |
| GET | `/api/admin/reports?status=` | ADMIN | 3ª branch |
| POST | `/api/admin/reports/{id}/resolve` | ADMIN | 3ª branch. Corpo `{ resolution }` |
| PATCH | `/api/admin/users/{id}/status` | ADMIN | 3ª branch. Banir/reativar via `users.active`, que o login já respeita ("Usuário inativo") |
| DELETE | `/api/admin/animals/{id}` (e campaigns/events) | ADMIN | 3ª branch. Remoção pelo admin |

As listas são arrays simples, porque o volume é pequeno. Busca e filtros ficam no cliente, como no painel da ONG.

Rascunho do `stats`:

```json
{
  "users":     { "total": 32, "persons": 25, "ngos": 7,
                 "newByMonth": [{ "month": "2026-05", "persons": 3, "ngos": 1 }] },
  "animals":   { "available": 18, "inProgress": 3, "adopted": 9,
                 "bySpecies": { "DOG": 14, "CAT": 15, "OTHER": 1 } },
  "adoptions": { "funnel": { "received": 40, "accepted": 15, "delivery": 11, "concluded": 9 },
                 "concludedByMonth": [{ "month": "2026-05", "count": 2 }] },
  "donations": { "totalRaised": 41250, "approvedCount": 260,
                 "raisedByMonth": [{ "month": "2026-05", "amount": 5300, "count": 31 }] },
  "campaigns": { "active": 9, "closed": 4 },
  "events":    { "upcoming": 5, "past": 3, "cancelled": 1 },
  "topNgos":   [{ "id": 4, "name": "Abrigo Amigo Fiel", "raised": 18050, "adoptions": 4 }]
}
```

## 4. Roteiro

### Branch 1 — backend `feature/admin-login`

- [x] **B1. Tipo ADMIN, ONG verificada e migração** — feito em 2026-10-10 (testes ok; 003 testada em banco temporário: recusa ADMIN antes, aceita depois, marca ONGs, roda 2x sem erro)
  - `user/entity/UserType.java`: acrescentar `ADMIN`.
  - `auth/AuthService.java#registerNgo`: `.verified(true)` e trocar o comentário do "fluxo temporário".
  - `sql/migrations/003_admin_and_verified_ngos.sql`, numa transação:
    - recria `chk_users_user_type` com `ADMIN`;
    - `UPDATE users SET is_verified = TRUE WHERE user_type = 'NGO'`;
    - comentário novo em `is_verified`.
  - `sql/schema.sql` com a mesma CHECK e o mesmo comentário. Copiar igual para `frontend/AUcolher/docs/script_banco_aucolher.sql`.
- [x] **B2. Primeira conta admin e `/api/admin/**`** — feito em 2026-10-10. Testado de ponta a ponta em banco temporário: o admin loga com `userType: ADMIN`; reiniciar não duplica nem troca a senha; ONG nova sai verificada; `/api/admin` dá 401 sem token, 403 para pessoa e passa para o admin. **Desvio**: o `SecurityConfig` passou a liberar o repasse interno para `/error` (`DispatcherType.ERROR`) — sem isso todo 403 da camada de segurança chegava ao front como 401, e o `api.js` desloga no 401. A 003 já foi aplicada no `aucolher_db` (backup antes).
  - `auth/AdminAccountInitializer.java` (`ApplicationRunner`) lê `app.admin.email|password|name`:
    - em branco: só avisa no log;
    - e-mail novo: cria a conta `ADMIN`, `LOCAL`, ativa, com a senha via `PasswordEncoder`;
    - e-mail que já existe: não mexe (avisa no log se a conta não for ADMIN).
  - `application.properties`: `app.admin.email=${ADMIN_EMAIL:}`, `app.admin.password=${ADMIN_PASSWORD:}`, `app.admin.name=${ADMIN_NAME:Administrador}`.
  - `config/SecurityConfig.java`: `.requestMatchers("/api/admin/**").hasRole("ADMIN")` antes do `anyRequest()`.
  - Teste `AdminAccountInitializerTest` (Mockito, no padrão do `AnimalServiceTest`) com 3 casos: cria; não duplica; ignora quando falta configuração.
- [x] **B3. README** — feito em 2026-10-11: valores de `userType`, migração 003, variáveis `ADMIN_*` e como defini-las no IntelliJ (Run Configuration → Environment variables).

**Verificação**
- Compilar e rodar os testes com o Maven do IntelliJ e o JDK 21.
- Testar num banco temporário (`aucolher_tmp_admin`, porta 8089), nunca no `aucolher_db`:
  - schema antigo → migração 003;
  - o login do admin devolve `userType: "ADMIN"`;
  - token de PERSON em `/api/admin/...` dá 403;
  - ONG nova sai com `isVerified: true`.
- No banco real, quem aplica a 003 é o usuário:

```
psql -U postgres -h localhost -d aucolher_db -f sql/migrations/003_admin_and_verified_ngos.sql
```

### Branch 2 — frontend `feature/painel-admin`

- [x] **F1. Refatoração: peças comuns dos painéis em `core/`** (sem mudança visual no painel da ONG) — feito em 2026-10-11. Desvio: no lugar de `monthlyColumns(items, ...)` ficaram duas funções, `bucketByMonth(items, { dateOf, valueOf })` (soma itens soltos por mês) e `monthColumns(points, { months, formatValue, countLabel })` (série mensal → colunas), porque o `stats` do admin já chega somado por mês; saída de `monthlyDonationColumns` conferida igual à antiga. `AnimalStatusChart` e `panelCharts.js` continuam em `features/ong`. Lint: 9 erros, os mesmos de antes.
  - `core/components/panel/PanelShell.jsx` (sai de `features/ong/panel/OngPanelLayout.jsx`), `PanelNav.jsx` (sai de `PanelSidebar.jsx`, configurável por props) e `PanelPage.jsx`.
  - `core/components/charts/*`, que saem de `features/ong/components/dashboard/charts/`.
  - `features/ong/utils/panelCharts.js`: nova `monthlyColumns(items, { dateOf, valueOf, months, format })`; `monthlyDonationColumns` vira atalho dela.
- [x] **F2. Acesso do admin** — feito em 2026-10-11. Desvios: `core/utils/panelLinks.js` (`getPanelLink`, `getHomePath`) concentra o atalho do painel por papel (navbar, menu do avatar, menu lateral); o `GuestRoute` passou a decidir o destino depois do login (página de origem ou início do papel) — antes ele mandava todo mundo para `/` e atropelava o redirecionamento do login, inclusive o "voltar para onde estava". Testado num ambiente isolado (API 8089 + banco temporário + front 5174): admin → `/admin`; pessoa e ONG em `/admin` → `/`; `/admin/dashboard` → `/admin`; login vindo de `/favoritos` volta para lá.
  - `AdminRoute` passa a checar `userType`. `LoginPage` manda o ADMIN para `/admin` quando não há `from`.
  - Link "Painel do admin" em `Navbar.jsx`, `UserAvatarMenu.jsx` e `PlatformSidebar.jsx`. `useProfileCompletion` ignora ADMIN.
  - `features/admin/panel/`: `adminPaths.js` (`/admin`, `/admin/usuarios`, `/admin/animais`, `/admin/campanhas`, `/admin/eventos`), `AdminPanelLayout.jsx` e `useAdminPanel.js`.
  - `routers/protectedRoutes.jsx`: rotas novas. `/admin/dashboard`, `/admin/estatisticas` e `/admin/aprovacoes` redirecionam para `/admin`.
  - Apagar os arquivos vazios sem uso: `OngApprovalsPage`, `OngApprovalCard`, `StatisticsPage`, `core/components/layout/AdminLayout.jsx` e os outros 0 B substituídos.
- [x] **F3. Camada de dados** — feito em 2026-10-11; contrato completo em `docs/api-admin.md`. Desvio: ids repetidos entre o seed e o banco real — a conta vista nos dados reais (dono de animal da API, ONG de campanha/evento) ocupa o lugar da fictícia quando o nome é outro; o ranking usa o nome do próprio dado. Testado contra a API de teste (3 animais reais + seed): números, listas e 403 para quem não é admin.: trio `adminApi`/`adminMock`/`adminService`, hooks, flag, chave, sync, seed de contas, leituras de admin em `doacoesMock`/`eventosMock` e `docs/api-admin.md` com o contrato completo.
- [x] **F4. Visão geral** — feito em 2026-10-11. 8 blocos (inclui "contas novas neste mês"), gráficos mensais com mensagem quando tudo é zero, situação + espécie no mesmo cartão, funil, ranking de ONGs e atividade recente. Extras: `StatTile` comum aos dois painéis; helpers `*FromCounts` em `panelCharts.js`; `BarList` aceita `valueText`; a dica dos gráficos se alinha pela borda de dentro nas pontas (antes a da última coluna vazava e criava rolagem lateral, também no painel da ONG). Paleta validada (verde/âmbar/azul, inclusive daltonismo).
  - Números: contas (pessoas · ONGs), animais disponíveis, adoções em andamento, adoções concluídas, total arrecadado, campanhas ativas, eventos próximos.
  - Gráficos:
    - adoções concluídas por mês;
    - novas contas por mês, com a divisão pessoas/ONGs;
    - arrecadado por mês;
    - situação dos animais;
    - animais por espécie;
    - funil do pedido à adoção;
    - top 5 ONGs (arrecadação e adoções);
    - atividade recente da plataforma.
  - Período de 6 meses, igual ao painel da ONG (o helper aceita `months`).
- [x] **F5. Exportar PDF** — feito em 2026-10-11. `PanelPage` ganhou ações com `onClick` e `printHeader` (troca o título pelo cabeçalho do relatório na impressão); `usePrintTimestamp` grava a hora no `beforeprint` (botão ou Ctrl+P). Conferido gerando o PDF de verdade num Chrome headless (A4, 3 páginas, sem barra lateral, gráficos coloridos, textos dos blocos sem corte).
  - O botão chama `window.print()`.
  - `print:hidden` na barra lateral, no cabeçalho e nos botões.
  - Na impressão, o shell perde `h-screen`/`overflow`, para sair a página inteira.
  - Cabeçalho que só aparece impresso: "Relatório AUcolher · gerado em dd/mm/aaaa hh:mm".
  - `break-inside-avoid` nos cards.
  - Em `styles/global.css`: `@page { size: A4; margin: 12mm }` e `print-color-adjust: exact`.
- [x] **F6. Usuários** — feito em 2026-10-11. Busca (nome, e-mail, cidade) com `core/utils/search.js` (`matchesSearch`, também usado agora no painel da ONG), filtros por tipo e — só quando houver banidas — por situação, 20 por vez com "Mostrar mais". O selo `VerifiedBadge` deixou de falar em "cadastro aprovado pela equipe".
  - Busca, filtros (tipo, status), mais recentes primeiro.
  - Cada linha: avatar, nome, tipo, selo, cidade/UF, membro desde, nº de animais e "Ver perfil".
- [x] **F7. Animais** — feito em 2026-10-11. Situação calculada por `withPlatformAdoptionStatus` (mesmo critério do adminMock, então a página bate com a Visão geral); filtros de situação e espécie, busca por nome, raça, quem anunciou e cidade; link para o anúncio e para o perfil de quem anunciou. Testado com pedido aceito (em processo) e concluído (adotado).: gráficos de situação e espécie, busca, filtros (situação, espécie), linhas no estilo do `AnimalRow` e "Ver anúncio".
- [x] **F8. Campanhas e Eventos** — feito em 2026-10-11. Cada página tem 4 blocos de números, um gráfico por categoria (arrecadado / quantidade), filtros por situação (com contagem) e busca. Situações e rótulos em `features/admin/utils/listStatus.js`. Excluídas e canceladas aparecem sem link (não têm mais página pública).
  - Campanhas: total arrecadado e filtros ativas/encerradas/removidas.
  - Eventos: próximos/passados/cancelados, com confirmados.
  - Links para as páginas públicas.
- [x] **F9. Dados de teste do admin (só dev)** — feito em 2026-10-11. Card na Visão geral (só em `npm run dev`, nunca na impressão): ~18 contas novas, 15 adoções concluídas e o resto do funil, e 5 campanhas encerradas com doações, tudo nos últimos 6 meses e com curva crescente. Marcados com `adminDemo` (o "Apagar" do painel da ONG usa `demo` e não mexe nisto, e vice-versa); donos são as ONGs geradas (ids ≥ 101), que não existem no banco real. Desvio: sem eventos de teste — o seed de eventos já cobre todos os estados. Testado: gerar enche os gráficos; apagar volta exatamente aos números de antes.
  - Card como o `ong/panel/dev/DemoDataCard.jsx`.
  - Gera contas, adoções concluídas espalhadas nos meses e campanhas/doações/eventos de várias ONGs (`insertDemoCampaigns`, `insertDemoEvents`), tudo com `demo: true`.
  - Botão "Apagar" para remover o que gerou.

**Verificação**
- `npm run lint` (nenhum erro novo) e `npm run build` a cada bloco.
- No navegador, com a API local já com a 003 e as variáveis `ADMIN_*`:
  - o admin cai em `/admin`;
  - PESSOA/ONG em `/admin` voltam para `/`;
  - os gráficos aparecem com a semente e com os dados de teste;
  - filtros e buscas funcionam;
  - a pré-visualização de impressão sai em A4 limpo;
  - a gaveta funciona no celular;
  - o painel da ONG continua igual (regressão da F1).

### Branch 3 — frontend `feature/denuncias`

Criada da `main` em 2026-10-11, depois do merge do PR #6 (painel do admin). Os pontos em aberto da seção 5 foram fechados no mesmo dia (todas as recomendações aceitas).

**Decisões (2026-10-11)**
- Alvos: **anúncios de animais** e **perfis de pessoa/ONG**. Campanhas, eventos e avaliações ficam fora.
- Categorias conforme o alvo; descrição de até 500 caracteres, obrigatória em "Outro":
  - anúncio: conteúdo impróprio, maus-tratos, golpe/fraude, spam, outro;
  - perfil: perfil falso, golpe/fraude, maus-tratos, conteúdo impróprio, spam, outro.
- O admin pode **arquivar** (improcedente), além de remover o anúncio ou banir a conta.
- Conta banida **pode ser reativada**: volta a logar e o conteúdo dela reaparece. Pedidos cancelados continuam cancelados.
- **Ações diretas nas listas**, sem denúncia: banir/reativar em Usuários; remover em Animais, Campanhas e Eventos. Sempre com confirmação.
- Anúncio removido some do site, mas o **dono vê "Removido pela moderação"** no painel e em Minha conta, sem poder reativar.
- Campanha ou evento removido pelo admin some também para a ONG (como uma exclusão dela); o admin vê "Removido pela moderação".
- Modo mock: uma conta é identificada por **id + nome** (os ids 1–7 do mock se repetem com os do banco real; ver seção 6). Assim, banir a "Abrigo Amigo Fiel" (mock 4) não bane a ONG real de id 4.

**Arquitetura**
- Denúncias: trio `features/denuncias/services/` (`denunciasApi` / `denunciasMock` / `denunciaService`), flag `USE_MOCK_DENUNCIAS`, chave `aucolher_mock_denuncias`, hooks em `features/denuncias/hooks/useDenuncias.js`. O `denunciasMock` exporta leituras/escritas "de admin" que o `adminMock` usa (como `readAllCampaignsForAdmin`).
- Moderação: `features/admin/services/moderationMock.js`, chave `aucolher_mock_moderacao` (`bannedAccounts`, `removedAnimals`). As rotas `/api/admin/*` de moderação ficam em `adminApi`/`adminMock`.
- Efeitos no site, só com `USE_MOCK_ADMIN` (com a API real, quem filtra é o backend):
  - animais (API real): a fachada `animalService` aplica a moderação — some da vitrine, do perfil e dos favoritos; o detalhe mostra "Anúncio indisponível"; em "meus animais" o removido vem com `status: 'REMOVED'`;
  - campanhas e eventos (mock): o próprio `doacoesMock`/`eventosMock` esconde os da ONG banida;
  - login e sessão: `authService` recusa conta banida ("Conta suspensa"); a sessão aberta é encerrada;
  - pedidos (localStorage): banir cancela os pedidos ativos da conta (`cancelReason: 'ACCOUNT_BANNED'`), e a outra parte vê o motivo.

**Blocos** (um commit cada; o usuário commita e dá push ao fim de cada um)
- [x] **D1. Denunciar (lado do site)** — feito em 2026-10-11. Testado no ambiente isolado: anúncio e perfil denunciados ("Denúncia em análise" depois), validação de motivo e de "Outro", 409 na repetida, 400 no próprio conteúdo e motivo inválido para o alvo, convite para logar (e volta ao anúncio depois do login), botão escondido para o dono e para o admin, rodapé "Como denunciar", layout em 375 px. Extra: seed com 4 denúncias pendentes contra os perfis 5, 6 e 7 e 1 arquivada contra o 1.
  - Camada de dados das denúncias: flag, chave, `queryKeys.denuncias`, sync entre abas, trio + hooks.
  - `ReportButton`, `ReportModal`, `ReportReasonSelect` (portal, `AuthRequiredModal` para quem não logou, "Denúncia em análise" quando já existe uma aberta, escondido no próprio conteúdo e para o admin).
  - Botão no detalhe do animal e no perfil público. Rodapé: "Denunciar anúncio" abre uma explicação de como denunciar (a rota `/denuncia` não existe).
  - `docs/api-admin.md`: `POST /api/reports` e `GET /api/reports/mine`.
- [x] **D2. Tela Denúncias no admin (consultar e arquivar)** — feito em 2026-10-11. Rota de arquivar por id (`POST /api/admin/reports/{id}/dismiss`, resolve o alvo inteiro), em vez de mandar o alvo no corpo: assim o mock não precisa do nome para separar perfis com id repetido. Abas Pendentes/Julgadas, filtro Anúncios/Perfis, pendentes ordenados pelos mais denunciados. Grupo "Moderação" na barra lateral com badge de casos; aviso "N casos de denúncia aguardando análise" na Visão geral (sai também no PDF, sem o botão). Apagados os vazios `ReportsPage.jsx` e `ReportTable.jsx`. Testado: badge e aviso batem (4 casos/6 denúncias), arquivar move para Julgadas e atualiza badge e aviso, layout em 375 px.
  - `GET /api/admin/reports`, `POST /api/admin/reports/dismiss`; `stats.reports`.
  - `/admin/denuncias`: pendentes/resolvidas, agrupadas por alvo ("3 denúncias"), com a cópia do alvo, motivos e descrições; "Arquivar".
  - Badge de casos pendentes na barra lateral e aviso na Visão geral.
- [x] **D3. Banir e reativar contas** — feito em 2026-10-11. Rotas `PATCH /api/admin/users/{id}/status` e `POST /api/admin/reports/{id}/ban` (pela denúncia, o nome da conta vem da cópia do alvo; pela lista, do próprio admin mock, que tem uma conta por id). Decisões em `moderationMock` + `useModeration` (useSyncExternalStore, reage a outras abas). Extras: adotantes dos pedidos entram na lista de Usuários; situação "ONG banida" em Campanhas/Eventos e "Fora do ar" + "Conta banida" em Animais, batendo com a Visão geral; o admin abre anúncio/perfil de conta banida com uma faixa de aviso; a conversa já aberta fica travada com o motivo. Testado: banir pela lista e pela denúncia (pedidos cancelados com motivo, denúncias resolvidas, vitrine/detalhe/perfil/campanhas/eventos/AUmatch filtrados, login recusado, sessão aberta em outra aba derrubada sem apagar a do admin), reativar (conteúdo volta, pedidos continuam cancelados), Visão geral batendo com as listas.
  - `PATCH /api/admin/users/{id}/status`, que também resolve as denúncias pendentes da conta e dos anúncios dela.
  - Efeitos: login recusado e sessão encerrada; perfil indisponível; animais, campanhas e eventos da conta somem (vitrine, detalhe, perfil, favoritos, AUmatch); pedidos ativos cancelados com o motivo (pedidos recebidos e conversa travada com aviso).
  - Botões: Usuários (banir/reativar) e Denúncias (banir conta / banir quem anunciou).
- [x] **D4. Remover conteúdo** — feito em 2026-10-11. Rotas `DELETE /api/admin/animals|campaigns|events/{id}`; a tela de Denúncias usa a do animal (id único, sem rota por denúncia). Anúncio removido ganha o status `REMOVED` (dono vê "Removido pela moderação" no painel e em Minha conta, sem ações; editar/status dão 403); pedidos ativos do animal cancelados com `LISTING_REMOVED` (conversa travada com aviso); campanha removida fica marcada (histórico de quem doou diz "removida pela moderação"); evento vira cancelado. Situação "Removido(a) pela moderação" nas listas do admin e no gráfico de situação (rosa claro). **Verificação só com lint, build e revisão do código**: a pedido do usuário, o backend de teste foi desligado no início do bloco para economizar tokens, e sem ele não há como logar no navegador.
  - `DELETE /api/admin/animals/{id}`, `/campaigns/{id}`, `/events/{id}`; resolvem as denúncias pendentes do anúncio.
  - Efeitos: anúncio some do site e aparece "Removido pela moderação" para o dono; campanha/evento somem.
  - Botões: Animais, Campanhas, Eventos e Denúncias (remover anúncio).
  - Fechar a documentação: `regras-de-negocios.md` §8 e `api-admin.md`.

**Verificação** (a cada bloco): `npm run lint` sem erro novo, `npm run build` e teste no navegador no ambiente isolado (API 8089 + banco temporário + front 5174), nunca no `aucolher_db`.

## 5. Denúncias e moderação (proposta)

- **Quem denuncia o quê**
  - Só com login; deslogado vê o `AuthRequiredModal`.
  - Alvos: anúncio de animal (`AnimalDetailPage`) e perfil de pessoa/ONG (`PublicProfilePage` / `PublicProfileHeader`).
  - Ninguém denuncia o próprio conteúdo.
  - Uma denúncia aberta por pessoa e alvo ("Você já denunciou; está em análise").
- **Modal** (`features/denuncias/components/ReportModal.jsx` + `ReportReasonSelect.jsx`): categoria fixa e descrição de até 500 caracteres, obrigatória em "Outro".
  - Categorias propostas: `IMPROPER_CONTENT` (conteúdo impróprio), `ANIMAL_ABUSE` (maus-tratos), `SCAM` (golpe/fraude), `FAKE_PROFILE` (perfil falso), `SPAM`, `OTHER`.
- **Dados**: `reportsMock` no mesmo trio.
  - Status `PENDING → RESOLVED`, com `resolution` = `LISTING_REMOVED | ACCOUNT_BANNED | DISMISSED`.
  - Cada denúncia guarda um snapshot do alvo (nome, foto, dono), para o admin ver mesmo depois da remoção.
- **Tela Denúncias** (`/admin/denuncias`)
  - Agrupada por alvo ("3 denúncias"), com motivos e descrições.
  - Ações: **remover anúncio**, **banir conta** e **arquivar (improcedente)**. Julgar resolve todas as pendentes do mesmo alvo.
  - Badge de pendentes na barra lateral e bloco "Denúncias pendentes" na Visão geral.
- **Ações diretas nas listas**: banir/reativar em Usuários; remover em Animais, Campanhas e Eventos.
- **Efeitos no site (modo mock)**, via um `moderationMock` consultado pelas fachadas:
  - anúncio removido e animais de conta banida somem da vitrine, do perfil e do detalhe ("Anúncio indisponível");
  - conta banida não loga ("Conta suspensa") e, se estiver logada, é deslogada;
  - pedidos ativos envolvendo a conta banida viram `CANCELLED`, com o motivo visível para a outra parte;
  - campanhas e eventos de ONG banida somem.
  - Com o backend pronto, isso vem da API (`users.active = false`, que o login já bloqueia) e os filtros do front deixam de ser necessários.
- **Rodapé**: o link "Denunciar anúncio" (`core/components/layout/Footer.jsx`) aponta para `/denuncia`, que não existe. Ele passa a explicar como denunciar.

**Confirmado em 2026-10-11** (detalhes na branch 3, seção 4)
- [x] Lista de categorias: a proposta, conforme o alvo.
- [x] "Arquivar (improcedente)": sim.
- [x] Reativar conta banida: sim.
- [x] Ações diretas pelas listas: sim, em todas.

## 6. Riscos e limitações do modo mock

- Os ids dos perfis mock (1–7) podem coincidir com ids reais do banco local. O problema já existe hoje (o perfil público é mock) e some quando existir o endpoint de perfil público.
- Animais "fora do ar" de outras contas não aparecem no painel, porque a API pública só lista disponíveis.
- O `adminMock` supõe que campanhas e eventos também estão em mock. Quando eles forem para a API, `/api/admin/*` precisa ir junto.
- Moderação no modo mock (branch 3):
  - banimentos e remoções valem só no navegador onde foram feitos (`aucolher_mock_moderacao`);
  - a vitrine desconta os anúncios escondidos só da página carregada, e a contagem "N animais encontrados" é exata quando a busca cabe numa página;
  - as abas do mesmo navegador dividem a sessão: banir a conta logada numa aba antiga derruba só aquela aba;
  - a lista de Usuários só conhece contas que aparecem em algum dado (seed, donos de animais, ONGs de campanhas e eventos, adotantes dos pedidos).
- "Global" no mock é global só dentro de um navegador (localStorage): dois navegadores não compartilham pedidos, denúncias nem banimentos.
- A métrica de reabandono (§9.3) continua fora, porque depende de histórico de status do animal no banco.

## 7. Fora do escopo

- Endpoints `/api/admin/*` e `/api/reports` no backend (ficam no contrato para o parceiro).
- Aprovação de ONG e pré-validação de CNPJ via BrasilAPI.
- Notificações de resultado de denúncia.
- Métrica de reabandono.
