import { useState } from 'react'
import { FaUsers } from 'react-icons/fa6'
import PanelPage from '../../../core/components/panel/PanelPage'
import LoadErrorState from '../../../core/components/ui/LoadErrorState'
import ShowMoreButton from '../../../core/components/ui/ShowMoreButton'
import Spinner from '../../../core/components/ui/Spinner'
import PillToggleGroup from '../../../core/components/ui/filters/PillToggleGroup'
import { getErrorMessage } from '../../../core/utils/apiError'
import { matchesSearch } from '../../../core/utils/search'
import SearchBar from '../../animais/components/SearchBar'
import ActivityEmptyState from '../../perfil/components/activity/ActivityEmptyState'
import UserRow from '../components/UserRow'
import { useAdminUsers } from '../hooks/useAdmin'

const PAGE_SIZE = 20

function countWhere(items, predicate) {
  return items.filter(predicate).length
}

function AdminUsersPage() {
  const { data: users = [], isLoading, error, refetch } = useAdminUsers()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Filtro novo, lista do começo
  function withReset(setter) {
    return (value) => {
      setter(value)
      setVisibleCount(PAGE_SIZE)
    }
  }

  let content
  if (isLoading) {
    content = <Spinner />
  } else if (error) {
    content = (
      <LoadErrorState title="Não foi possível carregar as contas" message={getErrorMessage(error)} onRetry={refetch} />
    )
  } else if (users.length === 0) {
    content = <ActivityEmptyState icon={FaUsers} title="Nenhuma conta ainda." />
  } else {
    const typeOptions = [
      { value: '', label: `Todas (${users.length})` },
      { value: 'PESSOA', label: `Pessoas (${countWhere(users, (user) => user.userType === 'PESSOA')})` },
      { value: 'ONG', label: `ONGs (${countWhere(users, (user) => user.userType === 'ONG')})` },
    ]
    // Só faz sentido filtrar por situação quando existe alguma conta banida
    const bannedCount = countWhere(users, (user) => !user.isActive)
    const statusOptions = [
      { value: '', label: 'Qualquer situação' },
      { value: 'ACTIVE', label: `Ativas (${users.length - bannedCount})` },
      { value: 'BANNED', label: `Banidas (${bannedCount})` },
    ]

    const filtered = users
      .filter((user) => !typeFilter || user.userType === typeFilter)
      .filter((user) => !statusFilter || (statusFilter === 'BANNED' ? !user.isActive : user.isActive))
      .filter((user) => matchesSearch(search, user.name, user.email, user.city))
    const visible = filtered.slice(0, visibleCount)

    content = (
      <div className="flex flex-col gap-4">
        <SearchBar value={search} onChange={withReset(setSearch)} placeholder="Buscar por nome, e-mail ou cidade..." />
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <PillToggleGroup options={typeOptions} value={typeFilter} onChange={withReset(setTypeFilter)} />
          {bannedCount > 0 && (
            <PillToggleGroup options={statusOptions} value={statusFilter} onChange={withReset(setStatusFilter)} />
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Nenhuma conta encontrada com esses filtros.</p>
        ) : (
          <>
            <p className="text-xs font-semibold text-slate-400">
              {filtered.length} {filtered.length === 1 ? 'conta' : 'contas'} · mais recentes primeiro
            </p>
            <ul className="flex flex-col gap-3">
              {visible.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </ul>
            {visibleCount < filtered.length && (
              <ShowMoreButton
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                remainingCount={filtered.length - visibleCount}
              />
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <PanelPage
      title="Usuários"
      description="Todas as contas da plataforma: pessoas e ONGs. Toda ONG já entra verificada."
    >
      {content}
    </PanelPage>
  )
}

export default AdminUsersPage
