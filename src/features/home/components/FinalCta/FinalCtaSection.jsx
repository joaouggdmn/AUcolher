import { Link } from 'react-router-dom'
import { FaArrowRight, FaBuildingShield, FaCalendarDays, FaCircleCheck, FaHandHoldingHeart, FaPaw, FaUserPen } from 'react-icons/fa6'
import ActionLink from '../shared/ActionLink'
import HomeReveal from '../shared/HomeReveal'
import MoreWaysToHelp from './MoreWaysToHelp'
import { useRankedPets } from '../../hooks/useRankedPets'
import { getPersonaActions } from '../../data/personaActions'
import { isAnswered } from '../../data/exampleProfile'
import { quizQuestions } from '../../../onboarding/data/quizQuestions'
import { plural } from '../../utils/homePets'

const DOT_PATTERN = {
  backgroundImage: 'radial-gradient(white 1.5px, transparent 1.5px)',
  backgroundSize: '28px 28px',
}

const SHORT_QUESTION_LABELS = {
  moradia: 'Moradia',
  rotinaExercicio: 'Rotina',
  tempoForaCasa: 'Tempo fora de casa',
  temCriancasOuPets: 'Crianças ou pets em casa',
  speciesPreference: 'Espécie',
  idealPetProfile: 'Pet ideal',
  portePreferido: 'Porte',
}

const ONG_SHORTCUTS = [
  { to: '/campanhas/criar', icon: FaHandHoldingHeart, label: 'Criar campanha' },
  { to: '/eventos/criar', icon: FaCalendarDays, label: 'Criar evento' },
  { to: '/perfil', icon: FaUserPen, label: 'Completar perfil da ONG' },
]

const PANEL_TITLE = 'text-sm font-bold uppercase tracking-wide text-amber-300'

function answerLabel(question, value) {
  return question.options.find((option) => option.value === value)?.label ?? '—'
}

// Cada público vê o próximo passo concreto dele; os textos usam os mesmos
// números do hero (perguntas do quiz, deck calculado)
function getCopy({ kind, quizProgress }, eligibleCount) {
  const questionCount = quizQuestions.length

  if (kind === 'pending') {
    const { missing } = quizProgress
    return {
      eyebrow: 'Quase lá',
      title: `${plural(missing, 'Falta', 'Faltam')} ${missing} ${plural(missing, 'pergunta', 'perguntas')} para os seus matches.`,
      subtitle: 'Termine o quiz no AUmatch e veja todos os pets ordenados pela compatibilidade com a sua rotina — sempre com o porquê.',
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
      'Crie sua conta grátis, responda o quiz e veja os pets ordenados pela compatibilidade com a sua rotina — sempre com o porquê.',
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

function QuizProgressPanel({ user }) {
  return (
    <>
      <h3 className={PANEL_TITLE}>Seu progresso</h3>
      <ul className="mt-4 flex flex-col gap-3">
        {quizQuestions.map((question) => {
          const done = isAnswered(user?.[question.key])
          return (
            <li key={question.key} className="flex items-start gap-3 text-sm leading-snug">
              {done ? (
                <FaCircleCheck aria-hidden="true" size={18} className="mt-px shrink-0 text-emerald-300" />
              ) : (
                <span aria-hidden="true" className="mt-px h-[18px] w-[18px] shrink-0 rounded-full border-2 border-white/25" />
              )}
              <span className={`flex-1 ${done ? 'text-emerald-100/70' : 'font-semibold text-white'}`}>
                {question.title}
                <span className="sr-only">{done ? ' (respondida)' : ' (pendente)'}</span>
              </span>
              {!done && (
                <span aria-hidden="true" className="shrink-0 rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                  pendente
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}

function MatchProfilePanel({ user }) {
  return (
    <>
      <h3 className={PANEL_TITLE}>Seu perfil AUmatch</h3>
      <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {quizQuestions.map((question) => (
          <div key={question.key}>
            <dt className="text-xs font-semibold text-emerald-100/60">{SHORT_QUESTION_LABELS[question.key] ?? question.title}</dt>
            <dd className="mt-0.5 text-sm font-bold text-white">{answerLabel(question, user?.[question.key])}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}

function OngShortcutsPanel() {
  return (
    <>
      <h3 className={PANEL_TITLE}>Mais atalhos</h3>
      <ul className="mt-4 flex flex-col gap-2">
        {ONG_SHORTCUTS.map(({ to, icon: Icon, label }) => (
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
      return <QuizProgressPanel user={persona.user} />
    case 'matched':
      return <MatchProfilePanel user={persona.user} />
    case 'ong':
      return <OngShortcutsPanel />
    default:
      return <QuizQuestionsPanel />
  }
}

function NgoInviteStrip() {
  return (
    <div className="mt-6 flex flex-col gap-5 rounded-3xl bg-white p-6 ring-1 ring-slate-200/70 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <FaBuildingShield aria-hidden="true" size={20} />
        </span>
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-emerald-950">Representa uma ONG?</h3>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
            Cadastre sua instituição: seus animais entram no AUmatch com o selo de verificada, e você gerencia pedidos,
            campanhas e eventos em um só lugar.
          </p>
        </div>
      </div>
      <ActionLink
        action={{ label: 'Cadastrar instituição', to: '/cadastro', state: { preselectUserType: 'ONG' } }}
        variant="emerald"
        size="md"
        showArrow
        className="shrink-0"
      />
    </div>
  )
}

function FinalCtaSection({ persona }) {
  const { kind, user } = persona
  const { eligibleCount } = useRankedPets(kind === 'matched' ? user : null, { excludeRequested: true })
  const copy = getCopy(persona, eligibleCount)
  const actions = getActions(persona)

  return (
    <section aria-labelledby="final-title" className="bg-stone-50 py-20 lg:py-28">
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

        {kind === 'visitor' && (
          <HomeReveal>
            <NgoInviteStrip />
          </HomeReveal>
        )}

        <HomeReveal>
          <MoreWaysToHelp className="mt-12" />
        </HomeReveal>
      </div>
    </section>
  )
}

export default FinalCtaSection
