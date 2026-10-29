# Plano do front: cada módulo pronto para ligar na API

## Contexto

O parceiro implementa o backend a partir dos contratos desta pasta. O front deixa a chamada de cada API já escrita, atrás de uma flag `VITE_USE_MOCK_*`:
- **até a entrega**, a flag fica ligada e um mock no `localStorage` responde no lugar, com os mesmos DTOs, então o site funciona inteiro;
- **na entrega**, o front põe a flag em `false` no `.env` e passa a usar a API.

### O sistema cai se uma rota ainda não existir?

Não.
- **Erro de API não derruba o site.** O axios rejeita, o react-query guarda o erro e a tela mostra uma mensagem ou fica vazia. Uma tela de erro geral só aparece se um componente quebrar ao renderizar.
- **Rota que ainda não existe:**
  - com login, o Spring responde 404;
  - sem login, responde 401, e o `auth:unauthorized` chama `logout()`, que sem sessão não faz nada.
- **O mock ligado até a entrega evita até isso.** Desligar a flag antes da hora deixaria só aquele módulo vazio ou com erro.

### O que falta

**Backend (parceiro), na ordem do `README.md` §3:**

| # | Entrega | Migração | Front |
|---|---|---|---|
| 1 | ~~Campanhas e doações, mais a parte delas no admin~~ | 007 | ✅ feito: só API, mock removido |
| 2 | Conta Mercado Pago por ONG | 009 | a fazer |
| 3 | Senha (recuperar e alterar pelo link, derrubar sessões, `hasPassword`) | 010 | mock, adaptador da API pronto |
| 4 | Chat (6 mensagens de sistema) | 011 | parte 2 deste plano |
| 5 | ~~Excluir conta~~ | 013 | ✅ feito: só API, mock removido |

**Frontend:**
- o chat (parte 2). ~~Excluir conta~~ (parte 3): feito, o front usa só a API e o mock saiu do código (`../contratos-prontos/api-exclusao-conta.md` §7);
- conectar o Mercado Pago (`api-mercado-pago-ongs.md` §9);
- a cada entrega do parceiro: desligar a flag e testar. ~~Campanhas~~: feito, o front usa só a API e o mock saiu do código (`api-campanhas-doacoes.md` §9);
- pendências pequenas:
  - `/minhas-avaliacoes` ainda é `PlaceholderPage`;
  - "Salvar no calendário" para Outlook e iCal só faz `console.log`. Dá para gerar o `.ics` no próprio navegador;
- ~~faxina dos mocks cuja flag já estava desligada~~: feito. Eventos, admin, moderação, reabandono, denúncias e campanhas já saíram do código.

**Geral:**
- publicar a API, o banco e o front, e fazer o teste de ponta a ponta;
- prints e diagramas para o TCC.

### Excluir conta

Entra pelo direito de eliminação dos dados da LGPD (art. 18, VI). Ficou mais barata do que parecia: o backend já tem a cascata do banimento (`AdoptionRequestService.cancelAllForAccount`, chamado pelo `ModerationService`), e o `JwtAuthenticationFilter` já recusa token de conta inativa. A exclusão reaproveita os dois.

---

## Parte 1: organizar os docs

```
docs/
  README.md                  índice
  regras-de-negocios.md
  entrega-final/             ← o que mandar ao parceiro
  contratos-prontos/         contratos já implementados (referência)
  planos-front/              planos do front já executados
  *.sql                      scripts do banco de desenvolvimento
```

- **Sem datas de entrega:** cronograma, sprints, "Escrito em", "Atualizado em" e status de branch saíram de todos os `.md`. Fica o conteúdo: regras, DTOs, rotas, SQL e o que muda no front.
- **`api-campanhas-doacoes.md`** junta a antiga §6 de `api-campanhas-eventos.md`, as mudanças do Mercado Pago e a parte de campanhas do admin e da moderação. O parceiro não precisa abrir os contratos prontos.
- **`plano-backend-restante.md` saiu:** o `README.md` desta pasta é o mapa.

## Parte 2: chat pronto para a API

Trio **fachada / api / mock**, como em eventos (`features/eventos/services/eventoService.js`), seguindo `api-chat.md` §2, §3, §3.1 e §6.

