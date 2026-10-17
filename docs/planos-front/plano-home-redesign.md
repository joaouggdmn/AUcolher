# AUcolher — Plano: ajustes finais da home

> Escopo: **só a home** (`src/features/home/`). Footer, AUmatch e o resto do site não mudam. Documento vivo: marcar os blocos (✅) conforme forem entregues e registrar desvios.

## Contexto

O redesign da home ficou denso demais. O card interativo do hero (carrossel de pets + "Por que deu match?") e o simulador ("perfil de teste") fazem uma busca de animais que deveria acontecer só no `/aumatch`.

O objetivo agora é que **quem acabou de chegar entenda o site em poucos segundos**, mantendo o que funcionou:

- as mensagens do hero que mudam por público (visitante, quiz pendente, com match, ONG);
- a vitrine de ONGs (campanhas e eventos);
- a vitrine de animais;
- a seção "Adoção segura".

## 1. Decisões

- **Ordem nova:** Hero → Atalhos → ONGs → Animais → Adoção segura. A página fecha com o CTA da Adoção segura.
- **Hero, lado direito:** um **mockup estático do AUmatch**, com um pet fictício fixo (nome, foto e % no código, sem link) e 3 legendas numeradas explicando o fluxo. Substitui o card interativo.
- **Hero, lado esquerdo:** texto e botões continuam por público. A busca ("Prefere buscar do seu jeito?") e a barra de números ficam como estão.
- **Simulador:** sai por completo.
- **Atalhos** (a antiga seção final verde escura): sobe para o 2º lugar, com fundo claro e **sem os botões que repetem os do hero**. O painel de cada público continua:
  - visitante: as perguntas do quiz;
  - quiz pendente: o progresso;
  - com match: o perfil AUmatch;
  - ONG: criar campanha, criar evento, completar perfil.
- **Botão secundário do hero, por público:**

  | Público | Botão | Destino |
  |---|---|---|
  | Visitante | Já tenho conta | `/login`, voltando para `/aumatch` |
  | Quiz pendente | Ver o que falta | `#atalhos` |
  | Com match | Ver meus favoritos | `/favoritos` |
  | ONG | Interesses recebidos | sem mudança |

- **"Como funciona o match"** do rodapé (`/#match`): a âncora passa para o mockup do hero.
- **Fundos alternados**, para as seções não se fundirem: Hero `stone-50` → Atalhos `white` → ONGs `stone-50` → Animais `white` → Adoção segura `stone-50`.

## 2. Blocos

- [x] **H1 — Hero:** mockup estático no lugar do `HeroMatchCard`/`HeroReceipt`; novos botões secundários em `data/personaActions.js`.
- [x] **H2 — Atalhos:** `FinalCta` → `Shortcuts/ShortcutsSection.jsx`, em tom claro, sem botões, em 2º lugar.
- [x] **H3 — Encaixe:**
  - vitrine de animais sem depender do hero (com match: top 4 do deck);
  - Adoção segura vira o fechamento, com botão primário;
  - fundos alternados.
- [x] **H4 — Limpeza:** apagar o simulador, o card antigo do hero, `useMatchProfile`, `useFeaturedPets`, `exampleProfile` e o que ficar órfão.

## 3. Verificação

- `npm run lint` e `npm run build` sem erros.
- Abrir `/` com cada público (visitante, quiz pendente, com match, ONG) e conferir texto, botões e painel dos Atalhos.
- O link "Como funciona o match" do rodapé rola até o mockup.
- Mobile (390px): as legendas do mockup viram lista e não há scroll horizontal.

## 4. Desvios e ajustes depois da entrega

- **Atalhos:** a versão clara e sem botões foi revertida a pedido. A seção original (card verde escuro) voltou, só que logo abaixo do hero, com `id="atalhos"`. Pessoa logada e ONG ganharam um painel "Mais atalhos":
  - pessoa: Fazer uma doação, Conversas, Anunciar um animal, Ver perfil público;
  - ONG: Criar campanha, Criar evento, Ver perfil público.
- **Hero:** o eyebrow só aparece para quem está logado. O botão de visitante na seção de atalhos virou "Ver compatibilidade".
- **Animais da home vêm da API** (`hooks/useHomeAnimals.js`), e não mais do mock `AnimalContext`. Antes, o "Conhecer" abria outro animal (`/animais/2` era a Mel no mock e o Thor na API).
- **Vitrine de ONGs:** a cidade e a foto usam o que vem da API quando não há perfil mock. O "Ver perfil" só aparece com perfil mock, porque `/ong/:id` ainda lê `mockPublicProfiles` e o id real pode abrir outra conta.

- **"Encontrar animais mais próximos" saiu da home** (hero e vitrine de animais), junto com o componente `NearbyButton`. O botão estava quebrado antes desta branch: o commit `9a561ea` (listagem via API, já na `main`) removeu o tratamento de `?lat=&lng=` porque a API não guarda coordenadas. Decisão do projeto: **o AUcolher não usa geolocalização**, nem na home nem no resto. Quem quer animais de uma cidade usa a busca ("Nome, raça ou cidade") e os chips "Buscar por cidade" da vitrine. A limpeza do restante (formulário da conta, formulário de animais, serviços de GPS/Nominatim) fica para uma branch própria.

### Pendências fora da home (anotadas para depois)
- `/aumatch` e o perfil público ainda leem animais do mock `AnimalContext`.
- `/ong/:id` e `/perfil/publico/:id` ainda são mock (`userService.getPublicProfile`).
- Backend: o card de `GET /animals` não traz `independenceLevel`, então o critério de independência fica "não informado" no ranking da home.

## 5. Limpeza da geolocalização (branch `feature/remove-geolocation`)

Removido de todo o sistema: GPS do navegador (`useGeolocation`), geocoding (`nominatimService`, `useLocationCapture`), cálculo de distância (`distance.js`), latitude/longitude do usuário, da sessão e do seed de animais (`distanceKm` também), o botão "Usar localização exata" e o indicador de coordenadas do formulário da conta, o selo "X km de distância" do cartão de animal, e o raio em km e a ordenação "Mais próximos" do AUmatch. Ficam: cidade/UF e o filtro por cidade do AUmatch e da listagem.

**CEP:** saiu da conta da pessoa e do formulário de animais, que agora usam seletores de estado e cidade (`CityStateFields`, com a lista de municípios do IBGE via `ibgeService`/`useCities`; se o IBGE falhar, a cidade vira campo de texto). O PUT /users/me da pessoa deixou de enviar `cep`, então o CEP antigo de uma conta some do banco no próximo salvamento. A ONG mantém o CEP no endereço (ViaCEP), assim como os eventos. Os links "Abrir no Google Maps" ficam (são só URLs de busca por endereço).
