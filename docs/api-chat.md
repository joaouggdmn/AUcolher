# AUcolher — Contrato da API: chat dos pedidos de adoção

> Versão 1 (13/10/2026). Hoje o chat é todo do navegador: as mensagens ficam no `localStorage` (`chat_messages_{requestId}`), a última leitura também (`aucolher_chat_last_seen_{userId}`), e as mensagens de sistema são escritas pelo próprio front (`core/hooks/useConcludeAdoption.js`). Cada navegador tem a sua conversa, então as duas partes **não se veem**.
> Este contrato leva o chat para o banco. Ele segue o padrão do resto da API: rotas, campos e enums em inglês, erros no `ErrorResponseDTO` com a frase pronta em `message`.
> **Decisão:** as mensagens novas chegam por **polling** (o front pergunta de tempos em tempos), sem WebSocket. É REST comum no Spring, e o modal do PIX já usa o mesmo padrão.

## 1. Regras de negócio

- **A conversa é o pedido de adoção.** Não existe tabela de "conversa": o id da conversa é o `adoption_requests.id`. As duas partes são:
  - o **adotante** (`adoption_requests.adopter_id`);
  - o **dono** do animal (`animals.owner_id`), pessoa ou ONG.
- Só as duas partes leem e escrevem. O admin não acessa o chat (403).
- **Quando a conversa existe.** A partir do aceite do dono (`ACCEPTED`). Depois disso ela continua visível, mesmo travada:
  - em `AWAITING_DELIVERY` e `CONCLUDED`;
  - em `CANCELLED`, **se** o pedido foi cancelado depois de aceito (`cancelled_from_status` = `ACCEPTED` ou `AWAITING_DELIVERY`).
  - Pedido `PENDING`, `REJECTED` ou cancelado ainda pendente **não tem conversa** (404).
  - É a mesma regra que o front já usa em `core/hooks/useChatContacts.js`.
- **Quem pode mandar mensagem.** Só em `ACCEPTED`. Em qualquer outro status a conversa é **somente leitura**: o histórico aparece, o campo de texto some.
  - `AWAITING_DELIVERY`: o dono confirmou a entrega e o chat trava (regras §3.1, passo 3).
  - `CONCLUDED` e `CANCELLED`: encerrada.
  - Banimento e anúncio removido pela moderação já cancelam o pedido (`api-denuncias-moderacao.md`), então a conversa trava sozinha, sem regra extra.
- **Mensagem de pessoa.** Só texto, de **1 a 1000 caracteres** depois de aparar os espaços das pontas. Quebras de linha no meio valem. Sem anexos nem imagens.
- **Mensagens de sistema.** São os avisos centralizados no meio da conversa ("O doador confirmou a entrega de Rex...").
  - Passam a ser criadas **pelo backend**, na **mesma transação** da troca de status do pedido. Assim as duas partes veem o aviso, e ele nunca existe sem a troca de status (nem o contrário).
  - O banco guarda um **código** (`systemEvent`), não o texto. O front monta a frase em português com o nome do animal, como já faz com o `cancelReason`.

| `systemEvent` | Quando o backend cria | Texto que o front mostra (hoje) |
|---|---|---|
| `DELIVERY_REQUESTED` | `ACCEPTED → AWAITING_DELIVERY` | "O doador confirmou a entrega de {animal}. O chat foi bloqueado para novas mensagens — quando o pet chegar até você, confirme o recebimento para concluir a adoção." |
| `ADOPTION_CONCLUDED` | `AWAITING_DELIVERY → CONCLUDED` | "Adoção de {animal} concluída! Parabéns pelo novo membro da família." |
| `ADOPTER_WITHDREW` | adotante cancela **a partir de** `ACCEPTED` ou `AWAITING_DELIVERY` | "O adotante cancelou o pedido de adoção de {animal}." |
| `OWNER_WITHDREW` | dono cancela (`ACCEPTED` ou `AWAITING_DELIVERY`) | "O doador desistiu da adoção de {animal}. O pedido foi cancelado." |

  - O adotante que cancela um pedido ainda `PENDING` **não** gera mensagem: não havia conversa.
  - Os cancelamentos feitos pelo sistema (`ANIMAL_ADOPTED`, `ANIMAL_UNAVAILABLE`, `ACCOUNT_BANNED`, `LISTING_REMOVED`) também **não** geram mensagem. O front já mostra o motivo na faixa de "Conversa encerrada", a partir do `cancelReason` do pedido.
