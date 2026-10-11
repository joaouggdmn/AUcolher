import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../core/context/AuthContext'
import { queryKeys } from '../../../core/services/queryKeys'
import { ADMIN_STALE_TIME } from '../../../core/utils/constants'
import {
  getAdminStats,
  listAdminAnimals,
  listAdminCampaigns,
  listAdminEvents,
  listAdminUsers,
} from '../services/adminService'

// Só a conta admin busca: para as outras o "servidor" responderia 403
function useAdminQuery(queryKey, queryFn) {
  const { user } = useAuth()

  return useQuery({
    queryKey,
    queryFn,
    staleTime: ADMIN_STALE_TIME,
    enabled: user?.userType === 'ADMIN',
  })
}

// Números e séries da Visão geral
export function useAdminStats() {
  return useAdminQuery(queryKeys.admin.stats, getAdminStats)
}

export function useAdminUsers() {
  return useAdminQuery(queryKeys.admin.users, listAdminUsers)
}

export function useAdminAnimals() {
  return useAdminQuery(queryKeys.admin.animals, listAdminAnimals)
}

export function useAdminCampaigns() {
  return useAdminQuery(queryKeys.admin.campaigns, listAdminCampaigns)
}

export function useAdminEvents() {
  return useAdminQuery(queryKeys.admin.events, listAdminEvents)
}
