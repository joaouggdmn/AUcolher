# AUcolher — Contrato da API: campanhas e doações (PIX)

> Migração **007**. O front já implementa este contrato: `features/doacoes/services/doacoesApi.js` chama as rotas abaixo, e o `doacoesMock.js` responde no lugar enquanto `VITE_USE_MOCK_CAMPANHAS` estiver ligada (padrão). Quando as rotas existirem, basta `VITE_USE_MOCK_CAMPANHAS=false`. Por isso nomes, formatos e códigos de status precisam bater exatamente com o que está aqui.
>
> **O dinheiro cai direto na conta Mercado Pago da ONG.** A conexão da conta (OAuth), a criação do PIX com o token da ONG e o webhook estão em `api-mercado-pago-ongs.md` (migração 009). Este arquivo já traz o que aquele contrato muda nas campanhas: `acceptingDonations`, `donations.ngo_id` e as recusas por conta não conectada.
>
> A §7 junta o que o **admin e a moderação** precisam das campanhas. O resto do admin já está pronto no backend e só espera estas tabelas.

## 1. Regras de negócio

- Só conta **ONG** cria campanha. Só a **ONG dona** edita, encerra e exclui.
- **Sem conta Mercado Pago conectada não há campanha:** `POST /api/campaigns` responde 400 se a conta da ONG não estiver `CONNECTED` (`api-mercado-pago-ongs.md` §1).
- Qualquer conta logada (pessoa ou ONG) doa, **menos a ONG dona na própria campanha**. O **admin não doa**: 403 "Contas de admin não fazem doações.", como a recusa de presença em eventos.
- Doação só por **PIX do Mercado Pago (Orders API)**, sempre criada pelo backend com o **token da ONG dona** da campanha. Tokens nunca vão para o navegador.
- Valores em **reais inteiros**. Doação mínima **R$ 5**, máxima **R$ 100.000**. Meta entre **R$ 50** e **R$ 1.000.000**.
- Status da campanha: `ACTIVE | CLOSED`. Ela fica `CLOSED` quando a ONG encerra **ou** quando o `deadline` (opcional) passa. O segundo caso é **calculado na leitura** (`deadline < hoje`), sem job agendado. `closedAt` é o momento do encerramento ou `"{deadline}T23:59:59"`.
- **Meta atingida** não encerra nada: a campanha continua recebendo doações.
- **Uma campanha urgente ativa por ONG.** Ligar `isUrgent` (criar urgente, ou editar uma que não era) responde **409** se a ONG já tiver outra campanha `ACTIVE` com `isUrgent = true`. Uma campanha que já é urgente pode continuar urgente ou desligar. O admin, ao editar, segue a mesma regra. Sem isso, toda ONG marcaria todas as campanhas como urgentes e o selo perderia o sentido.
- **Categoria "Outro":** com `category = OTHER`, a ONG escreve o nome da categoria em `customCategory` (obrigatório, até 30 caracteres), que aparece no selo. Com qualquer outra categoria, o backend grava `customCategory = null`.
- Campanha encerrada é somente leitura: não edita e não recebe doação, mas o detalhe abre.
- **Conta Mercado Pago que caiu** (desconectada ou `NEEDS_RECONNECT`): a campanha continua visível com `acceptingDonations: false`, e doar responde 400. Os PIX já gerados valem até vencer.
- **Encerrar** e **excluir** cancelam (`CANCELLED`) os PIX ainda pendentes da campanha.
- **Excluir** é sempre permitido:
  - sem doações `APPROVED` → exclusão real;
  - com doações `APPROVED` → exclusão lógica (`deleted = true`): some de todas as rotas de campanha (404), mas as doações continuam no histórico do doador e da ONG, com `campaign.removed = true`.
- Status da doação: `PENDING → APPROVED | EXPIRED | CANCELLED`. O PIX vale **30 min**; depois disso a doação vira `EXPIRED` (também calculado na leitura).
- Pagamento que chegar **depois** do cancelamento é aprovado mesmo assim: o dinheiro entrou.
- `raisedAmount` e `donationsCount` são `SUM`/`COUNT` das doações `APPROVED`.
- **ONG banida** pela moderação: as campanhas dela somem das rotas públicas (listas, detalhe 404, doação), como os eventos, e voltam se a conta for reativada (§7.3).

## 2. Campanha (resposta)

