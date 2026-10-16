# AUcolher — Contrato da API: denúncias e moderação

> ✅ **Implementado** (migração 014). O frontend usa estas rotas com `VITE_USE_MOCK_DENUNCIAS=false` e `VITE_USE_MOCK_ADMIN=false`:
> - denúncias do site: `features/denuncias/services/denunciasApi.js`;
> - rotas do admin: `features/admin/services/adminApi.js`. As estatísticas e as listas do admin estão no `api-admin.md`.
>
> Diferenças da implementação: o login recusa a conta suspensa só depois de conferir a senha. Corpo sem alvo responde 400 "Informe o que está sendo denunciado."; o dono que tenta `PATCH /status` com `REMOVED` recebe 400 "Só a moderação remove um anúncio". No front, o `api.js` reconhece o 403 da conta suspensa (`auth:suspended`) e desloga com o aviso.
>
> **Falta só a parte de campanhas** (remover campanha, `campaigns.removed_by_moderation`, esconder as campanhas da ONG banida). Ela entra com a migração 007: `../entrega-final/api-campanhas-doacoes.md` §7 e §8.

## 1. Denúncias

### 1.1 Regras

- **Quem denuncia**: qualquer conta logada de pessoa ou ONG. Sem token, 401. O admin não denuncia (403): ele modera direto pelo painel.
- **O que pode ser denunciado** (`targetType`):
  - `ANIMAL`: um anúncio de animal (`targetId` = id do animal);
  - `USER`: o perfil de uma pessoa ou ONG (`targetId` = id da conta).
  - Campanhas, eventos e avaliações ficam de fora (as avaliações continuam como estão).
- **Ninguém denuncia o próprio conteúdo** (400): o dono do animal, ou a própria conta.
- **Uma denúncia em análise por pessoa e alvo**: se já existe uma `PENDING` da mesma conta para o mesmo alvo, a resposta é 409. Depois de julgada, a pessoa pode denunciar de novo.
- **Motivo** (`reason`), conforme o alvo:

| `reason` | Rótulo | `ANIMAL` | `USER` |
|---|---|---|---|
| `FAKE_PROFILE` | Perfil falso | — | sim |
| `SCAM` | Golpe ou fraude | sim | sim |
| `ANIMAL_ABUSE` | Maus-tratos | sim | sim |
| `IMPROPER_CONTENT` | Conteúdo impróprio | sim | sim |
| `SPAM` | Spam | sim | sim |
| `OTHER` | Outro motivo | sim | sim |

- **Descrição** (`description`): texto livre de até 500 caracteres, obrigatório em `OTHER`. Vazio vira `null`.
- **Cópia do alvo** (`target`): o backend guarda nome, foto e dono do alvo no momento da denúncia. Assim o admin ainda vê o que foi denunciado depois de o anúncio sair do ar.
- **Situação** (`status`): `PENDING` (em análise) → `RESOLVED`. A decisão fica em `resolution`:
  - `LISTING_REMOVED`: o admin removeu o anúncio;
  - `ACCOUNT_BANNED`: o admin baniu a conta (denunciada ou dona do anúncio);
  - `DISMISSED`: arquivada como improcedente.
- Ninguém é avisado do resultado: a central de notificações foi removida (regras §11).

### 1.2 Endpoints

| Método | Rota | Quem | Resposta |
|---|---|---|---|
| POST | `/api/reports` | pessoa ou ONG | 201 + `ReportDTO` |
| GET | `/api/reports/mine` | logado | `ReportDTO[]` da própria conta, mais recentes primeiro |

Corpo do POST:

```json
{ "targetType": "ANIMAL", "targetId": 8, "reason": "SCAM", "description": "Pediu PIX antes da visita." }
```

Erros (todos no `ErrorResponseDTO`, com a mensagem em `message`):

