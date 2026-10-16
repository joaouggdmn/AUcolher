# AUcolher — Contrato da API: excluir a própria conta

> Versão 1 (15/10/2026). Implementa a regra de negócio §2.1 ("Excluir conta"). Sprint **S2**, migração **013**.
>
> **Não depende da moderação** (S3): como a exclusão é definitiva, ela muda o status das coisas direto, sem precisar da cascata reversível do banimento (`api-denuncias-moderacao.md` §2).

## 1. Regras de negócio

- **Quem:** pessoa e ONG excluem a própria conta no fim de "Minha conta". **Admin não**: 403.
- **Confirmação:**
  - conta com senha: informa a **senha**;
  - conta do Google sem senha: digita **`EXCLUIR`**.
- **Não dá para desfazer.** Diferente do banimento, que o admin reativa.
- **A linha de `users` não é apagada: é anonimizada.** Pedidos, avaliações, doações e mensagens das **outras** pessoas apontam para ela e precisam continuar legíveis.
  - O nome vira **"Conta excluída"**.
  - O e-mail vira `excluida-{id}@aucolher.invalid`. O e-mail original fica **livre para um novo cadastro**.
  - Senha, foto, bio, CNPJ (fica livre para outra ONG), e-mail institucional, redes sociais, ano de fundação, banner e endereço viram `NULL`.
  - O selo de verificada sai, a conta fica `active = false` e ganha `deleted_at`.
- **O que é apagado de vez:**
  - equipe e horários de visita da ONG;
  - perfil do AUmatch;
  - favoritos;
  - presenças confirmadas em eventos de outras ONGs;
  - conta Mercado Pago vinculada;
  - links de recuperação de senha;
  - marcas de leitura do chat.
- **O que continua, como histórico das outras pessoas,** com o autor exibido como "Conta excluída":
  - pedidos concluídos, devolvidos ou repassados, e as avaliações escritas;
  - mensagens de chat;
  - doações aprovadas, com o doador "Conta excluída" em "Doações recebidas" da ONG;
  - denúncias feitas pela conta.

## 2. Efeitos (tudo numa transação, nesta ordem)

1. **Pedidos de adoção ativos** (`PENDING`, `ACCEPTED`, `AWAITING_DELIVERY`) em que a conta é dona do animal **ou** adotante:
   - viram `CANCELLED`, com `cancelReason = ACCOUNT_DELETED` e `cancelledFromStatus` preenchido;
   - a outra parte vê "Cancelado — conta excluída", e a conversa fica travada;
   - como nos outros cancelamentos feitos pelo sistema, não há mensagem de sistema no chat.
   - Isso vem **antes** do passo 2, senão o evento de "animal saiu da vitrine" cancelaria os pedidos com o motivo errado (`ANIMAL_UNAVAILABLE`).
2. **Animais da conta:**
   - os `AVAILABLE` viram `INACTIVE`;
   - os `ADOPTED`, `INACTIVE` e `REMOVED` não mudam.
   - Todos somem das rotas públicas, porque o dono está inativo, e o detalhe responde 404.
3. **Campanhas da ONG:**
   - as `ACTIVE` são **encerradas** e depois têm **exclusão lógica** (`deleted = true`): saem de todas as rotas de campanha (404);
   - os PIX ainda pendentes são cancelados, como no "Encerrar" de sempre;
   - as doações aprovadas continuam no histórico de quem doou, com `campaign.removed = true`.
4. **Eventos da ONG:**
   - os futuros `ACTIVE` **com** confirmados viram `CANCELLED`, e quem confirmou vê "Evento cancelado" em Minha conta;
   - os futuros **sem** confirmados são apagados de verdade, como no excluir de sempre;
   - os passados ficam.
5. **Apagar** o que está na lista "apagado de vez" da seção 1.
6. **Anonimizar** a linha de `users` (seção 1).
7. **Denúncias** (quando a moderação existir, na S3): as `PENDING` contra o perfil da conta ou contra anúncios dela são arquivadas automaticamente (`RESOLVED`, `resolution = DISMISSED`), porque o conteúdo já saiu do ar.

Depois disso, qualquer token da conta para de funcionar: o `CustomUserDetailsService` encontra a conta inativa, e o e-mail antigo nem existe mais. O front desloga na hora.

## 3. Formatos (DTOs)

Corpo do pedido de exclusão:

```json
{ "password": "minhaSenha1" }
```

Conta sem senha (`hasPassword: false`, ver `api-senha.md` §2.3):

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

