# AUcolher — Contrato da API: retorno, repasse e taxa de reabandono

> Implementa a regra de negócio §3.3. Migração **012**.
>
> **Por que existe:** é a métrica que valida a hipótese principal do TCC. Adoções com compatibilidade alta no AUmatch voltam menos?

> ✅ **Implementado** (back e front, com `VITE_USE_MOCK_REABANDONO=false`). Diferenças do contrato: o `PATCH /status` recusa `RETURNED`/`REHOMED` (400); data do retorno ausente responde "Informe a data do retorno"; o repasse exige cidade e UF no perfil do adotante, como o cadastro. As mensagens de sistema do chat (`ANIMAL_RETURNED`, `ANIMAL_REHOMED`) entram com o chat: `../entrega-final/api-chat.md`.

## 1. Regras de negócio

### 1.1 Dois caminhos, que contam igual na taxa

| Caminho | Quem registra | Onde | Pedido vira | O que acontece com o animal |
|---|---|---|---|---|
| **Animal retornado** | Quem doou (dono original: pessoa ou ONG) | Pessoa: "Meus animais" → Anunciados por mim. ONG: painel → Animais | `RETURNED` | O **mesmo anúncio** volta para o doador como `INACTIVE` (fora do ar) |
| **Republicar anúncio** | Quem adotou | "Meus animais" → Adotados por mim | `REHOMED` | Nasce um **anúncio novo** em nome do adotante: cópia com fotos e comportamento, que ele revisa antes de publicar. O anúncio original continua `ADOPTED` no histórico do doador |

- **De onde parte:** os dois só partem de um pedido `CONCLUDED`.
- **Vale o primeiro.** Depois do retorno, o adotante não republica, porque o animal não está mais com ele. Depois do repasse, o doador não registra retorno, porque o animal está com o adotante.
- `RETURNED` e `REHOMED` **não são ativos**, como `CONCLUDED`.
- **Adotante ONG fica fora de tudo.** Quando uma ONG adota, ela está resgatando o animal e depois o anuncia de novo pelo painel, como qualquer resgate. Isso não é reabandono. Então, quando o adotante do pedido é ONG:
  - nenhuma das 4 rotas aceita o pedido (400, seção 3), nem para o doador nem para a ONG;
  - o pedido fica fora da taxa: não entra em `adoptions`, `returns`, faixas nem `noScore` (seção 4).
  - A **ONG doadora** continua normal: se ela doa para uma pessoa e o animal volta, ela registra o retorno pelo painel, e conta.
- Cada adoção conta separado. Se o animal republicado for adotado de novo, nasce outro pedido, com outro score congelado, que também pode voltar ou ser repassado.

### 1.2 Score congelado

- Quando o pedido passa a `CONCLUDED`, a API grava o score daquele momento em `match_score_at_adoption`, e ele **não muda mais**. Assim, refazer o quiz ou editar o animal depois não altera a medição.
- Ele só é gravado se o adotante tiver o **perfil AUmatch completo** (as 7 respostas). Nos outros casos fica nulo, e a adoção conta na taxa geral, mas fica fora das faixas:
  - ONG adotando;
  - pessoa sem quiz ou com quiz incompleto;
  - pedidos concluídos antes da migração.
- O `matchScore` que o DTO já devolve continua sendo o score **atual**, calculado na hora.

### 1.3 Animal retornado (doador)

- **O doador informa:**
  - a **data do retorno**, que não pode ser futura nem anterior à data da conclusão;
  - o **motivo** (seção 1.5);
  - uma **observação** opcional, de até 500 caracteres, obrigatória no motivo `OTHER`.
- **O anúncio:** passa de `ADOPTED` para `INACTIVE`. É a **única exceção** à regra "animal adotado não muda de status".
  - Depois disso, o doador edita o anúncio quando quiser, porque `INACTIVE` pode ser editado, e o reativa com o `PATCH /status` de sempre.
  - O front oferece "Revisar e republicar" (abre a edição) ou "Deixar fora do ar".
- **Corrigir:** repetir o registro num pedido já `RETURNED` corrige a data, o motivo e a nota, sem mexer no animal. **Não existe desfazer.**

