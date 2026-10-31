// Módulos sem endpoint no Spring Boot rodam contra um "servidor falso" no
// localStorage (regras-de-negocios.md §12). O padrão é o mock; com
// VITE_USE_MOCK_CHAT=false (ou outra flag abaixo) no .env o mesmo código
// chama a API real. Eventos, campanhas e doações, denúncias, o painel do
// admin, o retorno/repasse de adoções e a exclusão de conta já vêm sempre da API
// Recuperar senha (docs/entrega-final/api-senha.md): sem as rotas da
// migração 010, os links de "Esqueci minha senha" e do "Alterar senha" de
// Minha conta ficam num servidor falso
export const USE_MOCK_SENHA = import.meta.env.VITE_USE_MOCK_SENHA !== 'false'
// Chat dos pedidos (docs/entrega-final/api-chat.md): sem as rotas da migração
// 011, as conversas ficam num servidor falso no localStorage
export const USE_MOCK_CHAT = import.meta.env.VITE_USE_MOCK_CHAT !== 'false'

// Listas públicas mudam pouco: 30 s evita refazer a busca a cada navegação
export const EVENTOS_STALE_TIME = 30_000
export const CAMPANHAS_STALE_TIME = 30_000
export const ADMIN_STALE_TIME = 30_000
export const DENUNCIAS_STALE_TIME = 30_000

// Polling do chat (api-chat.md §3.1): a conversa aberta pergunta por mensagens
// novas a cada 3 s; o resumo (badge e listas), a cada 20 s
export const CHAT_POLL_MS = 3_000
export const CHAT_SUMMARY_POLL_MS = 20_000
export const CHAT_MESSAGE_MAX_LENGTH = 1000

// Capa do evento/campanha e banner da ONG (http ou data URL) — mesmo limite
// do contrato da API
export const EVENT_COVER_MAX_LENGTH = 600_000
export const CAMPAIGN_COVER_MAX_LENGTH = 600_000
export const NGO_COVER_MAX_LENGTH = 600_000

// Doação por PIX (plano §1): valores em reais inteiros, chips de atalho no
// modal, QR válido por 30 min e o modal consulta o status a cada 3 s
export const DONATION_MIN_AMOUNT = 5
export const DONATION_MAX_AMOUNT = 100_000
export const DONATION_AMOUNT_CHIPS = [10, 25, 50, 100]
export const PIX_EXPIRATION_MINUTES = 30
export const DONATION_POLL_INTERVAL = 3_000
