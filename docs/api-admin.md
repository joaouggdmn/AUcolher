# AUcolher — Contrato da API: painel do admin

> Escrito em 2026-10-11, junto com o painel do admin no frontend (branch `feature/painel-admin`). O frontend já chama estas rotas por `features/admin/services/adminApi.js`. Enquanto o backend não tem as rotas, um servidor falso com as mesmas funções e os mesmos DTOs responde no lugar: `adminMock.js`, ligado por `VITE_USE_MOCK_ADMIN`, que vem ligado por padrão. Denúncias e moderação (banir, remover) têm um contrato próprio: `api-denuncias-moderacao.md` (ver §6).

> **Implementado em 15/10/2026** (backend `feature/admin-api`). Além do contrato: `GET /api/admin/animals` devolve `listingStatus` (`AVAILABLE`, `IN_PROGRESS`, `ADOPTED`, `INACTIVE`, `REMOVED`), que a tela exige, e `animals.removed` no stats. **Campanhas ainda não:** `donations`, `campaigns` e `ngoRanking.byRaised` vêm zerados e `/api/admin/campaigns` não existe; o front os pega do mock (`campaignAdminStats.js`) enquanto `VITE_USE_MOCK_CAMPANHAS` estiver ligada. `AdminUserDTO.deletedAt` espera a 013.

> **Edição pela moderação** (15/10/2026, back `feature/admin-limites` + migração 016):
> - `GET`/`PUT /api/admin/users/{id}` — corpo `{ email, profile }`, com o `profile` igual ao do `PUT /users/me`;
> - `PUT /api/admin/animals/{id}` e `PUT /api/admin/events/{id}`, com os mesmos corpos do dono;
> - os DTOs ganham `moderatedAt`.
>
> A campanha é editada no mock (`updateCampaignForAdmin`). Quando a 007 entrar, o back precisa de `PUT /api/admin/campaigns/{id}`, que o front já chama, e de `campaigns.moderated_at`/`moderated_by`.

## 1. Regras

- **Quem acessa**
  - Todas as rotas exigem a conta `ADMIN`. O backend já restringe `/api/admin/**` a `ROLE_ADMIN`.
  - Sem token, a resposta é 401. Com token de pessoa ou ONG, é 403.
- **O que o admin vê**: a plataforma inteira.
  - Contas de pessoas e ONGs, sem outros admins.
  - Animais em qualquer status.
  - Campanhas ativas, encerradas e excluídas.
  - Eventos próximos, passados e cancelados.
- **Como contar**
  - Doações: só as aprovadas entram nos totais.
  - Campanhas excluídas com doação aprovada (a exclusão lógica): continuam no total arrecadado, porque o dinheiro entrou.
- **Séries mensais**
  - Sempre os últimos 12 meses, do mais antigo ao mês atual, com zero onde não houve nada.
  - O mês vem como `"YYYY-MM"`, na data local do servidor.
  - A tela mostra os últimos 6 meses, mas o PDF pode usar mais.
- **Formato das listas**: arrays simples, sem paginação, porque o volume do TCC é pequeno. A busca e os filtros ficam no cliente, como no painel da ONG. Se o volume crescer, dá para paginar com o `PageDTO` que a API já usa.
- **Datas**: `LocalDateTime` sem `Z` (`"2026-10-09T13:15:00"`), como no resto da API.

## 2. Endpoints

| Método | Rota | Resposta |
|---|---|---|
| GET | `/api/admin/stats` | `AdminStatsDTO` (seção 3.1) |
| GET | `/api/admin/users` | `AdminUserDTO[]`, mais recentes primeiro |
| GET | `/api/admin/animals` | `AnimalSummaryDTO[]` (o mesmo card da vitrine), todos os status, mais recentes primeiro |
| GET | `/api/admin/campaigns` | Campanha (`api-campanhas-eventos.md` §6.2) + `removed`, mais recentes primeiro |
| GET | `/api/admin/events` | Evento (`api-campanhas-eventos.md` §2.1), todos os status, data mais distante primeiro |

## 3. Formatos (DTOs)

### 3.1 `AdminStatsDTO` — números e gráficos da Visão geral