### 1.4 Republicar anúncio (adotante)

- O adotante abre "Republicar anúncio". O front busca os dados completos do animal (`rehome-draft`) e mostra o formulário de anúncio **preenchido**, mais o motivo e a observação (mesmas regras da seção 1.3, sem data). O adotante pode corrigir o comportamento com base no que aprendeu convivendo com o animal.
- Ao publicar, numa transação:
  - nasce o anúncio novo, `AVAILABLE`, em nome do adotante, com `origin_request_id` = id do pedido original;
  - o pedido original vira `REHOMED`, com `return_date` = hoje.
- **O repasse conta a partir daqui.**
- **Desisti de doar.** Enquanto o anúncio novo **não tiver gerado uma adoção** (não está `ADOPTED`), o adotante pode desfazer:
  - o anúncio novo vira `INACTIVE`, e os pedidos ativos dele são cancelados como em qualquer "tirar do ar" (`ANIMAL_UNAVAILABLE`);
  - o anúncio novo perde o `origin_request_id`;
  - o pedido original volta a `CONCLUDED`, com os dados do repasse apagados.
- **Tirar do ar ou excluir o anúncio novo NÃO desfaz o repasse.** Na API, os dois são a mesma coisa: o animal fica `INACTIVE`. Para desfazer, existe a ação própria. No front, o diálogo de excluir pergunta qual é o caso (seção 8).

### 1.5 Motivos (`returnReason`)

| Valor | Texto no front |
|---|---|
| `BEHAVIOR` | Comportamento do animal |
| `OTHER_PETS` | Incompatibilidade com outros animais da casa |
| `CHILDREN` | Incompatibilidade com crianças |
| `HOUSING_OR_ROUTINE` | Mudança de moradia ou de rotina |
| `COSTS` | Custos |
| `ANIMAL_HEALTH` | Saúde do animal |
| `OTHER` | Outro motivo (descrição obrigatória) |

### 1.6 O que muda em outras regras

- **Avaliações:** continuam liberadas em `RETURNED` e `REHOMED`, porque a adoção aconteceu. O `AdoptionReviewService` hoje exige `CONCLUDED` e passa a aceitar os três.
- **Perfil público:** o `adoptionsCount` (`GET /users/{id}/reviews`) conta `CONCLUDED`, `RETURNED` e `REHOMED`.
- **Visibilidade:** as duas partes veem o tipo, a data, o motivo e a nota no card do pedido. Em `REHOMED`, o doador vê também o link para o anúncio novo.
- **Chat:** registrar um retorno ou um repasse cria uma mensagem de sistema na conversa do pedido, na mesma transação, se o chat (migração 011) já existir:
  - `ANIMAL_RETURNED`: "{animal} voltou para quem doou.";
  - `ANIMAL_REHOMED`: "{adotante} anunciou {animal} para uma nova adoção.".
  - A conversa continua somente leitura. Desfazer o repasse não cria mensagem.

## 2. Formatos (DTOs)

### 2.1 Pedido de adoção (acréscimos ao `AdoptionRequestDTO`)

```json
{
  "...campos de sempre": "...",
  "status": "RETURNED",
  "matchScoreAtAdoption": 85,
  "return": {
    "type": "RETURNED",
    "date": "2026-11-03",
    "reason": "OTHER_PETS",
    "note": "Não se adaptou com os dois gatos da casa.",
    "recordedAt": "2026-11-03T18:20:00",
    "rehomedAnimalId": null
  }
}
```

- `return` vem `null` fora de `RETURNED` e `REHOMED`.
- `type` repete o status, para o front não precisar comparar.
- `rehomedAnimalId` só vem em `REHOMED`: é o id do anúncio novo.
- `matchScoreAtAdoption` pode ser `null` (seção 1.2).

### 2.2 Registrar retorno (corpo)

```json
{ "returnDate": "2026-11-03", "reason": "OTHER_PETS", "note": "Não se adaptou com os dois gatos da casa." }
```

### 2.3 Dados para republicar (`GET .../rehome-draft`)