| Status | Quando | `message` |
|---|---|---|
| 400 | motivo ausente ou que não vale para o alvo | "Escolha o motivo da denúncia." |
| 400 | `OTHER` sem descrição | "Conte o que aconteceu: a descrição é obrigatória em \"Outro motivo\"." |
| 400 | descrição com mais de 500 caracteres | "A descrição pode ter no máximo 500 caracteres." |
| 400 | próprio anúncio / próprio perfil | "Você não pode denunciar o seu próprio anúncio." / "Você não pode denunciar o seu próprio perfil." |
| 403 | conta admin | "Contas de admin não fazem denúncias: a moderação é feita pelo painel." |
| 404 | alvo inexistente | "Anúncio não encontrado." / "Perfil não encontrado." |
| 409 | já existe uma em análise | "Você já denunciou este anúncio. A denúncia está em análise." / "Você já denunciou este perfil. A denúncia está em análise." |

### 1.3 `ReportDTO`

```json
{
  "id": 12,
  "targetType": "ANIMAL",
  "targetId": 8,
  "target": {
    "name": "Nino",
    "photoUrl": "https://...",
    "userType": null,
    "city": null,
    "state": null,
    "species": "DOG",
    "ownerId": 2,
    "ownerName": "Apacri",
    "ownerUserType": "NGO"
  },
  "reason": "SCAM",
  "description": "Pediu PIX antes da visita.",
  "status": "PENDING",
  "resolution": null,
  "createdAt": "2026-10-11T15:20:00",
  "resolvedAt": null
}
```

- `target` muda conforme o alvo:
  - `ANIMAL`: `name`, `photoUrl`, `species`, `ownerId`, `ownerName` e `ownerUserType` (`PERSON` ou `NGO`); o resto vem `null`;
  - `USER`: `name`, `photoUrl`, `userType`, `city` e `state`; o resto vem `null`.
- Para o admin, o DTO ganha `reporter` (§1.4).
- Datas em `LocalDateTime` sem fuso, como no resto da API.

### 1.4 Rotas do admin

| Método | Rota | Resposta |
|---|---|---|
| GET | `/api/admin/reports` | `AdminReportDTO[]`, todas as situações, mais recentes primeiro |
| POST | `/api/admin/reports/{id}/dismiss` | `AdminReportDTO[]` arquivadas (`resolution: DISMISSED`) |
| POST | `/api/admin/reports/{id}/ban` | `AdminReportDTO[]` resolvidas como `ACCOUNT_BANNED` (ver §2) |

- `AdminReportDTO` = `ReportDTO` + `reporter`:

```json
"reporter": { "id": 2, "name": "Pessoa Teste", "photoUrl": null, "userType": "PERSON" }
```

- **Casos**: o admin julga o alvo, não cada denúncia. Arquivar, banir ou remover resolve a denúncia do `{id}` **e todas as outras `PENDING` do mesmo alvo**, com o mesmo `resolvedAt`. A tela agrupa as pendentes por alvo e as julgadas por decisão (alvo + `resolution` + `resolvedAt`).
- Erros do dismiss: 404 "Denúncia não encontrada."; 400 "Esta denúncia já foi julgada." (já está `RESOLVED`).
- A remoção de anúncio usa o `DELETE /api/admin/animals/{id}` (§3), não uma rota de denúncia.

### 1.5 Notas do modo mock

- O mock não tem banco para montar a cópia do alvo: a fachada (`denunciaService.createReport`) manda a cópia como segundo argumento, e só o `denunciasMock` a usa.
- O seed traz denúncias contra os perfis fictícios 5, 6 e 7 (e uma já arquivada contra o 1), feitas por contas geradas do seed do admin (ids a partir de 101).
- Os ids 1 a 7 dos perfis fictícios se repetem com os do banco real. Para o perfil, o alvo é identificado por id **e nome** (`reportTargetKey`), como no resto do mock do admin.

## 2. Moderação: banir e reativar contas

