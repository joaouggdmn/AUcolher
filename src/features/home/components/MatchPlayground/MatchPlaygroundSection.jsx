import { useState } from 'react'
import SectionHeader from '../shared/SectionHeader'
import HomeReveal from '../shared/HomeReveal'
import AnswerPicker from './AnswerPicker'
import MatchResultCard from './MatchResultCard'
import StickyScoreChip from './StickyScoreChip'
import { useRankedPets } from '../../hooks/useRankedPets'
import { plural } from '../../utils/homePets'

const DOT_PATTERN = {
  backgroundImage: 'radial-gradient(white 1.5px, transparent 1.5px)',
  backgroundSize: '28px 28px',
}

function getHeaderCopy({ kind, firstName, quizProgress }) {
  if (kind === 'pending') {
    const { missing } = quizProgress
    return {
      eyebrow: 'Prévia com as suas respostas',
      title: 'Veja seus matches antes de terminar o quiz.',
      subtitle: `${plural(missing, 'A pergunta que falta usa', `As ${missing} que faltam usam`)} um exemplo.`,
    }
  }

  if (kind === 'matched') {
    return {
      eyebrow: firstName ? `Seus matches, ${firstName}` : 'Seus matches',
      title: 'Os pets que mais combinam com a sua rotina hoje.',
      subtitle: 'Mude uma resposta para testar outra rotina — seu perfil não muda.',
    }
  }

  if (kind === 'ong') {
    return {
      eyebrow: 'Para ONGs',
      title: 'Veja seus anúncios pelos olhos de quem adota.',
      subtitle: 'Simule a rotina de um adotante e veja em que posição seus animais aparecem.',
    }
  }

  return {
    eyebrow: 'Teste agora, sem cadastro',
    title: 'Monte sua rotina e veja quem dá match.',
    subtitle: 'Mesmo cálculo do AUmatch. Nada do que você marcar aqui é salvo.',
  }
}

// Sem overflow-hidden na seção: ele quebraria o sticky da coluna de
// resultado e do chip do mobile. Os brilhos ficam numa camada própria recortada
function MatchPlaygroundSection({ persona, sim }) {
  const { kind } = persona
  const { ranked } = useRankedPets(sim.profile, {
    excludeRequested: kind === 'matched' || kind === 'pending',
    excludeOwn: kind !== 'ong',
  })
  const [selectedId, setSelectedId] = useState(null)

  // Se a resposta nova tirou do top 3 o pet aberto, o card volta para o
  // primeiro — derivado no render, sem effect
  const topPets = ranked.slice(0, 3)
  const best = topPets[0] ?? null
  const selected = topPets.find((pet) => pet.id === selectedId) ?? best
  const header = getHeaderCopy(persona)

  return (
    <section
      id="simulador"
      aria-labelledby="sim-title"
      className="relative isolate scroll-mt-28 bg-emerald-950 py-20 lg:py-28"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={DOT_PATTERN} />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />
      </div>

      {/* "Como funciona o match" do rodapé aponta para /#match: agora quem
          explica o match é o simulador, então a âncora mora aqui */}
      <span id="match" aria-hidden="true" className="absolute top-0 scroll-mt-28" />

      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <HomeReveal>
          <SectionHeader id="sim-title" tone="dark" {...header} />
        </HomeReveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <HomeReveal>
              <AnswerPicker persona={persona} sim={sim} />
            </HomeReveal>
            {best && <StickyScoreChip pet={best} />}
          </div>

          <div id="sim-result" className="scroll-mt-28 lg:sticky lg:top-28 lg:col-span-7 lg:self-start">
            <HomeReveal delay={120}>
              <MatchResultCard
                persona={persona}
                profile={sim.profile}
                isOwnAnswers={sim.source === 'quiz' && !sim.isDirty}
                topPets={topPets}
                selected={selected}
                onSelect={setSelectedId}
              />
            </HomeReveal>
          </div>
        </div>

        {/* Anuncia só o que muda no topo do ranking, não cada clique */}
        <p className="sr-only" aria-live="polite">
          {best
            ? `Melhor match: ${best.name}, ${best.matchScore}% de compatibilidade.`
            : 'Nenhum pet disponível com esse perfil.'}
        </p>
      </div>
    </section>
  )
}

export default MatchPlaygroundSection
