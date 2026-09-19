# AUcolher — Regras de Negócio

> Documento vivo. Reflete as decisões tomadas até 2026-09-18. Atualizar conforme o projeto evoluir — não é uma especificação congelada.

## 1. Visão geral

AUcolher é uma plataforma de adoção de animais cujo diferencial é o **AUmatch**: um sistema de matchmaking comportamental que cruza o estilo de vida do adotante com as características do animal, com o objetivo de reduzir o reabandono. É o tema central do TCC.

Três papéis de usuário:

- **Usuário comum** — pode cadastrar animais para adoção, adotar, participar de eventos e campanhas de ONGs.
- **ONG** — tudo que o usuário comum faz, mais um perfil institucional mais completo e a possibilidade de criar eventos e campanhas de doação.
- **Admin** — modera a plataforma, aprova ONGs, julga denúncias e acompanha métricas gerais.

Frontend em React (Vite), backend em Spring Boot + PostgreSQL (em desenvolvimento paralelo pelo parceiro).

## 2. Usuários e papéis

- Campo único de papel no backend: `tipoUsuario` com os valores `PESSOA | ONG | ADMIN`. Não deve existir um campo `role` separado e desalinhado — hoje esse é um bug conhecido no frontend (ver seção 13).
- Um usuário só tem um papel por vez (não é possível ser `PESSOA` e `ADMIN` simultaneamente, por exemplo).
- **Pendência em aberto**: como o primeiro usuário `ADMIN` é criado (seed manual no banco, endpoint separado, etc.) ainda precisa ser combinado com o parceiro de backend.

## 3. Ciclo de vida da adoção

### 3.1 Estados do pedido de interesse

```
PENDING → ACCEPTED → AWAITING_DELIVERY → CONCLUDED
   |
   └──→ REJECTED

(pedidos concorrentes do mesmo animal são CANCELLED em cascata quando um deles conclui)
```

1. **PENDING** — adotante curte o animal no AUmatch (ou demonstra interesse de outra forma) → gera um pedido pendente para o dono do animal (usuário ou ONG).
2. Dono analisa o perfil do adotante (compatibilidade do AUmatch + avaliações recebidas, se houver) e decide:
   - **ACCEPTED** — libera o chat entre as partes.
   - **REJECTED** — encerra o pedido, sem chat.
3. **ACCEPTED → AWAITING_DELIVERY** — dono confirma que vai entregar/já combinou a entrega do animal. Isso **trava o chat para novas mensagens**, mas o histórico continua visível.
4. **AWAITING_DELIVERY → CONCLUDED** — adotante confirma que recebeu o animal. Nesse momento:
   - O animal é marcado como adotado e sai da listagem de disponíveis.
   - Pedidos concorrentes do mesmo animal são cancelados automaticamente (`CANCELLED`).
   - Ambas as partes podem se avaliar.

### 3.2 Avaliações (avaliação mútua)

- **Opcional**, não bloqueia nada no sistema.
- Liberada somente após o pedido chegar a `CONCLUDED`.
- Tanto o adotante quanto quem doou o animal podem avaliar um ao outro — uma avaliação por direção, por ciclo de adoção.
- Conteúdo: nota (estrelas) + comentário opcional.
- **Editável e excluível pelo próprio autor a qualquer momento** (sem janela de prazo definida).
- Visível no perfil público de quem foi avaliado, como média + contagem (ex: "4.8 ⭐ · 12 avaliações").
- Serve como sinal de confiança: ao decidir aceitar um pedido de interesse (ou ao escolher de quem adotar), a outra parte pode consultar essas avaliações.
- Uma avaliação considerada abusiva/injusta pode ser alvo de denúncia (seção 8).

## 4. AUmatch (matchmaking comportamental)

- Todo novo adotante passa por um questionário de estilo de vida (onboarding) antes de usar o AUmatch: moradia, rotina de exercício, tempo fora de casa, se tem crianças/outros pets, preferência de espécie, perfil ideal de pet, porte preferido.
- Interface de swipe: curtir gera um pedido de interesse (`PENDING`); passar apenas descarta o animal da fila.
- O algoritmo de compatibilidade cruza essas respostas com os atributos do animal (nível de energia, independência, temperamento, se é bom com crianças, se é adequado a apartamento) e gera um score usado para ordenar/filtrar os animais mostrados.
- Um animal já adotado nunca aparece na fila. Um animal já com pedido `PENDING`/`ACCEPTED` do próprio usuário também não deveria ser mostrado de novo (evitar duplicidade de interesse pelo mesmo animal).

