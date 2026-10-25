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
- **Autenticação** — e-mail e senha ou **login com Google (OAuth2)**, com JWT e rotas protegidas por perfil: pessoa, ONG e administrador.
- **Denúncias e painel do administrador** — estatísticas, moderação (banir, reativar, editar e remover anúncios, contas e eventos) e a taxa de reabandono.

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
| Base | React 18 · Vite · React Router v6 · Tailwind CSS v4 |
| Dados e formulários | Axios · TanStack React Query · React Hook Form · Zod |
| Estado | Context API |

**Back-end** ([api-aucolher](https://github.com/joaouggdmn/api-aucolher))

| Camada | Tecnologia |
| --- | --- |
| Base | Java 17 · Spring Boot 3.3 · Spring Data JPA |
| Segurança | Spring Security · OAuth2 Client (Google) · JWT (JJWT) |
| Banco de dados | PostgreSQL |
| Testes | JUnit 5 · Mockito · MockMvc |

## Arquitetura do front-end

O código é organizado por **features** (*feature-sliced*), com uma regra fixa: a camada `core/` **nunca importa** de `features/`.

```
src/
├── core/                # componentes e hooks compartilhados, sem regra de domínio
│   ├── components/
│   └── hooks/           # ex.: useProfileCompletion, useReceivedRequests
├── features/
│   ├── auth/            # login, cadastro, AuthContext
│   ├── animais/         # anúncios, vitrine e pedidos de adoção
│   ├── aumatch/         # swipe, quiz e cálculo de compatibilidade
│   └── ...              # chat, eventos, perfil, admin etc.
└── routes/              # PrivateRoute, GuestRoute, OngRoute, AdminRoute
```

Decisões de projeto:

- **Padrão em inglês nos dois lados.** Código, campos, rotas e valores de enum usam inglês. Os textos exibidos ao usuário ficam em português.
- **Regras importantes ficam no servidor.** O front-end só esconde botões; quem valida cada transição do pedido de adoção e cada permissão é a API.
- **Banco de dados controlado por script.** O Hibernate só valida o schema (`ddl-auto=validate`); as tabelas vêm de `sql/schema.sql`, e mudanças em bancos existentes vão em migrações numeradas e transacionais.
- **Concorrência tratada no banco.** Um índice único parcial impede dois pedidos vivos para o mesmo animal, e a conclusão da adoção trava o animal com `SELECT ... FOR UPDATE`.
- **Perfil do AUmatch em tabela própria** (`match_profiles`, 1:1 com `users`), para o quiz poder mudar sem mexer no cadastro.

Os detalhes do back-end, como endpoints e regras, estão no README do [api-aucolher](https://github.com/joaouggdmn/api-aucolher).

## Como rodar

Requer Node.js 20 ou superior, Java 17 e PostgreSQL.

### 1. Back-end

```bash
git clone https://github.com/joaouggdmn/api-aucolher.git
cd api-aucolher
psql -U postgres -h localhost -f sql/schema.sql   # cria o banco aucolher_db e as tabelas
mvn spring-boot:run                               # sobe em http://localhost:8080
```

Defina as variáveis de ambiente antes de subir: `JWT_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD` (a conta de administrador é criada a partir delas), e `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` se for usar o login com Google. A tabela completa está no README do back-end. O login com Google está explicado em `docs/entrega-final/api-login-google.md`.

### 2. Front-end

```bash
git clone https://github.com/joaouggdmn/AUcolher.git
cd AUcolher
npm install
npm run dev                                       # http://localhost:5173
```

Crie um arquivo `.env` com o endereço da API: VITE_API_URL=http://localhost:8080

## Limitações conhecidas

- **O chat ainda não usa a API:** as mensagens ficam no navegador (`localStorage`), por pedido de adoção, e são sincronizadas entre abas pelo evento `storage`.
- **Não há geolocalização:** a busca por local é por cidade e UF, por decisão do projeto.
- **Campanhas e doações** ainda são simuladas no front-end.

## Equipe

- **João Pedro Uggioni Damin** — front-end, requisitos, regras de negócio e documentação técnica · [GitHub](https://github.com/joaouggdmn) · [LinkedIn](https://linkedin.com/in/joaopedrouggioni)
- **Pedro Henrique Manoel Euzébio** — back-end e diagramas