Devolve o **mesmo formato do corpo de cadastro de animal** (`AnimalRequestDTO`), já preenchido com os dados atuais do anúncio original, fotos incluídas. O front usa isso como valor inicial do `AnimalFormWizard`.

### 2.4 Republicar (corpo)

```json
{
  "reason": "HOUSING_OR_ROUTINE",
  "note": "Vou me mudar para um apartamento que não aceita animais.",
  "animal": { "...AnimalRequestDTO completo, revisado pelo adotante": "..." }
}
```

- `animal` passa pelas **mesmas validações** do `POST /api/animals`.
- A resposta é o `AdoptionRequestDTO` atualizado (`REHOMED`, com `rehomedAnimalId`).

### 2.5 Animal (acréscimo)

- `AnimalSummaryDTO` e `AnimalDetailDTO` ganham `originRequestId`, nulo ou o id do pedido.
- O front usa esse campo no diálogo de excluir do anúncio republicado e no link "republicado de uma adoção".

## 3. Endpoints

| Método | Rota | Quem | Sucesso | Observação |
|---|---|---|---|---|
| POST | `/api/adoption-requests/{id}/return` | dono do animal | 200 `AdoptionRequestDTO` | Registra ou corrige o retorno |
| GET | `/api/adoption-requests/{id}/rehome-draft` | adotante | 200 `AnimalRequestDTO` | Só com pedido `CONCLUDED` |
| POST | `/api/adoption-requests/{id}/rehome` | adotante | 200 `AdoptionRequestDTO` | Cria o anúncio novo + `REHOMED`, numa transação |
| POST | `/api/adoption-requests/{id}/rehome/undo` | adotante | 200 `AdoptionRequestDTO` | "Desisti de doar" |

**Ordem das checagens** (como no resto do pacote `adoption/`):
1. pedido não existe → 404 "Pedido não encontrado";
2. papel errado → 403;
3. adotante ONG → 400;
4. status errado → 400;
5. validação do corpo → 400.

| Status | Rota | Quando | `message` |
|---|---|---|---|
| 403 | `/return` | não é o dono do animal | "Só quem doou o animal registra o retorno" |
| 403 | `/rehome*` | não é o adotante | "Só quem adotou pode republicar o animal" |
| 400 | as 4 rotas | o adotante do pedido é ONG (seção 1.1) — checado logo depois do papel | "Adoções feitas por ONG não têm retorno nem repasse" |
| 400 | `/return` | pedido não está `CONCLUDED` nem `RETURNED` | "Só uma adoção concluída pode ter o retorno registrado" |
| 400 | `/return` | pedido `REHOMED` | "O adotante já anunciou este animal para uma nova adoção" |
| 400 | `/rehome-draft`, `/rehome` | pedido não está `CONCLUDED` | "Só uma adoção concluída pode ser republicada" |
| 400 | `/rehome-draft`, `/rehome` | pedido `RETURNED` | "Este animal já voltou para quem doou" |
| 400 | `/rehome/undo` | pedido não está `REHOMED` | "Esta adoção não foi republicada" |
| 400 | `/rehome/undo` | anúncio novo já `ADOPTED` | "O anúncio já gerou uma nova adoção: não dá para desfazer" |
| 400 | `/return` | data futura | "A data do retorno não pode ser futura" |
| 400 | `/return` | data anterior à conclusão | "A data do retorno não pode ser anterior à adoção" |
| 400 | `/return`, `/rehome` | sem motivo | "Escolha o motivo" |
| 400 | `/return`, `/rehome` | `OTHER` sem nota | "Descreva o motivo" |
| 400 | `/return`, `/rehome` | nota com mais de 500 caracteres | "A observação pode ter no máximo 500 caracteres" |

## 4. Taxa de reabandono (`AdminStatsDTO`)

Bloco novo em `GET /api/admin/stats` (`api-admin.md` §3.1):

