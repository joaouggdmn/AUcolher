# AUcolher — Contrato da API: eventos, campanhas e doações

> Versão 3 (09/10/2026). §1–§5 cobrem **eventos e presenças**; §6 cobre **campanhas e doações (PIX do Mercado Pago)**.
> **O que mudou desde a v1 (27/09):** rotas, campos e valores passaram para inglês, seguindo o padrão de `/api/animals` e `/api/auth`. O erro usa `message`, como o `ErrorResponseDTO` atual. As regras não mudaram.
> O frontend já implementa este contrato num modo mock (localStorage). Quando os endpoints existirem, basta trocar a flag `VITE_USE_MOCK_EVENTOS=false` (eventos) ou `VITE_USE_MOCK_CAMPANHAS=false` (campanhas). Por isso nomes, formatos e códigos de status precisam bater exatamente com o que está aqui.

## 1. Regras de negócio

- Só conta **ONG** (`userType = NGO`) cria evento. Só a **ONG dona** edita, exclui e vê a lista de confirmados.
- Qualquer conta logada (pessoa ou ONG) confirma presença, **menos a ONG dona do evento**.
- **Evento passado** (`date < hoje`) fica somente leitura: não pode ser editado nem excluído, e ninguém confirma ou cancela presença nele. Um evento de hoje continua aberto o dia inteiro.
- `capacity` é opcional (`null` = ilimitado). Com todas as vagas ocupadas, a confirmação é recusada ("Vagas esgotadas").
- **Excluir**:
  - sem confirmados → exclusão real (`DELETE` da linha);
  - com confirmados → exclusão lógica: `status = 'CANCELLED'`. O evento some de todas as listas e do detalhe, mas continua em `GET /api/events/attending`, para quem confirmou ver "Evento cancelado" em Minha conta.
- Status: `ACTIVE | CANCELLED`. Não existe ação de "cancelar" separada: cancelar é consequência de excluir com confirmados.

## 2. Formatos (DTOs)

Datas: `date` é `LocalDate` (`"2026-10-11"`). Horas são `LocalTime`, e o frontend aceita `"09:00"` ou `"09:00:00"`. `createdAt` e `confirmedAt` são `LocalDateTime` **sem fuso** (`"2026-09-27T14:03:00"`).

### 2.1 Evento (resposta)

```json
{
  "id": 12,
  "title": "Feira de Adoção de Primavera",
  "description": "Mais de 40 animais resgatados procurando um lar.",
  "category": "ADOPTION_FAIR",
  "date": "2026-10-11",
  "startTime": "09:00:00",
  "endTime": "16:00:00",
  "venueName": "Parque Centenário",
  "cep": "88801000",
  "street": "Av. Centenário",
  "number": "1500",
  "complement": null,
  "district": "Centro",
  "city": "Criciúma",
  "state": "SC",
  "capacity": 50,
  "attendeesCount": 12,
  "coverUrl": "https://... ou data:image/jpeg;base64,...",
  "status": "ACTIVE",
  "createdAt": "2026-09-27T14:03:00",
  "ngo": {
    "id": 1,
    "name": "Patinhas Carentes",
    "isVerified": true,
    "photoUrl": null
  }
}
```

- `category`: `ADOPTION_FAIR | HEALTH | BAZAAR | WORKSHOP` (feira de adoção, mutirão de saúde, bazar beneficente, workshop).
- `attendeesCount`: `COUNT` de `event_attendances` do evento.
- `endTime`, `cep`, `number`, `complement`, `district`, `capacity`, `coverUrl` e `ngo.photoUrl` podem vir `null`.
- `ngo` é montado a partir de `users` (dono do evento). Use `@JsonProperty("isVerified")`, como já é feito no `UserResponseDTO`.
- Os nomes de endereço (`cep`, `street`, `number`, `complement`, `district`, `city`, `state`) são os mesmos do cadastro de ONG.

### 2.2 Criar / editar evento (requisição de `POST` e `PUT`)

O `PUT` recebe o objeto inteiro (substitui todos os campos).

```json
{
  "title": "Feira de Adoção de Primavera",
  "description": "Mais de 40 animais resgatados procurando um lar.",
  "category": "ADOPTION_FAIR",
  "date": "2026-10-11",
  "startTime": "09:00",
  "endTime": "16:00",
  "venueName": "Parque Centenário",
  "cep": "88801000",
  "street": "Av. Centenário",
  "number": "1500",
  "complement": null,
  "district": "Centro",
  "city": "Criciúma",
  "state": "SC",
  "capacity": 50,
  "coverUrl": "data:image/jpeg;base64,..."
}
```