- **Não lidas.** Cada parte guarda até qual mensagem já leu (`last_read_message_id`).
  - Conta como não lida toda mensagem com `id` maior que esse valor e que **não** foi escrita pela própria pessoa. Mensagens de sistema contam para as duas partes.
  - É a mesma conta que o front faz hoje em `countUnreadMessages` (`core/utils/chatReadState.js`).
  - A marca de leitura só anda para frente.

## 2. Formatos (DTOs)

`createdAt` é `LocalDateTime` **sem fuso** (`"2026-10-13T14:03:00"`), como no resto da API.

### 2.1 Mensagem (`ChatMessage`)

Mensagem de pessoa:

```json
{
  "id": 57,
  "type": "USER",
  "senderId": 4,
  "text": "Oi! Posso visitar o Rex no sábado de manhã?",
  "systemEvent": null,
  "createdAt": "2026-10-13T14:03:00"
}
```

Mensagem de sistema:

```json
{
  "id": 58,
  "type": "SYSTEM",
  "senderId": null,
  "text": null,
  "systemEvent": "DELIVERY_REQUESTED",
  "createdAt": "2026-10-13T18:20:00"
}
```

- `type`: `USER | SYSTEM`.
- `USER`: `senderId` e `text` preenchidos, `systemEvent` nulo.
- `SYSTEM`: só `systemEvent`; `senderId` e `text` nulos.
- O front descobre se a mensagem é dele comparando `senderId` com o id da conta logada. Não precisa de nome nem de foto: a conversa tem só duas pessoas, e o cabeçalho já vem do pedido.

### 2.2 Enviar mensagem (corpo do `POST`)

```json
{ "text": "Oi! Posso visitar o Rex no sábado de manhã?" }
```

### 2.3 Marcar como lida (corpo do `PUT`)

```json
{ "lastMessageId": 58 }
```

`lastMessageId` é a última mensagem que **apareceu na tela**, não "a última que existe". Assim, uma mensagem que chegou entre o `GET` e o `PUT` não é marcada como lida sem ninguém ver.

### 2.4 Resumo das conversas (`ChatSummary`)

```json
{
  "totalUnread": 3,
  "conversations": [
    {
      "requestId": 8,
      "unreadCount": 2,
      "lastMessage": { "id": 58, "type": "SYSTEM", "senderId": null, "text": null, "systemEvent": "DELIVERY_REQUESTED", "createdAt": "2026-10-13T18:20:00" }
    },
    { "requestId": 5, "unreadCount": 0, "lastMessage": null }
  ]
}
```

- Traz **todas** as conversas da conta logada (como dona ou como adotante), inclusive as que ainda não têm mensagem (`lastMessage: null`) e as travadas.
- Ordem: a mensagem mais recente primeiro; as conversas sem mensagem vão para o fim, com o `requestId` mais novo primeiro.
- `totalUnread` é a soma dos `unreadCount`. É o número do badge da sidebar.
- O resto do card (nome e foto da outra parte, nome do animal, status) o front já tem dos pedidos (`/adoption-requests/sent` e `/received`). Por isso o resumo não repete esses dados.

### 2.5 Erro

O mesmo `ErrorResponseDTO` de hoje: `{ "status": 400, "error": "...", "message": "Escreva uma mensagem." }`. O front mostra o `message` direto.

## 3. Endpoints

| Método | Rota | Quem | Sucesso | Observação |
|---|---|---|---|---|
| GET | `/api/chats/summary` | logado (pessoa ou ONG) | 200 `ChatSummary` | badge da sidebar, lista de conversas e painel da ONG |
| GET | `/api/chats/{requestId}/messages?after={id}` | as duas partes | 200 `ChatMessage[]` | ordem crescente de `id`. Sem `after`, o histórico inteiro; com `after`, só as mensagens com `id > after` (pode vir `[]`) |
| POST | `/api/chats/{requestId}/messages` | as duas partes | 201 `ChatMessage` | só em `ACCEPTED` |
| PUT | `/api/chats/{requestId}/read` | as duas partes | 204 | marca como lida até `lastMessageId`; vale em qualquer status com conversa (inclusive travada) |

