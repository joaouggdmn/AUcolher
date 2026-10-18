import AumatchCardMockup from '../shared/AumatchCardMockup'
import { quizQuestions } from '../../../onboarding/data/quizQuestions'

// Pet fictícia e fixa, de propósito: o hero explica o AUmatch para quem
// acabou de chegar, não busca animais (isso é só no /aumatch). As fotos não
// estão no seed, para ninguém achar que é um anúncio real
const EXAMPLE_PET = {
  name: 'Brisa',
  ageLabel: '2 anos',
  breed: 'SRD',
  city: 'Curitiba',
  state: 'PR',
  summary: 'Brincalhona e cheia de energia, ama correr no quintal.',
  matchScore: 92,
  photoUrl: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&w=1200&q=80',
}

const BACK_PHOTOS = [
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1200&q=80',
]

const STEPS = [`Responda ${quizQuestions.length} perguntas`, 'Veja o % de match', 'Curta para enviar seu interesse']

// O card (AumatchCardMockup) é decorativo; quem explica são as legendas em
// texto, ligadas a ele pelos selos numerados.
// id="match": o "Como funciona o match" do rodapé (/#match) cai aqui
function HeroAUmatchMockup() {
  const pet = EXAMPLE_PET

  return (
    <figure id="match" className="mx-auto flex w-full max-w-md scroll-mt-28 flex-col items-center xl:max-w-none">
      {/* O card é o protagonista; as legendas ficam pequenas e estreitas à
          direita dele, centralizadas na altura do card (no mobile, logo
          abaixo). O grupo encosta na borda direita da coluna: legenda
          estreita = o card sai do meio da tela */}
      <div className="flex w-full flex-col items-center gap-8 xl:flex-row xl:items-center xl:justify-end xl:gap-5">
        <AumatchCardMockup pet={pet} backPhotos={BACK_PHOTOS} />

        <figcaption className="xl:max-w-44">
          <ol className="flex flex-col gap-2.5">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[11px] font-black text-emerald-950 shadow-md shadow-amber-500/30"
                >
                  {index + 1}
                </span>
                <span className="text-sm font-bold text-emerald-950">{step}</span>
              </li>
            ))}
          </ol>
        </figcaption>
      </div>
    </figure>
  )
}

export default HeroAUmatchMockup
