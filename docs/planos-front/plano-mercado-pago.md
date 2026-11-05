# Plano: fechar a API de pagamento do Mercado Pago (front)

> Criado em 04/11/2026. Parte do back, credenciais, testes e problemas encontrados: `docs/plano-mercado-pago.md`, no repositório do backend.
>
> Contrato: `docs/entrega-final/api-mercado-pago-ongs.md` (§9 é o front) e `api-campanhas-doacoes.md`.

## 1. Objetivo e decisões

O dinheiro das doações deve cair direto na conta Mercado Pago de cada ONG (regras §10.3 e texto do TCC). Para isso, a ONG precisa de uma tela para conectar a conta, e o site precisa respeitar quem não está recebendo doações.

| Decisão | Escolha |
|---|---|
| Meta para o TCC | Demonstração em sandbox + 1 Pix real de R$ 5, feito uma vez, para provar o crédito na conta |
| Prazo | Menos de 2 semanas: primeiro a doação de ponta a ponta, depois o resto |
| Hospedagem | Começa local, com túnel. Publicar é opcional e só troca as URLs |
| Conta e aplicação no Mercado Pago | João cria, seguindo o passo a passo do doc do back |
| Execução | Claude nos dois repositórios, um bloco por vez, em branch. Push e PR ficam com vocês |

## 2. Situação hoje

| Parte | Situação |
|---|---|
| Doação: formulário, QR, "copia e cola", acompanhamento a cada 3 s, histórico | Prontos e ligados na API; nunca rodaram com credenciais reais |
| `acceptingDonations` | A API já manda. O front ignora: **não está no `toFrontendCampaign`** |
| Conectar, ver e desconectar a conta | **Não existe:** sem funções no `doacoesApi.js`, sem hook, sem tela |
| Volta do OAuth (`/ong/painel/campanhas?mp=`) | A rota existe, mas ninguém lê o `?mp=` |
| Botões de doar | Aparecem mesmo sem a ONG estar recebendo. O clique só mostraria o erro 400 |

Enquanto o back usa o token provisório, a API responde `acceptingDonations: true` para toda ONG. Por isso, esta parte só faz sentido junto com a branch do back.

## 3. Ordem de execução

Mesma tabela do doc do back. `main` não muda até o Gate B passar. **Os PRs do back e do front entram juntos, depois do T2:** sem esta tela, nenhuma ONG conseguiria conectar a conta nem criar campanha.

| Etapa | Quem | O que entrega | Estimativa |
|---|---|---|---|
| **M0. Credenciais** | João | Aplicação, contas de teste, túnel e `.env.aiven` preenchido | 1 h |
| **Gate A. Orders API** | João + Claude | Doação sandbox pelo token único, no `main` atual | 30 min |
| **B1 e B2. Backend** | Claude | Doações na conta da ONG; um cliente e um webhook | 2 dias |
| **Gate B. OAuth real** | João + Claude | ONG conecta conta de teste, doa, Pix aprovado, webhook recebido | 1 h |
| **F1. Dados no front** | Claude | Serviços, hook, `acceptingDonations` | 0,5 dia |
| **F2. Conectar a conta** | Claude | Card no painel de campanhas e retorno `?mp=` | 0,5 dia |
| **F3. Bloqueios** | Claude | Formulário e botões de doar | 0,5 dia |
| **T2. Ponta a ponta** | João + Claude | Roteiro completo em sandbox no navegador | 2 h |
| **T3. Pix real de R$ 5** | **João paga** | Comprovante do crédito na conta | 1 h |
| **D1. Fechamento** | Claude | Docs atualizados e roteiro da banca | 0,5 dia |

As estimativas são aproximadas e não contam espera por revisão.

**O front começa depois do Gate B**, porque o resultado pode mudar o plano. Se o Gate B falhar de vez, vale o plano B do contrato: conta única da plataforma, sem esta tela de conexão.

## 4. Blocos do front

Branch `feature/mercado-pago-ongs`, a partir do `main`. Cada bloco passa no lint e no build sozinho.

### F1. Dados

- `features/doacoes/services/doacoesApi.js`:
  - `getMercadoPagoAccount`: `GET /ngo/mercado-pago`;
  - `connectMercadoPago`: `POST /ngo/mercado-pago/connect`;
  - `disconnectMercadoPago`: `DELETE /ngo/mercado-pago`.