`{requestId}` é o id do pedido de adoção. As listas são arrays simples, sem paginação: o volume do TCC é pequeno.

**Ordem das checagens** nas rotas com `{requestId}`:
1. pedido não existe → 404 "Conversa não encontrada.";
2. a conta não é o adotante nem o dono → 403 "Você não participa desta conversa.";
3. o pedido nunca teve conversa (`PENDING`, `REJECTED`, cancelado antes do aceite) → 404 "Conversa não encontrada.";
4. regra do envio (só no `POST`) → 400.

**Recusas (400) no envio**, com `message`:

| Quando | `message` |
|---|---|
| texto vazio ou só espaços | "Escreva uma mensagem." |
| mais de 1000 caracteres | "A mensagem pode ter no máximo 1000 caracteres." |
| pedido em `AWAITING_DELIVERY` | "A entrega já foi confirmada: o chat está fechado para novas mensagens." |
| pedido `CONCLUDED` | "Esta adoção foi concluída: o chat está fechado para novas mensagens." |
| pedido `CANCELLED` | "Este pedido foi cancelado: o chat está fechado para novas mensagens." |

No `PUT /read`, `lastMessageId` ausente ou negativo → 400 "Informe a última mensagem lida.".

### 3.1 Como o front vai usar (polling)

- **Conversa aberta:** `GET /chats/{id}/messages` uma vez (histórico) e depois `GET /chats/{id}/messages?after={último id}` **a cada 3 s**, só enquanto a aba estiver visível. Cada resposta não vazia é anexada ao fim da lista, e o front chama o `PUT /read` com o último id.
- **Envio:** o `POST` devolve a mensagem criada, que entra na lista na hora, sem esperar o próximo polling.
- **Badge e lista de conversas:** `GET /chats/summary` **a cada 20 s** e ao abrir a tela de conversas.
- **Trocas de status:** depois de um `PATCH /adoption-requests/{id}/status` que deu certo, o front recarrega as mensagens da conversa. A mensagem de sistema já estará lá, criada pelo backend.

## 4. Notas de implementação (Spring Boot)

1. **Pacote** `chat/`, no mesmo formato de `adoption/`:
   - `ChatController` (`@RequestMapping("/api/chats")`), `ChatService`, `ChatMessageRepository`, `ChatReadRepository`;
   - entidades `ChatMessage` e `ChatRead` (com a PK composta `ChatReadId`, como `EventAttendanceId`);
   - enums `MessageType` (`USER`, `SYSTEM`) e `SystemEvent`;
   - DTOs `ChatMessageDTO`, `SendMessageDTO`, `MarkReadDTO`, `ChatSummaryDTO`, `ConversationSummaryDTO`.
2. **Segurança**: o chat é só de pessoa e ONG.
   ```java
   .requestMatchers("/api/chats/**").hasAnyRole("PERSON", "NGO")
   ```
   `/api/chats/summary` não colide com `/api/chats/{requestId}/messages`, porque as duas têm profundidades diferentes.
3. **Mensagens de sistema**: no `AdoptionRequestService.changeStatus(...)`, depois de aplicar a transição, chame `chatService.addSystemMessage(request, SystemEvent.X)`. Tudo fica na mesma `@Transactional`: se a mensagem falhar, a troca de status volta junto.
   - `AWAITING_DELIVERY` → `DELIVERY_REQUESTED`;
   - `CONCLUDED` → `ADOPTION_CONCLUDED` (dentro do `conclude(...)`);
   - `CANCELLED` pelo adotante → `ADOPTER_WITHDREW`, **só se** o status de partida era `ACCEPTED` ou `AWAITING_DELIVERY`;
   - `CANCELLED` pelo dono → `OWNER_WITHDREW`;
   - os cancelamentos em lote (`ANIMAL_ADOPTED` no `conclude`, `ANIMAL_UNAVAILABLE` no `onAnimalLeftListing`, e os da moderação) **não** chamam o chat.
