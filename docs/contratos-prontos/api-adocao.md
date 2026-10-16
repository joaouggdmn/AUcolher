# Contrato — API de pedidos de adoção e avaliações

> ✅ **Implementado.** Backend: pacote `adoption/` do `api-aucolher`. Referência completa no README do backend, seções "Pedidos de adoção", "Avaliações" e "Admin: pedidos". Migração: `sql/migrations/005_adoption_requests.sql`.

O chat continua mock: as mensagens ficam no navegador, guardadas pelo **id real** do pedido (`chat_messages_{id}`). O contrato para levar o chat ao banco está em `../entrega-final/api-chat.md`. Com ele, as trocas de status (confirmar entrega, concluir, desistir) também passam a criar as mensagens de sistema no backend.

## Rotas

| Rota | Quem | Uso no front |
|---|---|---|
| `POST /api/adoption-requests {animalId}` | pessoa ou ONG (admin 403) | "Enviar pedido" na página do animal e curtir no AUmatch |
| `GET /api/adoption-requests/sent` | logado | "Meus interesses"; botão da página do animal ("Pedido enviado", "Recusado") |
| `GET /api/adoption-requests/received` | logado | Interesses recebidos, painel da ONG, badges de pendentes, chat |
| `GET /api/adoption-requests/{id}` | as partes | (opcional) recarregar um pedido |
| `PATCH /api/adoption-requests/{id}/status {status}` | depende | Aceitar, recusar, confirmar entrega, confirmar chegada, cancelar |
| `PUT /api/adoption-requests/{id}/review {rating, comment}` | as partes, em CONCLUDED | Avaliar ou editar (responde o pedido atualizado) |
| `DELETE /api/adoption-requests/{id}/review` | as partes | Apagar a minha avaliação (204) |
| `GET /api/users/{id}/reviews` | público | Perfil público, avaliações recebidas e adoções |
| `GET /api/admin/adoption-requests` | admin | Funil, adoções por mês, ranking de ONGs |

## Status e transições (validadas no servidor)

| De → Para | Quem | Observação |
|---|---|---|
| PENDING → ACCEPTED | dono | Libera o chat |
| PENDING → REJECTED | dono | Definitivo: a pessoa não pede aquele animal de novo |
| ACCEPTED → AWAITING_DELIVERY | dono | "Confirmar entrega"; o chat fica só leitura |
| AWAITING_DELIVERY → CONCLUDED | adotante | "Confirmar chegada"; o animal vira ADOPTED e os outros pedidos ativos são cancelados (`ANIMAL_ADOPTED`) |
| PENDING / ACCEPTED / AWAITING_DELIVERY → CANCELLED | adotante | `ADOPTER_WITHDREW` (inclusive durante a entrega) |
| ACCEPTED / AWAITING_DELIVERY → CANCELLED | dono | `OWNER_WITHDREW` (pendente o dono recusa) |
| ativos → CANCELLED | sistema | `ANIMAL_UNAVAILABLE`: o dono marcou o animal como adotado, tirou do ar ou excluiu |

- **Erros:** papel errado responde 403; status de partida errado, 400 (`message` pronta para mostrar).
- **Pedir de novo:** só depois de um pedido CANCELLED.
- **Vários aceites:** o dono pode aceitar vários pedidos; vale o primeiro que concluir.

**Motivos só do front (moderação mock):** `ACCOUNT_BANNED` e `LISTING_REMOVED`. A fachada mostra como CANCELLED os pedidos ativos com uma parte banida ou com o anúncio removido, sem mudar o servidor. Eles entram no banco com a moderação real (`api-denuncias-moderacao.md` §5).

## AdoptionRequestDTO → modelo do front

API:
```json
{
  "id": 8, "status": "PENDING", "cancelReason": null, "cancelledFromStatus": null,
  "createdAt": "...", "updatedAt": "...", "concludedAt": null, "closedAt": null,
  "animal": { "...AnimalSummaryDTO": "com owner {id, name, photoUrl, userType, isVerified}" },
  "adopter": { "id": 4, "name": "Maria", "photoUrl": null, "userType": "PERSON", "city": "Criciúma", "state": "SC",
               "matchProfile": { "...MatchProfileDTO": "ou null" } },
  "matchScore": 85,
  "reviews": { "adopter": "ReviewDTO|null", "owner": "ReviewDTO|null" }
}
```

O front mantém o formato que as telas já usam:
```js
{
  id, animalId: animal.id, ownerId: animal.owner.id, status, createdAt, concludedAt,
  cancelReason, cancelledFromStatus, animalSource: 'api',
  animal: toFrontendAnimal(dto.animal),
  adopter: {
    userId, name, photoUrl, city, state,
    // respostas do quiz já convertidas (toFrontendMatchProfile)
    moradia, rotinaExercicio, ...,
    lifestyleSummary, profileCompletion,   // calculados no front
  },
  matchScore,                              // do servidor (antes: computeMatchScore no front)
  reviews: { adopter, owner },             // ReviewDTO → { rating, comment, authorId, authorName, authorPhotoUrl, authorIsOng, createdAt, updatedAt }
}
```

## Avaliações

- **Quem avalia quem:**
  - `reviews.adopter` é escrita pelo adotante, sobre o dono;
  - `reviews.owner` é escrita pelo dono, sobre o adotante.
- **Regras:** nota de 1 a 5; comentário opcional, de até 500 caracteres; `updatedAt` só aparece depois de uma edição.
- **Resumo do perfil:** `GET /users/{id}/reviews` devolve `{ average (1 casa), count, distribution {"5":n,…,"1":n}, adoptionsCount, reviews[] }`.
  - Cada item tem `{ id, requestId, rating, comment, author { id, name, photoUrl, isOng }, animalName, createdAt, updatedAt }`.
  - `adoptionsCount` = pedidos CONCLUDED em que a conta foi dona ou adotante.

## Dados de teste

- `docs/seed-animais-teste.sql`: 25 animais.
- `docs/seed-pedidos-teste.sql`: 11 pedidos em todos os status, com avaliações, nos animais de teste.
- Para desfazer: `remover-pedidos-teste.sql` e `remover-animais-teste.sql`.
