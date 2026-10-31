# AUcolher — Entrar com o Google

> Sem migração: `users.password` já aceita nulo e `users.provider` (`LOCAL` | `GOOGLE`) já existe.
> - **Back e front implementados neste módulo** (branch `feature/login-google` nos dois repositórios). O parceiro não precisa implementar nada: este doc registra como o fluxo funciona, as variáveis de ambiente e como criar as credenciais.
> - No front, o botão aparece sempre. Sem as credenciais do Google na API, ele leva a uma página de erro do próprio Google.

## 1. Regras de negócio

- **Só cria conta de pessoa.** O primeiro acesso de um e-mail cria uma conta `PERSON` com `provider = GOOGLE`, `password = null`, o nome e a foto do Google. ONG continua no cadastro com CNPJ e endereço, que o Google não fornece. Por isso o botão aparece no login e só na aba **Pessoa** do cadastro.
- **Mesmo e-mail, mesma conta.** Se já existe uma conta com o e-mail (de pessoa, ONG ou admin), o Google entra nela. O Google confirma que o e-mail é da pessoa. A conta mantém o `provider` e a senha, e passa a entrar das duas formas.
- **Conta banida não entra**, com a mesma frase do login por senha: "Esta conta foi suspensa pela moderação do AUcolher.".
- **Conta criada pelo Google:**
  - **não troca de e-mail** em "Minha conta": o próximo login pelo Google criaria outra conta;
  - **pode criar uma senha** pelo link de redefinição (`api-senha.md`). Depois disso, entra das duas formas;
  - exclui a conta digitando `EXCLUIR`, porque não tem senha para confirmar (`../contratos-prontos/api-exclusao-conta.md`).
- **Localização:** a conta nasce sem cidade e UF, como no cadastro de pessoa. O formulário de anunciar animal já pede as duas quando faltam.

## 2. O fluxo

```
[Front] botão "Continuar com Google"
   │  guarda a página de origem no sessionStorage
   ▼  vai para {API}/oauth2/authorization/google
[Google] tela de consentimento
   ▼  volta para {API}/login/oauth2/code/google
[API] CustomOAuth2UserService: acha a conta pelo e-mail ou cria a de pessoa
   │  OAuth2AuthenticationSuccessHandler:
   │    conta banida → redireciona para {FRONT}/login/google?error=suspended
   │    senão        → gera um código de uso único → {FRONT}/login/google?code=abc
   │  OAuth2AuthenticationFailureHandler (cancelou no Google, erro) → {FRONT}/login/google?error=failed
[Front] /login/google: POST /api/auth/google/exchange { code } → { token, type, user }
   ▼  abre a sessão como no login por senha e volta à página de origem
```

**Por que o código de troca?** O login com o Google termina numa página da API (`/login/oauth2/code/google`), e não no front. Daí para o front a API só tem um redirecionamento. Se o token fosse na URL, ele ficaria no histórico do navegador e nos logs. Por isso a API manda um **código** curto, que o front troca pelo token numa chamada `POST`:
- o código só vale uma vez;
- expira em 60 segundos;
- sozinho, não abre nada.

## 3. Endpoints

### `GET /oauth2/authorization/google` (do Spring)
Começa o fluxo. O front navega para essa URL (`window.location`), sem `axios`, porque ela redireciona para o Google. A origem vem da `VITE_API_URL`: `http://localhost:8080/api` vira `http://localhost:8080/oauth2/authorization/google`.

### `GET /login/oauth2/code/google` (do Spring)
É a volta do Google. O Spring confere o `state`, troca o código do Google pelos dados da conta e chama o `CustomOAuth2UserService` e depois o success handler ou o failure handler. Essa URL precisa estar cadastrada como **URI de redirecionamento** no Google Cloud (§6).

### `POST /api/auth/google/exchange` (público)

```json
{ "code": "q3Jx...43 caracteres" }
```

| Status | Quando | Corpo |
|---|---|---|
| 200 | Código válido | O `AuthResponseDTO`, **o mesmo** do `POST /api/auth/login`: `{ "token", "type": "Bearer", "user": UserResponseDTO }` |
| 400 | Código vazio, desconhecido, já usado ou vencido | `message`: "O login com o Google expirou. Tente novamente." |
| 403 | A conta foi banida entre o Google e a troca | `message`: "Esta conta foi suspensa pela moderação do AUcolher." |

## 4. Redirecionamentos para o front

Todos vão para `{FRONTEND_URL}/login/google`:

