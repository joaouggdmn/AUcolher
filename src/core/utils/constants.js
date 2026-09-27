// Módulos sem endpoint no Spring Boot rodam contra um "servidor falso" no
// localStorage (regras-de-negocios.md §12). O padrão é o mock; com
// VITE_USE_MOCK_EVENTOS=false no .env o mesmo código chama a API real
export const USE_MOCK_EVENTOS = import.meta.env.VITE_USE_MOCK_EVENTOS !== 'false'

// Listas públicas mudam pouco: 30 s evita refazer a busca a cada navegação
export const EVENTOS_STALE_TIME = 30_000

// Capa do evento (http ou data URL) — mesmo limite do contrato da API
export const EVENT_COVER_MAX_LENGTH = 600_000