## 5. Animais

- Cada animal tem: espécie, raça, sexo, idade, porte, localização, fotos, vacinação/castração/vermifugação, necessidades especiais, nível de energia, temperamento, independência, se é bom com crianças/cães/gatos, se é adequado a apartamento, resumo e história.
- Cadastro pode ser feito por usuário comum ou ONG.
- Um animal só aparece nas listagens/AUmatch enquanto estiver disponível (não adotado).
- Ao concluir uma adoção, o animal passa a "adotado" e some das listagens públicas.

## 6. Perfis, bio e favoritos

### 6.1 Perfil de usuário comum
- Dados básicos + **bio** (pensada especialmente para cuidadores autônomos, que não são uma ONG formal mas cuidam/resgatam animais).
- Exibe animais anunciados, avaliações recebidas, informações de contato.

### 6.2 Perfil de ONG
Perfil mais completo que o de usuário comum:
- Bio/descrição da instituição.
- Endereço físico.
- Número de adoções realizadas.
- Equipe.
- Horário de visitas.
- CNPJ, email institucional (opcional), links de redes sociais (Instagram/Facebook/X).
- Selo de "verificada" quando aprovada pelo admin (ver seção 7).

### 6.3 Favoritos
- Lista pessoal e privada de animais, sem limite de quantidade.
- Pode ser adicionado a partir do card do animal ou da página de detalhe.
- Se um animal favoritado for adotado por outra pessoa, quem favoritou recebe uma notificação (ver seção 11).

## 7. Cadastro e aprovação de ONG

> Regras definidas e documentadas agora; a implementação é uma etapa futura (Fase 2), não prioritária no momento.

1. ONG se cadastra informando: nome, CNPJ, email institucional (opcional), links de redes sociais, bio.
2. **Autopreenchimento via BrasilAPI** (`https://brasilapi.com.br/api/cnpj/v1/{cnpj}`, pública e gratuita): ao digitar o CNPJ, o formulário busca e preenche automaticamente razão social, endereço, etc.
3. **Pré-validação automática**: se a situação cadastral do CNPJ vier como inativa/baixada na Receita, o cadastro é **bloqueado antes mesmo de chegar na fila do admin** — reduz spam e trabalho manual de moderação.
4. Cadastro válido entra com status **PENDENTE**. A ONG vê um aviso de "cadastro em análise" e ainda não pode logar normalmente.
5. Admin analisa manualmente (critério de mérito: coerência dos dados, redes sociais, etc. — a validade do CNPJ já foi filtrada no passo 3) e decide:
   - **Aprovar** → ONG recebe e-mail de confirmação, pode logar, ganha o selo de verificada.
   - **Recusar** → ONG recebe e-mail com o motivo. **Não é um banimento permanente** — a ONG pode corrigir os dados e reenviar o cadastro.

## 8. Denúncias e moderação

- Podem ser denunciados: anúncios de animais e perfis (usuário ou ONG).
- Motivo da denúncia: categoria fixa (ex: conteúdo impróprio, maus-tratos, golpe/fraude, perfil falso, spam) + campo de descrição livre.
- O admin analisa e decide diretamente entre:
  - Apagar o anúncio denunciado, ou
  - Banir a conta (usuário ou ONG) — não há etapa intermediária de advertência formal.
- **Efeito cascata do banimento**:
  - Todos os animais anunciados pela conta banida somem das listagens.
  - Pedidos de adoção ativos envolvendo a conta banida são cancelados automaticamente, com aviso para a outra parte envolvida.
- Ao julgar uma denúncia, o sistema notifica quem denunciou (e, opcionalmente, quem foi denunciado) sobre o resultado.

## 9. Dashboard do admin

### 9.1 Escopo inicial (núcleo, prioridade para o TCC)
- Total de usuários cadastrados (pessoas e ONGs).
- Animais disponíveis vs. adotados.
- Total de adoções concluídas.
- ONGs aguardando aprovação, com atalho direto para aprovar/recusar.
- Denúncias pendentes, com atalho direto para julgar.