| Campo | Obrigatório | Validação |
|---|---|---|
| `title` | sim | 3 a 120 caracteres |
| `description` | sim | até 2000 caracteres |
| `category` | sim | um dos 4 valores |
| `date` | sim | `>= hoje` |
| `startTime` | sim | — |
| `endTime` | não | se vier, `> startTime` |
| `venueName` | sim | até 120 caracteres |
| `street` | sim | até 150 |
| `city` | sim | até 100 |
| `state` | sim | UF com 2 letras |
| `cep` | não | 8 dígitos. O frontend manda sem máscara, mas pode reaproveitar a limpeza do cadastro |
| `number`, `complement`, `district` | não | 20 / 100 / 100 |
| `capacity` | não | inteiro `>= 1`. No `PUT`, também `>= attendeesCount` |
| `coverUrl` | não | mesma regra do `@PhotoUrl` (http(s) ou data URL jpeg/png/webp), limite **600.000** caracteres: a capa é maior que o avatar (~1000 px) |

Textos em branco viram `null` (o `Sanitizer` já faz isso nos outros DTOs).

### 2.3 Presença (lista de confirmados, só para a ONG dona)

```json
[
  {
    "user": { "id": 7, "name": "Eduardo Santos", "photoUrl": null },
    "confirmedAt": "2026-09-28T10:15:00"
  }
]
```

Ordenada por `confirmedAt` crescente.

### 2.4 Erro

O mesmo `ErrorResponseDTO` de hoje: `{ "status": 400, "error": "...", "message": "Vagas esgotadas para este evento." }`. O frontend mostra o texto de `message` direto para o usuário, então escreva frases prontas para exibir.

## 3. Endpoints

| Método | Rota | Quem | Sucesso | Observação |
|---|---|---|---|---|
| GET | `/api/events?ngoId=` | público | 200 `Event[]` | só `ACTIVE` com `date >= hoje`, ordenado por `date, startTime`. `ngoId` é opcional |
| GET | `/api/events/{id}` | público | 200 `Event` | 404 se não existe ou `CANCELLED`. Evento passado **abre** normalmente |
| POST | `/api/events` | ONG | 201 `Event` | 403 se não for ONG |
| PUT | `/api/events/{id}` | ONG dona | 200 `Event` | 400 se passado ou `capacity < attendeesCount` |
| DELETE | `/api/events/{id}` | ONG dona | 204 | real ou lógica (ver §1). 400 se passado |
| GET | `/api/events/mine` | ONG | 200 `Event[]` | todos os eventos da ONG logada, **inclusive passados**, sem os `CANCELLED` |
| POST | `/api/events/{id}/attendance` | logado | 200 `Event` | confirma presença. **Idempotente**: se já confirmou, devolve 200 sem duplicar |
| DELETE | `/api/events/{id}/attendance` | logado | 200 `Event` | cancela a presença. **Idempotente**: se não tinha, devolve 200 |
| GET | `/api/events/{id}/attendees` | ONG dona | 200 `Attendee[]` | 403 se não for a dona |
| GET | `/api/events/attending` | logado | 200 `Event[]` | eventos em que o usuário logado confirmou presença, **incluindo passados e `CANCELLED`** |

`/events/mine` e `/events/attending` são rotas fixas, como `/animals/mine`: no controller o Spring já prefere o caminho literal a `/events/{id}`; o cuidado é só na ordem das regras de segurança (§4.1).

Os dois endpoints de presença (`POST`/`DELETE`) devolvem o **evento atualizado** (com o novo `attendeesCount`), para o frontend atualizar o card sem outra requisição.

**Recusas (400) na confirmação/cancelamento de presença**, com `message`:
- evento passado → "Este evento já aconteceu.";
- evento `CANCELLED` → "Este evento foi cancelado.";
- usuário é a ONG dona → "Você não pode confirmar presença no seu próprio evento.";
- sem vagas (só no `POST`) → "Vagas esgotadas para este evento.".

**Ordem das checagens em rotas com `{id}`:** 404 (não existe ou `CANCELLED`, exceto nas rotas de presença, que devolvem o 400 acima) → 403 (papel ou dono) → 400 (regra).

As listas são arrays simples, sem paginação: busca, categoria, cidade e período são filtrados no frontend.

## 4. Notas de implementação (Spring Boot)

