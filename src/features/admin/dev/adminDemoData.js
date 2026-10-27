import { USE_MOCK_CAMPANHAS } from '../../../core/utils/constants'
import { insertAdminDemoCampaigns, removeAdminDemoCampaigns } from '../../doacoes/services/doacoesMock'
import { buildDemoCampaigns } from './adminDemoContent'

// 🔴 Dados de teste do painel do admin (só em dev): campanhas encerradas com
// doações, espalhadas nos últimos 6 meses. Contas, animais e pedidos vêm da
// API; só as campanhas, que ainda são mock, ganham exemplos. Tudo fica no
// navegador, marcado com `adminDemo` — nada vai para o banco, e o "Apagar"
// do painel da ONG não mexe nisto
const SEED_KEY = 'aucolher_admin_demo_seed'

export function isAdminDemoActive() {
  return localStorage.getItem(SEED_KEY) === 'active'
}

// `onProgress` recebe o passo atual, para a tela mostrar. Quem chama
// recarrega a página no fim: os contextos e o cache releem tudo
export async function generateAdminDemoData(onProgress) {
  if (USE_MOCK_CAMPANHAS) {
    onProgress('Criando campanhas e doações...')
    await removeAdminDemoCampaigns()
    await insertAdminDemoCampaigns(buildDemoCampaigns())
  }

  localStorage.setItem(SEED_KEY, 'active')
}

export async function removeAdminDemoData(onProgress) {
  if (USE_MOCK_CAMPANHAS) {
    onProgress('Apagando campanhas e doações de teste...')
    await removeAdminDemoCampaigns()
  }

  localStorage.removeItem(SEED_KEY)
}