### 2.1 Endpoints

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| PATCH | `/api/admin/users/{id}/status` | `{ "active": false }` (banir) ou `{ "active": true }` (reativar) | `AdminUserDTO` atualizado (`api-admin.md` §3.2) |
| POST | `/api/admin/reports/{id}/ban` | — | `AdminReportDTO[]` resolvidas como `ACCOUNT_BANNED` |

- O `/reports/{id}/ban` bane a conta por trás do caso: a do perfil denunciado (`USER`) ou a dona do anúncio denunciado (`ANIMAL`).
- Erros:
  - 404 "Conta não encontrada." / "Denúncia não encontrada.";
  - 400 "Informe se a conta fica ativa." (corpo sem `active` booleano);
  - 400 "Esta denúncia já foi julgada.";
  - 400 "Não foi possível identificar a conta denunciada." (anúncio sem dono);
  - 400 "Contas de admin não podem ser banidas.".

### 2.2 Regras do banimento (o backend aplica tudo numa transação)

- **Conta**: `users.active = false`. O login já recusa conta inativa; a mensagem passa a ser **"Esta conta foi suspensa pela moderação do AUcolher."** (hoje é "Usuário inativo"), com 403.
- **Sessão aberta**: um token emitido antes do banimento também deixa de valer. Qualquer requisição autenticada responde 403 com a mesma mensagem, e o front desloga (ver §4, item 4).
- **Denúncias**: todas as `PENDING` contra o perfil da conta ou contra anúncios dela viram `RESOLVED`, com `resolution: ACCOUNT_BANNED`.
- **Pedidos de adoção**: os ativos (`PENDING`, `ACCEPTED`, `AWAITING_DELIVERY`) em que a conta é dona ou adotante viram `CANCELLED`, com `cancelReason: "ACCOUNT_BANNED"` e `cancelledFromStatus` preenchido. A outra parte vê "Cancelado — conta suspensa", e a conversa fica travada com o aviso.
- **O que some das rotas públicas** (a conta continua no banco):
  - animais da conta: vitrine (`GET /api/animals`), `GET /api/users/{id}/animals`, favoritos e deck do AUmatch; `GET /api/animals/{id}` responde 404 para todos, menos para o admin;
  - campanhas e eventos da ONG: listas, detalhe (404), doação e presença;
  - o perfil público da conta (404). Isso já acontece hoje: o `UserService` esconde contas inativas.
  - As avaliações escritas pela conta banida **continuam aparecendo**.
- **O que o admin continua vendo**: tudo, nas rotas `/api/admin/*`, com a situação da conta:
  - `/admin/users`: `active: false`;
  - `/admin/animals`: `owner.active: false`;
  - `/admin/campaigns` e `/admin/events`: `ngo.active: false`.
- **Reativar** (`active: true`): a conta volta a entrar e o conteúdo dela volta às rotas públicas. Pedidos cancelados e denúncias resolvidas **não** voltam.

### 2.3 Notas do modo mock

- As decisões ficam em `features/admin/services/moderationMock.js` (chave `aucolher_mock_moderacao`, tabela `bannedAccounts`). Com `VITE_USE_MOCK_ADMIN=false`, o módulo responde "ninguém foi banido" e quem filtra é a API.
- **Uma conta é id + nome** (`matchesAccount`), porque os ids 1 a 7 dos perfis fictícios se repetem com os do banco real. Banir a "Abrigo Amigo Fiel" (mock 4) não atinge a ONG real de id 4.
- **Quem aplica os efeitos no front**:
  - login recusado: `core/services/authService.js#loginRequest`;
  - sessão aberta: o `AuthContext` derruba a conta banida e o login mostra o aviso. As abas do mesmo navegador dividem a sessão: se outra conta já entrou por cima, só a aba antiga sai;
  - animais (API real): a fachada `animalService` esconde os da conta banida (vitrine, perfil, favoritos) e marca o detalhe com `moderation: 'OWNER_BANNED'`. A contagem "N animais encontrados" desconta os escondidos da página, o que é exato quando a busca cabe numa página;
  - campanhas e eventos: o próprio `doacoesMock` / `eventosMock` (404 e listas filtradas);
  - AUmatch: a fachada `aumatchService` tira do deck os animais de dono banido;
  - pedidos: o servidor não muda (a moderação ainda é mock). A camada de moderação do `AdoptionRequestProvider` mostra os pedidos ativos da conta banida como cancelados (`ACCOUNT_BANNED`) e trava as ações.
