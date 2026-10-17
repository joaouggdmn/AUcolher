# AUcolher — Regras de Negócio

> Documento vivo: atualizar conforme o projeto evoluir. Os contratos da API estão em `contratos-prontos/` (já implementados) e `entrega-final/` (o que falta no backend).

## 1. Visão geral

AUcolher é uma plataforma de adoção de animais cujo diferencial é o **AUmatch**: um sistema de matchmaking comportamental que cruza o estilo de vida do adotante com as características do animal, com o objetivo de reduzir o reabandono. É o tema central do TCC.

Três papéis de usuário:

- **Usuário comum** — pode cadastrar animais para adoção, adotar, participar de eventos e campanhas de ONGs.
- **ONG** — tudo que o usuário comum faz, mais um perfil institucional mais completo e a possibilidade de criar eventos e campanhas de doação.
- **Admin** — modera a plataforma, julga denúncias e acompanha métricas gerais (painel próprio em `/admin`).

Frontend em React (Vite), backend em Spring Boot + PostgreSQL (em desenvolvimento paralelo pelo parceiro).

## 2. Usuários e papéis

- Campo único de papel: `userType`. A API usa `PERSON | NGO | ADMIN` e o frontend converte para `PESSOA | ONG | ADMIN` (`authService.normalizeUserType`). Não existe um campo `role` separado.
- Um usuário só tem um papel por vez (não é possível ser `PESSOA` e `ADMIN` simultaneamente, por exemplo).
- **Cadastrou, entrou**: pelo formulário (pessoa ou ONG) ou pelo Google, a conta já sai do cadastro logada, sem passar pela tela de login. O cadastro devolve o mesmo `{ token, type, user }` do login.
- **Criação do admin**:
  - Não há cadastro público de admin. O cadastro público continua só para pessoa e ONG.
  - A primeira conta `ADMIN` é criada pela própria API ao subir, a partir das variáveis de ambiente `ADMIN_EMAIL` / `ADMIN_PASSWORD` (`ADMIN_NAME` é opcional). Sem elas, nada é criado.
  - Nenhuma senha fica no repositório.
- **O que o admin faz no site**: ele **modera, mas não participa**.
  - **Modera:** remove anúncios, eventos e campanhas e bane ou reativa contas, sempre com confirmação. Faz isso pelo painel (`/admin`) **e** direto nas páginas do site:
    - "Remover anúncio" no detalhe do animal, só para anúncio que não foi adotado nem removido;
    - "Banir conta" ou "Reativar conta" no perfil público, no lugar do "Denunciar";
    - "Remover evento" no detalhe do evento e "Remover campanha" no detalhe da campanha, no lugar de "Confirmar presença" e "Doar".
  - **Vê o que está fora do ar:** anúncio removido, anúncio de conta banida, anúncio tirado do ar pelo dono e o perfil de conta banida (com os animais dela), sempre com uma faixa explicando. Para todos os outros, isso continua indisponível.
  - **Não participa:** não doa, não confirma presença, não favorita, não anuncia animal, não pede adoção, não usa o AUmatch e não denuncia.
    - O menu dele mostra só o "Painel do admin", e os atalhos da home levam ao painel.
    - As telas de participante (favoritos, cadastrar animal, interesses e chat) mandam para `/admin`.
    - A API responde 403 com a frase pronta, por exemplo "Contas de admin não confirmam presença em eventos.".
  - **Edita** contas (perfil público e e-mail de login), anúncios, eventos e campanhas de outras pessoas, pelo botão "Editar" das listas do painel e das páginas do site. Ele usa os mesmos formulários do dono, com as mesmas regras:
    - o anúncio removido não muda mais, mas o adotado e o fora do ar podem ser editados;
    - evento só ativo e que ainda não aconteceu; campanha só ativa;
    - conta admin não é editada;
    - o Perfil AUmatch (o quiz) continua só da pessoa.
  - **O e-mail de login:**
    - precisa ser único;
    - conta que entra pelo Google não troca de e-mail, porque o próximo login pelo Google criaria outra conta;
    - trocar o e-mail encerra a sessão da conta, que entra de novo com o e-mail novo.
  - **Transparência:** o conteúdo editado continua em nome do dono, e fica registrado quando e quem editou (`moderated_at`/`moderated_by`, migração 016). O dono e o admin veem "Editado pela moderação em {data}":
    - o dono, em "Meus animais", nas listas do painel da ONG, em "Minha conta" e no detalhe do próprio anúncio, evento ou campanha;
    - o público não vê o selo.

