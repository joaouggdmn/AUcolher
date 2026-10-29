# AUcolher — Contrato da API: excluir a própria conta

> ✅ **Implementado** (migração 013). O front usa só a API: o mock e a flag `VITE_USE_MOCK_EXCLUSAO` foram removidos.
>
> Implementa a regra de negócio §2.1 ("Excluir conta").
>
> **Reaproveita a moderação:** o banimento já cancelava os pedidos da conta (`AdoptionRequestService.cancelAllForAccount`), e o `JwtAuthenticationFilter` já recusava token de conta inativa. A exclusão usa as mesmas peças. O que ela tem de próprio é a anonimização, o `deleted_at` e o que é apagado de vez (§5).

## 1. Regras de negócio

- **Quem:** pessoa e ONG excluem a própria conta no fim de "Minha conta". **Admin não**: 403.
- **Confirmação:**
  - conta com senha: informa a **senha**;
  - conta do Google sem senha: digita **`EXCLUIR`**.
- **Não dá para desfazer.** Diferente do banimento, que o admin reativa.
- **A linha de `users` não é apagada: é anonimizada.** Pedidos, avaliações, doações e mensagens das **outras** pessoas apontam para ela e precisam continuar legíveis.
  - O nome vira **"Conta excluída"**.
  - O e-mail vira `excluida-{id}@aucolher.invalid`. O e-mail original fica **livre para um novo cadastro**.
  - Senha, foto, bio, CNPJ (fica livre para outra ONG), redes sociais, ano de fundação, banner (`cover_url`) e endereço viram `NULL`.
  - O selo de verificada sai, a conta fica `active = false` e ganha `deleted_at`.
- **O que é apagado de vez:**
  - equipe e horários de visita da ONG;
  - perfil do AUmatch;
  - favoritos;
  - presenças confirmadas em eventos de outras ONGs.
- **Quando existirem**, também entram nessa lista:
  - a conta Mercado Pago vinculada (009);
  - os links de recuperação de senha (010);
  - as marcas de leitura do chat (011).
  - Hoje essas tabelas ainda não existem. Quem implementar essas migrações acrescenta a limpeza em `AccountDeletionService`.
- **O que continua, como histórico das outras pessoas,** com o autor exibido como "Conta excluída":
  - pedidos concluídos, devolvidos ou repassados, e as avaliações escritas;
  - mensagens de chat;
  - doações aprovadas, com o doador "Conta excluída" em "Doações recebidas" da ONG;
  - denúncias feitas pela conta.

## 2. Efeitos (tudo numa transação, nesta ordem)

1. **Pedidos de adoção ativos** (`PENDING`, `ACCEPTED`, `AWAITING_DELIVERY`) em que a conta é dona do animal **ou** adotante:
   - viram `CANCELLED`, com `cancelReason = ACCOUNT_DELETED` e `cancelledFromStatus` preenchido;
   - a outra parte vê "Cancelado: conta excluída", e a conversa fica travada;
   - como nos outros cancelamentos feitos pelo sistema, não há mensagem de sistema no chat.
   - Isso vem **antes** do passo 2, senão o evento de "animal saiu da vitrine" cancelaria os pedidos com o motivo errado (`ANIMAL_UNAVAILABLE`).
2. **Animais da conta:**
   - os `AVAILABLE` viram `INACTIVE`;
   - os `ADOPTED`, `INACTIVE` e `REMOVED` não mudam.
   - Todos somem das rotas públicas, porque o dono está inativo, e o detalhe responde 404.
3. **Campanhas da ONG:**
   - **todas** ganham **exclusão lógica** (`deleted = true`), mesmo sem doações, e saem de todas as rotas de campanha (404);
   - as ativas são **encerradas** antes (`CLOSED`, `closedAt`); as já encerradas mantêm o `closedAt` que tinham;
   - os PIX ainda pendentes são cancelados, como no "Encerrar" de sempre;
   - as doações aprovadas continuam no histórico de quem doou, com `campaign.removed = true`. Assim nenhuma doação aponta para uma campanha que dá 404.