| Query | Quando | O front faz |
|---|---|---|
| `?code=...` | Login com o Google concluído | Troca o código (§3) e volta à página de origem, ou ao início do papel |
| `?error=suspended` | Conta banida | Volta ao login com a frase da suspensão |
| `?error=failed` | A pessoa cancelou no Google ou houve erro no OAuth | Volta ao login com "Não foi possível entrar com o Google. Tente novamente." |

## 5. Configuração

**Backend** (variáveis de ambiente, fora do Git):

| Variável | Para quê | Padrão |
|---|---|---|
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth (§6) | texto de exemplo, que não funciona |
| `GOOGLE_CLIENT_SECRET` | Chave secreta do cliente (§6) | texto de exemplo, que não funciona |
| `FRONTEND_URL` | Para onde a API redireciona depois do Google (o mesmo valor da senha e do Mercado Pago) | `http://localhost:5173` |

**Front** (`.env`):

| Variável | Para quê |
|---|---|
| `VITE_API_URL` | A mesma de sempre. A URL de início do fluxo sai da origem dela |

## 6. Criar as credenciais no Google Cloud

1. Acesse https://console.cloud.google.com, entre com a conta Google do projeto e **crie um projeto** (por exemplo, "AUcolher").
2. **Tela de consentimento OAuth** ("Google Auth Platform" → "Branding" e "Audience"):
   - tipo de usuário **Externo**;
   - nome do app "AUcolher" e o e-mail de suporte;
   - escopos: só os básicos, `email`, `profile` e `openid` (são os que a API pede);
   - enquanto o app estiver em **modo de teste**, só entram os e-mails da lista **Usuários de teste**. Adicione os seus e os da banca, se for demonstrar.
3. **Credencial** ("Clients" → "Criar cliente" ou "Credenciais" → "Criar credenciais" → "ID do cliente OAuth"):
   - tipo de aplicativo: **Aplicativo da Web**;
   - **Origens JavaScript autorizadas:** `http://localhost:5173`;
   - **URIs de redirecionamento autorizados:** `http://localhost:8080/login/oauth2/code/google`. Tem que ser exatamente esse endereço, sem barra no fim.
4. Copie o **ID do cliente** e a **Chave secreta do cliente**.
5. **No IntelliJ:** Run → Edit Configurations → a configuração da API → **Environment variables**, e adicione:
   ```
   GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com;GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
   ```
   Reinicie a API.
6. **No front:** nada a configurar; o botão já aparece.

**Em produção:**
- cadastre também a origem e a URI com os endereços publicados (`https://...`);
- defina `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `FRONTEND_URL` no servidor da API;
- para qualquer conta Google entrar, publique o app na tela de consentimento. Com só os escopos básicos, não precisa de verificação do Google.

## 7. Implementação (backend)

| Arquivo | Papel |
|---|---|
| `security/CustomOAuth2UserService` | Acha a conta pelo e-mail ou cria a de pessoa, com nome e foto do Google |
| `security/OAuth2AuthenticationSuccessHandler` | Recusa a conta banida e redireciona para o front com o código |
| `security/OAuth2AuthenticationFailureHandler` | Redireciona para o front com `error=failed` |
| `security/GoogleLoginCodeStore` | Os códigos de troca: 32 bytes aleatórios (`SecureRandom`), de uso único, válidos por 60 s, guardados em memória |
| `auth/AuthController` + `AuthService.exchangeGoogleCode` | `POST /api/auth/google/exchange` |
| `config/SecurityConfig` | `/oauth2/**` e `/login/oauth2/**` são públicos; o `oauth2Login` registra os dois handlers |

**Notas:**
- **Os códigos ficam em memória.** Com uma só instância da API, isso basta. Reiniciar a API entre o Google e a troca só faz a pessoa clicar de novo. Com várias instâncias, o código iria para o banco.
- **Sessão HTTP:** a API é stateless, mas o Spring guarda o `state` do OAuth2 numa sessão HTTP curta durante a ida e a volta do Google. É o comportamento padrão do `oauth2Login`. O JWT continua sendo a única autenticação das rotas `/api`.

## 8. Implementação (front)

| Arquivo | Papel |
|---|---|
| `features/auth/components/GoogleLoginButton.jsx` | O botão. Guarda a página de origem e vai para a API |
| `features/auth/pages/GoogleCallbackPage.jsx` | A rota `/login/google`: troca o código uma vez só e abre a sessão, ou volta ao login com o aviso |
| `core/services/authService.js` → `exchangeGoogleCode` | `POST /auth/google/exchange`, com o mesmo mapeamento do login |
| `core/context/AuthContext.jsx` → `loginWithGoogle` | Abre a sessão como no login por senha |
| `LoginPage.jsx` / `RegisterPage.jsx` | O botão no login e na aba Pessoa do cadastro, e o aviso de erro no login |