### 9.2 Requisito adicional
- Exportar as informações do dashboard em **PDF**.

### 9.3 Métricas extras (fase 2 / só se sobrar tempo)
- **Taxa de reabandono** — a métrica mais valiosa para validar a proposta do TCC, pois mede diretamente se o AUmatch está reduzindo devoluções de animais já adotados. Requer guardar histórico de status do animal (hoje o sistema só sabe se está "disponível" ou "adotado", sem histórico de adoções anteriores) — decisão de modelagem de dados a ser tomada se essa métrica avançar.
- Total arrecadado em campanhas de doação.
- Eventos ativos.
- Gráfico de adoções ao longo do tempo.

## 10. Eventos e campanhas de doação

- ONGs podem cadastrar eventos (feiras de adoção, mutirões, etc.) que acontecem na cidade.
- ONGs podem cadastrar campanhas de doação para suas causas.
- **Gateway de pagamento escolhido: Mercado Pago** — PIX nativo, sandbox bem documentado, adequado ao contexto brasileiro do TCC.
- Estratégia de entrega em duas fases:
  1. Fluxo funcional com chave PIX estática (entrega mínima viável).
  2. Integração real do checkout Mercado Pago — etapa isolada e opcional, plugável sem alterar o restante do fluxo, feita apenas se houver tempo.

## 11. Notificações

- Central de notificações **pull-based** (sininho/lista consultada ao abrir o app ou navegar) — não é notificação em tempo real via WebSocket, escolha deliberada para caber no prazo do TCC.
- Eventos que devem gerar notificação:
  - Novo pedido de interesse recebido.
  - Pedido aceito/recusado.
  - Chat liberado / entrega confirmada / recebimento confirmado.
  - Animal favoritado foi adotado por outra pessoa.
  - Nova avaliação recebida.
  - ONG aprovada/recusada.
  - Denúncia julgada.

## 12. Nota técnica: estado atual (mock) vs. arquitetura final

- **Já integrado com o backend real (Spring Boot + PostgreSQL)**: login e cadastro (`core/services/authService.js`, `core/services/api.js`).
- **Ainda mockado em `localStorage`, só para testes de frontend**: animais (`AnimalContext`), pedidos de adoção (`AdoptionRequestContext`), mensagens de chat (`useChatMessages`), avaliações, favoritos, notificações.
- Conforme o parceiro de backend for entregando endpoints, cada um desses módulos precisa ser migrado do mock para chamadas reais de API — isso deve ser tratado como um roteiro próprio, módulo por módulo, não uma migração única.

## 13. Backlog técnico conhecido (não implementar agora — só registro)

Gaps encontrados na exploração do código atual, guardados aqui para referência quando formos implementar:

- **Bug de papel**: `authService.toFrontendUser()` mapeia o campo do backend para `userType`, mas os guards de rota (`OngRoute`, `AdminRoute`) checam `user.role`, que nunca é preenchido — hoje nenhuma rota de ONG ou admin é acessível de fato. Precisa alinhar nome do campo com o backend (ver seção 2).
- **Bug de identidade no chat**: `createRequest` nunca preenche `adopterId`, só `adopter.userId` (frequentemente `null`) — o casamento de contato de chat do lado do adotante é frágil.
- Não existe página própria para o adotante acompanhar os pedidos que ele enviou (hoje só dá pra confirmar recebimento pelo cabeçalho do chat).
- Botão de favoritar hoje é decorativo (`console.log`), sem persistência.
- Aba de avaliações hoje só exibe dados mockados, sem formulário de envio real.
- Diversas telas existem como arquivos vazios/placeholders: perfil de ONG, dashboard de ONG, dashboard admin, aprovação de ONGs, denúncias, estatísticas, criar/editar evento, criar/editar campanha.

## 14. Perguntas em aberto (alinhar com o parceiro de backend)

- Como o primeiro usuário `ADMIN` é criado.
- Nome definitivo do campo de papel no contrato da API (`tipoUsuario` vs. `role`) e nos três valores (`PESSOA`/`ONG`/`ADMIN`).
- Se/quando o histórico de status do animal (necessário para a métrica de reabandono) entra no modelo de dados do backend.