### 2.1 Senha e exclusão de conta

Contratos: `entrega-final/api-senha.md` e `entrega-final/api-exclusao-conta.md`.

**Alterar senha**
- Em "Minha conta", card "Acesso": e-mail e senha aparecem só para ver, a senha mascarada (o banco guarda o hash).
- O botão "Alterar senha" envia o mesmo link do "Esqueci minha senha" para o e-mail da conta. Não há formulário com a senha atual: quem acessa o e-mail prova que é dono da conta. Nova senha com no mínimo 6 caracteres, como no cadastro.
- Conta criada pelo Google (`provider = GOOGLE`, sem senha): o botão vira "Criar senha", com o mesmo link. Depois disso a conta entra das duas formas.

**Recuperar senha**
- `/recuperar-senha`: a pessoa informa o e-mail. A resposta é **sempre a mesma** ("Se houver uma conta com esse e-mail, enviamos um link"), para não revelar quais e-mails têm conta.
- O e-mail traz um link para `/redefinir-senha?token=...`. O token:
  - é de **uso único**;
  - vale **30 minutos**;
  - fica no banco só como hash.
  - Pedir um link novo invalida o anterior.
- Conta só do Google, sem senha: o e-mail também traz o link, explicando que ele serve para criar uma senha.
- Envio por SMTP (Spring Mail), com as credenciais em variáveis de ambiente.

**Excluir conta**
- Em "Minha conta", com confirmação por senha (conta do Google: digitar "EXCLUIR").
- **Não apaga a linha**: anonimiza. Nome vira "Conta excluída"; e-mail, foto, bio, CNPJ, endereço e redes são apagados (o e-mail fica livre para um novo cadastro); a conta não entra mais.
- Aplica o **mesmo efeito cascata do banimento** (seção 8): os anúncios, campanhas e eventos saem do ar, e os pedidos ativos são cancelados, com motivo visível para a outra parte.
- Campanhas ativas da ONG são encerradas, e os PIX pendentes, cancelados. Doações aprovadas, pedidos concluídos e avaliações continuam no histórico das outras pessoas, com o autor exibido como "Conta excluída".
- Não dá para desfazer (diferente do banimento, que o admin reativa).

## 3. Ciclo de vida da adoção

### 3.1 Estados do pedido de interesse

```
PENDING → ACCEPTED → AWAITING_DELIVERY → CONCLUDED → RETURNED (dono registrou que o animal voltou)
                                             └──→ REHOMED (adotante republicou o animal)
   |          |               |
   |          └───────────────┴──→ CANCELLED (adotante ou dono desistiu)
   ├──→ REJECTED (definitivo)
   └──→ CANCELLED (adotante desistiu)

(quando um pedido conclui, os outros ativos do mesmo animal viram CANCELLED)
```

**A API valida tudo isso:** pedidos e avaliações moram no banco (`adoption_requests`, `adoption_reviews`). O contrato está em `contratos-prontos/api-adocao.md`.

**Quem pede e quando:**
- Pessoa ou ONG pode pedir; o admin não pede.
- O dono não pede o próprio animal, e o animal precisa estar disponível.
- Cada pessoa tem um pedido "vivo" por animal:
  - **recusado é definitivo** — não pede aquele animal de novo;
  - só um pedido **cancelado** libera um pedido novo.

**Vários aceites:** o dono pode aceitar vários pedidos do mesmo animal. Vale o primeiro que concluir.

**Desistência:**
- O adotante cancela em qualquer etapa antes da conclusão, inclusive "Aguardando entrega".
- O dono cancela um pedido aceito ou aguardando entrega. Pendente, ele recusa.
- O motivo fica registrado (`cancelReason`):
  - `ADOPTER_WITHDREW` ou `OWNER_WITHDREW`: uma das partes desistiu;
  - `ANIMAL_ADOPTED`: outro pedido do mesmo animal concluiu;
  - `ANIMAL_UNAVAILABLE`: o dono tirou o animal do ar, marcou como adotado por fora ou excluiu o anúncio;
  - `ACCOUNT_BANNED` ou `LISTING_REMOVED`: moderação, ainda mock (só na tela).
- A conversa de um pedido cancelado continua visível, travada, com o motivo.

**Acompanhamento:** o adotante acompanha tudo em **"Meus interesses"** (`/meus-interesses`).

