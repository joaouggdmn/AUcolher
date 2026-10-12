import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarDays, FaComments, FaEye, FaHandHoldingHeart, FaPaw } from 'react-icons/fa6'
import ActionLink from '../shared/ActionLink'
import HomeReveal from '../shared/HomeReveal'
import { useRankedPets } from '../../hooks/useRankedPets'
import { getPersonaActions } from '../../data/personaActions'
import { quizQuestions } from '../../../onboarding/data/quizQuestions'
import { plural } from '../../utils/homePets'

const DOT_PATTERN = {
  backgroundImage: 'radial-gradient(white 1.5px, transparent 1.5px)',
  backgroundSize: '28px 28px',
}

// Atalhos da pessoa e da ONG: o mesmo painel, com as rotas de cada público.
// O perfil público é por id; o admin não tem perfil público e fica sem ele
function getShortcuts({ kind, user }) {
  if (kind === 'ong') {
    return [
      { to: '/campanhas/criar', icon: FaHandHoldingHeart, label: 'Criar campanha' },
      { to: '/eventos/criar', icon: FaCalendarDays, label: 'Criar evento' },
      { to: `/ong/${user?.id}`, icon: FaEye, label: 'Ver perfil público' },
    ]
  }

  return [
    { to: '/campanhas', icon: FaHandHoldingHeart, label: 'Fazer uma doação' },
    { to: '/chat', icon: FaComments, label: 'Conversas' },
    { to: '/animais/criar', icon: FaPaw, label: 'Anunciar um animal' },
    user?.userType !== 'ADMIN' && { to: `/perfil/publico/${user?.id}`, icon: FaEye, label: 'Ver perfil público' },
  ].filter(Boolean)
}

const PANEL_TITLE = 'text-sm font-bold uppercase tracking-wide text-amber-300'

// Cada público vê o próximo passo concreto dele; os textos usam os mesmos
// números do hero (perguntas do quiz, deck calculado)
function getCopy({ kind, quizProgress }, eligibleCount) {
  const questionCount = quizQuestions.length

  if (kind === 'pending') {
    const { missing } = quizProgress
    return {
      eyebrow: 'Quase lá',
      title: `${plural(missing, 'Falta', 'Faltam')} ${missing} ${plural(missing, 'pergunta', 'perguntas')} para os seus matches.`,
      subtitle: 'Termine o quiz e veja todos os pets ordenados para você.',
    }
  }

  if (kind === 'matched') {
    return {
      eyebrow: 'Seu deck está pronto',
      title:
        eligibleCount > 0
          ? `${eligibleCount} ${plural(eligibleCount, 'pet já está ordenado', 'pets já estão ordenados')} para você.`
          : 'Seu deck está em dia.',
      subtitle:
        eligibleCount > 0
          ? 'Curta quem combinar, passe quem não combinar e ajuste suas respostas quando quiser.'
          : 'Assim que novos animais forem cadastrados, eles entram no seu deck ordenados pela compatibilidade.',
    }
  }

  if (kind === 'ong') {
    return {
      eyebrow: 'Atalhos da sua ONG',
      title: 'Mais um resgatado pronto para um lar?',
      subtitle:
        'Quanto mais completo o perfil de comportamento — energia, independência e convivência —, mais preciso o match com quem quer adotar.',
    }
  }

  return {
    eyebrow: 'Seu match começa aqui',
    title: `${questionCount} perguntas separam você do seu AUmigo.`,
    subtitle:
      'Responda o quiz e veja os pets ordenados pela compatibilidade com a sua rotina.',
  }
}

function getActions(persona) {
  const actions = getPersonaActions(persona)
  if (!actions) return null

  switch (persona.kind) {
    case 'visitor':
      return {
        primary: actions.primary,
        // O LoginPage volta para state.from depois de entrar
        secondary: { label: 'Já tenho conta', to: '/login', state: { from: { pathname: '/aumatch' } } },
      }
    case 'pending':
      return { primary: { ...actions.primary, label: 'Terminar meu quiz no AUmatch' } }
    case 'matched':
      return { primary: actions.primary, secondary: { label: 'Ver meus favoritos', to: '/favoritos' } }
    default:
      return actions
  }
}

function QuizQuestionsPanel() {
  return (
    <>
      <h3 className={PANEL_TITLE}>O que o quiz pergunta</h3>
      <ol className="mt-4 flex flex-col gap-3">
        {quizQuestions.map((question, index) => (
          <li key={question.key} className="flex items-start gap-3 text-sm leading-snug text-emerald-50">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold tabular-nums text-emerald-100"
            >
              {index + 1}
            </span>
            <span className="pt-0.5">{question.title}</span>
          </li>
        ))}
      </ol>
    </>
  )
}

function ShortcutsPanel({ persona }) {
  return (
    <>
      <h3 className={PANEL_TITLE}>Mais atalhos</h3>
      <ul className="mt-4 flex flex-col gap-2">
        {getShortcuts(persona).map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <Link
              to={to}
              className="group flex items-center gap-3 rounded-2xl bg-white/5 p-3 text-sm font-bold text-white ring-1 ring-white/10 transition-colors duration-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-900"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                <Icon aria-hidden="true" size={15} />
              </span>
              <span className="flex-1">{label}</span>
              <FaArrowRight
                aria-hidden="true"
                size={12}
                className="text-emerald-200 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

function SidePanel({ persona }) {
  switch (persona.kind) {
    case 'loading':
      return <div aria-hidden="true" className="h-72 rounded-2xl bg-white/5 motion-safe:animate-pulse" />
    case 'pending':
    case 'matched':
    case 'ong':
      return <ShortcutsPanel persona={persona} />
    default:
      return <QuizQuestionsPanel />
  }
}

function FinalCtaSection({ persona }) {
  const { kind, user } = persona
  const { eligibleCount } = useRankedPets(kind === 'matched' ? user : null, { excludeRequested: true })
  const copy = getCopy(persona, eligibleCount)
  const actions = getActions(persona)

  return (
    <section id="atalhos" aria-labelledby="final-title" className="scroll-mt-28 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <HomeReveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-emerald-900 p-6 shadow-2xl shadow-emerald-950/20 sm:p-12 lg:p-14">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute inset-0 opacity-[0.06]" style={DOT_PATTERN} />
              <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-amber-400/20 blur-[100px]" />
              {/* No mobile a pata cairia atrás do painel do quiz */}
              <FaPaw className="absolute -bottom-8 -left-6 hidden text-[10rem] text-white/[0.04] lg:block" />
            </div>

            <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
              <div className="flex flex-col items-start">
                {kind === 'loading' ? (
                  <div aria-hidden="true" className="h-5 w-40 rounded-full bg-white/10 motion-safe:animate-pulse" />
                ) : (
                  <p className="text-sm font-semibold uppercase tracking-wide text-amber-400">{copy.eyebrow}</p>
                )}
                <h2
                  id="final-title"
                  className="mt-3 text-3xl font-black tracking-tight text-balance text-white sm:text-4xl"
                >
                  {copy.title}
                </h2>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-emerald-100/80 sm:text-lg">{copy.subtitle}</p>

                <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
                  {actions ? (
                    <>
                      <ActionLink action={actions.primary} />
                      {actions.secondary && <ActionLink action={actions.secondary} variant="outlineDark" />}
                    </>
                  ) : (
                    <div aria-hidden="true" className="h-12 w-64 rounded-full bg-white/10 motion-safe:animate-pulse sm:h-14" />
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-7">
                <SidePanel persona={persona} />
              </div>
            </div>
          </div>
        </HomeReveal>
      </div>
    </section>
  )
}

export default FinalCtaSection
