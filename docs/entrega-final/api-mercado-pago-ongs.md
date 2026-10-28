# AUcolher — Contrato da API: conta Mercado Pago de cada ONG

> Implementa a regra de negócio §10.3: **o dinheiro das doações cai direto na conta da ONG**, e a plataforma nunca guarda doações nem cobra comissão.
>
> Migração **009** (`mercado_pago_accounts`). O que isto muda nas campanhas (`acceptingDonations`, `donations.ngo_id`, recusas) já está escrito em `api-campanhas-doacoes.md`. **Antes de implementar, faça o teste no sandbox da seção 6.**

## 1. Regras de negócio

- **Vínculo.** Cada ONG vincula **uma** conta do Mercado Pago pelo OAuth do próprio Mercado Pago.
  - A ONG faz login no Mercado Pago e autoriza o AUcolher.
  - O AUcolher **nunca** recebe a senha da ONG.
  - Para trocar de conta: desconectar e conectar outra.
  - Uma mesma conta do Mercado Pago não pode ficar vinculada a duas ONGs.
- **Só a ONG** conecta, consulta e desconecta (`ROLE_NGO`).
- **Sem conta conectada não há campanha.** `POST /api/campaigns` responde 400 se a conta não estiver `CONNECTED`.
- **Campanha cuja conta caiu.** A ONG desconectou ou a renovação falhou:
  - a campanha continua visível, com `acceptingDonations: false` ("Doações indisponíveis no momento");
  - doar responde 400;
  - os PIX já gerados continuam válidos até vencer.
- **Situação da conta:**
  - `CONNECTED`: tudo certo;
  - `NEEDS_RECONNECT`: a renovação do token falhou ou o Mercado Pago revogou o acesso. O painel avisa e mostra o botão "Reconectar". Reconectar volta a conta para `CONNECTED`.
- **Desconectar.** Apaga as credenciais. É **recusado** enquanto houver doação `PENDING`, ainda não vencida, numa campanha da ONG. Como o PIX vale 30 minutos, a espera é curta. Assim nenhum pagamento em andamento fica sem como ser confirmado.
- **Credenciais.** O `access_token` e o `refresh_token` da ONG:
  - nunca saem do backend (nem em DTO, nem em log);
  - ficam **criptografados** no banco (AES-256-GCM).
- **Comissão.** A plataforma não cobra: a order sai sem `marketplace_fee`. Só a tarifa do Mercado Pago é descontada, na conta da ONG.
- **Excluir a conta da ONG** apaga a linha de `mercado_pago_accounts` (`api-exclusao-conta.md`).

## 2. Formatos (DTOs)

### 2.1 Situação da conta (`MercadoPagoAccountDTO`)

Conectada:

```json
{
  "connected": true,
  "status": "CONNECTED",
  "mpUserId": 1234567890,
  "liveMode": false,
  "connectedAt": "2026-10-20T14:03:00"
}
```

Sem conta vinculada:

```json
{ "connected": false, "status": null, "mpUserId": null, "liveMode": null, "connectedAt": null }
```

- `status`: `CONNECTED | NEEDS_RECONNECT`.
- `connected` é `true` só em `CONNECTED`. Com `NEEDS_RECONNECT`, ele vem `false`, para o front tratar como "precisa conectar".
- `liveMode` é `false` para credenciais de teste (sandbox).

### 2.2 Início da conexão

Resposta de `POST /api/ngo/mercado-pago/connect`:

```json
{ "authorizationUrl": "https://auth.mercadopago.com/authorization?client_id=1234567890123456&response_type=code&platform_id=mp&state=eyJhbGciOi...&redirect_uri=https%3A%2F%2Fapi.example.com%2Fapi%2Fmercado-pago%2Foauth%2Fcallback" }
```

O front só faz `window.location.href = authorizationUrl`.

### 2.3 Campanha (já em `api-campanhas-doacoes.md` §2)

```json
{ "...campos de sempre": "...", "acceptingDonations": true }
```

