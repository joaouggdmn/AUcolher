# AUcolher 🐾

**Plataforma inteligente de adoção responsável de animais, com algoritmo de matchmaking comportamental (AUmatch).**

> Trabalho de Conclusão de Curso do Técnico em Informática — CEDUP Abílio Paulo (Criciúma/SC), 2026.

[PREENCHER: link da demo online, se houver] · [PREENCHER: link do repositório do back-end]

---

## Sobre o projeto

Muitas adoções dão errado porque o estilo de vida do adotante não combina com o comportamento do animal. O AUcolher conecta **adotantes**, **protetores independentes** e **ONGs** e usa o **AUmatch**, um algoritmo de compatibilidade, para sugerir pets que realmente se encaixam no perfil de cada pessoa.

A hipótese central do TCC é que adotar com base em compatibilidade comportamental reduz a **taxa de reabandono** (adoções devolvidas). A plataforma inclui a métrica necessária para validar essa hipótese.

## Principais funcionalidades

- **AUmatch** — interface de *swipe* gamificada (arrastar com mouse ou toque) que apresenta os animais com a porcentagem de compatibilidade.
- **Perfil de estilo de vida** — questionário que descreve a rotina e as preferências do adotante e alimenta o algoritmo.
- **Cadastro de animais** — publicado por ONGs ou protetores independentes, com atributos de comportamento (nível de energia, temperamento, independência, vocalização), porte e saúde (vacinado, castrado, vermifugado).
- **Pedidos de adoção** — o adotante solicita e quem anunciou o animal acompanha e responde às solicitações recebidas.
- **Chat interno** — conversa entre usuários com match, substituindo a troca de telefone/WhatsApp. [CONFIRMAR: nesta versão as mensagens ficam no `localStorage`, sincronizadas entre abas pelo evento `storage`; ajuste se já usa a API]
- **Geolocalização** — captura por GPS (Geolocation API) ou por CEP, convertido em coordenadas com ViaCEP + Nominatim (OpenStreetMap).
- **Autenticação e perfis de acesso** — login com JWT e rotas protegidas por perfil: visitante, usuário, ONG e administrador.
- **Documentação técnica** — requisitos, regras de negócio e diagramas PlantUML do TCC. [CONFIRMAR: caminho, por exemplo `docs/`]

## Como o AUmatch funciona

1. O adotante responde ao questionário de estilo de vida.
2. Cada característica do perfil é comparada com os atributos do animal.
3. Cada comparação recebe um **peso** e as pontuações são somadas.
4. O resultado vira uma **porcentagem de compatibilidade**, usada para ordenar e exibir os animais no swipe.

A lógica fica em `computeMatchScore`, com leitura defensiva dos rótulos (`normalizeToken`) para lidar com acentos e variações do português.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Front-end | React 18 · Vite · React Router v6 · Tailwind CSS v4 |
| Dados e formulários | Axios · TanStack React Query · React Hook Form · Zod |
| Estado | Context API (`AuthContext`, `AnimalContext`, `AdoptionRequestContext`) |
| Back-end | Java · Spring Boot · PostgreSQL (desenvolvido por [PREENCHER: nome do parceiro]) |
| Geolocalização | Geolocation API · ViaCEP · Nominatim |
| Documentação | PlantUML |

## Arquitetura do front-end

O código é organizado por **features** (*feature-sliced*), com uma regra fixa: a camada `core/` **nunca importa** de `features/`.

```
src/
├── core/                # componentes e hooks compartilhados, sem regra de domínio
│   ├── components/
│   └── hooks/           # ex.: useProfileCompletion, useReceivedRequests
├── features/
│   ├── auth/            # login, cadastro, AuthContext, authService
│   ├── animais/         # cadastro, listagem e pedidos de adoção
│   ├── aumatch/         # swipe, questionário e computeMatchScore
│   └── ...              # chat, perfil, geolocalização etc.
└── routes/              # PrivateRoute, GuestRoute, OngRoute, AdminRoute
```

Outras decisões de projeto:

- **Modelo em inglês no front-end, entidades em português no back-end.** A tradução entre os dois fica isolada em `authService.js`.
- **Persistência síncrona antes de navegar.** Os contexts gravam no `localStorage` antes de atualizar o estado ou trocar de rota, para evitar perda de dados.
- **Banco de dados enxuto.** O perfil do AUmatch fica na tabela `perfis_aumatch`, ligada a `usuarios` por chave estrangeira 1:1, o que mantém a tabela de autenticação leve.

## Como rodar

### Front-end

Requer Node.js 20.19+ ou 22.12+.

```bash
git clone https://github.com/joaouggdmn/AUcolher.git
cd AUcolher
npm install
npm run dev
```

Crie um arquivo `.env` com o endereço da API: [PREENCHER: nome da variável e valor, por exemplo `VITE_API_URL=http://localhost:8080`].

### Back-end

Requer Java [PREENCHER: versão] e PostgreSQL. Veja as instruções no repositório do back-end: [PREENCHER: link].

## Capturas de tela

[PREENCHER: adicione 3 ou 4 imagens em `docs/screenshots/`, como o swipe do AUmatch, a listagem de animais e o chat, e referencie aqui com `![descrição](docs/screenshots/arquivo.png)`.]

## Equipe

- **João Pedro Uggioni Damin** — front-end, requisitos, regras de negócio e documentação técnica · [GitHub](https://github.com/joaouggdmn) · [LinkedIn](https://linkedin.com/in/joaopedrouggioni)
- **[PREENCHER: nome do parceiro]** — back-end · [GitHub]([PREENCHER])
