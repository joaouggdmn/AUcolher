import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarDays, FaCircleCheck, FaHandHoldingHeart, FaUserPen } from 'react-icons/fa6'
import SectionHeader from '../shared/SectionHeader'
import HomeReveal from '../shared/HomeReveal'
import { useRankedPets } from '../../hooks/useRankedPets'
import { quizQuestions } from '../../../onboarding/data/quizQuestions'
import { isAnswered, plural } from '../../utils/homePets'

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

const PANEL_TITLE = 'text-sm font-bold uppercase tracking-wide text-amber-700'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50'

function answerLabel(question, value) {
  return question.options.find((option) => option.value === value)?.label ?? '—'
}

// Os botões de cada público ficam no hero, logo acima: aqui o texto só
// contextualiza o painel ao lado, sem chamar para o mesmo clique de novo
function getCopy({ kind, quizProgress }, eligibleCount) {
  const questionCount = quizQuestions.length

  if (kind === 'pending') {
    const { missing } = quizProgress
    return {
      eyebrow: 'Quase lá',
      title: `${plural(missing, 'Falta', 'Faltam')} ${missing} ${plural(missing, 'pergunta', 'perguntas')} para os seus matches.`,
      subtitle: 'O que você já respondeu fica salvo. Termine o quiz no AUmatch e veja todos os pets ordenados para você.',
    }
  }

  if (kind === 'matched') {
    return {
      eyebrow: 'Seu perfil AUmatch',
      title:
        eligibleCount > 0
          ? `${eligibleCount} ${plural(eligibleCount, 'pet já está ordenado', 'pets já estão ordenados')} para você.`
          : 'Seu deck está em dia.',
      subtitle:
        'Estas são as respostas que ordenam o seu deck. Mudou de casa ou de rotina? Refaça o quiz pelas preferências do AUmatch.',
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
    eyebrow: 'Como o AUmatch te conhece',
    title: `${questionCount} perguntas separam você do seu AUmigo.`,
    subtitle:
      'Perguntas rápidas sobre a sua casa e a sua rotina. Com elas, o AUmatch ordena os pets pela compatibilidade com você.',
  }
}

function QuizQuestionsPanel() {
  return (
    <>
      <h3 className={PANEL_TITLE}>O que o quiz pergunta</h3>
      <ol className="mt-4 flex flex-col gap-3">
        {quizQuestions.map((question, index) => (
          <li key={question.key} className="flex items-start gap-3 text-sm leading-snug text-slate-700">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold tabular-nums text-emerald-800 ring-1 ring-slate-200"
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

// Quem chega pelo "Ver o que falta" do hero precisa de um caminho daqui
// mesmo, por isso o único link da seção fica no fim deste painel
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
                <FaCircleCheck aria-hidden="true" size={18} className="mt-px shrink-0 text-emerald-600" />
              ) : (
                <span aria-hidden="true" className="mt-px h-[18px] w-[18px] shrink-0 rounded-full border-2 border-slate-300" />
              )}
              <span className={`flex-1 ${done ? 'text-slate-500' : 'font-semibold text-emerald-950'}`}>
                {question.title}
                <span className="sr-only">{done ? ' (respondida)' : ' (pendente)'}</span>
              </span>
              {!done && (
                <span aria-hidden="true" className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                  pendente
                </span>
              )}
            </li>
          )
        })}
      </ul>
      <Link
        to="/aumatch"
        className={`group mt-6 inline-flex items-center gap-1.5 rounded-full text-sm font-bold text-emerald-800 underline-offset-4 hover:underline ${FOCUS_RING}`}
      >
        Responder agora no AUmatch
        <FaArrowRight
          aria-hidden="true"
          size={11}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </Link>
    </>
  )
}

function MatchProfilePanel({ user }) {
  return (
    <>
      <h3 className={PANEL_TITLE}>Suas respostas</h3>
      <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {quizQuestions.map((question) => (
          <div key={question.key}>
            <dt className="text-xs font-semibold text-slate-500">{SHORT_QUESTION_LABELS[question.key] ?? question.title}</dt>
            <dd className="mt-0.5 text-sm font-bold text-emerald-950">{answerLabel(question, user?.[question.key])}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}

function OngShortcutsPanel() {
  return (
    <>
      <h3 className={PANEL_TITLE}>Atalhos</h3>
      <ul className="mt-4 flex flex-col gap-2">
        {ONG_SHORTCUTS.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <Link
              to={to}
              className={`group flex items-center gap-3 rounded-2xl bg-white p-3 text-sm font-bold text-emerald-950 ring-1 ring-slate-200 transition-shadow duration-300 hover:ring-emerald-600 ${FOCUS_RING}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Icon aria-hidden="true" size={15} />
              </span>
              <span className="flex-1">{label}</span>
              <FaArrowRight
                aria-hidden="true"
                size={12}
                className="text-emerald-700 transition-transform duration-300 group-hover:translate-x-1"
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
      return <div aria-hidden="true" className="h-72 rounded-2xl bg-slate-200/70 motion-safe:animate-pulse" />
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

// Segunda seção da home: o "e agora?" de cada público, logo abaixo do hero.
// id="atalhos": destino do "Ver o que falta" do hero (quiz pendente)
function ShortcutsSection({ persona }) {
  const { kind, user } = persona
  const { eligibleCount } = useRankedPets(kind === 'matched' ? user : null, { excludeRequested: true })
  const copy = getCopy(persona, eligibleCount)

  return (
    <section id="atalhos" aria-labelledby="shortcuts-title" className="scroll-mt-28 bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-14">
        <HomeReveal>
          {/* Enquanto a sessão carrega, o eyebrow some em vez de mostrar o do visitante */}
          <SectionHeader
            id="shortcuts-title"
            eyebrow={kind === 'loading' ? null : copy.eyebrow}
            title={copy.title}
            subtitle={copy.subtitle}
          />
        </HomeReveal>

        <HomeReveal delay={120}>
          <div className="rounded-3xl bg-stone-50 p-6 ring-1 ring-slate-200/70 sm:p-7">
            <SidePanel persona={persona} />
          </div>
        </HomeReveal>
      </div>
    </section>
  )
}

export default ShortcutsSection