1. **Segurança**: liberar **exatamente** as leituras públicas, no mesmo padrão já usado com `/api/animals/mine`. As rotas fixas vêm antes da regra pública, porque `/api/events/*` também casaria com elas:
   ```java
   .requestMatchers(HttpMethod.GET, "/api/events/mine", "/api/events/attending").authenticated()
   .requestMatchers(HttpMethod.GET, "/api/events", "/api/events/*").permitAll()
   ```
   Não use `/api/events/**`: isso deixaria `GET /api/events/{id}/attendees` (lista de confirmados) aberto sem login.
2. **Exceções**: `ForbiddenException` (403) e `ResourceNotFoundException` (404), que já existem em `shared/exception`, cobrem os casos de "não é dono / papel errado" e "não existe / cancelado".
3. **Vagas sem corrida**: na confirmação, travar a linha do evento (`@Lock(LockModeType.PESSIMISTIC_WRITE)` ou `SELECT ... FOR UPDATE`), contar os confirmados, comparar com `capacity` e só então inserir, tudo na mesma transação. A PK composta de `event_attendances` garante que ninguém confirma duas vezes.
4. **Idempotência da presença**: `POST` que já existe e `DELETE` que não existe **não** são erro. Devolvem 200 com o evento.
5. **"Hoje"** é a data do servidor (`LocalDate.now()`), usada em todas as regras de "passado".
6. **Exclusão**: se `COUNT(attendances) = 0`, `DELETE`. Senão, `UPDATE events SET status = 'CANCELLED'`. As presenças ficam gravadas.

## 5. SQL (rascunho, PostgreSQL)

Nomes de tabela e coluna em inglês, como depois da migração de `refactor/english-names`.

```sql
CREATE TABLE IF NOT EXISTS events (
    id           BIGSERIAL     PRIMARY KEY,
    ngo_id       BIGINT        NOT NULL REFERENCES users(id),
    title        VARCHAR(120)  NOT NULL,
    description  TEXT          NOT NULL,
    category     VARCHAR(20)   NOT NULL CHECK (category IN ('ADOPTION_FAIR', 'HEALTH', 'BAZAAR', 'WORKSHOP')),
    date         DATE          NOT NULL,
    start_time   TIME          NOT NULL,
    end_time     TIME,
    venue_name   VARCHAR(120)  NOT NULL,
    cep          VARCHAR(8),
    street       VARCHAR(150)  NOT NULL,
    number       VARCHAR(20),
    complement   VARCHAR(100),
    district     VARCHAR(100),
    city         VARCHAR(100)  NOT NULL,
    state        VARCHAR(2)    NOT NULL,
    capacity     INTEGER       CHECK (capacity IS NULL OR capacity > 0),
    cover_url    TEXT,
    status       VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED')),
    created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_events_ngo ON events (ngo_id);
CREATE INDEX IF NOT EXISTS idx_events_status_date ON events (status, date);

CREATE TABLE IF NOT EXISTS event_attendances (
    event_id      BIGINT     NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id       BIGINT     NOT NULL REFERENCES users(id),
    confirmed_at  TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id)
);
```

> Confira os nomes `users(id)` e o padrão de colunas com o `sql/schema.sql` atual do backend antes de criar a migração.

## 6. Campanhas e doações

### 6.1 Regras de negócio

- Só conta **ONG** cria campanha. Só a **ONG dona** edita, encerra e exclui.
- Qualquer conta logada (pessoa ou ONG) doa, **menos a ONG dona na própria campanha**. O **admin não doa** (decidido em 15/10/2026): responde 403 "Contas de admin não fazem doações.", como a recusa de presença em eventos.
- Doação só por **PIX do Mercado Pago (Orders API)**, sempre criada pelo backend: o Access Token é secreto e nunca vai para o navegador.
- **Atualizado em 15/10/2026:** o dinheiro cai **direto na conta Mercado Pago da ONG**, vinculada por OAuth. Isso substitui a antiga "conta única da plataforma". Muda a criação da campanha, o DTO (`acceptingDonations`), a criação e a consulta da order e o webhook: ver `entrega-final/api-mercado-pago-ongs.md` §5.
- Valores em **reais inteiros**. Doação mínima **R$ 5**, máxima **R$ 100.000**. Meta entre **R$ 50** e **R$ 1.000.000**.
- Status da campanha: `ACTIVE | CLOSED`. Ela fica `CLOSED` quando a ONG encerra **ou** quando o `deadline` (opcional) passa. O segundo caso é **calculado na leitura** (`deadline < hoje`), sem job agendado. `closedAt` é o momento do encerramento ou `"{deadline}T23:59:59"`.
- **Meta atingida** não encerra nada: a campanha continua recebendo doações.
- Campanha encerrada é somente leitura: não edita e não recebe doação, mas o detalhe abre.
- **Encerrar** e **excluir** cancelam (`CANCELLED`) os PIX ainda pendentes da campanha.
- **Excluir** é sempre permitido:
  - sem doações `APPROVED` → exclusão real;
  - com doações `APPROVED` → exclusão lógica (`deleted = true`): some de todas as rotas de campanha (404), mas as doações continuam no histórico do doador e da ONG, com `campaign.removed = true`.