1. **PENDING** — adotante curte o animal no AUmatch (ou demonstra interesse de outra forma) → gera um pedido pendente para o dono do animal (usuário ou ONG).
2. Dono analisa o perfil do adotante (compatibilidade do AUmatch + avaliações recebidas, se houver) e decide:
   - **ACCEPTED** — libera o chat entre as partes.
   - **REJECTED** — encerra o pedido, sem chat.
3. **ACCEPTED → AWAITING_DELIVERY** — dono confirma que vai entregar/já combinou a entrega do animal. Isso **trava o chat para novas mensagens**, mas o histórico continua visível.
4. **AWAITING_DELIVERY → CONCLUDED** — adotante confirma que recebeu o animal. Nesse momento:
   - O animal é marcado como adotado e sai da listagem de disponíveis.
   - Pedidos concorrentes do mesmo animal são cancelados automaticamente (`CANCELLED`, motivo `ANIMAL_ADOPTED`).
   - Ambas as partes podem se avaliar.

### 3.2 Avaliações (avaliação mútua)

- **Opcional**, não bloqueia nada no sistema.
- Liberada somente após o pedido chegar a `CONCLUDED`.
- Tanto o adotante quanto quem doou o animal podem avaliar um ao outro — uma avaliação por direção, por ciclo de adoção.
- Conteúdo: nota (estrelas) + comentário opcional.
- **Editável e excluível pelo próprio autor a qualquer momento** (sem janela de prazo definida).
- Visível no perfil público de quem foi avaliado, como média + contagem (ex: "4.8 ⭐ · 12 avaliações").
- Serve como sinal de confiança: ao decidir aceitar um pedido de interesse (ou ao escolher de quem adotar), a outra parte pode consultar essas avaliações.
- Uma avaliação considerada abusiva/injusta pode ser alvo de denúncia (seção 8) — ainda não implementado.
- O perfil público lê as avaliações e o número de adoções de `GET /api/users/{id}/reviews`.

### 3.3 Devolução e taxa de reabandono

É a métrica que valida a hipótese principal do TCC: adoções com compatibilidade alta no AUmatch voltam menos.

**Score congelado na conclusão**
- Ao passar para `CONCLUDED`, o pedido guarda o `matchScore` daquele momento (`match_score_at_adoption`). Depois disso ele não muda, mesmo que o quiz ou o animal mudem.
- Ele só é gravado com o **quiz completo** (as 7 respostas). ONG adotando, ou pessoa sem quiz completo: o campo fica nulo. A adoção conta na taxa geral, mas fica fora das faixas.

> Há dois caminhos, e os dois contam como reabandono. Contrato em `contratos-prontos/api-devolucao-reabandono.md`.

**Os dois caminhos** (os dois só partem de um pedido `CONCLUDED`; vale o primeiro)

| Caminho | Quem registra | Onde | Pedido vira | Animal |
|---|---|---|---|---|
| **Animal retornado** | Dono original (quem anunciou e entregou, pessoa ou ONG) | Pessoa: "Meus animais" → Anunciados por mim. ONG: painel → Animais | `RETURNED` | O **mesmo anúncio** volta para o doador como `INACTIVE` (fora do ar) |
| **Republicar anúncio** | Adotante | "Meus animais" → Adotados por mim | `REHOMED` | **Anúncio novo** em nome do adotante (cópia com fotos e comportamento, editável antes de publicar). O anúncio original continua `ADOPTED` no histórico do doador |

- **Depois do retorno**, o adotante não republica, porque o animal não está mais com ele. **Depois do repasse**, o doador não registra retorno, porque o animal está com o adotante.
- **No republicar, o animal não volta para o doador.** A participação do doador termina ali.
- **Adotante ONG fica fora de tudo.** A ONG que adota está resgatando o animal e depois o anuncia de novo pelo painel: isso não é reabandono. Pedido com adotante ONG não tem "Animal retornado" nem "Republicar anúncio", e fica fora da taxa (nem entra no total de adoções). A **ONG doadora** continua normal: registra o retorno quando o animal que ela doou volta.

**Motivo** (`returnReason`), nos dois caminhos
- `BEHAVIOR`: comportamento do animal;
- `OTHER_PETS`: incompatibilidade com outros animais da casa;
- `CHILDREN`: incompatibilidade com crianças;
- `HOUSING_OR_ROUTINE`: mudança de moradia ou de rotina;
- `COSTS`: custos;
- `ANIMAL_HEALTH`: saúde do animal;
- `OTHER`: outro, com descrição obrigatória.
- Observação opcional (até 500 caracteres).

