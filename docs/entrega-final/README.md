# AUcolher — Entrega final: plano de front, back e banco

> Escrito em 15/10/2026. Junta o que **já estava pendente**, que vem do `plano-backend-restante.md`, com o que **entrou no escopo em 14/10**. Esse segundo grupo está nas regras em `regras-de-negocios.md` §2.1, §3.3, §9.3 e §10.3:
> - devolução e reabandono;
> - trocar e recuperar senha;
> - excluir conta;
> - conta do Mercado Pago por ONG;
> - página "Meus animais".
>
> **Meta:** o sistema completo até **29/11/2026**, em 3 *sprints* de 2 semanas.
>
> **Quem faz o quê:**
> - **parceiro:** backend e banco;
> - **front:** o usuário, com o Claude.

> **Atualizado em 15/10/2026 — adiantado da S2/S3:** o backend do reabandono (012) e todo o pacote do admin (stats com `returns`, listas, denúncias e moderação, 014) já estão prontos, nas branches `feature/devolucao-reabandono` e `feature/admin-api` do back, mais `feature/admin-api-real` do front. As duas migrações foram aplicadas no `aucolher_db`. **Campanhas e doações continuam no mock:** o stats devolve `donations`, `campaigns` e `ngoRanking.byRaised` zerados, e o front os completa com o `doacoesMock` enquanto `VITE_USE_MOCK_CAMPANHAS` estiver ligada. Quando a 007 entrar no back, esses blocos e `/api/admin/campaigns` (lista e remoção) passam a ser dela. As mensagens de sistema `ANIMAL_RETURNED`/`ANIMAL_REHOMED` esperam o chat (011).

## 1. Arquivos desta pasta

| Arquivo | O que tem |
|---|---|
| `README.md` | Este plano: cronograma, migrações, variáveis de ambiente, riscos e checklist |
| `api-mercado-pago-ongs.md` | Conexão da conta Mercado Pago de cada ONG (OAuth) e o que muda no contrato de campanhas |
| `api-senha.md` | Recuperar e alterar a senha pelo link do e-mail, derrubando as sessões (v2: sem "trocar senha" com a atual) |
| `api-exclusao-conta.md` | Excluir a própria conta (anonimização e efeitos) |
| `api-devolucao-reabandono.md` | "Animal retornado", "Republicar anúncio", score congelado e taxa de reabandono |

**Página "Meus animais":** é só front e está descrita na seção 4 deste arquivo. A parte que depende do back está no `api-devolucao-reabandono.md`.

**Contratos que continuam valendo** (na pasta `docs/`):
- `api-campanhas-eventos.md` §6, com as mudanças do `api-mercado-pago-ongs.md`;
- `api-perfil-ong.md` (banner);
- `api-chat.md`;
- `api-admin.md`;
- `api-denuncias-moderacao.md`.

Os contratos seguem o padrão dos anteriores:
- regras → DTOs → endpoints → notas de Spring → SQL → front;
- rotas, campos e enums em inglês;
- erros no `ErrorResponseDTO`, com a frase pronta em `message`.

## 2. Cronograma

As datas são de segunda a domingo. Em cada *sprint*, o back entrega as rotas **na primeira semana**, e o front liga as telas **na segunda**. Antes disso, o front já pode montar as telas a partir do formato do contrato.

| Sprint | Datas | Backend + banco (parceiro) | Frontend (usuário + Claude) |
|---|---|---|---|
| Preparação | 15/10–18/10 | Ler os contratos. **Teste no sandbox do Mercado Pago** (`api-mercado-pago-ongs.md` §6): OAuth de um vendedor de teste, PIX criado com o token dele, webhook chegando | Revisar os contratos com o parceiro |
| **S1** | 19/10–01/11 | Campanhas e doações já com a conta MP por ONG (migrações 007 e 009); banner da ONG (008) | Ligar campanhas na API; "Conectar Mercado Pago" no painel da ONG e bloqueios; campo de banner; **página "Meus animais" + editar anúncio de pessoa** (sem back novo) |
| **S2** | 02/11–15/11 | Chat (011); recuperar e alterar senha por e-mail + derrubar sessões (010); devolução e repasse + score congelado (012); excluir conta (013) | Chat na API; desligar `VITE_USE_MOCK_SENHA` (`/recuperar-senha`, `/redefinir-senha` e o "Alterar senha" de Minha conta já estão prontos); botões **"Animal retornado"** e **"Republicar anúncio"**; excluir conta |
| **S3** | 16/11–29/11 | Pacote admin: `stats` (com o bloco `returns`) + denúncias e moderação (014) | Admin na API (desligar `VITE_USE_MOCK_ADMIN` e `VITE_USE_MOCK_DENUNCIAS`); card de reabandono + PDF; interceptor do 403 de conta suspensa; publicação e teste de ponta a ponta |
| Fechamento | 30/11 → | Correções | Prints das telas e diagramas para o TCC |