```json
"returns": {
  "adoptions": 40,
  "returned": 4,
  "rehomed": 2,
  "rate": 15.0,
  "byRange": [
    { "range": "HIGH",   "min": 80, "max": 100, "adoptions": 20, "returns": 1, "rate": 5.0 },
    { "range": "MEDIUM", "min": 50, "max": 79,  "adoptions": 12, "returns": 2, "rate": 16.7 },
    { "range": "LOW",    "min": 0,  "max": 49,  "adoptions": 6,  "returns": 3, "rate": 50.0 }
  ],
  "noScore": { "adoptions": 2, "returns": 0 },
  "byReason": { "BEHAVIOR": 3, "OTHER_PETS": 1, "CHILDREN": 0, "HOUSING_OR_ROUTINE": 1, "COSTS": 1, "ANIMAL_HEALTH": 0, "OTHER": 0 }
}
```

- **Os números** (sempre **sem** os pedidos em que o adotante é ONG, seção 1.1):
  - `adoptions` = pedidos em `CONCLUDED`, `RETURNED` ou `REHOMED` (todas as adoções que aconteceram);
  - `returns` = `RETURNED` + `REHOMED`.
- **A taxa:** `rate` = `returns ÷ adoptions × 100`, com uma casa decimal, e `null` quando `adoptions = 0`.
- **Faixas:** pelo `match_score_at_adoption`. Os nulos vão para `noScore`.
- **`byReason`:** conta os motivos de `RETURNED` e `REHOMED`, sempre com as 7 chaves.

```sql
SELECT CASE
         WHEN match_score_at_adoption IS NULL THEN 'NONE'
         WHEN match_score_at_adoption >= 80   THEN 'HIGH'
         WHEN match_score_at_adoption >= 50   THEN 'MEDIUM'
         ELSE 'LOW'
       END                                                  AS range,
       COUNT(*)                                             AS adoptions,
       COUNT(*) FILTER (WHERE r.status IN ('RETURNED', 'REHOMED')) AS returns
FROM adoption_requests r
JOIN users adopter ON adopter.id = r.adopter_id
WHERE r.status IN ('CONCLUDED', 'RETURNED', 'REHOMED')
  AND adopter.user_type <> 'NGO'          -- resgate de ONG não é adoção final (seção 1.1)
GROUP BY 1;
```

## 5. Notas de implementação (Spring Boot)

1. **Enums:**
   - `AdoptionStatus` ganha `RETURNED` e `REHOMED`, fora do conjunto `ACTIVE`;
   - enum novo `ReturnReason`.
2. **Entidade `AdoptionRequest`:**
   - campos `matchScoreAtAdoption`, `returnDate`, `returnReason`, `returnNote` e `returnRecordedAt`;
   - métodos `recordReturn(...)`, `rehome(...)` e `undoRehome()`, no estilo de `accept()` e `conclude()`.
3. **Congelar o score no `conclude(request)`** do `AdoptionRequestService`: se o adotante tem `MatchProfile` e `isComplete()`, grave `MatchScoreCalculator.score(profile, animal).score()`; senão, `null`.
4. **"Vale o primeiro".** Em `/return`, `/rehome` e `/rehome/undo`, trave a linha do pedido (`PESSIMISTIC_WRITE`, como o `conclude` já faz com o animal) antes de checar o status.
5. **`AnimalService`:**
   - `returnToOwner(animal)`, de uso interno: `ADOPTED → INACTIVE`, a exceção da seção 1.3;
   - `createRehomed(adopter, dto, originRequest)`: reaproveita o `fill(...)` do cadastro.
   - O `PUT` e o `PATCH /status` públicos continuam recusando animal adotado.
6. **Mensagens de sistema:** `ANIMAL_RETURNED` e `ANIMAL_REHOMED` entram no `SystemEvent` do chat (`../entrega-final/api-chat.md` §1).
7. **Avaliações e perfil:** `AdoptionReviewService` aceita os três status (seção 1.6), e `countByStatusInvolving` passa a receber a lista dos três.
8. **Testes:**
   - score congelado com e sem quiz completo;
   - retorno pelo dono: animal `INACTIVE` e pedido `RETURNED`;
   - retorno com data inválida;
   - adotante tentando registrar retorno → 403;
   - pedido com adotante ONG → 400 nas 4 rotas, e fora do `stats`;
   - republicar cria o anúncio e o pedido fica `REHOMED`;
   - retorno depois do repasse → 400;
   - desfazer antes e depois de o anúncio novo ser adotado;
   - a agregação do `stats`.