4. **Quem é parte**: `request.getAdopter().getId()` ou `request.getAnimal().getOwner().getId()`, os mesmos campos que o `AdoptionRequestService.get(...)` já usa para liberar o pedido às duas partes.
5. **Texto**: aplicar `trim()` e validar o tamanho no service (para devolver a frase exata da tabela acima). Não precisa escapar HTML: o React mostra o texto como texto.
6. **Marcar como lida**: um upsert que nunca volta para trás.
   ```sql
   INSERT INTO chat_reads (request_id, user_id, last_read_message_id, read_at)
   VALUES (:requestId, :userId, :lastMessageId, now())
   ON CONFLICT (request_id, user_id) DO UPDATE
       SET last_read_message_id = GREATEST(chat_reads.last_read_message_id, EXCLUDED.last_read_message_id),
           read_at = now();
   ```
   Com JPA dá para fazer igual: buscar o `ChatRead` e só trocar se o novo id for maior.
7. **Resumo** em uma consulta, depois buscando as últimas mensagens pelos ids:
   ```sql
   SELECT r.id AS request_id,
          COUNT(m.id) FILTER (WHERE m.id > COALESCE(cr.last_read_message_id, 0)
                               AND (m.sender_id IS NULL OR m.sender_id <> :me)) AS unread_count,
          MAX(m.id) AS last_message_id
   FROM adoption_requests r
   JOIN animals a           ON a.id = r.animal_id
   LEFT JOIN chat_reads cr  ON cr.request_id = r.id AND cr.user_id = :me
   LEFT JOIN chat_messages m ON m.request_id = r.id
   WHERE (r.adopter_id = :me OR a.owner_id = :me)
     AND (r.status IN ('ACCEPTED', 'AWAITING_DELIVERY', 'CONCLUDED')
          OR (r.status = 'CANCELLED' AND r.cancelled_from_status IN ('ACCEPTED', 'AWAITING_DELIVERY')))
   GROUP BY r.id;
   ```
8. **Custo do polling**: cada `GET ...?after=` é uma busca pelo índice `(request_id, id)`. Com poucos usuários, 3 s não pesa. Se pesar, basta aumentar o intervalo no front, sem mudar o contrato.
9. **Dados antigos**: as mensagens que estão hoje no `localStorage` são de teste e **não** são migradas.

## 5. SQL (rascunho de migração, PostgreSQL)

Número: **`011_chat.sql`** (renumerada em 15/10; ver `entrega-final/README.md` §3).

**Atualizado em 15/10/2026:** dois eventos de sistema novos, criados no registro de retorno e de repasse (`entrega-final/api-devolucao-reabandono.md` §1.6). Eles entram na CHECK de `system_event` e no enum `SystemEvent`:

| `systemEvent` | Quando o backend cria | Texto que o front mostra |
|---|---|---|
| `ANIMAL_RETURNED` | dono registra o retorno (`CONCLUDED → RETURNED`) | "{animal} voltou para quem doou." |
| `ANIMAL_REHOMED` | adotante republica (`CONCLUDED → REHOMED`) | "{adotante} anunciou {animal} para uma nova adoção." |