**Animal retornado (doador)**
- Pode ser registrado a qualquer momento depois da conclusão. A data do retorno não pode ser futura nem anterior à conclusão.
- O animal volta como `INACTIVE` (fora do ar), e não direto como disponível, porque pode precisar de cuidados antes de uma nova adoção. É a única vez em que um animal `ADOPTED` muda de status.
- Logo depois, o front oferece:
  - **"Revisar e republicar"**: abre a edição, para corrigir o comportamento conforme o motivo (por exemplo, "não convive com gatos");
  - **"Deixar fora do ar"**.
- Dá para corrigir a data e o motivo depois, mas não para desfazer.

**Republicar anúncio (adotante)**
- O adotante revisa o anúncio preenchido, informa o motivo e publica. O repasse **conta a partir da publicação**.
- **"Desisti de doar":** enquanto o anúncio novo não tiver gerado uma adoção, o adotante pode desfazer. O anúncio novo sai do ar, e o pedido original volta a `CONCLUDED`, saindo da taxa.
- Tirar do ar ou excluir o anúncio novo **não** desfaz o repasse. No excluir, o front pergunta se ele ficou com o animal; se sim, chama o desfazer.

**O que acontece em comum**
- As duas partes veem o tipo, a data e o motivo no card do pedido. As avaliações daquela adoção continuam, e podem ser feitas e editadas.
- O chat do pedido recebe uma mensagem de sistema (`ANIMAL_RETURNED` ou `ANIMAL_REHOMED`).
- Cada adoção conta separado: se o animal for adotado de novo, é outro pedido, com outro score congelado.

**A taxa (painel do admin, seção 9)**
- Taxa de reabandono = (`RETURNED` + `REHOMED`) ÷ (`CONCLUDED` + `RETURNED` + `REHOMED`) × 100, contando só adoções com adotante pessoa.
- Mostrada de forma geral, **por faixa de compatibilidade** do score congelado e por tipo (retornado ou repassado):
  - **alta**: 80 a 100;
  - **média**: 50 a 79;
  - **baixa**: 0 a 49.
- O painel também mostra a distribuição dos motivos.
- **Limitação conhecida:** só conta o que é registrado na plataforma. Animal repassado por fora (grupo de mensagens, por exemplo) ou abandonado sem avisar ninguém não entra.

## 4. AUmatch (matchmaking comportamental)

- O AUmatch é só de pessoa física (quem adota). ONG, admin e visitante veem o deck como prévia, sem score e sem curtir.
- Todo novo adotante passa por um questionário de estilo de vida (onboarding) de 7 perguntas antes de usar o AUmatch:
  - moradia;
  - rotina de exercício;
  - tempo fora de casa;
  - quem mora com a pessoa (múltipla escolha: crianças, cães, gatos ou ninguém);
  - preferência de espécie;
  - perfil ideal de pet;
  - porte preferido.
- As respostas ficam no banco (`match_profiles`, rota `/api/match/profile`).
- Interface de swipe:
  - curtir gera um pedido de interesse (`PENDING`);
  - passar apenas descarta o animal da fila, só na sessão (não é gravado).
- O algoritmo de compatibilidade roda no backend (`MatchScoreCalculator`) e o deck (`GET /api/match/deck`) já chega ordenado. Ele soma 6 critérios, num total de 100 pontos:

  | Critério | Pontos | Cruza |
  |---|---|---|
  | Moradia | 15 | moradia × adequado a apartamento |
  | Energia | 20 | rotina × nível de energia |
  | Independência | 20 | tempo fora × independência |
  | Convivência | 15 | cada grupo em casa × bom com crianças / cães / gatos |
  | Temperamento | 15 | perfil ideal × temperamento |
  | Porte | 15 | porte preferido × porte (vazio + apartamento conta como pequeno) |

  O detalhe está em `contratos-prontos/api-aumatch.md`.
- Um animal já adotado nunca aparece na fila. Um animal já com pedido `PENDING`/`ACCEPTED` do próprio usuário também não deveria ser mostrado de novo (evitar duplicidade de interesse pelo mesmo animal).

## 5. Animais