- `acceptingDonations` = campanha `ACTIVE` **e** ONG com conta `CONNECTED`. É calculado na leitura.
- Booleano com `@JsonProperty("acceptingDonations")`.

## 3. Endpoints

| Método | Rota | Quem | Sucesso | Observação |
|---|---|---|---|---|
| POST | `/api/ngo/mercado-pago/connect` | ONG | 200 `{ authorizationUrl }` | Também serve para reconectar |
| GET | `/api/mercado-pago/oauth/callback?code=&state=` | público (o Mercado Pago chama) | 302 para o front | Troca o `code` pelos tokens e salva |
| GET | `/api/ngo/mercado-pago` | ONG | 200 `MercadoPagoAccountDTO` | Situação da conta |
| DELETE | `/api/ngo/mercado-pago` | ONG | 204 | Desconecta (apaga as credenciais) |

**Para onde o callback redireciona:** `{FRONTEND_URL}/ong/painel/campanhas?mp={resultado}`.

| `mp=` | Quando |
|---|---|
| `connected` | Tokens obtidos e salvos |
| `denied` | A ONG negou a autorização (o Mercado Pago volta com `error`) |
| `already_linked` | A conta do Mercado Pago já está vinculada a **outra** ONG |
| `error` | `state` inválido ou vencido, `code` recusado, ou falha ao falar com o Mercado Pago (o detalhe vai para o log) |

**Erros:**
- `POST /connect` sem `MP_CLIENT_ID` configurado → 503 "Pagamentos indisponíveis no momento.".
- `DELETE` sem conta vinculada → 404 "Nenhuma conta do Mercado Pago está conectada.".
- `DELETE` com PIX pendente → 400 "Há doações Pix aguardando pagamento. Tente desconectar de novo em alguns minutos.".
- Pessoa ou admin em `/api/ngo/**` → 403.

## 4. Fluxo do OAuth

1. **Início.** O painel chama `POST /api/ngo/mercado-pago/connect`. O backend monta:
   - `state`: um **JWT curto**, assinado com o mesmo segredo do `JwtService`, com `sub` = id da ONG, `purpose = "mp_oauth"` e `exp` = agora + 10 minutos. Não precisa de tabela;
   - a `authorizationUrl` (`https://auth.mercadopago.com/authorization`), com `client_id`, `response_type=code`, `platform_id=mp`, `state` e `redirect_uri` = `MP_REDIRECT_URI`.
2. **No Mercado Pago.** A ONG entra na conta dela e autoriza.
3. **Volta.** O Mercado Pago chama `GET /api/mercado-pago/oauth/callback?code=...&state=...`. O backend:
   - se veio `error`, redireciona com `mp=denied`;
   - confere o `state`: assinatura, `purpose`, `exp`, e se a conta ainda existe, é ONG e está ativa. Se falhar, `mp=error`;
   - troca o código: `POST https://api.mercadopago.com/oauth/token`, com `client_id`, `client_secret`, `grant_type=authorization_code`, `code`, `redirect_uri` (**idêntica** à do passo 1) e `test_token` (= `MP_TEST_TOKEN`). O código vale **10 minutos**;
   - lê da resposta `access_token`, `refresh_token`, `expires_in` (segundos), `user_id` e `live_mode`;
   - se esse `user_id` já está vinculado a outra ONG, redireciona com `mp=already_linked`;
   - senão, faz upsert em `mercado_pago_accounts` (`status = CONNECTED`, `expires_at = agora + expires_in`) e redireciona com `mp=connected`.
4. **Renovação** (o token dura cerca de 180 dias):
   - **preguiçosa:** antes de usar o token (criar order, consultar order), se `expires_at < agora + 7 dias`, renova primeiro;
   - **agendada:** um `@Scheduled` diário, às 3h, renova as contas que vencem em até 30 dias, para ONGs sem doação recente não perderem o acesso;
   - **como renovar:** `POST https://api.mercadopago.com/oauth/token` com `grant_type=refresh_token`, `client_id`, `client_secret` e `refresh_token`. **O `refresh_token` muda a cada renovação: salve o novo**, senão o acesso se perde;
   - **se falhar** (`invalid_grant`, 401): `status = NEEDS_RECONNECT`. Não apague as credenciais; quem as substitui é a reconexão.