**Por que essa ordem:**
- **S1 começa por campanhas:** o parceiro já está nelas, e a conta MP por ONG muda o jeito de criar o PIX. É melhor mudar o rumo agora do que refazer depois.
- **Excluir conta fica na S2, antes da moderação:** como a exclusão é definitiva, ela muda o status das coisas direto (ver `api-exclusao-conta.md`) e não depende da cascata do banimento.
- **`stats` e moderação saem juntos na S3:** o front liga as duas partes com a mesma flag (`plano-backend-restante.md` §3).

**Se atrasar**, o que pode escorregar, nesta ordem:
1. o banner da ONG, que é só visual;
2. o aviso por e-mail de "senha alterada", que é opcional (`api-senha.md`);
3. a exportação em PDF do card de reabandono. O card na tela fica.

## 3. Migrações (renumeradas na ordem das sprints)

As antigas 009 (chat) e 010 (denúncias) ainda não existiam, então foram renumeradas. Os contratos antigos apontam para cá.

| Nº | Arquivo | Sprint | Conteúdo | SQL em |
|---|---|---|---|---|
| 007 | `007_campaigns.sql` | S1 | `campaigns`, `donations` (**com `ngo_id`**, ver `api-mercado-pago-ongs.md` §5) | `api-campanhas-eventos.md` §6.7 |
| 008 | `008_ngo_cover.sql` | S1 | `users.cover_url` | `api-perfil-ong.md` §2.5 |
| 009 | `009_mercado_pago_accounts.sql` | S1 | `mercado_pago_accounts` | `api-mercado-pago-ongs.md` §8 |
| 010 | `010_password_security.sql` | S2 | `users.password_changed_at`, `password_reset_tokens` | `api-senha.md` §7 |
| 011 | `011_chat.sql` | S2 | `chat_messages`, `chat_reads` (+ eventos `ANIMAL_RETURNED` e `ANIMAL_REHOMED`) | `api-chat.md` §5 |
| 012 | `012_adoption_returns.sql` | **feita (15/10)** | status `RETURNED` / `REHOMED`, score congelado, dados da devolução, `animals.origin_request_id` | `api-devolucao-reabandono.md` §7 |
| 013 | `013_account_deletion.sql` | S2 | `users.deleted_at`, motivo `ACCOUNT_DELETED` | `api-exclusao-conta.md` §6 |
| 014 | `014_reports_moderation.sql` | **feita (15/10)** | `reports` + ajustes de moderação (sem o bloco de `campaigns`: a 007 cria `campaigns.removed_by_moderation` direto no `CREATE TABLE`) | `api-denuncias-moderacao.md` §5 |
| 015 | `015_drop_institutional_email.sql` | **feita (15/10)** | remove `users.institutional_email`; o contato público da ONG é o e-mail de login (`PublicProfileDTO.email`, só ONG) | branch `feature/remove-institutional-email` do back |

**Dependências que exigem cuidado:**
- **A 011 (chat) precisa da 012:** a CHECK de `chat_messages.system_event` inclui `ANIMAL_RETURNED` e `ANIMAL_REHOMED`. As duas são da mesma sprint, então tanto faz qual sai primeiro, desde que a CHECK já nasça com os 6 eventos.
- **CHECKs de `adoption_requests`:** a 012 recria a de `status`, a 013 recria a de `cancel_reason`, e a 014 recria a de `cancel_reason` de novo (com `ACCOUNT_BANNED` e `LISTING_REMOVED`). **Cada uma precisa manter os valores das anteriores.** Na 014, a lista final é:
  - `ADOPTER_WITHDREW`;
  - `OWNER_WITHDREW`;
  - `ANIMAL_ADOPTED`;
  - `ANIMAL_UNAVAILABLE`;
  - `ACCOUNT_DELETED`;
  - `ACCOUNT_BANNED`;
  - `LISTING_REMOVED`.
- **A 014 altera `campaigns`**, então roda depois da 007, como já era.

**O padrão das migrações não muda:**
- cabeçalho com o que muda e o comando `psql`;
- `BEGIN`/`COMMIT`;
- `IF NOT EXISTS`, e `DROP CONSTRAINT IF EXISTS` antes de recriar;
- `COMMENT ON` nas colunas novas.

**Depois de cada migração:**
- atualizar o `sql/schema.sql`;
- atualizar a cópia do front, `docs/script_banco_aucolher.sql`;
- acrescentar a seção no README do backend.

## 4. Página "Meus animais" (só front, S1 e S2)

**Hoje:** a pessoa física **não consegue editar um anúncio**. `/animais/editar/:id` e `/meus-anuncios` são `PlaceholderPage` (`routers/protectedRoutes.jsx`). Só a ONG edita, pelo painel (`features/ong/panel/pages/AnimalFormPage.jsx`). A API já tem tudo o que precisa:
- `GET /api/animals/mine`;
- `PUT /api/animals/{id}`;
- `PATCH /api/animals/{id}/status`;
- `DELETE /api/animals/{id}`, que é exclusão lógica: o animal vira `INACTIVE`.