```json
{
  "id": 1,
  "title": "Cirurgia urgente do Rex",
  "description": "Rex foi atropelado e precisa de uma cirurgia ortopédica...",
  "category": "HEALTH",
  "customCategory": null,
  "isUrgent": true,
  "goalAmount": 8000,
  "raisedAmount": 3250,
  "donationsCount": 25,
  "coverUrl": "https://... ou data:image/jpeg;base64,...",
  "deadline": "2026-10-29",
  "status": "ACTIVE",
  "acceptingDonations": true,
  "createdAt": "2026-10-07T09:30:00",
  "closedAt": null,
  "ngo": {
    "id": 1,
    "name": "Patinhas Carentes",
    "isVerified": true,
    "photoUrl": null,
    "city": "Araranguá",
    "state": "SC"
  }
}
```

- `category`: `HEALTH | FOOD | INFRASTRUCTURE | NEUTERING | RESCUE | OTHER` (saúde/cirurgias, alimentação, estrutura do abrigo, castração, resgate, outro).
- `customCategory`: nome livre da categoria quando `category = OTHER`; `null` nas outras.
- `goalAmount` e `raisedAmount` em reais inteiros (no banco, `NUMERIC(12,2)`; o JSON pode mandar `3250` ou `3250.00`).
- `acceptingDonations` = campanha `ACTIVE` **e** ONG com conta Mercado Pago `CONNECTED`. Calculado na leitura.
- `deadline`, `closedAt`, `coverUrl`, `ngo.photoUrl`, `ngo.city` e `ngo.state` podem vir `null`.
- Booleanos com `@JsonProperty("isUrgent")`, `@JsonProperty("isVerified")` e `@JsonProperty("acceptingDonations")`.
- Datas sem fuso (`LocalDateTime`), como no resto da API.

## 3. Criar / editar campanha (requisição de `POST` e `PUT`)

```json
{
  "title": "Cirurgia urgente do Rex",
  "description": "Rex foi atropelado e precisa de uma cirurgia ortopédica...",
  "category": "HEALTH",
  "customCategory": null,
  "isUrgent": true,
  "goalAmount": 8000,
  "deadline": "2026-10-29",
  "coverUrl": "data:image/jpeg;base64,..."
}
```

| Campo | Obrigatório | Validação |
|---|---|---|
| `title` | sim | 3 a 120 caracteres |
| `description` | sim | até 2000 caracteres |
| `category` | sim | um dos 6 valores |
| `customCategory` | só com `OTHER` | 1 a 30 caracteres; ignorado (vira `null`) nas outras categorias |
| `isUrgent` | não | padrão `false`; no máximo uma urgente ativa por ONG (§1) |
| `goalAmount` | sim | inteiro de 50 a 1.000.000 |
| `deadline` | não | `>= hoje` |
| `coverUrl` | não | mesma regra da capa do evento (http(s) ou data URL jpeg/png/webp, até 600.000 caracteres; `PhotoUrl.COVER_MAX_LENGTH`) |

O `PUT` substitui todos os campos e é recusado (400) se a campanha estiver encerrada.

## 4. Doação (resposta)

```json
{
  "id": 259,
  "amount": 50,
  "status": "PENDING",
  "createdAt": "2026-10-09T23:39:17",
  "approvedAt": null,
  "pix": {
    "qrCode": "00020126440014br.gov.bcb.pix...6304ABCD",
    "qrCodeBase64": "iVBORw0KGgo...",
    "ticketUrl": "https://www.mercadopago.com.br/...",
    "expiresAt": "2026-10-10T00:09:17"
  },
  "campaign": { "id": 1, "title": "Cirurgia urgente do Rex", "ngoName": "Patinhas Carentes", "removed": false },
  "donor": null
}
```

- `pix` só vem **para o próprio doador** e **enquanto `PENDING`** (no `POST` e no `GET /donations/{id}`). Nos outros casos, `null`.
  - `qrCode` é o "copia e cola". O frontend desenha o QR a partir dele, então `qrCodeBase64` e `ticketUrl` podem vir `null`.
- `campaign.title` e `ngoName` são os **atuais** quando a campanha existe; se ela foi apagada de vez, valem os guardados na doação. `removed` é `true` para excluída (real ou lógica, inclusive pela moderação).
- `donor` (`{ id, name, photoUrl }`) só vem em `GET /donations/received`, para a ONG.
- Corpo do `POST /campaigns/{id}/donations`: `{ "amount": 50 }`.