4. **Eventos da ONG:**
   - os futuros `ACTIVE` **com** confirmados viram `CANCELLED`. Quem confirmou continua vendo o evento em `GET /api/events/attending`, como "Evento cancelado" em Minha conta. O evento de ONG **banida** continua sumindo dessa lista;
   - os futuros **sem** confirmados são apagados de verdade, como no excluir de sempre;
   - os passados ficam.
5. **Apagar** o que está na lista "apagado de vez" da seção 1.
6. **Anonimizar** a linha de `users` (seção 1).
7. **Denúncias:** as `PENDING` contra o perfil da conta ou contra anúncios dela são arquivadas automaticamente (`RESOLVED`, `resolution = DISMISSED`, `resolved_by` nulo), porque o conteúdo já saiu do ar.

Depois disso, qualquer token da conta para de funcionar: o e-mail antigo não existe mais, então o `JwtAuthenticationFilter` segue sem autenticar (401 nas rotas protegidas). O login com o e-mail antigo responde 401, como um e-mail desconhecido. O front desloga na hora.

## 3. Formatos (DTOs)

Corpo do pedido de exclusão:

```json
{ "password": "minhaSenha1" }
```

Conta sem senha (conta do Google; `hasPassword: false` quando a 010 existir, ver `../entrega-final/api-senha.md` §2.2):

```json
{ "confirmation": "EXCLUIR" }
```

**Lista do admin** (`AdminUserDTO`, `api-admin.md` §3.2): ganha `deletedAt` (nulo ou data). A conta excluída aparece com `name: "Conta excluída"`, `active: false` e `deletedAt` preenchido. A tela mostra "Excluída", sem a ação de reativar.

## 4. Endpoints

| Método | Rota | Quem | Sucesso | Observação |
|---|---|---|---|---|
| POST | `/api/users/me/deletion` | pessoa ou ONG | 204 | Exclui a conta logada. POST, porque `DELETE` com corpo é mal suportado por proxies e clientes HTTP |

**Recusas**, com `message`:

| Status | Quando | `message` |
|---|---|---|
| 403 | conta `ADMIN` | "A conta de administrador não pode ser excluída." |
| 400 | conta com senha, sem `password` ou com senha errada | "Senha incorreta." |
| 400 | conta sem senha e `confirmation` diferente de `EXCLUIR` | "Digite EXCLUIR para confirmar." |

**No painel do admin:**
- `PATCH /api/admin/users/{id}/status` com `{ "active": true }` numa conta com `deleted_at` responde 400 "Contas excluídas não podem ser reativadas.".
- `PUT /api/admin/users/{id}` numa conta com `deleted_at` responde 400 "Contas excluídas não podem ser editadas.".

## 5. Como ficou no Spring Boot

1. **Orquestração.** `user/AccountDeletionService.deleteAccount(email, body)`, `@Transactional`, chama os serviços donos de cada coisa:
   - `AdoptionRequestService.cancelAllForAccount(userId, ACCOUNT_DELETED)`;
   - `AnimalService.unlistAllOf(userId)`, que não publica `AnimalLeftListingEvent`, porque os pedidos já foram cancelados;
   - `CampaignService.closeAndHideAllOf(ngoId)`;
   - `EventService.cancelUpcomingOf(ngoId)`;
   - `MatchProfileRepository.deleteById`, `FavoriteRepository.removeAllOf` e `EventAttendanceRepository.deleteAllOf`;
   - `User.anonymize(now)`;
   - `ReportService.resolveAgainstAccount(userId, DISMISSED, null, now)`. O banimento usa o mesmo método com `ACCOUNT_BANNED`.
