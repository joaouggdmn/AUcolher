import { FaHeart, FaXmark } from 'react-icons/fa6'
import { LuLightbulb } from 'react-icons/lu'
import SectionHeader from '../shared/SectionHeader'
import HomeReveal from '../shared/HomeReveal'
import NgoShield from '../shared/NgoShield'
import ActionLink from '../shared/ActionLink'
import { JOURNEY_STEPS } from '../../data/journeySteps'

// Réplicas em miniatura dos elementos do AUmatch (mesmas cores e ícones do
// PetSwipeCard e dos botões de swipe), para a pessoa reconhecê-los lá dentro
const SIGNALS = [
  {
    key: 'ngo',
    title: 'ONG verificada',
    replica: <NgoShield size="sm" decorative />,
  },
  {
    key: 'score',
    title: 'Toque no % para ver o porquê',
    replica: (
      <span className="flex items-center gap-1 rounded-full bg-emerald-800 px-2 py-1 text-[10px] font-extrabold text-white">
        %
        <LuLightbulb size={10} className="text-amber-300" />
      </span>
    ),
  },
  {
    key: 'like',
    title: 'Curtir envia seu interesse',
    replica: (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 shadow-md shadow-amber-500/30">
        <FaHeart size={13} />
      </span>
    ),
  },
  {
    key: 'pass',
    title: 'Passar, sem compromisso',
    replica: (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-rose-400 shadow-md shadow-emerald-950/10 ring-1 ring-black/5">
        <FaXmark size={14} />
      </span>
    ),
  },
]

// O número do passo fica escondido do leitor de tela: a <ol> já dá a ordem
function StepBadge({ step }) {
  const Icon = step.icon

  return (
    <div className="relative z-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white shadow-md shadow-emerald-950/10 ring-8 ring-stone-50">
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full ${
          step.isMatchAction
            ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950'
            : 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white'
        }`}
      >
        <Icon aria-hidden="true" size={22} />
      </span>
      <span
        aria-hidden="true"
        className="absolute -right-1 -top-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-black text-emerald-950 ring-4 ring-stone-50"
      >
        {step.number}
      </span>
    </div>
  )
}

function TrustJourneySection({ persona }) {
  const isOng = persona.kind === 'ong'

  return (
    <section aria-labelledby="journey-title" className="bg-stone-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <HomeReveal>
          <SectionHeader
            id="journey-title"
            align="center"
            eyebrow="Adoção segura"
            title="Do primeiro like ao “bem-vindo em casa”."
            subtitle="A decisão é sempre de quem adota e de quem cuida — tudo dentro do AUcolher."
          />
        </HomeReveal>

        <div className="relative mt-14">
          {/* Linha tracejada ligando os passos: vertical no mobile, horizontal no desktop */}
          <span
            aria-hidden="true"
            className="absolute bottom-10 left-10 top-10 border-l-2 border-dashed border-emerald-200 lg:hidden"
          />
          <span
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-10 hidden border-t-2 border-dashed border-emerald-200 lg:block"
          />

          <ol className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
            {JOURNEY_STEPS.map((step, index) => (
              <li key={step.number}>
                <HomeReveal delay={index * 100} className="flex h-full gap-5 lg:flex-col lg:items-center lg:gap-6">
                  <StepBadge step={step} />
                  <div className="flex-1 rounded-3xl bg-white p-5 shadow-sm shadow-emerald-950/5 ring-1 ring-slate-200/70 lg:w-full lg:p-6 lg:text-center">
                    <h3 className="text-lg font-extrabold tracking-tight text-emerald-950">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {isOng && step.ongDescription ? step.ongDescription : step.description}
                    </p>
                  </div>
                </HomeReveal>
              </li>
            ))}
          </ol>
        </div>

        <HomeReveal className="mt-14 flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              Sinais que você vai ver no AUmatch
            </h3>
            <ul className="flex flex-wrap justify-center gap-2.5">
              {SIGNALS.map((signal) => (
                <li
                  key={signal.key}
                  className="flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-sm font-semibold text-emerald-950 ring-1 ring-slate-200/70"
                >
                  <span aria-hidden="true" className="flex min-w-8 justify-center">
                    {signal.replica}
                  </span>
                  {signal.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Atalho para o próximo passo real: o deck (ou, para a ONG, os pedidos) */}
          <ActionLink
            action={
              isOng
                ? { label: 'Ver interesses recebidos', to: '/interesses-recebidos', badge: persona.pendingCount }
                : { label: 'Ir para o AUmatch', to: '/aumatch' }
            }
            variant="outline"
            size="md"
            showArrow
          />
        </HomeReveal>
      </div>
    </section>
  )
}

export default TrustJourneySection
