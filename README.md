# AUcolher 

**Plataforma inteligente de adoção responsável de animais, com algoritmo de matchmaking comportamental (AUmatch).**

> Trabalho de Conclusão de Curso do Técnico em Informática — CEDUP Abílio Paulo (Criciúma/SC), 2026.

🖥️ **Front-end:** este repositório · ⚙️ **Back-end:** [joaouggdmn/api-aucolher](https://github.com/joaouggdmn/api-aucolher) 

---

## Sobre o projeto

Muitas adoções dão errado porque o estilo de vida do adotante não combina com o comportamento do animal. O AUcolher conecta **adotantes**, **protetores independentes** e **ONGs** e usa o **AUmatch**, um algoritmo de compatibilidade, para sugerir pets que realmente se encaixam no perfil de cada pessoa.

A hipótese central do TCC é que adotar com base em compatibilidade comportamental reduz a **taxa de reabandono**. A plataforma registra o que acontece depois da adoção e calcula essa taxa, para verificar se adoções com alta compatibilidade são menos devolvidas.

## Principais funcionalidades

- **AUmatch** — interface de *swipe* gamificada (arrastar com mouse ou toque) que mostra os animais ordenados por compatibilidade, com a pontuação de cada critério.
- **Quiz de estilo de vida** — 7 perguntas sobre moradia, rotina, tempo fora de casa, quem mora junto, espécie, perfil ideal de pet e porte.
- **Anúncios de animais** — qualquer conta (pessoa ou ONG) anuncia, com fotos, saúde, comportamento e história. A vitrine tem filtros por espécie, porte, idade, energia, temperamento e cidade, além de **favoritos**.
- **Pedidos de adoção** — fluxo completo: pendente → aceito → aguardando entrega → concluído, com regras de quem pode fazer cada transição.
- **Chat** — liberado quando o dono aceita o pedido e travado na entrega.
- **Avaliações** — depois da adoção, adotante e dono avaliam um ao outro; o perfil público mostra média e distribuição das notas.
- **Retorno e repasse** — o dono registra a devolução de um animal, ou o adotante republica o anúncio. Os dois casos alimentam a taxa de reabandono.
- **Eventos das ONGs** — com confirmação de presença e limite de vagas.
- **Campanhas e doações por Pix** — cada ONG conecta a própria conta do **Mercado Pago** (OAuth) e o dinheiro das doações cai direto nela, sem passar pela plataforma e sem comissão. O doador paga pelo QR Code ou pelo "copia e cola", e a doação se confirma sozinha. Testado com Pix real.
- **Perfil público da ONG** — banner, equipe, horário de visitas, redes sociais e as abas de animais, campanhas, eventos e avaliações.
- **Autenticação** — e-mail e senha ou **login com Google (OAuth2)**, com JWT e rotas protegidas por perfil: pessoa, ONG e administrador. A senha é recuperada ou trocada por um link enviado ao e-mail, e a própria pessoa pode excluir a conta.
- **Denúncias e painel do administrador** — estatísticas, moderação (banir, reativar, editar e remover anúncios, contas, eventos e campanhas) e a taxa de reabandono.
- **Assistente de suporte com IA** — um balão em todas as telas tira dúvidas sobre o uso da plataforma com o **Google Gemini**, chamado só pelo back-end. Ele só responde (não age na conta), avisa para não enviar dados pessoais e tem limite de mensagens. A conversa fica no navegador, sem tabela no banco.

## Como o AUmatch funciona

A compatibilidade vai de 0 a 100 e soma seis critérios:

| Critério | Pontos | O que compara |
| --- | :---: | --- |
| Energia | 20 | rotina de exercícios do adotante × nível de energia do animal |
| Independência | 20 | tempo fora de casa × independência do animal |
| Moradia | 15 | em apartamento, só pontua se o animal se adapta; casa e sítio pontuam cheio |
| Convivência | 15 | crianças, cães e gatos em casa × o que o animal tolera |
| Temperamento | 15 | perfil ideal de pet × temperamento do animal |
| Porte | 15 | porte preferido × porte do animal |

Nas escalas (energia, independência e porte), nível igual vale o máximo, nível vizinho vale 40% e nível oposto vale 0. O deck mostra primeiro os animais com maior pontuação, e o empate é decidido pelo anúncio mais recente.

O cálculo roda na API (`MatchScoreCalculator`, coberto por testes). O front-end mantém uma cópia em `features/aumatch/utils/matchScore.js` para exibir a pontuação, então qualquer mudança de regra precisa ser feita nos dois lugares.

## Taxa de reabandono

Quando uma adoção é concluída, a API **congela** o score de compatibilidade daquele momento. Se depois a adoção termina em **devolução** ao doador ou em **repasse** para outra pessoa, ela conta como reabandono. O painel do administrador mostra a taxa geral, os motivos mais comuns e a taxa por faixa de compatibilidade (alta, média e baixa). Adoções feitas por ONG ficam fora do cálculo, porque são resgates e não adoções finais.

## Tecnologias

**Front-end (este repositório)**

| Camada | Tecnologia |
| --- | --- |
| Base | React 19 · Vite 8 · React Router 7 · Tailwind CSS 4 |
| Dados | Axios · TanStack React Query 5 |
| Estado | Context API (sessão, favoritos e pedidos de adoção) |
| Outros | qrcode.react (QR Code do Pix) · react-icons |

**Back-end** ([api-aucolher](https://github.com/joaouggdmn/api-aucolher))

| Camada | Tecnologia |
| --- | --- |
| Base | Java 17 · Spring Boot 3.3 · Spring Data JPA · Bean Validation |
| Segurança | Spring Security · OAuth2 Client (Google) · JWT (JJWT) · BCrypt |
| Banco de dados | PostgreSQL |
| Integrações | Mercado Pago (OAuth e Orders API, para o Pix) · Spring Mail (e-mail de senha) · Google Gemini (assistente de suporte) |
| Testes | JUnit 5 · Mockito · MockMvc |

## Arquitetura do front-end

O código é organizado por **features** (*feature-sliced*): cada funcionalidade tem a sua pasta, com páginas, componentes, hooks e serviços. O que várias telas usam fica em `core/`.

```
src/
├── core/
│   ├── components/      # layout (navbar, sidebar, rodapé) e componentes de interface
│   ├── context/         # AuthContext, FavoritesContext, AdoptionRequestContext
│   ├── guards/          # PrivateRoute, GuestRoute, PessoaRoute, OngRoute, ParticipantRoute, AdminRoute
│   ├── hooks/           # ex.: useProfileCompletion, useReceivedRequests
│   └── services/        # api.js (Axios com o token), queryKeys e APIs públicas (IBGE, ViaCEP, BrasilAPI)
├── features/
│   ├── auth/            # login, cadastro e senha
│   ├── animais/         # anúncios e vitrine
│   ├── aumatch/         # swipe, quiz e cálculo de compatibilidade
│   ├── adocao/          # pedidos de adoção
│   ├── doacoes/         # campanhas, Pix e conta do Mercado Pago
│   ├── ong/             # painel e perfil da ONG
│   └── ...              # chat, eventos, avaliações, denúncias, admin etc.
└── routers/             # rotas públicas, de autenticação e protegidas
```

Decisões de projeto:

- **Padrão em inglês nos dois lados.** Código, campos, rotas e valores de enum usam inglês. Os textos exibidos ao usuário ficam em português.
- **Regras importantes ficam no servidor.** O front-end só esconde botões; quem valida cada transição do pedido de adoção e cada permissão é a API.
- **Banco de dados controlado por script.** O Hibernate só valida o schema (`ddl-auto=validate`); as tabelas vêm de `sql/schema.sql`, e mudanças em bancos existentes vão em migrações numeradas e transacionais.
- **Concorrência tratada no banco.** Um índice único parcial impede dois pedidos vivos para o mesmo animal, e a conclusão da adoção trava o animal com `SELECT ... FOR UPDATE`.
- **Perfil do AUmatch em tabela própria** (`match_profiles`, 1:1 com `users`), para o quiz poder mudar sem mexer no cadastro.

Os detalhes do back-end, como endpoints e regras, estão no README do [api-aucolher](https://github.com/joaouggdmn/api-aucolher).

## Como rodar

Requer Node.js 20.19 ou superior (exigência do Vite 8), Java 17, Maven e PostgreSQL.

### 1. Back-end

```bash
git clone https://github.com/joaouggdmn/api-aucolher.git
cd api-aucolher
psql -U postgres -h localhost -f sql/schema.sql   # cria o banco aucolher_db e as tabelas
mvn spring-boot:run                               # sobe em http://localhost:8080
```

Sem nenhuma variável, a API sobe contra o PostgreSQL local com os valores padrão e uma chave JWT aleatória a cada execução. Defina `JWT_SECRET` para os tokens sobreviverem a um reinício.

- **Administrador:** não há cadastro público; a conta `ADMIN` é inserida direto no banco.
- **Dados de teste:** `docs/seed-banco-completo.sql`, deste repositório, cria ONGs, pessoas, animais, pedidos, eventos e conversas. Ele **apaga** os dados do banco antes; a senha das contas de teste está no cabeçalho do arquivo.
- **Login com Google, e-mail de senha, doações e assistente:** cada um precisa das suas variáveis (o assistente, de `GEMINI_API_KEY`). A tabela completa e o passo a passo do Mercado Pago (túnel HTTPS, webhook, chave Pix) estão no README do back-end. O login com Google está explicado em `docs/entrega-final/api-login-google.md`.

### 2. Front-end

```bash
git clone https://github.com/joaouggdmn/AUcolher.git
cd AUcolher
npm install
npm run dev                                       # http://localhost:5173
```

O endereço da API vem do `.env`, na raiz do projeto. Sem o arquivo, o padrão é este:

```
VITE_API_URL=http://localhost:8080/api
```

## Limitações conhecidas

- **Não há geolocalização:** a busca por local é por cidade e UF, por decisão do projeto.
- **O site ainda não está publicado.** Roda localmente, com o banco PostgreSQL também local (até 23/11/2026 o banco ficava na nuvem, no Aiven). Para o Mercado Pago alcançar a API (retorno do OAuth e webhook), é usado um túnel HTTPS (ngrok).
- **Não há sandbox de Pix** para doações na conta da ONG: até a credencial de teste do Mercado Pago gera cobrança real. Os testes foram feitos com Pix real de R$ 5.
- **Estorno** feito pela ONG no Mercado Pago não muda a doação no AUcolher.
- **Chat por *polling*** (nova consulta a cada 3 s), não em tempo real. **Imagens** ficam dentro do JSON, como data URL, e não num serviço de arquivos.

## Equipe

- **João Pedro Uggioni Damin** — front-end, requisitos, regras de negócio e documentação técnica · [GitHub](https://github.com/joaouggdmn) · [LinkedIn](https://linkedin.com/in/joaopedrouggioni)
- **Pedro Henrique Manoel Euzébio** — back-end e diagramas
