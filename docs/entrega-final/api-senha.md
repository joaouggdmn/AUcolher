# AUcolher — Contrato da API: recuperar e alterar senha

> Implementa a regra de negócio §2.1. Migração **010**.
> - Não existe "trocar senha" com a senha atual (sem `PUT /api/users/me/password`). Toda alteração passa pelo link de redefinição por e-mail. Em "Minha conta", o botão "Alterar senha" só pede esse link para o e-mail da conta.
> - O front já está pronto: `features/auth/services/passwordService.js` chama as rotas abaixo, e o mock responde enquanto `VITE_USE_MOCK_SENHA` estiver ligada (padrão).

## 1. Regras de negócio

**Senha**
- Mínimo de **6 caracteres**, como no cadastro.

**Alterar senha** (logado, em "Minha conta" → card "Acesso")
- A senha aparece só mascarada (`••••••••`): o banco guarda o hash, não a senha.
- O botão "Alterar senha" chama o mesmo `POST /forgot` com o e-mail da conta. Quem tem acesso ao e-mail prova que é dono da conta, então a senha atual não é pedida.
- **Conta do Google sem senha** (`password` nulo): o botão vira "Criar senha" e usa o mesmo link. Depois disso, a conta entra das duas formas, Google ou e-mail e senha.
- Vale para pessoa e ONG.

**Derrubar as sessões**
- Redefinir a senha **invalida todos os tokens emitidos antes**, inclusive o do navegador que pediu o link: todo mundo entra de novo com a senha nova.
- Como funciona: `users.password_changed_at` guarda o momento da troca, e o filtro do JWT recusa token com `iat` anterior a ele (seção 5).

**Recuperar senha** (sem login)
- A pessoa informa o e-mail. A resposta é **sempre a mesma**, exista conta ou não ("Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha."), para não revelar quais e-mails têm conta.
- **Quando existe conta ativa** (com senha ou só do Google): chega um e-mail com o link `{FRONTEND_URL}/redefinir-senha?token={token}`. O token:
  - é de **uso único**;
  - vale **30 minutos**;
  - fica no banco **só como hash** (SHA-256).
  - Pedir um link novo invalida o anterior ainda não usado.
- **Limite:** no máximo **um e-mail por minuto** por conta. Pedidos repetidos dentro do minuto recebem a mesma resposta neutra, sem novo envio.
- **Conta só do Google, sem senha:** o e-mail é o mesmo, com uma linha a mais explicando que a conta entra pelo Google e que o link serve para criar uma senha.
- **Conta inativa** (banida ou excluída): não envia nada, e a resposta continua a mesma.
- **Redefinir:** com o token válido, a pessoa escolhe a nova senha. O token é marcado como usado, todas as sessões caem e a pessoa vai para o login com o aviso "Senha redefinida. Entre com a nova senha.". Ela não entra automaticamente.

**Aviso de "senha alterada"** (opcional)
- Depois de uma redefinição, um e-mail curto avisa a conta: "Sua senha do AUcolher foi alterada em {data}. Se não foi você, use 'Esqueci minha senha'.".

## 2. Formatos (DTOs)

### 2.1 Recuperação

```json
{ "email": "maria@exemplo.com" }
```

```json
{ "token": "x7Qm...43 caracteres..." }
```

```json
{ "token": "x7Qm...", "newPassword": "senhaNova2" }
```

O token é gerado com 32 bytes aleatórios (`SecureRandom`) e vai no link em Base64 URL-safe, sem padding (43 caracteres).

### 2.2 Usuário (acréscimo ao `UserResponseDTO`)

```json
{ "...campos de sempre": "...", "hasPassword": true }
```

- `hasPassword` = `password != null`. Com ele, o front decide entre "Alterar senha" e "Criar senha".
- Vem em todas as respostas que já trazem o usuário: login, cadastro, OAuth e `PUT /api/users/me`.

## 3. Endpoints

