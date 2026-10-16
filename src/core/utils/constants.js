// Módulos sem endpoint no Spring Boot rodam contra um "servidor falso" no
// localStorage (regras-de-negocios.md §12). O padrão é o mock; com
// VITE_USE_MOCK_EVENTOS=false (ou _CAMPANHAS) no .env o mesmo código chama
// a API real
export const USE_MOCK_EVENTOS = import.meta.env.VITE_USE_MOCK_EVENTOS !== 'false'
export const USE_MOCK_CAMPANHAS = import.meta.env.VITE_USE_MOCK_CAMPANHAS !== 'false'
// Painel do admin: sem as rotas /api/admin/* no Spring Boot, um servidor falso
// junta contas (mock), animais (API real), pedidos, campanhas e eventos
export const USE_MOCK_ADMIN = import.meta.env.VITE_USE_MOCK_ADMIN !== 'false'
// Denúncias feitas no site (POST /api/reports e GET /api/reports/mine)
export const USE_MOCK_DENUNCIAS = import.meta.env.VITE_USE_MOCK_DENUNCIAS !== 'false'
// Retorno e repasse de adoções (docs/contratos-prontos/api-devolucao-reabandono.md):
// sem as rotas da migração 012, um "servidor falso" guarda os registros por
// pedido e os sobrepõe aos pedidos reais
export const USE_MOCK_REABANDONO = import.meta.env.VITE_USE_MOCK_REABANDONO !== 'false'
// Recuperar senha (docs/entrega-final/api-senha.md): sem as rotas da
// migração 010, os links de "Esqueci minha senha" e do "Alterar senha" de
// Minha conta ficam num servidor falso
export const USE_MOCK_SENHA = import.meta.env.VITE_USE_MOCK_SENHA !== 'false'

// Listas públicas mudam pouco: 30 s evita refazer a busca a cada navegação
export const EVENTOS_STALE_TIME = 30_000
export const CAMPANHAS_STALE_TIME = 30_000
export const ADMIN_STALE_TIME = 30_000
export const DENUNCIAS_STALE_TIME = 30_000

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