- `features/doacoes/services/doacaoService.js`: acrescentar `acceptingDonations` em `toFrontendCampaign`.
- `core/services/queryKeys.js`: chave `mercadoPago.account(userId)`.
- Novo `features/doacoes/hooks/useMercadoPagoAccount.js`:
  - query da situação, só para conta de ONG, como em `useReceivedDonations`;
  - conectar: recebe a `authorizationUrl` e faz `window.location.href`;
  - desconectar: invalida a conta e `queryKeys.campanhas.all`, porque `acceptingDonations` muda.

### F2. Conectar a conta

Novo card (`features/ong/components/dashboard/MercadoPagoCard.jsx`) no topo de `features/ong/panel/pages/CampaignsPage.jsx`, acima do `OngCampaignsPanel`.

| Situação | O que aparece |
|---|---|
| Sem conta | "Conecte sua conta do Mercado Pago para receber doações", botão **Conectar** e o aviso de que a conta precisa ter **chave Pix** cadastrada |
| `CONNECTED` | Selo "Conta conectada" e **Desconectar**, via `ConfirmDialog` |
| `NEEDS_RECONNECT` | Aviso em âmbar e botão **Reconectar** |

**Erros da API:** mostrar o `message` direto (503 sem credenciais; 400 ao desconectar com PIX pendente).

**Volta do OAuth:** ler `?mp=` com `useSearchParams`, avisar pelo `notify` do `useOngPanel` e limpar a URL, para o aviso não repetir ao recarregar.

| `mp=` | Aviso |
|---|---|
| `connected` | "Conta do Mercado Pago conectada." |
| `denied` | "A conexão com o Mercado Pago foi cancelada." |
| `already_linked` | "Esta conta do Mercado Pago já está vinculada a outra ONG." |
| `error` | "Não foi possível conectar a conta do Mercado Pago. Tente de novo." |

**Ícones:** de `react-icons`, como no resto do projeto.

### F3. Bloqueios

- **Criar campanha** (`features/ong/panel/pages/CampaignFormPage.jsx`, só no modo de criação): sem conta conectada, mostrar o card da F2 no lugar do formulário.
- **Doar:** com `acceptingDonations === false` em campanha ativa, trocar o botão por "Doações indisponíveis no momento" em:
  - `features/doacoes/components/CampaignCard.jsx` (`CardAction`), usado também em `OngCampaignsTab`;
  - `features/doacoes/pages/CampaignDetailPage.jsx` (`MainAction`);
  - `features/home/components/OngShowcase/OngCampaignRow.jsx`;
  - `features/doacoes/components/HeroSosBanner.jsx`.
- **Dona da campanha** (`OwnerActions`, em `CampaignDetailPage`): se não estiver recebendo, avisar para conectar a conta no painel.

### Efeito que vocês vão ver

Ao sair o provisório do back, **todas as campanhas atuais ficam "Doações indisponíveis"** até a ONG conectar a conta. É a regra do contrato. Para a banca, conectem 1 ou 2 ONGs com as contas de teste vendedoras.

## 5. Verificação

**A cada bloco:** `npm run lint` e `npm run build`, comparando com a base de erros de antes da branch.

**T2, no navegador, com o back da branch e o Mercado Pago de teste:**

- [ ] Sem conta: o card aparece, e criar campanha mostra o aviso no lugar do formulário.
- [ ] **Conectar** leva ao Mercado Pago e volta com "conectada"; a URL fica limpa e recarregar não repete o aviso.
- [ ] Negar a autorização e usar a conta de outra ONG mostram o aviso certo.
- [ ] Criar campanha e doar: o QR aparece, a janela confirma sozinha e a barra sobe.
- [ ] **Desconectar** pede confirmação. Com PIX pendente, mostra o erro da API; sem pendente, a campanha fica "Doações indisponíveis" em todas as telas da F3.
- [ ] `NEEDS_RECONNECT`: aviso em âmbar, **Reconectar** resolve.
- [ ] Doador, dona da campanha, admin e visitante veem o botão certo.

O roteiro completo, com webhook e testes do back, está no doc do back (seção 9).

## 6. Fechamento (D1)

Atualizar no front:
- `docs/entrega-final/README.md` (situação e ordem);
- `docs/entrega-final/api-mercado-pago-ongs.md` e `api-campanhas-doacoes.md` (o que o sandbox confirmou);
- `docs/regras-de-negocios.md` §10.3 ("Ainda não implementado") e §12.

## 7. Fora do escopo

Aprovação manual de ONGs, estornos e revisão de termos de uso, que só seriam necessários para receber doações reais abertas ao público; e a publicação do site. **Se publicarem:** o front só precisa do `VITE_API_URL` certo. O resto é configuração do back.
