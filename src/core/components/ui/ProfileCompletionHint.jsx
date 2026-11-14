import { Link, useLocation } from 'react-router-dom'
import { FaUserPen, FaArrowRight } from 'react-icons/fa6'
import { useAuth } from '../../context/AuthContext'
import { useProfileCompletion } from '../../hooks/useProfileCompletion'

// O <select> de estado do CityStateFields, que Minha conta usa na Localização
const LOCATION_STATE_FIELD_ID = 'location-state'

const TONE_CLASSES = {
  light: {
    box: 'bg-slate-50 text-slate-600',
    icon: 'text-amber-500',
    strong: 'text-emerald-950',
    link: 'text-emerald-700 hover:text-emerald-900',
  },
  dark: {
    box: 'border border-white/10 bg-white/5 text-emerald-100/75',
    icon: 'text-amber-300',
    strong: 'text-white',
    link: 'text-amber-300 hover:text-amber-200',
  },
}

function joinLabels(labels) {
  if (labels.length <= 1) return labels[0] ?? ''
  return `${labels.slice(0, -1).join(', ')} e ${labels.at(-1)}`
}

// Lembrete discreto para quem adota: quem recebe o pedido vê a completude do
// perfil (o selo de % no card do pedido), então vale completar antes. Não
// bloqueia nada e some sozinho em 100%. Só pessoa física: ONG e admin não
// têm esse checklist no pedido
function ProfileCompletionHint({ lead, tone = 'light', className = '' }) {
  const { user, isMatchProfileReady } = useAuth()
  const { checklist, percentage } = useProfileCompletion(user)
  const { pathname } = useLocation()

  // Antes do perfil AUmatch chegar da API, o quiz pareceria não respondido
  if (user?.userType !== 'PESSOA' || !isMatchProfileReady || percentage === 100) return null

  const missing = checklist.filter((item) => !item.isComplete)
  const isMissingLocation = missing.some((item) => item.key === 'localizacao')
  const isOnlyQuizMissing = missing.length === 1 && missing[0].key === 'estiloDeVida'

  // No AUmatch o botão do quiz já está ao lado: repetir só o quiz seria ruído
  if (isOnlyQuizMissing && pathname.startsWith('/aumatch')) return null

  // Só o quiz: o AUmatch reabre ele sozinho. O resto se completa em Minha
  // conta, já com o campo de estado em foco quando falta a localização
  const link = isOnlyQuizMissing
    ? { to: '/aumatch', state: undefined }
    : { to: '/perfil', state: isMissingLocation ? { focusField: LOCATION_STATE_FIELD_ID } : undefined }

  const classes = TONE_CLASSES[tone]

  return (
    <div className={`flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${classes.box} ${className}`}>
      <FaUserPen size={13} className={`mt-0.5 shrink-0 ${classes.icon}`} />
      <p>
        {lead} Ele está <strong className={classes.strong}>{percentage}% completo</strong>:{' '}
        {missing.length === 1 ? 'falta' : 'faltam'}{' '}
        <strong className={classes.strong}>{joinLabels(missing.map((item) => item.label))}</strong>.{' '}
        <Link
          to={link.to}
          state={link.state}
          className={`inline-flex items-center gap-1 whitespace-nowrap font-bold transition-colors duration-300 ${classes.link}`}
        >
          Completar perfil
          <FaArrowRight size={9} />
        </Link>
      </p>
    </div>
  )
}

export default ProfileCompletionHint