- Cada animal tem: espécie, raça, sexo, idade, porte, localização (cidade e UF do responsável pelo anúncio), fotos, vacinação/castração/vermifugação, necessidades especiais, nível de energia, temperamento, independência, se é bom com crianças/cães/gatos, se é adequado a apartamento, resumo e história.
- Cadastro pode ser feito por usuário comum ou ONG.
- **Sem geolocalização.** O sistema não pede nem guarda localização exata (latitude/longitude, GPS) de usuários ou animais, e não ordena por distância. A localização é só cidade/UF, e quem quer animais de uma cidade usa a busca e o filtro por cidade. No perfil da pessoa e no cadastro do animal, estado e cidade são **escolhidos em listas** (municípios do IBGE), nunca digitados, para a mesma cidade não aparecer escrita de dois jeitos. O animal herda a cidade/UF de quem anuncia; se a conta ainda não tem localização, o formulário do animal pede e já salva no perfil. O **CEP** só existe no endereço da ONG e dos eventos.
- Um animal só aparece nas listagens/AUmatch enquanto estiver disponível (não adotado).
- Ao concluir uma adoção, o animal passa a "adotado" e some das listagens públicas.
- **"Adotado" só vem da conclusão do pedido** (o adotante confirma a chegada no chat). O dono não marca o animal como adotado à mão: isso inflava o número de adoções do admin sem nenhuma adoção de verdade por trás. Se o animal foi adotado fora da plataforma, o dono **tira o anúncio do ar**. O `PATCH /api/animals/{id}/status` continua aceitando `ADOPTED`, mas o front não oferece mais essa ação.
- **Página "Meus animais"** (só pessoa física, link na sidebar, rota `/meus-animais`). A ONG continua usando o painel. A página tem duas abas:
  - **Anunciados por mim:** editar o anúncio (até aqui a pessoa não conseguia), tirar do ar ou reativar, excluir e, nos adotados, **"Animal retornado"** (seção 3.3);
  - **Adotados por mim:** as adoções concluídas, com **"Republicar anúncio"** e **"Desisti de doar"** (seção 3.3).
  - `/meus-anuncios` redireciona para ela, e a lista "Meus animais" de Minha conta vira um link.

## 6. Perfis, bio e favoritos

### 6.1 Perfil de usuário comum
- Dados básicos + **bio** (pensada especialmente para cuidadores autônomos, que não são uma ONG formal mas cuidam/resgatam animais).
- Exibe animais anunciados e avaliações recebidas. Não há telefone/WhatsApp (removido): o contato entre adotante e dono acontece pelo chat de um pedido aceito.

### 6.2 Perfil de ONG
Perfil mais completo que o de usuário comum:
- Bio/descrição da instituição.
- Endereço físico.
- Número de adoções realizadas.
- Equipe.
- Horário de visitas: dias da semana marcados + horário de abrir e fechar, ou "Somente com agendamento" (o banco continua guardando o texto, ex.: "Terça a sexta" / "14h às 18h").
- CNPJ e links de redes sociais (Instagram/Facebook/X).
- Contato: o **e-mail de login** da ONG aparece no perfil público. Não existe mais e-mail institucional separado: o cadastro aceita qualquer e-mail, então quem tem um institucional já se cadastra com ele. O e-mail de pessoa física continua privado.
- **Banner** no topo do perfil público, opcional e **só para ONG** (contrato em `contratos-prontos/api-perfil-ong.md`).
- Selo de "verificada": **toda ONG tem**, desde o cadastro (ver seção 7).

### 6.3 Favoritos
- Lista pessoal e privada de animais, sem limite de quantidade. É de pessoa e ONG; o admin não favorita (seção 2).
- Pode ser adicionado a partir do card do animal ou da página de detalhe.
- Se um animal favoritado for adotado por outra pessoa, quem favoritou não recebe nenhum aviso automático — a central de notificações foi removida (ver seção 11).

## 7. Cadastro de ONG

> **Não existe mais etapa de aprovação pelo admin.** A fila de aprovação (status `PENDENTE`, aprovar/recusar com motivo) foi descartada.

1. A ONG se cadastra informando: nome, CNPJ, e-mail (o de login, que também é o contato público), links de redes sociais, bio e endereço.
2. O cadastro válido já entra **ativo**: a ONG loga direto e usa o painel `/ong/painel`.
3. **Toda ONG é verificada**:
   - o backend grava `is_verified = true` no cadastro;
   - a migração 003 marcou as ONGs que já existiam;
   - o campo continua no banco caso, no futuro, o selo precise ser retirado de alguém.
