# Contrato — API do AUmatch

> ✅ **Implementado.** Backend: pacote `match/` do `api-aucolher`. Documentação completa no README do backend, seção "AUmatch".

## Acesso

Só pessoa física (`PERSON`).
- Sem token: 401 (o front desloga, via `auth:unauthorized`).
- ONG ou admin: 403. O front nem chama: ONG, admin e visitante veem a prévia montada com `GET /animals`, sem score.

## Rotas

| Rota | Uso no front |
|---|---|
| `GET /api/match/profile` | Carrega o Perfil AUmatch no login e no restore da sessão (AuthContext) |
| `PUT /api/match/profile` | Envio do quiz e "Minha conta". Substituição completa: mande as 7 respostas |
| `GET /api/match/deck` | Deck do `/aumatch` e ranking da home (persona `matched`) |

## Perfil: front ↔ API

| Front (`user.*`) | Valores no front | API | Valores na API |
|---|---|---|---|
| `moradia` | APARTAMENTO / CASA_QUINTAL / SITIO | `housing` | APARTMENT / HOUSE_WITH_YARD / FARM |
| `rotinaExercicio` | SEDENTARIO / ATIVO / MUITO_ATIVO | `exerciseRoutine` | SEDENTARY / ACTIVE / VERY_ACTIVE |
| `tempoForaCasa` | POUCO_TEMPO / PERIODO_NORMAL / LONGO_PERIODO | `timeAway` | SHORT / REGULAR / LONG |
| `convivencia` | array de CRIANCAS / CAES / GATOS, ou `['NINGUEM']` | `hasChildren`, `hasDogs`, `hasCats` | os três booleanos, ou os três `null` |
| `speciesPreference` | DOG / CAT / BOTH | `speciesPreference` | igual |
| `idealPetProfile` | CALM_COMPANION / PLAYFUL_ACTIVE / PROTECTIVE_INDEPENDENT | `idealPetProfile` | igual |
| `portePreferido` | PEQUENO / MEDIO / GRANDE | `preferredSize` | SMALL / MEDIUM / LARGE |

- A resposta traz também `complete` (as 7 respondidas).
- `convivencia: null` = sem resposta (os três `null` na API).
- `['NINGUEM']` = os três `false`.
- A API recusa só uma parte dos três booleanos (400, `errors.householdValid`).

## Deck

```json
[
  {
    "animal": { "...": "AnimalSummaryDTO, o mesmo card de GET /animals (agora com independenceLevel)" },
    "matchScore": 85,
    "criteria": [{ "key": "HOUSING", "points": 15, "maxPoints": 15, "answered": true }]
  }
]
```

**Montagem (no back):**
- A lista vem inteira, já ordenada pelo score, sem paginação.
- No empate de score, vem primeiro o anúncio mais recente.
- Entram só animais `AVAILABLE` de contas ativas, menos os da própria pessoa, filtrados por `speciesPreference`.

**Filtros que ficam no front** (até os pedidos de adoção irem para a API):
- os animais já pedidos (mock);
- os de donos banidos (mock);
- cidade e ordenação (`applyMatchPreferences`).

**`criteria[].key`:** `HOUSING`, `ENERGY`, `INDEPENDENCE`, `LIVING`, `TEMPERAMENT`, `SIZE`. Os textos e ícones do "Por que deu match?" ficam no front.

## Algoritmo (espelhado em `features/aumatch/utils/matchScore.js`)

| Critério | Máx | Regra |
|---|---|---|
| HOUSING | 15 | Apartamento: 15 se `apartmentFriendly`, senão 0. Casa, sítio ou sem resposta: 15 |
| ENERGY | 20 | Rotina → LOW/MODERATE/HIGH × `energyLevel`: igual 20, vizinho 8, oposto 0 |
| INDEPENDENCE | 20 | Tempo fora → LOW/MODERATE/HIGH × `independenceLevel`: 20, 8 ou 0 |
| LIVING | 15 | Ninguém ou sem resposta: 15. Senão `round(15 × compatíveis / grupos presentes)` |
| TEMPERAMENT | 15 | Perfil ideal × temperamento: 15 ou 0 |
| SIZE | 15 | Porte preferido (ou SMALL, se vazio e mora em apartamento) × `size`: 15, 6 ou 0 |

Quem ainda não respondeu nada começa com 30 pontos.