- **Contas na lista do admin**: além das que já entravam, entram também as que aparecem como adotante nos pedidos. Quem só adota também precisa poder ser moderado.

## 3. Moderação: remover conteúdo

### 3.1 Endpoints

| Método | Rota | Resposta |
|---|---|---|
| DELETE | `/api/admin/animals/{id}` | 204 |
| DELETE | `/api/admin/campaigns/{id}` | 204 |
| DELETE | `/api/admin/events/{id}` | 204 |

- A tela de Denúncias usa o mesmo `DELETE /api/admin/animals/{id}` para "Remover anúncio": o id do animal é o `targetId` do caso. Não existe rota de remoção por denúncia, porque o id do animal é único.
- Erros:
  - 404 "Anúncio não encontrado." / "Campanha não encontrada." / "Evento não encontrado." (inexistente, já removido ou, no evento, já cancelado);
  - 400 "Este anúncio já foi removido.";
  - 400 "Este animal já foi adotado: o anúncio fica só como histórico."

### 3.2 Regras

- **Anúncio de animal**
  - Ganha um status próprio, **`REMOVED`**. O dono não consegue trocá-lo: `PUT /api/animals/{id}`, `PATCH /api/animals/{id}/status` e `DELETE /api/animals/{id}` respondem 403 "Este anúncio foi removido pela moderação e não pode mais ser alterado."
  - O `PATCH /status` do dono também não aceita `REMOVED` como valor (400): só a moderação remove.
  - Sai de todas as rotas públicas (vitrine, perfil, favoritos, deck; o detalhe responde 404 para todos, menos para o admin).
  - O dono continua vendo o anúncio em `GET /api/animals/mine`, com `status: "REMOVED"`. A tela mostra "Removido pela moderação", sem ações.
  - As denúncias `PENDING` contra o anúncio viram `RESOLVED`, com `resolution: LISTING_REMOVED`.
  - Os pedidos de adoção ativos do animal viram `CANCELLED`, com `cancelReason: "LISTING_REMOVED"`. As partes veem "Cancelado — anúncio removido", e uma conversa já aberta fica travada com o aviso.
  - Não há "desfazer".
- **Campanha**
  - Vira exclusão lógica (`deleted = true`), com `removed_by_moderation = true`. A linha fica sempre, mesmo sem doações, para o admin ver o que removeu.
  - Os PIX ainda não pagos são cancelados. As doações aprovadas continuam no total arrecadado e no histórico de quem doou ("campanha removida pela moderação").
  - Some também do painel da ONG, como uma campanha que ela mesma excluiu.
- **Evento**
  - Vira `CANCELLED`, com `removed_by_moderation = true`, mesmo sem confirmados (a linha fica). Quem confirmou presença vê "Evento cancelado" em Minha conta.
  - Some também do painel da ONG.
- **O que o admin vê**:
  - `/admin/animals`: `status: "REMOVED"`;
  - `/admin/campaigns` e `/admin/events`: `removedByModeration: true`.
  - A tela mostra "Removido(a) pela moderação", separado do que a própria ONG excluiu ou cancelou.
- **`stats`** (`api-admin.md` §3.1): `animals.removed` conta os anúncios removidos, que não entram em `available`, `inProgress` nem `bySpecies`.

### 3.3 Notas do modo mock