## 5. Endpoints

| Método | Rota | Quem | Sucesso | Observação |
|---|---|---|---|---|
| GET | `/api/campaigns?ngoId=&status=` | público | 200 `Campaign[]` | `status` = `ACTIVE` (padrão) ou `CLOSED`. Nunca devolve excluídas nem de ONG banida. Ordem: `createdAt` decrescente |
| GET | `/api/campaigns/{id}` | público | 200 `Campaign` | 404 se não existe, foi excluída ou a ONG está banida. Encerrada **abre** normalmente |
| POST | `/api/campaigns` | ONG | 201 `Campaign` | 403 se não for ONG; 400 sem conta Mercado Pago conectada; 409 se ligar a urgência já tendo outra urgente ativa |
| PUT | `/api/campaigns/{id}` | ONG dona | 200 `Campaign` | 400 se encerrada; 409 se ligar a urgência já tendo outra urgente ativa |
| POST | `/api/campaigns/{id}/close` | ONG dona | 200 `Campaign` | cancela os PIX pendentes. 400 se já encerrada |
| DELETE | `/api/campaigns/{id}` | ONG dona | 204 | real ou lógica (§1); cancela os PIX pendentes |
| GET | `/api/campaigns/mine` | ONG | 200 `Campaign[]` | ativas e encerradas da ONG logada, sem as excluídas |
| POST | `/api/campaigns/{id}/donations` | logado | 201 `Donation` | cria a order PIX com o token da ONG. 404 se a campanha não existe; 403 se admin; 400 se própria, encerrada, valor inválido ou ONG sem conta conectada |
| GET | `/api/donations/{id}` | doador | 200 `Donation` | 403 se for de outra conta. Se `PENDING`, consulta o Mercado Pago antes de responder (§6) |
| GET | `/api/donations/mine` | logado | 200 `Donation[]` | histórico de quem doou, em qualquer status, `createdAt` decrescente |
| GET | `/api/donations/received` | ONG | 200 `Donation[]` | só `APPROVED`, nas campanhas da ONG logada (inclusive excluídas), com `donor`, `approvedAt` decrescente |
| POST | `/api/webhooks/mercadopago` | Mercado Pago | 200 | valida a assinatura e aprova a doação (`api-mercado-pago-ongs.md` §5.2) |

**Mensagens usadas pelo frontend:**

| Status | Quando | `message` |
|---|---|---|
| 400 | doar na própria campanha | "Você não pode doar para a sua própria campanha." |
| 400 | doar em campanha encerrada | "Esta campanha está encerrada e não recebe mais doações." |
| 400 | valor abaixo do mínimo / com centavos | "A doação mínima é de R$ 5." / "Informe um valor em reais, sem centavos." |
| 400 | ONG sem conta conectada (depois das checagens acima) | "Esta ONG não está recebendo doações no momento." |
| 400 | editar / encerrar campanha encerrada | "Campanhas encerradas não podem ser editadas." / "Esta campanha já está encerrada." |
| 400 | criar sem conta conectada | "Conecte sua conta do Mercado Pago no painel antes de criar uma campanha." |
| 403 | admin doando | "Contas de admin não fazem doações." |
| 400 | `OTHER` sem nome | "Dê um nome para a categoria." |
| 409 | ligar urgência com outra urgente ativa | "A ONG já tem uma campanha urgente ativa (\"{título}\"). Tire a urgência dela antes de marcar outra." |

## 6. Fluxo do PIX e notas de implementação

1. O modal manda `POST /api/campaigns/{id}/donations { amount }`.
2. O backend grava a doação `PENDING` (`expires_at = agora + 30 min`, `ngo_id` = ONG dona) e cria a order no Mercado Pago **com o token da ONG** (`api-mercado-pago-ongs.md` §5.1), com o header `X-Idempotency-Key` = id da doação. Guarda o `mp_order_id`.
3. A resposta traz o `pix`. O modal mostra o QR, o "copia e cola" e a contagem regressiva, e faz `GET /api/donations/{id}` a cada 3 s.
4. Aprovação chega por **dois caminhos**: o webhook ou o próprio `GET /donations/{id}`, que consulta a order (com o token de `donations.ngo_id`) enquanto estiver `PENDING`. O segundo é o que funciona em `localhost`, onde o webhook não chega sem túnel.
5. **Aprovação atômica**, para webhook e polling nunca somarem duas vezes:
   ```sql
   UPDATE donations SET status = 'APPROVED', approved_at = now()
   WHERE id = ? AND status IN ('PENDING', 'CANCELLED');
   ```
   Com `raisedAmount` calculado por `SUM`, o total nunca conta duas vezes.