**C1. Adaptadores e flag**
- `core/utils/constants.js`: `USE_MOCK_CHAT` (`VITE_USE_MOCK_CHAT`, mock por padrão), `CHAT_POLL_MS = 3000` e `CHAT_SUMMARY_POLL_MS = 20000`.
- `features/chat/services/chatApi.js`: `getSummary()`, `listMessages(requestId, after)`, `sendMessage(requestId, text)`, `markRead(requestId, lastMessageId)`.
- `features/chat/services/chatMock.js`: as mesmas funções sobre o `localStorage`, com os mesmos DTOs (`type USER|SYSTEM`, `systemEvent`, `createdAt`).
  - **Mensagens antigas:** converte o formato antigo de `chat_messages_{id}`.
  - **Leitura:** guarda o `lastReadMessageId` por usuário. Na primeira vez, deriva da última leitura antiga, para o badge não "acender".
  - **Regras do envio:** as do contrato (1–1000 caracteres, só em `ACCEPTED`), com as mesmas frases de erro.
  - **`recordSystemEvent`:** faz o papel do backend, que cria a mensagem de sistema na troca de status.
- `features/chat/services/chatService.js` vira a fachada:
  - escolhe o adaptador pela flag;
  - converte o DTO no modelo da tela;
  - monta o texto pt-BR dos 6 `systemEvent`;
  - expõe `recordStatusEvent`, que no mock grava e com a API não faz nada.
- `core/services/queryKeys.js`: as chaves do chat.

**C2. Hooks com react-query e polling** (o mesmo código para mock e API)
- **`useChatMessages`:** histórico + `?after=último id` a cada 3 s, só com a aba visível. O envio põe a mensagem devolvida no cache na hora e mostra o erro da API.
- **`useChatUnread`:** o summary a cada 20 s. O formato devolvido não muda, então `Navbar`, lista de conversas e painel da ONG continuam iguais.
- **`ChatConversationPanel`:** `markRead` com a última mensagem na tela, estado de erro, `maxLength={1000}`.

**C3. Mensagens de sistema saem do front**
- **`useConcludeAdoption`:** troca o texto injetado por `recordStatusEvent(requestId, código)` e recarrega a conversa.
- **Saem:** `core/utils/chatSystemMessage.js` e o `localStorage` espalhado pelos hooks (ele fica só no mock).

**C4. Docs:** `api-chat.md` §6 e o `README.md` §2 marcam o front como pronto.

## Parte 3: excluir conta pronto para a API

> ✅ **Concluída.** A rota existe (migração 013), e o front usa só a API: o mock, a flag e o bloqueio de login do mock saíram do código, e o admin não vê a seção. O que segue é o registro de como a parte foi planejada.

`../contratos-prontos/api-exclusao-conta.md` §1–4 e §7: `POST /api/users/me/deletion`, com `{ password }` ou `{ confirmation: "EXCLUIR" }`.

**E1. Serviço, flag e mock**
- `USE_MOCK_EXCLUSAO` (`VITE_USE_MOCK_EXCLUSAO`, mock por padrão).
- **`deleteMyAccount(body)`** na fachada `features/perfil/services/userService.js`. O mock valida como o contrato:
  - admin → 403;
  - a senha é conferida de verdade por um login na API;
  - sem senha, exige `EXCLUIR`.
  - No sucesso, guarda a conta como excluída: o login dela passa a ser recusado no mock.
- **Limitação do mock:** a cascata (anúncios, pedidos, campanhas) não é simulada.

**E2. Tela**
- "Zona de perigo" no fim de Minha conta (pessoa e ONG), com `ConfirmDialog` na variante perigo:
  - lista o que acontece;
  - pede a senha ou `EXCLUIR`;
  - mostra o erro da API.
- **Sucesso:** logout, home e o toast "Sua conta foi excluída.".

**E3. Textos e admin**
- `ACCOUNT_DELETED` nos textos de cancelamento ("Cancelado — conta excluída") e na faixa de conversa encerrada.
- **Admin:** selo "Excluída" e sem "Reativar" quando houver `deletedAt`.

**E4. Docs:** `../contratos-prontos/api-exclusao-conta.md` §7 e o `README.md` §2 marcam o front como pronto.

---

## Verificação

- **Lint e build:** `npm run lint` e `npm run build` a cada bloco.
- **Chat:**
  - conversão das mensagens antigas;
  - polling entre duas abas e duas contas;
  - o badge zera ao abrir;
  - as mensagens de sistema aparecem ao confirmar a entrega e ao concluir;
  - o envio é recusado em `AWAITING_DELIVERY`.
- **Com a flag desligada antes da entrega** (`VITE_USE_MOCK_CHAT=false`): o badge fica em 0, a conversa mostra o erro e o resto do site segue normal.
- **Excluir conta** (feito, contra a API):
  - senha errada → "Senha incorreta.";
  - conta sem senha → `EXCLUIR`;
  - logout e toast;
  - o login antigo recusado pela API (401);
  - o admin não vê a seção.