- Os anúncios removidos ficam na tabela `removedAnimals` do `moderationMock` (mesma chave `aucolher_mock_moderacao`), por id, porque os ids dos animais da API são únicos.
  - Essa tabela entrou depois da `bannedAccounts`. Um navegador que já tinha a chave sem ela recomeça o "banco" de moderação uma vez, como o `createMockStore` faz com qualquer tabela que falta, e os banimentos de teste feitos antes somem.
- **Quem aplica os efeitos no front**:
  - a fachada `animalService`: esconde o anúncio, marca o detalhe com `moderation: 'REMOVED'`, devolve `status: 'REMOVED'` em "meus animais" e recusa editar ou mudar o status;
  - o `doacoesMock` e o `eventosMock`: `removeCampaignForAdmin` e `removeEventForAdmin`;
  - a camada de moderação do `AdoptionRequestProvider`, que mostra os pedidos ativos do animal como cancelados (`LISTING_REMOVED`) só na tela.

## 4. Notas de implementação (Spring Boot)

1. **Pacotes**:
   - `report/`: `ReportController` (`/api/reports`), `ReportService`, `ReportRepository`, a entidade `Report` e os enums `ReportTargetType`, `ReportReason`, `ReportStatus`, `ReportResolution`.
   - `admin/`: `AdminController` (`/api/admin`), com as rotas de denúncia, banimento e remoção ao lado das estatísticas do `api-admin.md`.
   - Um `ModerationService` concentra as ações que mexem em vários módulos (banir, reativar, remover), cada uma numa `@Transactional`.
2. **Segurança**: `/api/admin/**` já está restrito a `ROLE_ADMIN`. Falta liberar as denúncias:
   ```java
   .requestMatchers(HttpMethod.POST, "/api/reports").hasAnyRole("PERSON", "NGO")
   .requestMatchers(HttpMethod.GET, "/api/reports/mine").authenticated()
   ```
   O 403 do admin no `POST` precisa da frase da §1.2. Se a regra de papel do Spring responder antes, com uma mensagem genérica, deixe o `POST` como `authenticated()` e cheque o papel no service.
3. **Enums novos**:
   - `AnimalStatus.REMOVED`;
   - `CancelReason.ACCOUNT_BANNED` e `CancelReason.LISTING_REMOVED`;
   - uma `ConflictException` (409) no `shared/exception`, tratada no `GlobalExceptionHandler`. Hoje só existem 400, 403 e 404.
4. **Conta banida com token válido**: hoje o `JwtAuthenticationFilter` carrega o `UserDetails` (que já vem `disabled` quando `active = false`), mas **não confere** `isEnabled()`. Por isso, uma conta banida continua usando a API até o token vencer (24 h).
   - Correção: se `!userDetails.isEnabled()`, responder direto 403 com `{ "status": 403, "error": "Forbidden", "message": "Esta conta foi suspensa pela moderação do AUcolher." }` e não seguir a cadeia.
   - O front reconhece essa mensagem e desloga.
   - No login (`AuthService`, hoje `"Usuário inativo"`): a mesma frase, com 403.
5. **Cópia do alvo** (`target`): é montada no `POST /api/reports`, lendo o banco.
   - `ANIMAL`: nome do animal, foto de `sort_order` 0, espécie, id, nome e `userType` do dono;
   - `USER`: nome, `photoUrl`, `userType`, cidade e UF da conta.
   - A foto pode ser um data URL: copie como está (a coluna é `TEXT`).
6. **409 sem corrida**: antes de inserir, procure uma `PENDING` da mesma conta para o mesmo alvo. O índice único parcial da §5 garante a regra mesmo com dois cliques simultâneos: trate o `DataIntegrityViolationException` desse índice como o mesmo 409.
7. **Resolver um caso** (dismiss, ban, remover anúncio): um único `now` para todas as linhas.
   ```sql
   UPDATE reports
      SET status = 'RESOLVED', resolution = :resolution, resolved_by = :adminId, resolved_at = :now
    WHERE target_type = :targetType AND target_id = :targetId AND status = 'PENDING'
   RETURNING *;
   ```
   No banimento, resolva também as denúncias de `ANIMAL` cujo `target_owner_id` é a conta banida.