## 6. Ligação com a página "Meus animais"

A página `/meus-animais` é só front (regras §5). Esta feature acrescenta a ela:
- os botões da seção 8;
- o `originRequestId` dos anúncios, para o diálogo de excluir.

## 7. SQL (rascunho de migração, PostgreSQL)

```sql
-- ============================================================
-- Migração 012 — retorno, repasse e score congelado
--
-- Uma adoção concluída pode voltar para quem doou (RETURNED) ou ser
-- republicada pelo adotante (REHOMED). Os dois contam na taxa de
-- reabandono. O score do AUmatch fica congelado na conclusão.
--
--   psql -U postgres -h localhost -d aucolher_db -f sql/migrations/012_adoption_returns.sql
-- ============================================================

BEGIN;

ALTER TABLE adoption_requests
    ADD COLUMN IF NOT EXISTS match_score_at_adoption SMALLINT,
    ADD COLUMN IF NOT EXISTS return_date             DATE,
    ADD COLUMN IF NOT EXISTS return_reason           VARCHAR(30),
    ADD COLUMN IF NOT EXISTS return_note             VARCHAR(500),
    ADD COLUMN IF NOT EXISTS return_recorded_at      TIMESTAMP;

-- Status: os de antes + RETURNED e REHOMED
ALTER TABLE adoption_requests DROP CONSTRAINT IF EXISTS chk_adoption_requests_status;
ALTER TABLE adoption_requests ADD CONSTRAINT chk_adoption_requests_status
    CHECK (status IN ('PENDING', 'ACCEPTED', 'AWAITING_DELIVERY', 'CONCLUDED', 'REJECTED', 'CANCELLED',
                      'RETURNED', 'REHOMED'));

-- concluded_at: preenchido em toda adoção que aconteceu (a 005 exigia só em CONCLUDED)
ALTER TABLE adoption_requests DROP CONSTRAINT IF EXISTS chk_adoption_requests_concluded;
ALTER TABLE adoption_requests ADD CONSTRAINT chk_adoption_requests_concluded
    CHECK ((status IN ('CONCLUDED', 'RETURNED', 'REHOMED')) = (concluded_at IS NOT NULL));

ALTER TABLE adoption_requests ADD CONSTRAINT chk_adoption_requests_score
    CHECK (match_score_at_adoption IS NULL OR match_score_at_adoption BETWEEN 0 AND 100);

ALTER TABLE adoption_requests ADD CONSTRAINT chk_adoption_requests_return_reason
    CHECK (return_reason IS NULL OR return_reason IN
        ('BEHAVIOR', 'OTHER_PETS', 'CHILDREN', 'HOUSING_OR_ROUTINE', 'COSTS', 'ANIMAL_HEALTH', 'OTHER'));

-- Os dados do retorno existem exatamente em RETURNED e REHOMED
ALTER TABLE adoption_requests ADD CONSTRAINT chk_adoption_requests_returned
    CHECK ((status IN ('RETURNED', 'REHOMED')) =
           (return_date IS NOT NULL AND return_reason IS NOT NULL AND return_recorded_at IS NOT NULL));

ALTER TABLE adoption_requests ADD CONSTRAINT chk_adoption_requests_return_note
    CHECK (return_reason IS DISTINCT FROM 'OTHER' OR (return_note IS NOT NULL AND char_length(btrim(return_note)) > 0));

COMMENT ON COLUMN adoption_requests.match_score_at_adoption IS 'Score do AUmatch congelado na conclusão (nulo sem quiz completo) — base das faixas da taxa de reabandono';
COMMENT ON COLUMN adoption_requests.return_date             IS 'RETURNED: data em que o animal voltou ao doador; REHOMED: data da republicação';
COMMENT ON COLUMN adoption_requests.return_reason           IS 'Motivo do retorno ou do repasse';

-- O anúncio republicado aponta para a adoção de onde veio (uma republicação por adoção)
ALTER TABLE animals ADD COLUMN IF NOT EXISTS origin_request_id BIGINT
    REFERENCES adoption_requests (id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_animals_origin_request ON animals (origin_request_id)
    WHERE origin_request_id IS NOT NULL;

COMMENT ON COLUMN animals.origin_request_id IS 'Anúncio republicado pelo adotante: o pedido de adoção de onde ele veio (nulo nos demais)';

-- Taxa de reabandono no painel do admin
CREATE INDEX IF NOT EXISTS idx_adoption_requests_outcome ON adoption_requests (status)
    WHERE status IN ('CONCLUDED', 'RETURNED', 'REHOMED');

COMMIT;
```