## 5. Chamadas ao Mercado Pago

As mudanças nas campanhas já estão em `api-campanhas-doacoes.md`:
- a order é criada com o **token da ONG dona da campanha**, e o dinheiro cai na conta dela;
- `POST /api/campaigns` e `POST /api/campaigns/{id}/donations` recusam ONG sem conta `CONNECTED`;
- a campanha ganha `acceptingDonations`;
- `donations.ngo_id` diz qual token consulta a order (no `GET /donations/{id}` em `PENDING` e no webhook), mesmo se a campanha for apagada de vez.

Aqui ficam os detalhes das chamadas.

### 5.1 Criação do PIX (Orders API) com o token da ONG

```http
POST https://api.mercadopago.com/v1/orders
Authorization: Bearer {access_token da ONG}
X-Idempotency-Key: donation-259
Content-Type: application/json
```

```json
{
  "type": "online",
  "processing_mode": "automatic",
  "total_amount": "50.00",
  "external_reference": "donation-259",
  "payer": { "email": "email-do-doador@exemplo.com" },
  "transactions": {
    "payments": [
      { "amount": "50.00", "payment_method": { "id": "pix", "type": "bank_transfer" } }
    ]
  }
}
```

- Sem `marketplace_fee`.
- Da resposta saem `id` (vai para `donations.mp_order_id`) e o "copia e cola" (`qr_code`), além de `qr_code_base64` e `ticket_url`, que vão para o `pix` do DTO da doação.
- **Conferir no sandbox:** o caminho exato desses campos na resposta da Orders API e se dá para definir a expiração em 30 minutos na order. Se não der, vale a regra da nossa API: a doação vence em 30 minutos e é cancelada.

### 5.2 Webhook (`POST /api/webhooks/mercadopago`)

1. **A notificação.** No painel da aplicação do AUcolher no Mercado Pago (Suas integrações → Webhooks), aponte para essa URL, com o evento de **orders**. O Mercado Pago manda `?data.id={id da order}&type=order`, mais os cabeçalhos `x-signature` e `x-request-id`.
2. **Validar a assinatura antes de tudo:**
   - o `x-signature` vem como `ts=1742505638683,v1=ced36ab6...`;
   - monte o texto `id:{data.id};request-id:{x-request-id};ts:{ts};`, com o `data.id` em minúsculas se for alfanumérico;
   - calcule o HMAC-SHA256 com `MP_WEBHOOK_SECRET` e compare com o `v1` em tempo constante;
   - assinatura inválida → 401.
3. **Localizar a doação** por `donations.mp_order_id = data.id`. Se não existir, responde 200 e ignora: pode ser uma order de outro sistema.
4. **Consultar a order:** `GET https://api.mercadopago.com/v1/orders/{id}`, com o token de `donations.ngo_id`.
5. **Se a order estiver paga**, aprovar de forma atômica, como já está no contrato:

   ```sql
   UPDATE donations SET status = 'APPROVED', approved_at = now()
   WHERE id = ? AND status IN ('PENDING', 'CANCELLED');
   ```

6. **Responder 200 rápido.** O Mercado Pago repete a notificação quando não recebe 2xx.

**Situação da order → doação** (conferir os nomes exatos no sandbox):

| Order no Mercado Pago | Doação |
|---|---|
| paga (`processed` / `accredited`) | `APPROVED` |
| aguardando pagamento (`action_required` / `waiting_transfer`) | continua `PENDING` |
| expirada ou cancelada | `EXPIRED` / `CANCELLED` (só se ainda estiver `PENDING`) |

## 6. Teste no sandbox (fazer antes de implementar)

Tem que funcionar **antes** de implementar campanhas e esta conexão. Passos:

1. Criar a **aplicação do AUcolher** em Mercado Pago Developers, cadastrar a **URL de redirecionamento** e anotar `client_id` e `client_secret`.
2. Criar **dois usuários de teste**: um "vendedor" (faz o papel da ONG) e um "comprador" (o doador).
3. Fazer o OAuth com o vendedor de teste (`test_token=true`) e guardar o `access_token`.
4. Criar uma order PIX (seção 5.1) **com o token do vendedor** e conferir se volta o "copia e cola".
5. Seguir o guia "Testar compra com Pix" da Orders API para aprovar o pagamento no sandbox, e conferir:
   - o `GET /v1/orders/{id}` com o token do vendedor mostra a order paga;
   - o webhook chega na URL da aplicação, com a assinatura válida. Isso exige uma URL pública: a API publicada ou um túnel.
6. Conferir se o Mercado Pago aceita `http://localhost:8080/...` como URL de retorno. Se não aceitar, o desenvolvimento do OAuth usa o túnel.

| Resultado | Decisão |
|---|---|
| Passos 3 a 5 funcionam | Seguir este contrato |
| O token do vendedor não cria order PIX, **ou** não é possível confirmar o pagamento (nem por webhook, nem por consulta) | **Plano B**: conta única da plataforma, com repasse às ONGs registrado no painel (regras §10.3). Avisar o front e atualizar este contrato e o texto do TCC |
| Só o webhook falha, mas a consulta (passo 5) funciona | Seguir este contrato. A confirmação fica pela consulta do `GET /donations/{id}`, que já existe |

## 7. Notas de implementação (Spring Boot)

1. **Pacote `payment/`:**
   - `MercadoPagoAccount` (entidade) e `MercadoPagoAccountRepository`;
   - `MercadoPagoOAuthService` (URL de autorização, callback, renovação);
   - `MercadoPagoClient` (um `RestClient` com `exchangeCode`, `refresh`, `createPixOrder` e `getOrder`);
   - `MercadoPagoController` (`/api/ngo/mercado-pago` e o callback);
   - `MercadoPagoTokenRefreshJob` (`@Scheduled`; liga `@EnableScheduling`);
   - `TokenCryptoConverter`.
2. **Criptografia (`TokenCryptoConverter implements AttributeConverter<String, String>`):**
   - AES-256-GCM;
   - chave de `MP_TOKEN_ENCRYPTION_KEY` (Base64, 32 bytes);
   - IV aleatório de 12 bytes por valor;
   - grava `Base64(iv || ciphertext)`.
   - Sem a chave, a API sobe, mas a conexão responde 503 (README §5).
3. **Segurança** (rotas fixas antes das genéricas):

   ```java
   .requestMatchers(HttpMethod.GET, "/api/mercado-pago/oauth/callback").permitAll()
   .requestMatchers("/api/ngo/**").hasRole("NGO")
   ```

4. **Configuração:**

   ```properties
   app.frontend-url=${FRONTEND_URL:http://localhost:5173}
   app.mercadopago.client-id=${MP_CLIENT_ID:}
   app.mercadopago.client-secret=${MP_CLIENT_SECRET:}
   app.mercadopago.redirect-uri=${MP_REDIRECT_URI:}
   app.mercadopago.webhook-secret=${MP_WEBHOOK_SECRET:}
   app.mercadopago.token-encryption-key=${MP_TOKEN_ENCRYPTION_KEY:}
   app.mercadopago.test-token=${MP_TEST_TOKEN:false}
   ```

5. **Log:** nunca logar token, `code` ou `client_secret`. Logar só o id da ONG e o `mp_user_id`.
6. **Testes:**
   - `MercadoPagoOAuthService` com o `MercadoPagoClient` mockado: callback feliz, `state` vencido, conta já vinculada a outra ONG, renovação que falha → `NEEDS_RECONNECT`;
   - `TokenCryptoConverter`: o valor vai e volta igual, e o texto cifrado muda a cada vez.

## 8. SQL (rascunho de migração, PostgreSQL)

