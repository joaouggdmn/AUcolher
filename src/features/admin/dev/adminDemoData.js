import { USE_MOCK_ADMIN, USE_MOCK_CAMPANHAS } from '../../../core/utils/constants'
import { ADOPTION_REQUESTS_STORAGE_KEY } from '../../../core/utils/storageKeys'
import { insertAdminDemoCampaigns, removeAdminDemoCampaigns } from '../../doacoes/services/doacoesMock'
import { insertDemoAccounts, removeDemoAccounts } from '../services/adminMock'
import { buildDemoAccounts, buildDemoCampaigns, buildDemoRequests } from './adminDemoContent'

// 🔴 Dados de teste do painel do admin (só em dev): contas novas, pedidos e
// adoções concluídas, e campanhas encerradas com doações, todos espalhados
// nos últimos 6 meses. Tudo fica no navegador, marcado com `adminDemo` —
// nada vai para o banco, e o "Apagar" do painel da ONG não mexe nisto
const SEED_KEY = 'aucolher_admin_demo_seed'

function readRequests() {
  try {
    return JSON.parse(localStorage.getItem(ADOPTION_REQUESTS_STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export function isAdminDemoActive() {
  return localStorage.getItem(SEED_KEY) === 'active'
}

function clearDemoRequests() {
  const requests = readRequests().filter((request) => !request.adminDemo)
  localStorage.setItem(ADOPTION_REQUESTS_STORAGE_KEY, JSON.stringify(requests))
}

// `onProgress` recebe o passo atual, para a tela mostrar. Quem chama
// recarrega a página no fim: os contextos e o cache releem tudo
export async function generateAdminDemoData(onProgress) {
  if (USE_MOCK_ADMIN) {
    onProgress('Criando contas novas...')
    await removeDemoAccounts()
    await insertDemoAccounts(buildDemoAccounts())
  }

  onProgress('Criando pedidos e adoções...')
  clearDemoRequests()
  localStorage.setItem(ADOPTION_REQUESTS_STORAGE_KEY, JSON.stringify([...buildDemoRequests(), ...readRequests()]))

  if (USE_MOCK_CAMPANHAS) {
    onProgress('Criando campanhas e doações...')
    await removeAdminDemoCampaigns()
    await insertAdminDemoCampaigns(buildDemoCampaigns())
  }

  localStorage.setItem(SEED_KEY, 'active')
}

export async function removeAdminDemoData(onProgress) {
  if (USE_MOCK_ADMIN) {
    onProgress('Apagando contas de teste...')
    await removeDemoAccounts()
  }

  onProgress('Apagando pedidos e adoções de teste...')
  clearDemoRequests()

  if (USE_MOCK_CAMPANHAS) {
    onProgress('Apagando campanhas e doações de teste...')
    await removeAdminDemoCampaigns()
  }

  localStorage.removeItem(SEED_KEY)
}