6. **Segurança**: liberar só as leituras públicas, com as rotas fixas antes da regra pública, como em eventos:
   ```java
   .requestMatchers(HttpMethod.GET, "/api/campaigns/mine").authenticated()
   .requestMatchers(HttpMethod.GET, "/api/campaigns", "/api/campaigns/*").permitAll()
   .requestMatchers(HttpMethod.POST, "/api/webhooks/mercadopago").permitAll()
   ```
7. **Sandbox do Mercado Pago**: com `payer.first_name = "APRO"`, o PIX de teste é aprovado automaticamente.

## 7. Admin e moderação de campanhas

O painel do admin, as denúncias e a moderação já estão no backend (`admin/AdminController`, `AdminService`, `AdminStatsService`, `ModerationService`). Faltam só as partes de campanhas. **O caminho mais curto é copiar o que já existe para eventos** (`GET/PUT/DELETE /api/admin/events`).

### 7.1 Rotas do admin (`/api/admin/**` já é só `ROLE_ADMIN`)

| Método | Rota | Resposta | Observação |
|---|---|---|---|
| GET | `/api/admin/campaigns` | 200 `AdminCampaign[]` | ativas, encerradas e excluídas, `createdAt` decrescente |
| PUT | `/api/admin/campaigns/{id}` | 200 `AdminCampaign` | mesmo corpo do `PUT` da ONG (§3); grava `moderated_at`/`moderated_by`. 404 se excluída; 400 se encerrada |
| DELETE | `/api/admin/campaigns/{id}` | 204 | remoção pela moderação (§7.2). 404 "Campanha não encontrada." se não existe ou já foi excluída |

`AdminCampaign` = a campanha da §2, mais:
- `removed` (`deleted`), `removedByModeration` e `moderatedAt`;
- `ngo.active` (`false` se a ONG foi banida).

### 7.2 Remover pela moderação
- Vira exclusão lógica (`deleted = true`) com `removed_by_moderation = true`. A linha fica sempre, mesmo sem doações, para o admin ver o que removeu.
- Os PIX ainda não pagos são cancelados. As doações aprovadas continuam no total arrecadado e no histórico de quem doou (`campaign.removed = true`).
- Some também do painel da ONG, como uma campanha que ela mesma excluiu.
- Não há "desfazer".

### 7.3 Banimento da ONG
O `ModerationService` já bane contas (`users.active = false`), e o `EventService` já esconde os eventos da ONG banida (`requireActiveNgo` no detalhe e o filtro de ONG ativa em `toPublicDtos`). As campanhas seguem o mesmo filtro: somem das listas, o detalhe responde 404 e doar também. Reativar a conta traz tudo de volta.

### 7.4 Blocos do `stats` (`GET /api/admin/stats`)
Hoje o `AdminStatsService` devolve estes blocos zerados. Preencher:

```json
"donations": {
  "totalRaised": 34200,
  "approvedCount": 258,
  "raisedByMonth": [{ "month": "2026-10", "amount": 5300, "count": 31 }]
},
"campaigns": { "active": 11, "closed": 2, "removed": 0, "suspended": 0 },
"ngoRanking": { "byRaised": [{ "id": 4, "name": "Abrigo Amigo Fiel", "raised": 18050, "adoptions": 0 }], "byAdoptions": [] }
```

- **`donations`**: só `APPROVED`, agrupadas por `approved_at`, últimos 12 meses (do mais antigo ao atual, zero onde não houve nada, `"YYYY-MM"`). Reais inteiros. Campanhas excluídas com doação aprovada continuam no total.
- **`campaigns`**: `active` e `closed` não contam excluídas nem de ONG banida; `removed` conta as excluídas que continuam no banco; `suspended` conta as de ONG banida.
- **`ngoRanking.byRaised`**: até 5 ONGs, só com valor maior que zero, pelo arrecadado. O `adoptions` de cada uma vem do mesmo cálculo do `byAdoptions` que já existe.
- **`recentActivity`**: entra o tipo `CAMPAIGN_CREATED` (`id` = campanha, `title` = título, `detail` = nome da ONG).

