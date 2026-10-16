# AUcolher — Contrato da API: eventos e presenças

> ✅ **Implementado** (migração 006). O front usa a API com `VITE_USE_MOCK_EVENTOS=false`.
> Campanhas e doações, que moravam na §6 deste arquivo, estão em `../entrega-final/api-campanhas-doacoes.md`.

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