4. O controle de abuso fica com as denúncias e o banimento (seção 8).
5. Ideias guardadas para o futuro (não implementar agora):
   - autopreenchimento via BrasilAPI (`https://brasilapi.com.br/api/cnpj/v1/{cnpj}`);
   - bloqueio de CNPJ inativo/baixado na Receita já no cadastro.

## 8. Denúncias e moderação

> Plano em `planos-front/plano-painel-admin.md`, contrato em `contratos-prontos/api-denuncias-moderacao.md`.

- **Quem denuncia**: qualquer conta logada de pessoa ou ONG. Quem não entrou é convidado a fazer login. O admin não denuncia: ele modera direto pelo painel.
- **O que pode ser denunciado**: anúncios de animais e perfis (pessoa ou ONG). Campanhas, eventos e avaliações ficam fora por enquanto.
- Ninguém denuncia o próprio conteúdo, e cada pessoa tem no máximo **uma denúncia em análise por alvo** ("Denúncia em análise").
- **Motivo**: categoria fixa, conforme o alvo, mais uma descrição livre de até 500 caracteres (obrigatória em "Outro motivo"):
  - anúncio: conteúdo impróprio, maus-tratos, golpe/fraude, spam, outro;
  - perfil: perfil falso, golpe/fraude, maus-tratos, conteúdo impróprio, spam, outro.
- **O admin analisa** (painel `/admin`, seção Denúncias, agrupada por alvo) e decide entre:
  - remover o anúncio denunciado;
  - banir a conta (usuário ou ONG) — não há etapa intermediária de advertência formal;
  - arquivar a denúncia como improcedente.
  - Julgar resolve todas as denúncias pendentes do mesmo alvo.
- **Ações diretas**: o admin também pode banir/reativar contas e remover anúncios, campanhas e eventos sem denúncia, pelas listas do painel ou direto na página do anúncio, do perfil, do evento ou da campanha (seção 2). Sempre com confirmação.
- **Anúncio removido**: some do site (vitrine, perfil, favoritos; o detalhe mostra "Anúncio indisponível"). O dono ainda o vê no painel e em Minha conta como "Removido pela moderação", sem poder reativar.
- **Efeito cascata do banimento**:
  - a conta banida não consegue entrar ("Conta suspensa") e, se estiver logada, é desconectada;
  - o perfil dela fica indisponível;
  - todos os animais anunciados pela conta banida somem das listagens, e as campanhas e eventos da ONG banida também;
  - pedidos de adoção ativos envolvendo a conta banida são cancelados automaticamente, com o motivo visível para a outra parte.
- **Reativar** uma conta banida é permitido (para desfazer um engano): ela volta a entrar e o conteúdo dela reaparece. Os pedidos cancelados continuam cancelados.
- Ao julgar uma denúncia, o sistema hoje não notifica mais ninguém sobre o resultado — a central de notificações foi removida (ver seção 11).

## 9. Dashboard do admin

> Plano completo em `planos-front/plano-painel-admin.md`.
> - O painel é uma tela própria em `/admin`, no mesmo formato do painel da ONG (barra lateral, sem a navbar do site).
> - Seções: Visão geral, Usuários, Animais, Campanhas, Eventos e Denúncias.

### 9.1 Escopo inicial (núcleo, prioridade para o TCC)
- Total de usuários cadastrados (pessoas e ONGs).
- Animais disponíveis vs. adotados.
- Total de adoções concluídas.
- Denúncias pendentes, com atalho direto para julgar.
- Saiu: "ONGs aguardando aprovação". A ONG não passa mais por aprovação (ver seção 7).

### 9.2 Requisito adicional
- Exportar as informações do dashboard em **PDF**, pela impressão do navegador ("Salvar como PDF"), com um layout de impressão próprio.

### 9.3 Métricas extras
- Já entram no painel:
  - total arrecadado em campanhas;
  - eventos ativos;
  - adoções ao longo do tempo;
  - novos cadastros por mês;
  - funil do pedido à adoção;
  - ranking de ONGs.
- **Taxa de reabandono**:
  - é a métrica mais valiosa para validar a proposta do TCC, pois mede diretamente se o AUmatch reduz as devoluções;
  - card na Visão geral: taxa geral, taxa por faixa de compatibilidade (alta, média, baixa) e distribuição dos motivos. Também sai no PDF;
  - regras de registro e cálculo na seção 3.3. O histórico vem dos próprios pedidos (`RETURNED` / `REHOMED` + score congelado), sem tabela de histórico do animal.