```json
{
  "users": {
    "total": 32,
    "persons": 23,
    "ngos": 9,
    "newByMonth": [{ "month": "2026-10", "persons": 2, "ngos": 0 }]
  },
  "animals": {
    "available": 18,
    "inProgress": 3,
    "adopted": 9,
    "bySpecies": { "DOG": 14, "CAT": 15, "OTHER": 1 }
  },
  "adoptions": {
    "funnel": { "received": 40, "accepted": 15, "delivery": 11, "concluded": 9 },
    "concludedByMonth": [{ "month": "2026-10", "count": 2 }]
  },
  "donations": {
    "totalRaised": 34200,
    "approvedCount": 258,
    "raisedByMonth": [{ "month": "2026-10", "amount": 5300, "count": 31 }]
  },
  "campaigns": { "active": 11, "closed": 2, "removed": 0, "suspended": 0 },
  "events": { "upcoming": 13, "past": 2, "cancelled": 1, "suspended": 0 },
  "ngoRanking": {
    "byRaised": [{ "id": 4, "name": "Abrigo Amigo Fiel", "raised": 18050, "adoptions": 0 }],
    "byAdoptions": [{ "id": 1, "name": "Patinhas Carentes", "raised": 5300, "adoptions": 4 }]
  },
  "recentActivity": [
    { "type": "ACCOUNT_CREATED", "at": "2026-10-09T13:15:00", "id": 125, "title": "João Victor Prado", "detail": "PERSON" }
  ],
  "reports": { "pending": 6, "pendingTargets": 4 }
}
```

- **`users`**
  - Conta só `PERSON` e `NGO`.
  - `newByMonth` agrupa as contas por `created_at`.
- **`animals`**
  - `available`, `inProgress` e `adopted` são a situação do anúncio do ponto de vista da plataforma. `inProgress` é um animal disponível que já tem um pedido aceito ou aguardando entrega.
  - Animais `INACTIVE` (fora do ar) não entram nesses três números nem em `bySpecies`.
- **`adoptions`**
  - É o funil de todos os pedidos de interesse. Cada etapa conta quem chegou nela ou passou dela:
    - `accepted` = `ACCEPTED`, `AWAITING_DELIVERY` ou `CONCLUDED`;
    - `delivery` = `AWAITING_DELIVERY` ou `CONCLUDED`.
  - `concludedByMonth` agrupa os pedidos pela data de conclusão.
- **`donations`**: só doações `APPROVED`, agrupadas por `approved_at`. Os valores são em reais inteiros.
- **`campaigns`**
  - `active` e `closed` não contam as excluídas nem as de ONG banida.
  - `removed` conta as excluídas que continuam no banco (exclusão lógica).
  - `suspended` conta as de ONG banida (`api-denuncias-moderacao.md` §2), que saíram do site.
- **`events`**
  - `upcoming` = `ACTIVE` com data a partir de hoje.
  - `past` = `ACTIVE` com data anterior a hoje.
  - `cancelled` = `CANCELLED`.
  - `upcoming` e `past` não contam os de ONG banida; esses vão em `suspended`.
- **`animals`** de conta banida não entram em `available`, `inProgress` nem `bySpecies` (saíram do site); os adotados continuam em `adopted`.
- **`ngoRanking`**: até 5 ONGs em cada lista, só com valor maior que zero.
  - `byRaised` ordena pelo arrecadado (doações aprovadas).
  - `byAdoptions` ordena pelas adoções concluídas de animais da ONG.
- **`recentActivity`**: os 8 acontecimentos mais recentes, de qualquer tipo.
- **`reports`** (tabela `reports`, `api-denuncias-moderacao.md`): `pending` conta as denúncias `PENDING`; `pendingTargets`, quantos alvos diferentes elas atingem ("casos" esperando uma decisão). Alimenta o aviso da Visão geral.

| `type` | `id` | `title` | `detail` |
|---|---|---|---|
| `ACCOUNT_CREATED` | conta | nome | `PERSON` ou `NGO` |
| `ADOPTION_CONCLUDED` | animal | nome do animal | nome do adotante |
| `CAMPAIGN_CREATED` | campanha | título | nome da ONG |
| `EVENT_CREATED` | evento | título | nome da ONG |

**Atualizado em 15/10/2026:**
- **Bloco `returns`.** O `AdminStatsDTO` ganha a **taxa de reabandono**: geral, por faixa de compatibilidade (alta, média, baixa) e por motivo. O formato e o SQL estão em `entrega-final/api-devolucao-reabandono.md` §4. Entra na S3, junto com o resto deste contrato.
- **`AdminUserDTO.deletedAt`.** A conta excluída pela própria pessoa aparece como "Conta excluída" e não pode ser reativada (`entrega-final/api-exclusao-conta.md` §3 e §4).

