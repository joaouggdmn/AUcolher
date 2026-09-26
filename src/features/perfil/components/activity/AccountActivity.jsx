import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaPaw,
  FaStar,
  FaHandHoldingHeart,
  FaCalendarCheck,
  FaPlus,
  FaArrowRight,
  FaEye,
  FaLock,
} from 'react-icons/fa6'
import { formatCurrency } from '../../../../core/utils/currency'
import { useAccountActivity } from '../../hooks/useAccountActivity'
import ProfileReviewsList from '../public/ProfileReviewsList'
import VisibilityChip from '../account/VisibilityChip'
import MyAnimalsPanel from './MyAnimalsPanel'
import ImpactPanel from './ImpactPanel'
import AttendedEventsPanel from './AttendedEventsPanel'

function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm
}

// Parte inferior de "Minha conta": cada card resume uma métrica e, ao ser
// clicado, abre o histórico correspondente logo abaixo (padrão de abas)
function AccountActivity({ user }) {
  const isOng = user?.userType === 'ONG'
  const { animals, reviews, impact, events } = useAccountActivity(user)
  const [activeKey, setActiveKey] = useState('animais')

  const availableCount = animals.filter((animal) => animal.listingStatus === 'DISPONIVEL').length

  const sections = [
    {
      key: 'animais',
      icon: FaPaw,
      label: 'Animais cadastrados',
      visibility: 'public',
      value: animals.length,
      caption: `${availableCount} ${plural(availableCount, 'disponível', 'disponíveis')}`,
      description: 'Os disponíveis aparecem no seu perfil público. Os adotados ficam só no seu histórico.',
      actions: [{ to: '/animais/criar', label: 'Cadastrar animal', icon: FaPlus }],
      content: <MyAnimalsPanel animals={animals} />,
    },
    {
      key: 'avaliacoes',
      icon: FaStar,
      label: 'Avaliações recebidas',
      visibility: 'public',
      value: reviews.count > 0 ? reviews.average.toFixed(1).replace('.', ',') : '—',
      caption: `${reviews.count} ${plural(reviews.count, 'avaliação', 'avaliações')}`,
      description:
        'Deixadas por quem adotou ou doou com você depois de uma adoção concluída. Aparecem no seu perfil público.',
      content: <ProfileReviewsList {...reviews} />,
    },
    {
      key: 'impacto',
      icon: FaHandHoldingHeart,
      label: 'Meu impacto',
      visibility: 'private',
      value: impact.adoptionsCount,
      caption: isOng
        ? plural(impact.adoptionsCount, 'adoção realizada', 'adoções realizadas')
        : `${plural(impact.adoptionsCount, 'adoção', 'adoções')} · ${formatCurrency(impact.totalDonated)} doados`,
      description: isOng
        ? 'Adoções concluídas pela instituição. O total aparece no perfil público; o histórico fica só aqui.'
        : 'Adoções concluídas e doações para campanhas. O número de adoções aparece no seu perfil; o histórico fica só aqui.',
      actions: isOng
        ? [{ to: '/interesses-recebidos', label: 'Interesses recebidos' }]
        : [{ to: '/campanhas', label: 'Ver campanhas' }],
      content: <ImpactPanel impact={impact} isOng={isOng} />,
    },
    {
      key: 'eventos',
      icon: FaCalendarCheck,
      label: 'Eventos participados',
      visibility: 'private',
      value: events.past.length,
      caption:
        events.upcoming.length > 0
          ? `${events.upcoming.length} com presença confirmada`
          : plural(events.past.length, 'evento', 'eventos'),
      description: 'Eventos em que você confirmou presença: os próximos e os que já aconteceram. Só você vê esta lista.',
      actions: [
        ...(isOng ? [{ to: '/eventos/criar', label: 'Criar evento', icon: FaPlus }] : []),
        { to: '/eventos', label: 'Explorar eventos' },
      ],
      content: <AttendedEventsPanel events={events} />,
    },
  ]

  const activeSection = sections.find((section) => section.key === activeKey)

  return (
    <section aria-labelledby="account-activity-title" className="mt-16">
      <div className="mb-5">
        <h2 id="account-activity-title" className="text-xl font-black tracking-tight text-emerald-950">
          Atividade na AUcolher
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">Seus números e históricos na plataforma. Escolha um card para ver os detalhes.</p>
      </div>

      <div role="tablist" aria-label="Atividade da conta" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {sections.map((section) => {
          const Icon = section.icon
          const VisibilityIcon = section.visibility === 'public' ? FaEye : FaLock
          const isActive = section.key === activeKey

          return (
            <button
              key={section.key}
              id={`activity-tab-${section.key}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="activity-panel"
              onClick={() => setActiveKey(section.key)}
              className={`relative flex flex-col items-start gap-3 rounded-2xl p-4 text-left transition-all duration-300 ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/20'
                  : 'border border-slate-100 bg-white shadow-sm hover:border-emerald-200 hover:shadow-md'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  isActive ? 'bg-white/15 text-amber-300' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                <Icon size={15} />
              </span>

              <VisibilityIcon
                size={11}
                title={section.visibility === 'public' ? 'Aparece no perfil público' : 'Só você vê'}
                className={`absolute right-4 top-4 ${isActive ? 'text-emerald-200/70' : 'text-slate-300'}`}
              />

              <span className="min-w-0 max-w-full">
                <span className={`block text-2xl font-black tracking-tight ${isActive ? 'text-white' : 'text-emerald-950'}`}>
                  {section.value}
                </span>
                <span className={`block text-sm font-bold leading-snug ${isActive ? 'text-white' : 'text-emerald-950'}`}>
                  {section.label}
                </span>
                <span className={`mt-0.5 block truncate text-xs ${isActive ? 'text-emerald-100/80' : 'text-slate-500'}`}>
                  {section.caption}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* key força remontagem a cada troca, disparando a animação de entrada */}
      <div
        key={activeKey}
        id="activity-panel"
        role="tabpanel"
        aria-labelledby={`activity-tab-${activeKey}`}
        className="mt-4 animate-fade-slide-in rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-extrabold tracking-tight text-emerald-950">{activeSection.label}</h3>
              <VisibilityChip visibility={activeSection.visibility} />
            </div>
            <p className="mt-1 max-w-xl text-sm text-slate-500">{activeSection.description}</p>
          </div>

          {activeSection.actions && (
            <div className="flex shrink-0 flex-wrap gap-2">
              {activeSection.actions.map(({ to, label, icon: ActionIcon = FaArrowRight }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-800 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <ActionIcon size={11} />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {activeSection.content}
      </div>
    </section>
  )
}

export default AccountActivity