### 7.5 Exclusão da conta da ONG
`api-exclusao-conta.md` §2, passo 3: as campanhas `ACTIVE` são encerradas e ficam com `deleted = true`, e os PIX pendentes são cancelados.

## 8. SQL — `007_campaigns.sql` (rascunho, PostgreSQL)

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS campaigns (
    id                     BIGSERIAL      PRIMARY KEY,
    ngo_id                 BIGINT         NOT NULL REFERENCES users(id),
    title                  VARCHAR(120)   NOT NULL,
    description            TEXT           NOT NULL,
    category               VARCHAR(20)    NOT NULL CHECK (category IN ('HEALTH', 'FOOD', 'INFRASTRUCTURE', 'NEUTERING', 'RESCUE', 'OTHER')),
    custom_category        VARCHAR(30),
    is_urgent              BOOLEAN        NOT NULL DEFAULT FALSE,
    goal_amount            NUMERIC(12,2)  NOT NULL CHECK (goal_amount >= 50),
    deadline               DATE,
    cover_url              TEXT,
    status                 VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED')),
    deleted                BOOLEAN        NOT NULL DEFAULT FALSE,
    removed_by_moderation  BOOLEAN        NOT NULL DEFAULT FALSE,
    moderated_at           TIMESTAMP,
    moderated_by           BIGINT         REFERENCES users(id) ON DELETE SET NULL,
    created_at             TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at              TIMESTAMP,
    CONSTRAINT chk_campaigns_removed_by_moderation CHECK (NOT removed_by_moderation OR deleted)
);

CREATE INDEX IF NOT EXISTS idx_campaigns_ngo ON campaigns (ngo_id);

CREATE TABLE IF NOT EXISTS donations (
    id              BIGSERIAL      PRIMARY KEY,
    campaign_id     BIGINT         REFERENCES campaigns(id) ON DELETE SET NULL,
    campaign_title  VARCHAR(120)   NOT NULL,
    ngo_id          BIGINT         NOT NULL REFERENCES users(id),
    donor_id        BIGINT         NOT NULL REFERENCES users(id),
    amount          NUMERIC(12,2)  NOT NULL CHECK (amount >= 5),
    status          VARCHAR(20)    NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'APPROVED', 'EXPIRED', 'CANCELLED')),
    mp_order_id     VARCHAR(64)    UNIQUE,
    pix_qr_code     TEXT,
    created_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP      NOT NULL,
    approved_at     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_donations_campaign_status ON donations (campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations (donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_ngo_status ON donations (ngo_id, status);

COMMENT ON COLUMN campaigns.removed_by_moderation IS 'Removida pelo admin (sempre com deleted = true)';
COMMENT ON COLUMN campaigns.moderated_at IS 'Última edição da campanha feita pelo admin (nulo se nunca houve)';
COMMENT ON COLUMN campaigns.moderated_by IS 'O admin que fez a última edição da campanha';
COMMENT ON COLUMN donations.campaign_title IS 'Título no momento da doação: o histórico continua legível se a campanha for apagada de vez';
COMMENT ON COLUMN donations.ngo_id IS 'ONG dona no momento da doação: diz qual token do Mercado Pago consulta a order';

COMMIT;
```

- `campaign_title` guarda o título no momento da doação, para o histórico continuar legível quando a campanha é apagada de vez (`ON DELETE SET NULL`).
- `ngo_id` diz **qual token usar** para consultar a order, mesmo se a campanha for apagada de vez.
- As colunas de moderação seguem a 014 (`removed_by_moderation` em `events`) e a 016 (`moderated_at`/`moderated_by`).
- Confira o padrão com o `sql/schema.sql` atual antes de criar a migração.

## 9. O que muda no front quando a API existir

- `VITE_USE_MOCK_CAMPANHAS=false` no `.env`.
- Sai a mistura com o mock no admin: `features/admin/services/campaignAdminStats.js` e o `CAMPAIGNS_FROM_MOCK` de `adminService.js`. O admin passa a ler campanhas e os blocos do `stats` direto da API.
- A home e o perfil público já leem a ONG da campanha pelo id da API quando a flag está desligada (`useOngShowcase`).