**O que fazer:**
- **Rota e link.** Rota nova `/meus-animais`, só para pessoa física, com o link "Meus animais" na `PlatformSidebar`, perto de "Cadastrar animal". A ONG continua usando o painel.
- **Aba "Anunciados por mim":**
  - lista com `useMyAnimals` (`features/animais/hooks/useAnimais.js`);
  - selos de status iguais aos do `OwnerListingPanel`;
  - ações: **editar**, **tirar do ar / reativar**, **marcar como adotado** e **excluir**.
  - Animal adotado não edita: é regra da API.
- **Aba "Adotados por mim":** os pedidos enviados com status `CONCLUDED`, `RETURNED` ou `REHOMED` (`GET /api/adoption-requests/sent`), com o card do animal e a situação.
- **Editar anúncio:**
  - `/animais/editar/:id` passa a usar o `AnimalFormWizard` (`features/animais/components/create/`) em modo edição, com o `updateAnimal` de `features/animais/services/animalService.js`;
  - `features/ong/panel/pages/AnimalFormPage.jsx` já faz isso no painel: reaproveitar a lógica de carregar e salvar;
  - a página confere se o anúncio é da conta logada. Se não for, mostra uma mensagem de permissão, como a edição de campanha.
- **Redirecionamentos:**
  - `/meus-anuncios` → `/meus-animais`;
  - a seção "Meus animais" de Minha conta vira um link para a página nova, para não duplicar a lista.
- **S2:** entram os botões **"Animal retornado"** (nos adotados da aba 1) e **"Republicar anúncio"** e **"Desisti de doar"** (na aba 2), descritos no `api-devolucao-reabandono.md` §8.
- **Adiantado em 15/10:** a página e os botões foram feitos de uma vez no front (branch `feature/meus-animais-reabandono`), com o reabandono num mock local (`VITE_USE_MOCK_REABANDONO`) até as rotas da 012 existirem.

## 5. Variáveis de ambiente novas (backend)

| Variável | Para quê | Exemplo |
|---|---|---|
| `FRONTEND_URL` | Montar o link de redefinição de senha e a volta do OAuth do Mercado Pago | `http://localhost:5173` |
| `MAIL_USERNAME` | Conta Gmail do projeto | `aucolher.app@gmail.com` |
| `MAIL_PASSWORD` | **Senha de app** do Gmail (não é a senha da conta) | `abcd efgh ijkl mnop` |
| `MP_CLIENT_ID` | ID da aplicação do AUcolher no Mercado Pago | `1234567890123456` |
| `MP_CLIENT_SECRET` | Secret da aplicação | — |
| `MP_REDIRECT_URI` | URL de retorno do OAuth, **igual** à cadastrada na aplicação do MP | `https://api.../api/mercado-pago/oauth/callback` |
| `MP_WEBHOOK_SECRET` | Assinatura secreta dos webhooks (painel do MP → Webhooks) | — |
| `MP_TOKEN_ENCRYPTION_KEY` | Chave AES de 32 bytes em Base64 para criptografar os tokens das ONGs | `openssl rand -base64 32` |
| `MP_TEST_TOKEN` | `true` em desenvolvimento: o OAuth gera credenciais de teste | `true` |

**Regras:**
- nada disso vai para o Git;
- sem `MAIL_*`, o link de senha sai **no log** da API, como o `AdminAccountInitializer` faz quando falta configuração;
- sem `MP_*`, a conexão do Mercado Pago responde 503 "Pagamentos indisponíveis no momento." e o resto do sistema funciona.

## 6. Riscos

| Risco | O que fazer |
|---|---|
| O PIX criado com o token OAuth da ONG não funciona, ou o webhook não chega para os pagamentos dela | O teste da preparação decide. Se falhar, **plano B**: conta única da plataforma, com repasse às ONGs registrado no painel (regras §10.3) |
| O Mercado Pago não aceita `localhost` como URL de retorno do OAuth | Testar com a API publicada ou com um túnel (ngrok). O resto do desenvolvimento segue com o mock do front |
| O e-mail do Gmail cai no spam | Assunto e texto simples, remetente com nome ("AUcolher"). A página de recuperação avisa para olhar o spam |
| Carga do parceiro | Seguir a ordem de corte da seção 2. O front não fica parado: tudo pode ser montado a partir do contrato antes da rota existir |

## 7. Checklist de cada entrega (backend)

- [ ] Migração numerada + `sql/schema.sql` + seção no README do backend.
- [ ] Entidades, enums e DTOs com os **nomes exatos** do contrato (`@JsonProperty("isX")` nos booleanos).
- [ ] Regras no `SecurityConfig`: rotas fixas antes das genéricas, e rotas públicas só onde o contrato manda.
- [ ] Mensagens de erro **iguais** às dos contratos, porque o front mostra o `message` direto.
- [ ] Testes de unidade das regras (no padrão do `AdoptionRequestServiceTest`) e um teste HTTP de ponta a ponta num banco descartável.
- [ ] Avisar o front quando a rota estiver no ar e qual flag pode ser desligada.