- Os pedidos concluídos antes desta migração ficam com `match_score_at_adoption` nulo e entram em `noScore`.
- O "desfazer" zera o `origin_request_id` do anúncio novo. Por isso o índice único admite uma nova republicação depois de desfazer.

## 8. O que muda no front

> ✅ Feito no front, ligado na API (`VITE_USE_MOCK_REABANDONO=false`). O admin lê o bloco `returns` do `stats` real (`VITE_USE_MOCK_ADMIN=false`).
>
> Nenhum botão aparece em pedido com adotante ONG (seção 1.1).

**Serviços** (`features/adocao/services/`):
- `registerReturn(requestId, body)`;
- `getRehomeDraft(requestId)`;
- `rehome(requestId, body)`;
- `undoRehome(requestId)`.
- Os mappers levam `matchScoreAtAdoption`, `return` e o `originRequestId` dos animais.

**"Meus animais" → Anunciados por mim:**
- **Botão.** Nos cards `ADOPTED`, aparece **"Animal retornado"**. O pedido correspondente é o `CONCLUDED` daquele animal em `/adoption-requests/received`, que o front já carrega.
- **Modal:**
  - data (padrão: hoje);
  - motivo (os 7 da seção 1.5);
  - observação, obrigatória em "Outro".
- **Sucesso:** o *toast* "Retorno registrado" e duas opções, "Revisar e republicar" (vai para `/animais/editar/:id`) e "Deixar fora do ar".
- **Excluir um anúncio com `originRequestId`:** o diálogo pergunta:
  - "Fiquei com o animal" → chama `undoRehome` e o pedido volta a "Concluída";
  - "Doei por fora / só tirar do ar" → exclusão de sempre, e o repasse continua valendo.

**"Meus animais" → Adotados por mim:**
- **Adoção `CONCLUDED`:** botão **"Republicar anúncio"** → página `/meus-animais/republicar/:requestId`:
  - carrega o `rehome-draft` no `AnimalFormWizard`, mais um passo de motivo;
  - publica, e vai para o anúncio novo.
- **`REHOMED`:**
  - mostra "Republicado em {data}" e o link para o anúncio;
  - mostra **"Desisti de doar"**, com `ConfirmDialog`, enquanto o anúncio novo não estiver adotado.
- **`RETURNED`:** mostra "Devolvido a {doador} em {data}".

**Painel da ONG** (`features/ong/panel/pages/AnimalsPage.jsx` / `animals/AnimalRow.jsx`):
- o mesmo **"Animal retornado"** nos animais adotados;
- a mesma modal e as mesmas opções depois.

**Cards de pedido:**
- `AdoptionStatus.jsx`, `SentRequestCard`, `ReceivedRequestCard`, `ResolvedRequestRow` e `AdoptionTimeline` ganham os estados **"Devolvido ao doador"** e **"Repassado pelo adotante"**, com a data e o motivo;
- o doador vê também o link para o anúncio novo, em `REHOMED`.

**Painel do admin:**
- **Card novo** em `features/admin/overview/`, por exemplo `ReturnRateCard.jsx`:
  - a taxa geral;
  - três barras por faixa (alta, média, baixa), com "x de y adoções";
  - a lista de motivos;
  - uma nota de rodapé: "Considera só retornos e repasses registrados na plataforma.".
- **Layout de impressão:** o card entra no PDF.