## 10. Eventos e campanhas de doação

> Decisões completas em `planos-front/plano-campanhas-eventos.md`; contratos da API em `contratos-prontos/api-eventos.md` e `entrega-final/api-campanhas-doacoes.md`.

### 10.1 Eventos

- Só conta **ONG** cria evento; só a **ONG dona** edita, exclui e vê a lista de confirmados (painel `/ong/painel`).
- Evento de um dia: data, início, término opcional, local com endereço (CEP opcional preenche o resto), capa opcional e **vagas opcionais**.
- Categoria: feira de adoção, mutirão de saúde, bazar beneficente, workshop, arrecadação, passeio e encontro ou **outro**. Em "Outro", a ONG escreve um nome curto (até 30 caracteres) para eventos que não cabem nas outras; no filtro, "Outro" agrupa todos esses.
- Pessoa e ONG logadas confirmam ou cancelam presença, **menos a ONG dona**. O admin não participa: no lugar do botão, ele vê "Remover evento".
- Evento lotado mostra "Vagas esgotadas"; na edição, as vagas não podem ficar abaixo de quem já confirmou.
- **Evento passado** (`data < hoje`) é somente leitura: não edita, não exclui, sem presença. Um evento de hoje fica aberto o dia inteiro.
- **Excluir**: sem confirmados → exclusão real; com confirmados → vira `CANCELADO`, some da vitrine e do detalhe, e aparece como "Evento cancelado" em Minha conta de quem confirmou.
- A vitrine, a home e a aba "Eventos" do perfil público da ONG mostram só eventos ativos de hoje em diante.

### 10.2 Campanhas e doações

- Só conta **ONG** cria campanha; só a **ONG dona** edita, encerra e exclui (painel `/ong/painel`, seção Campanhas, ou pela página da campanha).
- Campanha: título, descrição, categoria (saúde, alimentação, estrutura, castração, resgate ou **outro**, com um nome curto escrito pela ONG), meta em reais inteiros, selo de **urgente** opcional, **prazo** opcional e capa opcional. A urgente ativa mais recente vira o banner SOS da vitrine.
- **Uma campanha urgente ativa por ONG.** Para marcar outra, a ONG tira a urgência da atual. Assim o selo continua significando algo.
- Doação só por **PIX via Mercado Pago (Orders API)**, sempre chamado pelo backend. Login obrigatório; pessoa e ONG doam, **menos a ONG na própria campanha**. O admin não doa (403 "Contas de admin não fazem doações."): no lugar do botão, ele vê "Remover campanha". Mínimo **R$ 5**, sem centavos.
- O PIX vale **30 minutos**; o modal acompanha o pagamento sozinho. Só doações **aprovadas** contam no total da campanha e em "Meu impacto".
- **Meta atingida** não encerra: a campanha continua recebendo. Ela encerra quando a ONG encerra ou quando o prazo vence; encerrada fica visível, mas não recebe nem edita.
- **Encerrar/excluir** cancela os PIX ainda não pagos. **Excluir**: sem doações aprovadas → some de vez; com doações → sai de todas as telas, mas fica no histórico de quem doou e nas doações recebidas da ONG.
- A ONG vê as **doações recebidas** (quem doou, quanto e para qual campanha) no painel.

### 10.3 Conta Mercado Pago de cada ONG

Substitui a antiga "conta única da plataforma": **o dinheiro cai direto na conta da ONG**, e a plataforma nunca guarda doações.

- **Vincular a conta.** No painel da ONG há o botão "Conectar Mercado Pago". Ele leva ao login do Mercado Pago (OAuth, fluxo de código de autorização com o escopo `offline_access`) e volta para o painel.
- **Credenciais da ONG.** O backend guarda o `access_token` e o `refresh_token` da ONG:
  - **criptografados** no banco;
  - nunca vão para o navegador;
  - renovados automaticamente pelo `refresh_token` antes de vencer. O `refresh_token` muda a cada renovação, então o novo sempre é salvo.