```sql
-- ============================================================
-- Migração 011 — chat dos pedidos de adoção
--
-- Cria chat_messages (mensagens de pessoa e avisos de sistema de
-- cada pedido) e chat_reads (até onde cada parte já leu). Até aqui
-- o chat existia só no navegador (localStorage do frontend).
--
--   psql -U postgres -h localhost -d aucolher_db -f sql/migrations/011_chat.sql
--
-- Roda numa transação só: se algo falhar, nada muda. Rodar de novo
-- não estraga nada (IF NOT EXISTS).
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- chat_messages — a conversa de um pedido de adoção. Não existe
-- tabela de conversa: o pedido (adoption_requests) é a conversa.
-- USER: mensagem de uma das partes (sender_id + text).
-- SYSTEM: aviso criado pela API na troca de status (system_event);
-- o frontend monta o texto.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
    id            BIGSERIAL      PRIMARY KEY,
    request_id    BIGINT         NOT NULL REFERENCES adoption_requests (id) ON DELETE CASCADE,
    sender_id     BIGINT         REFERENCES users (id) ON DELETE CASCADE,
    type          VARCHAR(10)    NOT NULL DEFAULT 'USER',
    text          VARCHAR(1000),
    system_event  VARCHAR(30),
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_chat_messages_type         CHECK (type IN ('USER', 'SYSTEM')),
    CONSTRAINT chk_chat_messages_system_event CHECK (system_event IN ('DELIVERY_REQUESTED', 'ADOPTION_CONCLUDED',
                                                                      'ADOPTER_WITHDREW', 'OWNER_WITHDREW',
                                                                      'ANIMAL_RETURNED', 'ANIMAL_REHOMED')),
    CONSTRAINT chk_chat_messages_text         CHECK (text IS NULL OR char_length(btrim(text)) > 0),
    CONSTRAINT chk_chat_messages_shape        CHECK (
        (type = 'USER'   AND sender_id IS NOT NULL AND text IS NOT NULL AND system_event IS NULL)
     OR (type = 'SYSTEM' AND sender_id IS NULL     AND text IS NULL     AND system_event IS NOT NULL)
    )
);

-- Histórico e polling ("mensagens depois do id X") de uma conversa
CREATE INDEX IF NOT EXISTS idx_chat_messages_request ON chat_messages (request_id, id);

COMMENT ON TABLE  chat_messages              IS 'Mensagens do chat de cada pedido de adoção (o pedido é a conversa)';
COMMENT ON COLUMN chat_messages.sender_id    IS 'Quem escreveu (adotante ou dono) — nulo nas mensagens de sistema';
COMMENT ON COLUMN chat_messages.type         IS 'USER (escrita por uma das partes) ou SYSTEM (aviso criado pela API na troca de status)';
COMMENT ON COLUMN chat_messages.text         IS 'Texto da mensagem USER, de 1 a 1000 caracteres — nulo em SYSTEM';
COMMENT ON COLUMN chat_messages.system_event IS 'Só em SYSTEM: DELIVERY_REQUESTED, ADOPTION_CONCLUDED, ADOPTER_WITHDREW ou OWNER_WITHDREW';

-- ------------------------------------------------------------
-- chat_reads — até qual mensagem cada parte já leu, por conversa.
-- Não lidas = mensagens com id maior, que não são da própria conta.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_reads (
    request_id            BIGINT     NOT NULL REFERENCES adoption_requests (id) ON DELETE CASCADE,
    user_id               BIGINT     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    last_read_message_id  BIGINT     NOT NULL CHECK (last_read_message_id >= 0),
    read_at               TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (request_id, user_id)
);

COMMENT ON TABLE  chat_reads                      IS 'Marca de leitura de cada parte em cada conversa — alimenta o contador de não lidas';
COMMENT ON COLUMN chat_reads.last_read_message_id IS 'Última mensagem vista; só aumenta (GREATEST no upsert)';

COMMIT;
```

`last_read_message_id` não é chave estrangeira de propósito. Ele é só um marcador ("li até aqui") e funciona mesmo se o front mandar um id maior que o da última mensagem.

## 6. O que muda no front quando a API existir (lembrete)

- `features/chat/services/chatService.js`, hoje vazio, vira o adaptador destas rotas. O ideal é o trio mock/api/fachada com uma flag `VITE_USE_MOCK_CHAT`, como em eventos.
- `useChatMessages`: troca o `localStorage` por react-query com o polling da §3.1. A mensagem da API é convertida para o modelo atual da tela: `senderId: 'system'` quando `type = SYSTEM`, o texto montado a partir do `systemEvent` e `timestamp` = `createdAt`.
- `useChatUnread` e `chatReadState`: passam a usar `GET /chats/summary` e `PUT /chats/{id}/read`.
- `useConcludeAdoption`: deixa de chamar `injectSystemMessage` (quem cria agora é o backend), e `core/utils/chatSystemMessage.js` sai.
- O campo de texto do `ChatConversationPanel` ganha `maxLength={1000}`.
- `storageKeys.js`: saem `chatMessagesStorageKey` e `chatLastSeenStorageKey`.