8. **Banir** (`ModerationService.ban(userId, adminId)`), numa transação:
   1. recusar se a conta é `ADMIN` (400);
   2. `users.active = false`;
   3. resolver as denúncias (item 7);
   4. cancelar os pedidos ativos em que a conta é adotante **ou** dona do animal: `status = 'CANCELLED'`, `cancel_reason = 'ACCOUNT_BANNED'`, `cancelled_from_status` = o status anterior, `closed_at = now`. Não gera mensagem de sistema no chat (`../entrega-final/api-chat.md` §1).
   - Os animais, eventos e campanhas da conta **não** são alterados: somem pelo filtro do item 10 e voltam sozinhos se a conta for reativada.
9. **Remover anúncio**: `status = 'REMOVED'`, resolver as denúncias com `LISTING_REMOVED` e cancelar os pedidos ativos com `LISTING_REMOVED`.
   - O `AnimalLeftListingEvent` já cancela os pedidos quando o dono tira o animal do ar (`ANIMAL_UNAVAILABLE`). Dá para reaproveitá-lo, acrescentando o motivo no evento: `new AnimalLeftListingEvent(animalId, CancelReason.LISTING_REMOVED)`.
10. **Filtro de conta ativa nas leituras públicas**: acrescentar `owner.active = true` (ou `ngo.active = true`) em:
    - `AnimalSpecifications` (vitrine), `GET /api/users/{id}/animals` e o detalhe `GET /api/animals/{id}` (404, menos para o admin);
    - `FavoriteService` (lista e ids). A lista já esconde `INACTIVE` e passa a esconder `REMOVED` também;
    - `MatchService` (deck do AUmatch);
    - `EventService` (lista, detalhe, presença) e o módulo de campanhas;
    - `POST /api/adoption-requests` num animal de dono banido: responde o mesmo 404 do animal escondido.
11. **Remover campanha/evento**: as regras da §3.2. Evento já `CANCELLED` ou campanha já excluída → 404.

## 5. SQL (rascunho de migração, PostgreSQL)

Número: **`014_reports_moderation.sql`** (aplicada).
- A CHECK de `cancel_reason` (bloco 3) já aceita `ACCOUNT_DELETED`, da exclusão de conta (013). A 013 não precisa recriá-la.
- A CHECK de `status` de `adoption_requests` já tem `RETURNED` e `REHOMED`, da migração 012, e não foi recriada aqui.
- O banimento usa o `AdoptionRequestService.cancelAllForAccount(userId, reason)`, que a exclusão de conta também vai usar.
- **O bloco 4 foi aplicado só em `events`.** A coluna `campaigns.removed_by_moderation` nasce direto no `CREATE TABLE campaigns` da 007 (`../entrega-final/api-campanhas-doacoes.md` §8).