- **Sem conta vinculada não há campanha.** "Criar campanha" pede para conectar a conta primeiro.
- **Conexão perdida.** Se a ONG desconectar a conta, ou a renovação falhar, as campanhas ativas continuam visíveis com "Doações indisponíveis no momento". O painel avisa a ONG para reconectar. Os PIX já gerados seguem válidos.
- **Criar o PIX.** O backend cria a order (`POST /v1/orders`, método `pix`) com o **token da ONG dona da campanha**. Assim o pagamento pertence à conta dela.
- **Comissão.** A plataforma não cobra (`marketplace_fee` = 0, ou ausente). Só a tarifa do Mercado Pago é descontada, na conta da ONG.
- **Confirmação.** Igual ao plano original: webhook com assinatura validada, mais consulta enquanto o PIX estiver pendente. A aprovação continua atômica (soma uma vez só).
- **A validar antes de implementar:** criar um PIX com o token OAuth de uma conta de teste de vendedor no sandbox. A documentação brasileira de split não cita o PIX explicitamente. **Plano B**, se não funcionar: voltar à conta única da plataforma, com repasse às ONGs registrado no painel.

## 11. Notificações (removidas)

- Havia uma central de notificações **pull-based** (sininho/lista consultada ao abrir o app ou navegar) — decisão revertida.
- **Decisão atual**: a central de notificações foi removida do sistema. A sidebar de navegação (acessível pelo ícone de menu na navbar) já cobre os alertas mais importantes do dia a dia via badges numéricos: interesses recebidos pendentes e mensagens de chat não lidas.
- Eventos que antes gerariam notificação e hoje **não têm nenhum canal de aviso**: animal favoritado foi adotado por outra pessoa, nova avaliação recebida, denúncia julgada. Se algum desses precisar de visibilidade no futuro, considerar um badge dedicado na sidebar em vez de reintroduzir uma central separada.

## 12. Nota técnica: API real vs. mock

- **Já na API (Spring Boot + PostgreSQL):** login e cadastro (inclusive admin e Google), animais, favoritos, AUmatch, pedidos de adoção e avaliações, devolução e repasse, eventos e presenças, perfil público e banner da ONG, painel do admin, denúncias e moderação.
- **Ainda num servidor falso no `localStorage`**, cada um atrás de uma flag `VITE_USE_MOCK_*` (ligada por padrão) e com o adaptador da API já escrito:
  - campanhas e doações (`VITE_USE_MOCK_CAMPANHAS`; o `doacoesMock.js` também faz o papel do Mercado Pago, com "Simular pagamento" só em desenvolvimento);
  - recuperar e alterar senha (`VITE_USE_MOCK_SENHA`);
  - chat.
- **O que falta no backend, em ordem:** `entrega-final/README.md`. Quando o parceiro entrega um módulo, o front desliga a flag dele (`=false` no `.env`).

## 13. Backlog técnico conhecido (não implementar agora — só registro)

Gaps encontrados na exploração do código atual, guardados aqui para referência quando formos implementar:

- **Bug de papel**:
  - `OngRoute` já usa `user.userType` (corrigido).
  - `AdminRoute` também já usa `user.userType` (corrigido no painel do admin).
- ~~Bug de identidade no chat~~ e ~~página do adotante~~: resolvidos com os pedidos na API.
- Avaliações não podem ser denunciadas, e as de contas banidas continuam aparecendo.
- Várias telas ainda são arquivos vazios/placeholders: dashboard admin, aprovação de ONGs, denúncias, estatísticas. Elas serão substituídas pelo painel do admin (`planos-front/plano-painel-admin.md`), e a de aprovação de ONGs será apagada.

## 14. Perguntas em aberto (alinhar com o parceiro de backend)

- ~~Como o primeiro usuário `ADMIN` é criado~~: resolvido com variáveis de ambiente na subida da API (seção 2).
- ~~Nome do campo de papel~~: resolvido. É `userType`, com `PERSON | NGO | ADMIN` na API.
- ~~Endpoints `/api/admin/*` e `/api/reports`~~: implementados (`contratos-prontos/api-admin.md` e `contratos-prontos/api-denuncias-moderacao.md`). Falta só a parte de campanhas, junto com a 007.
- ~~Se e quando o histórico de status do animal entra no modelo~~: resolvido. A taxa de reabandono usa os status `RETURNED` / `REHOMED` do pedido e o score congelado na conclusão (seção 3.3), sem tabela de histórico do animal.
- ~~Novos itens para o parceiro de backend, sem contrato~~: os contratos do que falta estão em **`docs/entrega-final/`**, com o mapa no `README.md` dela.