| Método | Rota | Quem | Sucesso | Observação |
|---|---|---|---|---|
| POST | `/api/auth/password/forgot` | público | 204 | Sempre 204 (resposta neutra) |
| POST | `/api/auth/password/reset/check` | público | 204 | A página de redefinir confere o link ao abrir |
| POST | `/api/auth/password/reset` | público | 204 | Redefine e invalida as sessões |

`/check` e `/reset` são POST de propósito: assim o token não aparece em URL de API nem em log de acesso.

**Recusas (400)**, com `message`:

| Rota | Quando | `message` |
|---|---|---|
| POST `/reset` | nova senha com menos de 6 caracteres | "A nova senha deve ter no mínimo 6 caracteres." |
| POST `/forgot` | e-mail vazio ou mal formado | "Informe um e-mail válido." |
| POST `/reset/check`, POST `/reset` | token inexistente, vencido ou já usado | "Este link é inválido ou expirou. Peça um novo." |

Erro de validação de campo segue o padrão do `GlobalExceptionHandler` (com `errors`).

## 4. E-mails

Enviados pelo SMTP do **Gmail**, com uma conta do projeto e **senha de app** (README §5). Texto simples, mais uma versão HTML sem imagens externas, para cair menos no spam.

**Recuperação** — assunto "Redefinir sua senha do AUcolher":

> Olá, {nome}!
> Recebemos um pedido para redefinir a senha da sua conta no AUcolher.
> Para criar uma nova senha, acesse o link abaixo. Ele vale por 30 minutos e só pode ser usado uma vez:
> {FRONTEND_URL}/redefinir-senha?token={token}
> Se você não fez esse pedido, ignore este e-mail: sua senha continua a mesma.

**Conta só do Google** — o mesmo e-mail, com esta linha antes do link:

> Sua conta no AUcolher foi criada com o Google e ainda não tem senha. Com o link abaixo você cria uma e passa a entrar também com e-mail e senha.

**Senha alterada** (opcional) — assunto "Sua senha do AUcolher foi alterada": o texto da seção 1.

## 5. Notas de implementação (Spring Boot)

1. **Derrubar sessões no filtro.**
   - O `JwtService` já grava o `iat` (`issuedAt`). Acrescente `extractIssuedAt(token)`.
   - O `CustomUserDetailsService` já relê o usuário a cada requisição. Faça ele devolver um `UserDetails` próprio (por exemplo, `AuthenticatedUser`) que leve o `passwordChangedAt`.
   - No `JwtAuthenticationFilter`, autentique só se `passwordChangedAt == null || iat >= passwordChangedAt`, **comparando em segundos**: o `iat` do JWT não tem milissegundos.
   - Token velho → a requisição segue sem autenticação → rota protegida responde **401**, e o front já desloga no 401 (`core/services/api.js`).
   - No `/reset`, grave `password_changed_at = now()` **truncado para segundos**. O próximo login gera um token com `iat >= changedAt`, que passa.
2. **Login (`AuthService.authenticate`).** Hoje ele recusa qualquer conta com `provider != LOCAL`. Passa a recusar só quando `password == null`, com a mesma mensagem ("Esta conta utiliza login via Google..."). Conta do Google que definiu senha entra pelos dois caminhos. O `provider` continua `GOOGLE`.
3. **Rotas.** As três ficam num `PasswordResetController` em `/api/auth/password`. Essas já ficam públicas pela regra `/api/auth/**` do `SecurityConfig`.
4. **Tokens de recuperação:**
   - salvar `sha256Hex(token)`; nunca o token puro;
   - para validar, calcular o hash do que chegou e buscar `WHERE token_hash = ? AND used_at IS NULL AND expires_at > now()`;
   - ao gerar um novo, marcar os anteriores ainda não usados da conta como usados (`used_at = now()`);
   - limite de 1 por minuto: se o último token da conta tem `created_at > now() - 1 min`, não gera nem envia.