**No painel do admin** (S3): `PATCH /api/admin/users/{id}/status` com `{ "active": true }` numa conta com `deleted_at` responde 400 "Contas excluídas não podem ser reativadas.".

## 5. Notas de implementação (Spring Boot)

1. **Orquestração.** Um `AccountDeletionService` em `user/`, com um método `@Transactional`, que chama os serviços donos de cada coisa:
   - `AdoptionRequestService.cancelAllForAccount(userId, ACCOUNT_DELETED)`;
   - `AnimalService.unlistAllOf(userId)`;
   - `CampaignService.closeAndHideAllOf(ngoId)`;
   - `EventService.cancelUpcomingOf(ngoId)`;
   - os repositórios para apagar o resto.
2. **Motivo novo.** Acrescente `ACCOUNT_DELETED` ao enum `CancelReason` e ao front (texto "conta excluída").
3. **Reaproveitar na moderação.** Os métodos `cancelAllForAccount` e o filtro "dono ativo" das rotas públicas são os mesmos que o banimento (S3) vai precisar. Na S3, o banimento chama `cancelAllForAccount(userId, ACCOUNT_BANNED)` em vez de reescrever a cascata.
4. **E-mail e CNPJ livres.** Como `email` e `cnpj` são `UNIQUE`, anonimizar **antes** de alguém tentar se cadastrar de novo já resolve. O e-mail anonimizado usa o domínio reservado `.invalid`, que nunca recebe correio.
5. **Testes:**
   - pessoa com pedido ativo como adotante e como dona: os dois cancelados com `ACCOUNT_DELETED`;
   - ONG com campanha ativa e PIX pendente: campanha encerrada e oculta, PIX cancelado, doação aprovada preservada;
   - evento futuro com e sem confirmados;
   - recadastro com o mesmo e-mail funciona;
   - admin recebe 403;
   - senha errada.

## 6. SQL (rascunho de migração, PostgreSQL)

```sql
-- ============================================================
-- Migração 013 — exclusão de conta
--
-- A linha de users não é apagada: a conta é anonimizada e marcada
-- com deleted_at. Pedidos ativos da conta são cancelados com o motivo
-- ACCOUNT_DELETED.
--
--   psql -U postgres -h localhost -d aucolher_db -f sql/migrations/013_account_deletion.sql
-- ============================================================

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

COMMENT ON COLUMN users.deleted_at IS 'Conta excluída pela própria pessoa (anonimizada, active = false); nunca é reativada';

-- Motivos de cancelamento: mantém os anteriores e acrescenta ACCOUNT_DELETED.
-- A migração 014 (moderação) recria esta CHECK de novo e precisa manter ACCOUNT_DELETED.
ALTER TABLE adoption_requests DROP CONSTRAINT IF EXISTS chk_adoption_requests_cancel_reason;
ALTER TABLE adoption_requests ADD CONSTRAINT chk_adoption_requests_cancel_reason
    CHECK (cancel_reason IS NULL OR cancel_reason IN
        ('ADOPTER_WITHDREW', 'OWNER_WITHDREW', 'ANIMAL_ADOPTED', 'ANIMAL_UNAVAILABLE', 'ACCOUNT_DELETED'));

COMMIT;
```

O nome `chk_adoption_requests_cancel_reason` é o da migração 005 (conferido em 15/10).

## 7. O que muda no front

- **Serviço:** `deleteMyAccount({ password } | { confirmation })` em `core/services/authService.js` ou `features/perfil/services/userService.js`.
- **Minha conta** (pessoa e ONG, também em `/ong/painel/perfil`): no fim da página, depois de "Dados da conta", uma **zona de perigo** "Excluir conta", em vermelho. Não existe mais aba ou seção "Segurança" (`api-senha.md` v2).
  - O `ConfirmDialog`, na variante perigo, explica o que acontece:
    - os anúncios saem do ar;
    - os pedidos em andamento são cancelados;
    - as campanhas são encerradas;
    - o histórico das outras pessoas fica, como "Conta excluída".
  - Ele pede a senha ou que se digite `EXCLUIR` (conforme `hasPassword`).
- **Sucesso:** logout, ida para a home e o *toast* "Sua conta foi excluída.".
- **Textos:** `ACCOUNT_DELETED` entra nos textos de cancelamento (cards de pedido e faixa de "Conversa encerrada"): "Cancelado — conta excluída".
- **Admin** (S3): o `UserRow` mostra o selo "Excluída" quando houver `deletedAt` e esconde "Reativar".