- Status da doação: `PENDING → APPROVED | EXPIRED | CANCELLED`. O PIX vale **30 min**; depois disso a doação vira `EXPIRED` (também calculado na leitura).
- Pagamento que chegar **depois** do cancelamento é aprovado mesmo assim: o dinheiro entrou.
- `raisedAmount` e `donationsCount` são `SUM`/`COUNT` das doações `APPROVED`.

### 6.2 Campanha (resposta)

```json
{
  "id": 1,
  "title": "Cirurgia urgente do Rex",
  "description": "Rex foi atropelado e precisa de uma cirurgia ortopédica...",
  "category": "HEALTH",
  "isUrgent": true,
  "goalAmount": 8000,
  "raisedAmount": 3250,
  "donationsCount": 25,
  "coverUrl": "https://... ou data:image/jpeg;base64,...",
  "deadline": "2026-10-29",
  "status": "ACTIVE",
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

- `category`: `HEALTH | FOOD | INFRASTRUCTURE` (saúde/cirurgias, alimentação, estrutura do abrigo).
- `goalAmount` e `raisedAmount` em reais inteiros (no banco, `NUMERIC(12,2)`; o JSON pode mandar `3250` ou `3250.00`).
- `deadline`, `closedAt`, `coverUrl`, `ngo.photoUrl`, `ngo.city` e `ngo.state` podem vir `null`.
- Booleans com `@JsonProperty("isUrgent")` / `@JsonProperty("isVerified")`.

### 6.3 Criar / editar campanha (requisição de `POST` e `PUT`)

```json
{
  "title": "Cirurgia urgente do Rex",
  "description": "Rex foi atropelado e precisa de uma cirurgia ortopédica...",
  "category": "HEALTH",
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
| `category` | sim | um dos 3 valores |
| `isUrgent` | não | padrão `false` |
| `goalAmount` | sim | inteiro de 50 a 1.000.000 |
| `deadline` | não | `>= hoje` |
| `coverUrl` | não | mesma regra da capa do evento (http(s) ou data URL jpeg/png/webp, até 600.000 caracteres) |

O `PUT` substitui todos os campos e é recusado (400) se a campanha estiver encerrada.

### 6.4 Doação (resposta)

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
  - `qrCode` é o "copia e cola" (`point_of_interaction.transaction_data.qr_code` do MP). O frontend desenha o QR a partir dele, então `qrCodeBase64` e `ticketUrl` podem vir `null`.
- `campaign.title` e `ngoName` são os **atuais** quando a campanha existe; se ela foi apagada de vez, valem os guardados na doação. `removed` é `true` para excluída (real ou lógica).
- `donor` (`{ id, name, photoUrl }`) só vem em `GET /donations/received`, para a ONG.
- Corpo do `POST /campaigns/{id}/donations`: `{ "amount": 50 }`.

### 6.5 Endpoints

| Método | Rota | Quem | Sucesso | Observação |
|---|---|---|---|---|
| GET | `/api/campaigns?ngoId=&status=` | público | 200 `Campaign[]` | `status` = `ACTIVE` (padrão) ou `CLOSED`. Nunca devolve excluídas. Ordem: `createdAt` decrescente |
| GET | `/api/campaigns/{id}` | público | 200 `Campaign` | 404 se não existe ou foi excluída. Encerrada **abre** normalmente |
| POST | `/api/campaigns` | ONG | 201 `Campaign` | 403 se não for ONG |
| PUT | `/api/campaigns/{id}` | ONG dona | 200 `Campaign` | 400 se encerrada |
| POST | `/api/campaigns/{id}/close` | ONG dona | 200 `Campaign` | cancela os PIX pendentes. 400 se já encerrada |
| DELETE | `/api/campaigns/{id}` | ONG dona | 204 | real ou lógica (ver §6.1); cancela os PIX pendentes |
| GET | `/api/campaigns/mine` | ONG | 200 `Campaign[]` | ativas e encerradas da ONG logada, sem as excluídas |
| POST | `/api/campaigns/{id}/donations` | logado | 201 `Donation` | cria a order PIX no MP. 404 se a campanha não existe; 400 se própria, encerrada ou valor inválido |
| GET | `/api/donations/{id}` | doador | 200 `Donation` | 403 se for de outra conta. Se `PENDING`, consulta o MP antes de responder (ver §6.6) |
| GET | `/api/donations/mine` | logado | 200 `Donation[]` | histórico de quem doou, em qualquer status, `createdAt` decrescente |
| GET | `/api/donations/received` | ONG | 200 `Donation[]` | só `APPROVED`, nas campanhas da ONG logada (inclusive excluídas), com `donor`, `approvedAt` decrescente |
| POST | `/api/webhooks/mercadopago` | Mercado Pago | 200 | só backend: valida a assinatura e aprova a doação |

**Mensagens (400) usadas pelo frontend:**
- "Você não pode doar para a sua própria campanha."
- "Esta campanha está encerrada e não recebe mais doações."
- "A doação mínima é de R$ 5." / "Informe um valor em reais, sem centavos."
- "Campanhas encerradas não podem ser editadas." / "Esta campanha já está encerrada."

### 6.6 Fluxo do PIX e notas de implementação

1. O modal manda `POST /api/campaigns/{id}/donations { amount }`.
2. O backend grava a doação `PENDING` (`expires_at = agora + 30 min`) e cria a order no MP (Orders API, `payment_method.id = "pix"`), com o header `X-Idempotency-Key` = id da doação. Guarda o `mp_order_id`.
3. A resposta traz o `pix`. O modal mostra o QR, o "copia e cola" e a contagem regressiva, e faz `GET /api/donations/{id}` a cada 3 s.
4. Aprovação chega por **dois caminhos**: o webhook do MP ou o próprio `GET /donations/{id}`, que consulta a order no MP enquanto estiver `PENDING`. O segundo é o que funciona em `localhost`, onde o webhook não chega sem ngrok.
5. **Aprovação atômica**, para webhook e polling nunca somarem duas vezes:
   ```sql
   UPDATE donations SET status = 'APPROVED', approved_at = now()
   WHERE id = ? AND status IN ('PENDING', 'CANCELLED');
   ```
   Só se 1 linha mudou, o total sobe. Com `raisedAmount` calculado por `SUM`, nem isso é necessário.
6. **Segurança**: liberar só as leituras públicas, com as rotas fixas antes da regra pública, como em eventos:
   ```java
   .requestMatchers(HttpMethod.GET, "/api/campaigns/mine").authenticated()
   .requestMatchers(HttpMethod.GET, "/api/campaigns", "/api/campaigns/*").permitAll()
   .requestMatchers(HttpMethod.POST, "/api/webhooks/mercadopago").permitAll()
   ```
7. **Sandbox do MP**: com `payer.first_name = "APRO"`, o PIX de teste é aprovado automaticamente.

### 6.7 SQL (rascunho, PostgreSQL)

```sql
CREATE TABLE IF NOT EXISTS campaigns (
    id           BIGSERIAL      PRIMARY KEY,
    ngo_id       BIGINT         NOT NULL REFERENCES users(id),
    title        VARCHAR(120)   NOT NULL,
    description  TEXT           NOT NULL,
    category     VARCHAR(20)    NOT NULL CHECK (category IN ('HEALTH', 'FOOD', 'INFRASTRUCTURE')),
    is_urgent    BOOLEAN        NOT NULL DEFAULT FALSE,
    goal_amount  NUMERIC(12,2)  NOT NULL CHECK (goal_amount >= 50),
    deadline     DATE,
    cover_url    TEXT,
    status       VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED')),
    deleted      BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at    TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_campaigns_ngo ON campaigns (ngo_id);

CREATE TABLE IF NOT EXISTS donations (
    id              BIGSERIAL      PRIMARY KEY,
    campaign_id     BIGINT         REFERENCES campaigns(id) ON DELETE SET NULL,
    campaign_title  VARCHAR(120)   NOT NULL,
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
```

`campaign_title` guarda o título no momento da doação, para o histórico continuar legível quando a campanha é apagada de vez (`ON DELETE SET NULL`).
