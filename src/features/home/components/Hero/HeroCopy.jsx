import { LuSparkles } from 'react-icons/lu'
import ActionLink, { ActionSkeleton } from '../shared/ActionLink'
import { getPersonaActions } from '../../data/personaActions'
import { quizQuestions } from '../../../onboarding/data/quizQuestions'
import { plural } from '../../utils/homePets'

// "AU" + "migo" nas cores do logo. emerald-600 e amber-600 só passam no
// contraste por serem texto grande e em negrito — não reaproveitar em corpo
function AUmigo() {
  return (
    <>
      <span className="text-emerald-600">AU</span>
      <span className="text-amber-600">migo</span>
    </>
  )
}

const PERSON_TITLE = (
  <>
    Adote o <AUmigo /> que combina com a sua rotina.
  </>
)

function getCopy({ kind, firstName, quizProgress }, { ranked, eligibleCount }) {
  const greeting = firstName ? `, ${firstName}` : ''

  if (kind === 'pending') {
    const { missing } = quizProgress
    return {
      eyebrow: `Olá${greeting}! Seu AUmatch está em andamento`,
      title: PERSON_TITLE,
      subtitle: `${plural(missing, 'Falta', 'Faltam')} ${missing} ${plural(missing, 'pergunta', 'perguntas')} para o AUmatch ordenar os pets pela compatibilidade com a sua rotina.`,
    }
  }

  if (kind === 'matched') {
    const top = ranked[0]
    return {
      eyebrow: `Seus matches estão prontos${greeting}`,
      title: (
        <>
          Seu próximo <AUmigo /> pode estar a um swipe.
        </>
      ),
      subtitle: top
        ? `Calculamos a compatibilidade de ${eligibleCount} ${plural(eligibleCount, 'pet disponível', 'pets disponíveis')} com as suas respostas. O melhor match agora é ${top.name}, com ${top.matchScore}%.`
        : 'Nenhum pet novo no seu deck agora. Assim que novos animais forem cadastrados, eles entram ordenados pela compatibilidade com as suas respostas.',
    }
  }

  if (kind === 'ong') {
    return {
      eyebrow: 'AUmatch para ONGs',
      title: 'Leve seus resgatados até a família certa.',
      subtitle:
        'No AUmatch, cada anúncio é comparado com a rotina de quem quer adotar, e seus animais aparecem com o selo dourado de ONG verificada.',
    }
  }

  // visitor e loading: enquanto a sessão carrega, título e texto já nascem
  // como os do visitante (a maioria) e só o eyebrow e os botões viram skeleton.
  // O visitante fica sem eyebrow: o selo é a saudação de quem está logado
  return {
    eyebrow: null,
    title: PERSON_TITLE,
    subtitle: `Responda ${quizQuestions.length} perguntas rápidas sobre a sua casa e a sua rotina e veja, ponto a ponto, por que cada pet combina com você.`,
  }
}

function QuizProgress({ answered, total }) {
  return (
    <div className="flex w-full max-w-sm items-center gap-3">
      <div
        role="progressbar"
        aria-label="Perguntas do quiz respondidas"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
        aria-valuetext={`${answered} de ${total}`}
        className="flex flex-1 gap-1"
      >
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full ${index < answered ? 'bg-emerald-600' : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <span aria-hidden="true" className="shrink-0 text-xs font-bold tabular-nums text-slate-500">
        {answered}/{total}
      </span>
    </div>
  )
}

// Devolve um fragmento: os blocos entram direto no flex da coluna do hero,
// que controla o espaçamento entre eles. `deck` é o ranking real de quem já
// fez o quiz (vazio para os demais), só para citar o melhor match no texto
function HeroCopy({ persona, deck }) {
  const { kind, quizProgress } = persona
  const copy = getCopy(persona, deck)
  const actions = getPersonaActions(persona)

  return (
    <>
      {kind === 'loading' && (
        <div aria-hidden="true" className="h-8 w-64 rounded-full bg-slate-200/70 motion-safe:animate-pulse" />
      )}
      {copy.eyebrow && (
        <p className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-800">
          <LuSparkles aria-hidden="true" size={15} className="shrink-0" />
          {copy.eyebrow}
        </p>
      )}

      <h1
        id="home-hero-title"
        className="max-w-xl text-[2.4rem] font-black leading-[1.06] tracking-tight text-balance text-emerald-950 sm:text-5xl xl:text-[3.5rem]"
      >
        {copy.title}
      </h1>

      <p className="max-w-xl text-lg leading-relaxed text-slate-600">{copy.subtitle}</p>

      {kind === 'pending' && <QuizProgress answered={quizProgress.answered} total={quizProgress.total} />}

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
        {actions ? (
          <>
            <ActionLink action={actions.primary} />
            <ActionLink action={actions.secondary} variant="outline" />
          </>
        ) : (
          <>
            <ActionSkeleton />
            <ActionSkeleton className="sm:w-48" />
          </>
        )}
      </div>
    </>
  )
}

export default HeroCopy