```sql
-- ============================================================
-- Migração 014 — denúncias e moderação
--
-- 1. reports: as denúncias de anúncios e perfis, com a cópia do
--    alvo e a decisão do admin.
-- 2. animals.status passa a aceitar REMOVED (removido pela moderação).
-- 3. adoption_requests.cancel_reason passa a aceitar ACCOUNT_BANNED e
--    LISTING_REMOVED.
-- 4. events/campaigns ganham removed_by_moderation.
-- O banimento não precisa de coluna nova: usa users.active.
--
--   psql -U postgres -h localhost -d aucolher_db -f sql/migrations/014_reports_moderation.sql
--
-- Roda numa transação só: se algo falhar, nada muda. Rodar de novo
-- não estraga nada.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. reports — denúncias feitas no site. O alvo é polimórfico
-- (target_type + target_id, sem chave estrangeira): pode ser um
-- animal ou uma conta. As colunas target_* guardam a cópia do alvo
-- no momento da denúncia, para o admin ver o que foi denunciado
-- mesmo depois de o anúncio sair do ar.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id                      BIGSERIAL     PRIMARY KEY,
    reporter_id             BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    target_type             VARCHAR(10)   NOT NULL,
    target_id               BIGINT        NOT NULL,

    -- Cópia do alvo
    target_name             VARCHAR(150)  NOT NULL,
    target_photo_url        TEXT,
    target_user_type        VARCHAR(10),
    target_city             VARCHAR(100),
    target_state            VARCHAR(2),
    target_species          VARCHAR(20),
    target_owner_id         BIGINT,
    target_owner_name       VARCHAR(150),
    target_owner_user_type  VARCHAR(10),

    -- Denúncia
    reason                  VARCHAR(20)   NOT NULL,
    description             VARCHAR(500),

    -- Julgamento
    status                  VARCHAR(10)   NOT NULL DEFAULT 'PENDING',
    resolution              VARCHAR(20),
    resolved_by             BIGINT        REFERENCES users (id),
    created_at              TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at             TIMESTAMP,

    CONSTRAINT chk_reports_target_type      CHECK (target_type IN ('ANIMAL', 'USER')),
    CONSTRAINT chk_reports_user_types       CHECK (target_user_type IN ('PERSON', 'NGO')
                                                AND target_owner_user_type IN ('PERSON', 'NGO')),
    CONSTRAINT chk_reports_reason           CHECK (reason IN ('FAKE_PROFILE', 'SCAM', 'ANIMAL_ABUSE',
                                                              'IMPROPER_CONTENT', 'SPAM', 'OTHER')),
    CONSTRAINT chk_reports_fake_profile     CHECK (reason <> 'FAKE_PROFILE' OR target_type = 'USER'),
    CONSTRAINT chk_reports_other            CHECK (reason <> 'OTHER' OR description IS NOT NULL),
    CONSTRAINT chk_reports_status           CHECK (status IN ('PENDING', 'RESOLVED')),
    CONSTRAINT chk_reports_resolution       CHECK (resolution IN ('LISTING_REMOVED', 'ACCOUNT_BANNED', 'DISMISSED')),
    CONSTRAINT chk_reports_resolved         CHECK ((status = 'RESOLVED') = (resolution IS NOT NULL)
                                               AND (status = 'RESOLVED') = (resolved_at IS NOT NULL)),
    CONSTRAINT chk_reports_listing_removed  CHECK (resolution <> 'LISTING_REMOVED' OR target_type = 'ANIMAL')
);

-- Uma denúncia em análise por pessoa e alvo (o 409); julgada, libera outra
CREATE UNIQUE INDEX IF NOT EXISTS uq_reports_pending  ON reports (reporter_id, target_type, target_id)
    WHERE status = 'PENDING';
-- Resolver o caso inteiro (todas as pendentes do mesmo alvo)
CREATE INDEX IF NOT EXISTS idx_reports_pending_target ON reports (target_type, target_id)
    WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_reports_created        ON reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reporter       ON reports (reporter_id, created_at DESC);

COMMENT ON TABLE  reports                  IS 'Denúncias de anúncios (ANIMAL) e perfis (USER), julgadas pelo admin';
COMMENT ON COLUMN reports.target_id        IS 'Id do animal (ANIMAL) ou da conta (USER) — sem FK, porque o alvo é polimórfico';
COMMENT ON COLUMN reports.target_name      IS 'Cópia do nome do alvo no momento da denúncia (as outras colunas target_* também são cópias)';
COMMENT ON COLUMN reports.target_owner_id  IS 'Só em ANIMAL: o dono do anúncio — usado para resolver as denúncias quando ele é banido';
COMMENT ON COLUMN reports.description      IS 'Até 500 caracteres; obrigatória quando reason = OTHER';
COMMENT ON COLUMN reports.status           IS 'PENDING (em análise) ou RESOLVED (julgada)';
COMMENT ON COLUMN reports.resolution       IS 'Só em RESOLVED: LISTING_REMOVED, ACCOUNT_BANNED ou DISMISSED';
COMMENT ON COLUMN reports.resolved_by      IS 'O admin que julgou o caso';

-- ------------------------------------------------------------
-- 2. animals — anúncio removido pela moderação (o dono não reativa)
-- ------------------------------------------------------------
ALTER TABLE animals DROP CONSTRAINT IF EXISTS chk_animals_status;
ALTER TABLE animals ADD CONSTRAINT chk_animals_status
    CHECK (status IN ('AVAILABLE', 'ADOPTED', 'INACTIVE', 'REMOVED'));

COMMENT ON COLUMN animals.status IS 'AVAILABLE, ADOPTED, INACTIVE (retirado do ar pelo dono — exclusão lógica) ou REMOVED (removido pela moderação)';

-- ------------------------------------------------------------
-- 3. adoption_requests — cancelamentos da moderação
-- ------------------------------------------------------------
ALTER TABLE adoption_requests DROP CONSTRAINT IF EXISTS chk_adoption_requests_cancel_reason;
ALTER TABLE adoption_requests ADD CONSTRAINT chk_adoption_requests_cancel_reason
    CHECK (cancel_reason IN ('ADOPTER_WITHDREW', 'OWNER_WITHDREW', 'ANIMAL_ADOPTED',
                             'ANIMAL_UNAVAILABLE', 'ACCOUNT_DELETED', 'ACCOUNT_BANNED', 'LISTING_REMOVED'));

COMMENT ON COLUMN adoption_requests.cancel_reason IS 'Só em CANCELLED: ADOPTER_WITHDREW, OWNER_WITHDREW, ANIMAL_ADOPTED, ANIMAL_UNAVAILABLE, ACCOUNT_BANNED (uma das partes foi banida) ou LISTING_REMOVED (anúncio removido pela moderação)';

-- ------------------------------------------------------------
-- 4. events e campaigns — o que foi removido pela moderação fica
-- separado do que a própria ONG cancelou ou excluiu
-- ------------------------------------------------------------
ALTER TABLE events ADD COLUMN IF NOT EXISTS removed_by_moderation BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE events DROP CONSTRAINT IF EXISTS chk_events_removed_by_moderation;
ALTER TABLE events ADD CONSTRAINT chk_events_removed_by_moderation
    CHECK (NOT removed_by_moderation OR status = 'CANCELLED');

COMMENT ON COLUMN events.removed_by_moderation IS 'Cancelado pelo admin (sempre com status CANCELLED)';

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS removed_by_moderation BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS chk_campaigns_removed_by_moderation;
ALTER TABLE campaigns ADD CONSTRAINT chk_campaigns_removed_by_moderation
    CHECK (NOT removed_by_moderation OR deleted);

COMMENT ON COLUMN campaigns.removed_by_moderation IS 'Removida pelo admin (sempre com deleted = true)';

-- ------------------------------------------------------------
-- users.active já existe: false = conta banida pela moderação
-- ------------------------------------------------------------
COMMENT ON COLUMN users.active IS 'false = conta suspensa pela moderação: não entra e o conteúdo some das rotas públicas';

COMMIT;
```

## 6. O que muda no front quando a API existir (lembrete)

- `.env`: `VITE_USE_MOCK_DENUNCIAS=false` e `VITE_USE_MOCK_ADMIN=false`.
- Saem os filtros de moderação do mock que hoje ficam nas fachadas da API real (os comentários 🔴): `core/services/authService.js`, `animais/services/animalService.js`, `aumatch/services/aumatchService.js`, `adocao/services/adocaoService.js`, `core/context/AdoptionRequestContext.jsx` e `core/context/AuthContext.jsx`.
- `core/services/api.js`: um interceptor reconhece o 403 "Esta conta foi suspensa pela moderação do AUcolher." e desloga, no lugar da checagem do `moderationMock`.
