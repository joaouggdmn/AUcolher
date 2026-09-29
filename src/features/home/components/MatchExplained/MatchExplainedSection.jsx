import SectionHeader from '../shared/SectionHeader'
import HomeReveal from '../shared/HomeReveal'
import PointsRuler from './PointsRuler'
import CriterionCard from './CriterionCard'
import { CRITERIA_GUIDE, HEAVIEST_CRITERION_KEY, TOTAL_POINTS } from '../../data/criteriaGuide'
import { quizQuestions } from '../../../onboarding/data/quizQuestions'

// Grade de 6 colunas no desktop: os dois primeiros critérios (os cards com
// mais texto) ocupam metade cada; os outros três dividem a linha de baixo.
// No sm, um último card ímpar ocupa a linha inteira em vez de ficar sozinho
function spanClasses(index, total) {
  const lg = index < 2 ? 'lg:col-span-3' : 'lg:col-span-2'
  const sm = index === total - 1 && total % 2 === 1 ? 'sm:col-span-2 lg:col-span-2' : ''
  return `${lg} ${sm}`
}

// É o alvo do link "Como funciona o match" do rodapé (/#match)
function MatchExplainedSection() {
  const criteriaCount = CRITERIA_GUIDE.length

  return (
    <section id="match" aria-labelledby="match-title" className="scroll-mt-28 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <HomeReveal>
          <SectionHeader
            id="match-title"
            align="center"
            eyebrow="Como funciona o match"
            title={`${TOTAL_POINTS} pontos, ${criteriaCount} critérios. Nenhuma caixa-preta.`}
            subtitle={`Você responde ${quizQuestions.length} perguntas rápidas, e ${criteriaCount} delas viram pontos: o AUmatch compara cada resposta com o comportamento informado no anúncio do pet e soma tudo. O resultado é a porcentagem do card — e o "Por que deu match?" mostra de onde veio cada ponto.`}
          />
        </HomeReveal>

        <HomeReveal className="mt-12 sm:mt-14">
          <PointsRuler />
        </HomeReveal>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {CRITERIA_GUIDE.map((criterion, index) => (
            <li key={criterion.key} className={spanClasses(index, criteriaCount)}>
              <HomeReveal delay={index * 80} className="h-full">
                <CriterionCard
                  criterion={criterion}
                  isHeaviest={criterion.key === HEAVIEST_CRITERION_KEY}
                  isWide={index < 2}
                />
              </HomeReveal>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-slate-500">
          A espécie que você escolhe só filtra quem aparece no seu deck, sem somar pontos. Nada fica escondido: todo
          critério aparece no &ldquo;Por que deu match?&rdquo;, com os pontos que somou.
        </p>
      </div>
    </section>
  )
}

export default MatchExplainedSection