**`donations.ngo_id`** já nasce na 007 (`api-campanhas-doacoes.md` §8). Se a sua 007 já rodou sem ela, ponha na 009: `ALTER TABLE donations ADD COLUMN IF NOT EXISTS ngo_id BIGINT REFERENCES users (id);`, preencha com `UPDATE donations d SET ngo_id = c.ngo_id FROM campaigns c WHERE c.id = d.campaign_id;` e depois `ALTER COLUMN ngo_id SET NOT NULL`.

**`009_mercado_pago_accounts.sql`:**

```sql
-- ============================================================
-- Migração 009 — conta Mercado Pago de cada ONG
--
-- Cada ONG vincula a própria conta (OAuth do Mercado Pago) e as
-- doações caem direto nela. Os tokens ficam criptografados pela
-- aplicação (AES-256-GCM): o banco só vê texto cifrado.
--
--   psql -U postgres -h localhost -d aucolher_db -f sql/migrations/009_mercado_pago_accounts.sql
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS mercado_pago_accounts (
    ngo_id         BIGINT       PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    mp_user_id     BIGINT       NOT NULL UNIQUE,
    access_token   TEXT         NOT NULL,
    refresh_token  TEXT         NOT NULL,
    expires_at     TIMESTAMP    NOT NULL,
    live_mode      BOOLEAN      NOT NULL DEFAULT FALSE,
    status         VARCHAR(20)  NOT NULL DEFAULT 'CONNECTED',
    connected_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_mp_accounts_status CHECK (status IN ('CONNECTED', 'NEEDS_RECONNECT'))
);

-- O job diário procura as contas que vencem logo
CREATE INDEX IF NOT EXISTS idx_mp_accounts_expires ON mercado_pago_accounts (expires_at);

COMMENT ON TABLE  mercado_pago_accounts               IS 'Conta Mercado Pago vinculada por cada ONG (OAuth) — as doações caem direto nela';
COMMENT ON COLUMN mercado_pago_accounts.mp_user_id    IS 'user_id da conta no Mercado Pago; uma conta não serve a duas ONGs';
COMMENT ON COLUMN mercado_pago_accounts.access_token  IS 'Token de acesso da ONG, criptografado pela aplicação (AES-256-GCM)';
COMMENT ON COLUMN mercado_pago_accounts.refresh_token IS 'Token de renovação, criptografado; muda a cada renovação';
COMMENT ON COLUMN mercado_pago_accounts.status        IS 'CONNECTED ou NEEDS_RECONNECT (renovação falhou ou acesso revogado)';

COMMIT;
```

## 9. O que muda no front (a fazer)

- **Serviço** (`features/doacoes/services/`):
  - `doacoesApi.js` ganha `getMercadoPagoAccount`, `connectMercadoPago` e `disconnectMercadoPago`;
  - não há mais mock de campanhas: as três funções chamam a API direto, então esta parte do front só dá para testar com a migração 009 no backend;
  - os mappers levam `acceptingDonations`.
- **Hook:** `useMercadoPagoAccount()`, com a query da situação e as mutations de conectar e desconectar. A chave fica em `core/services/queryKeys.js`.
- **Painel da ONG** (`features/ong/panel/pages/CampaignsPage.jsx`):
  - um card no topo, conforme a situação:
    - sem conta: "Conecte sua conta do Mercado Pago para receber doações", com o botão;
    - conectada: selo "Conta conectada" e "Desconectar", via `ConfirmDialog`;
    - `NEEDS_RECONNECT`: aviso em âmbar e "Reconectar";
  - ler o `?mp=` da volta, mostrar o *toast* (sucesso, negado, já vinculada a outra ONG, erro) e limpar a URL.
- **Criar campanha** (`CampaignFormPage` em modo criação): sem conta conectada, mostra o aviso com o botão de conectar no lugar do formulário.
- **Doação:** `CampaignCard`, o detalhe da campanha e o `DonationModal` checam `acceptingDonations === false`. Nesse caso, o botão "Doar" fica desabilitado e aparece "Doações indisponíveis no momento".
- **Ícones:** de `react-icons`, como no resto do projeto (por exemplo, `SiMercadopago` ou `FaHandHoldingDollar`).