2. **Contexto do JPA.** `DonationRepository.cancelPendingByCampaign` limpa o contexto (`clearAutomatically`). Por isso a conta é lida de novo antes de ser anonimizada.
3. **Motivo novo.** `ACCOUNT_DELETED` no enum `CancelReason`. A CHECK do banco já aceitava esse valor desde a 014.
4. **Reaproveitar a moderação.** Com `active = false`, a conta ganha de graça o filtro das rotas públicas (animais, eventos, perfil). A única exceção é `GET /api/events/attending`, que mantém os eventos da ONG excluída.
5. **E-mail e CNPJ livres.** Como `email` e `cnpj` são `UNIQUE`, anonimizar já libera os dois para um novo cadastro. O e-mail anonimizado usa o domínio reservado `.invalid`, que nunca recebe correio. Uma conta do Google excluída que entrar de novo pelo Google ganha uma conta nova.
6. **Testes:**
   - `AccountDeletionServiceTest`, `UserControllerTest`, `UserTest` e `EventServiceTest`;
   - casos novos em `CampaignServiceTest`, `AnimalServiceTest`, `ReportServiceTest`, `ModerationServiceTest` e `ModerationEditsTest`.
   - Um E2E num banco temporário conferiu cada passo da §2 e o recadastro com o mesmo e-mail e CNPJ.

## 6. SQL (migração 013, PostgreSQL)

As CHECKs `chk_users_ngo_has_cnpj` e `chk_users_local_has_password` exigiam CNPJ (ONG) e senha (conta LOCAL). Sem recriá-las, a anonimização seria recusada pelo banco.

```sql
BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_ngo_has_cnpj;
ALTER TABLE users ADD CONSTRAINT chk_users_ngo_has_cnpj
    CHECK (user_type <> 'NGO' OR cnpj IS NOT NULL OR deleted_at IS NOT NULL);

ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_local_has_password;
ALTER TABLE users ADD CONSTRAINT chk_users_local_has_password
    CHECK (provider <> 'LOCAL' OR password IS NOT NULL OR deleted_at IS NOT NULL);

ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_deleted_inactive;
ALTER TABLE users ADD CONSTRAINT chk_users_deleted_inactive
    CHECK (deleted_at IS NULL OR active = FALSE);

COMMENT ON COLUMN users.deleted_at IS 'Conta excluída pela própria pessoa (anonimizada, active = false); nunca é reativada';

COMMIT;
```

O arquivo completo é `sql/migrations/013_account_deletion.sql`, no backend. Ele também atualiza o comentário de `adoption_requests.cancel_reason`. Pode ser repetido.

**A CHECK de `adoption_requests.cancel_reason` não é tocada:** a 014 já a recriou aceitando `ACCOUNT_DELETED`.

## 7. O que mudou no front (feito)

- **Serviço:** `deleteMyAccount(body)` em `features/perfil/services/userService.js` chama `POST /users/me/deletion` com `{ password }` ou `{ confirmation: "EXCLUIR" }`.
  - Saíram `accountDeletionMock.js`, a flag `USE_MOCK_EXCLUSAO`, o bloqueio de login no `authService` e o `withMockDeletions` da lista do admin.
  - A chave antiga `aucolher_mock_exclusao` virou `LEGACY_MOCK_EXCLUSAO_STORAGE_KEY`, e o `AuthContext` a apaga.
- **Minha conta** (pessoa e ONG, também em `/ong/painel/perfil`): a seção "Excluir conta", em vermelho, no fim da página (`DeleteAccountSection.jsx`).
  - Não aparece quando o admin edita a conta de outra pessoa, nem no "Minha conta" do próprio admin.
  - O `ConfirmDialog`, na variante perigo, explica o que acontece:
    - os anúncios saem do ar;
    - os pedidos em andamento são cancelados;
    - na ONG, as campanhas saem do ar (as ativas são encerradas) e os eventos futuros são cancelados;
    - o histórico das outras pessoas fica, como "Conta excluída".
  - Ele pede a senha ou que se digite `EXCLUIR` (conforme `hasPassword`), e mostra o `message` da API se ela recusar.
  - Enquanto a API não manda `hasPassword` (migração 010), o front considera sem senha a conta criada pelo Google (`provider: "GOOGLE"`). Hoje isso equivale ao que a API confere (`password` nulo).
- **Sucesso:** logout, ida para a home e o aviso "Sua conta foi excluída.".
- **Textos:** `ACCOUNT_DELETED` nos cards de pedido ("Cancelado: conta excluída") e na faixa de "Conversa encerrada".
- **Admin:** o `UserRow` mostra o selo "Excluída" quando houver `deletedAt`, sem "Editar", "Banir" ou "Reativar", e a lista ganha o filtro "Excluídas".