### 3.2 `AdminUserDTO`

```json
{
  "id": 125,
  "name": "João Victor Prado",
  "email": "joao.victor.prado@email.com",
  "userType": "PERSON",
  "photoUrl": null,
  "city": "Tubarão",
  "state": "SC",
  "isVerified": false,
  "active": true,
  "createdAt": "2026-10-09T13:15:00",
  "animalsCount": 0
}
```

- `active` é a coluna `users.active`. Ela passa a ser usada pelo banimento (`api-denuncias-moderacao.md` §2), e o login já bloqueia conta inativa.
- `animalsCount` conta os anúncios da conta em qualquer status.

## 4. Notas para o backend (Spring Boot)

- **Pacote**: um `admin/` com `AdminController` (`@RequestMapping("/api/admin")`) e `AdminService`. A segurança já está pronta no `SecurityConfig`.
- **Banco**: nenhuma tabela nova, só consultas. As estatísticas dependem de `campaigns`/`donations` (`api-campanhas-eventos.md` §6.7) e de `reports` (`api-denuncias-moderacao.md` §5). Por isso este contrato entra depois de campanhas, junto com o de moderação (`plano-backend-restante.md` §3).
- **Hoje** só existe `GET /api/admin/adoption-requests`. A página de eventos do admin ainda lê o mock, porque falta o `GET /api/admin/events`.
- **Consultas sugeridas**
  - Contas: `COUNT ... GROUP BY user_type` e `date_trunc('month', created_at)`.
  - Doações: `SUM(amount) ... WHERE status = 'APPROVED'`, também com `date_trunc` em `approved_at`.
  - Animais: um `COUNT` por `status`.
  - Pedidos de adoção: `inProgress` e o funil usam os pedidos reais de `GET /api/admin/adoption-requests` (desde 2026-10-13).
- **`/admin/animals`**: é a listagem pública sem o filtro `status = AVAILABLE`. O `AnimalSpecifications` hoje força esse filtro na vitrine.
- **Booleans**: usar `@JsonProperty("isVerified")`, como já é feito.

## 5. Notas do modo mock (só frontend)

- **Contas**: a API ainda não lista contas, então elas vêm de `features/admin/data/seedAdmin.js`.
  - A semente traz os 7 perfis públicos mockados (ids 1 a 7) e 25 contas geradas (ids 101 a 125), com cadastro espalhado nos últimos 12 meses.
  - Somam-se as contas que aparecem nos dados reais: donos dos animais da API e ONGs de campanhas e eventos.
- **Ids repetidos**: os ids 1 a 7 do mock se repetem com os do banco real.
  - Mesmo id com outro nome é tratado como outra conta: a real ocupa o lugar da fictícia.
  - O ranking usa o nome que está no próprio dado (campanha ou cópia do animal no pedido).
- **Animais**
  - Vêm da vitrine real (`GET /api/animals`, todas as páginas), que só traz os disponíveis.
  - Os adotados vêm dos pedidos concluídos (`GET /api/admin/adoption-requests`). O mock devolve `listingStatus` em cada animal.
  - Animais fora do ar de outras contas não aparecem.
- **Pedidos de adoção**: vêm da API real (`GET /api/admin/adoption-requests`), mais os de demonstração do admin (`adminDemo`, só em dev, no `localStorage`).
- **Campanhas, doações e eventos**: o `adminMock` lê os outros servidores falsos (`readAllCampaignsForAdmin`, `readApprovedDonationsForAdmin`, `readAllEventsForAdmin`). Quando esses módulos forem para a API, as rotas `/api/admin/*` precisam ir junto.

## 6. Denúncias e moderação

Saíram deste arquivo em 13/10/2026 e agora estão em **`api-denuncias-moderacao.md`**:
- as denúncias do site (`/api/reports`);
- as rotas do admin para julgar (`/api/admin/reports/*`);
- banir e reativar contas (`PATCH /api/admin/users/{id}/status`);
- remover anúncio, campanha ou evento (`DELETE /api/admin/{animals|campaigns|events}/{id}`).

Lá estão também as notas de implementação e o SQL (`reports` e os ajustes de moderação). Como a mesma flag `VITE_USE_MOCK_ADMIN` liga as estatísticas daqui e a moderação de lá, o ideal é entregar os dois arquivos juntos.