5. **E-mail:**
   - dependência `spring-boot-starter-mail`;
   - envio **fora da transação** e sem travar a resposta (`@Async` ou depois do commit), para o `/forgot` responder rápido e no mesmo tempo, com ou sem conta. Isso também evita revelar a existência da conta pelo tempo de resposta;
   - sem `MAIL_USERNAME`, só registra o link no log, com um aviso.

   ```properties
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=${MAIL_USERNAME:}
   spring.mail.password=${MAIL_PASSWORD:}
   spring.mail.properties.mail.smtp.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true
   app.frontend-url=${FRONTEND_URL:http://localhost:5173}
   ```

6. **Testes:**
   - token JWT antigo recusado depois da redefinição, e o do login novo aceito;
   - conta do Google sem senha recebe o link e, depois do `/reset`, entra com e-mail e senha;
   - `/forgot` com e-mail inexistente responde 204 sem enviar;
   - token vencido ou usado responde 400;
   - limite de 1 por minuto.

## 6. Limpeza

Tokens usados ou vencidos há mais de 7 dias podem ser apagados por um `@Scheduled` diário. É opcional, porque o volume é pequeno.

## 7. SQL (rascunho de migração, PostgreSQL)

```sql
-- ============================================================
-- Migração 010 — segurança da senha
--
-- password_changed_at: tokens JWT emitidos antes da última
-- redefinição de senha deixam de valer (derruba as sessões).
-- password_reset_tokens: links de "Esqueci minha senha" (só o hash
-- do token fica no banco; uso único; 30 minutos).
--
--   psql -U postgres -h localhost -d aucolher_db -f sql/migrations/010_password_security.sql
-- ============================================================

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;

COMMENT ON COLUMN users.password_changed_at IS 'Última troca ou redefinição de senha; tokens JWT com iat anterior são recusados';

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash  CHAR(64)     NOT NULL UNIQUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP    NOT NULL,
    used_at     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens (user_id, created_at);

COMMENT ON TABLE  password_reset_tokens            IS 'Links de redefinição de senha (Esqueci minha senha)';
COMMENT ON COLUMN password_reset_tokens.token_hash IS 'SHA-256 (hex) do token enviado por e-mail — o token puro nunca é gravado';
COMMENT ON COLUMN password_reset_tokens.used_at    IS 'Preenchido quando o link é usado ou substituído por um novo';

COMMIT;
```

## 8. O que muda no front

> ✅ Já feito no front, atrás de `VITE_USE_MOCK_SENHA`. Quando as rotas existirem: `VITE_USE_MOCK_SENHA=false`.

**Serviço** (`features/auth/services/passwordService.js`)
- `requestPasswordReset`, `checkResetToken` e `resetPassword`.
- `toFrontendProfile` passa a levar `hasPassword`.

**Minha conta → card "Acesso"** (`features/perfil/components/account/AccessSection.jsx`, em pessoa e ONG)
- E-mail e senha só para ver; a senha mascarada, ou "Nenhuma senha criada" quando `hasPassword` é `false`.
- Botão "Alterar senha" / "Criar senha" → `POST /forgot` com o e-mail da conta → "Enviamos um link para {e-mail}…".
- A zona de "Excluir conta" (`api-exclusao-conta.md` §7) fica no fim de "Minha conta", depois de "Dados da conta".

**`/recuperar-senha`**
- Campo de e-mail → POST `/forgot` → mensagem neutra, com a dica "Confira também a caixa de spam".
- O link "Esqueci minha senha" da tela de login aponta para cá.

**`/redefinir-senha?token=`** (rota pública em `authRoutes.jsx`, fora do `GuestRoute`)
- Ao abrir, chama `/reset/check`. Link inválido: mensagem com o botão "Pedir um novo link". Link válido: formulário com nova senha e confirmação.
- Sucesso: encerra a sessão local e vai para `/login` com o aviso "Senha redefinida. Entre com a nova senha.".
- Tira o token da barra de endereço depois de ler (`navigate` com `replace`), para ele não ficar no histórico.

**401 depois da redefinição**
- O `api.js` já desloga no 401 (`auth:unauthorized`). O login mostra "Sua sessão terminou. Entre novamente." quando chega por esse caminho.
