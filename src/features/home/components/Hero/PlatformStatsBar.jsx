import { FaLocationDot, FaPaw, FaShieldHalved } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'
import HomeReveal from '../shared/HomeReveal'
import { usePlatformStats } from '../../hooks/usePlatformStats'
import { plural } from '../../utils/homePets'

// Classes estáticas: o Tailwind não enxerga `lg:grid-cols-${n}` montado em runtime
const LG_COLUMNS = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' }

// Só números que existem de verdade: contagem dos anúncios disponíveis e
// fatos do próprio AUmatch. Item zerado some em vez de mostrar "0 ONGs"
function PlatformStatsBar() {
  const { availableCount, ngoCount, cityCount, questionCount } = usePlatformStats()

  const items = [
    { key: 'pets', icon: FaPaw, value: availableCount, label: plural(availableCount, 'pet para adoção', 'pets para adoção') },
    { key: 'ngos', icon: FaShieldHalved, value: ngoCount, label: plural(ngoCount, 'ONG verificada', 'ONGs verificadas') },
    { key: 'cities', icon: FaLocationDot, value: cityCount, label: plural(cityCount, 'cidade com pets', 'cidades com pets') },
    {
      key: 'quiz',
      icon: LuSparkles,
      value: questionCount,
      label: plural(questionCount, 'pergunta no quiz', 'perguntas no quiz'),
      isMatch: true,
    },
  ].filter((item) => item.value > 0)

  if (items.length === 0) return null

  return (
    <HomeReveal className="mx-auto mt-16 max-w-5xl px-5 sm:mt-20 sm:px-6">
      <ul
        aria-label="O AUcolher em números"
        className={`grid grid-cols-2 gap-x-4 gap-y-6 rounded-3xl bg-white p-5 shadow-xl shadow-emerald-950/10 ring-1 ring-emerald-900/5 sm:p-6 lg:gap-0 lg:divide-x lg:divide-slate-100 ${LG_COLUMNS[items.length]}`}
      >
        {items.map(({ key, icon: Icon, value, label, isMatch }) => (
          <li key={key} className="flex items-center gap-3 lg:px-6 lg:first:pl-2 lg:last:pr-2">
            <span
              aria-hidden="true"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-11 sm:w-11 ${
                isMatch ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <Icon size={17} />
            </span>
            <p className="flex min-w-0 flex-col">
              <strong className="text-2xl font-black leading-none tracking-tight tabular-nums text-emerald-950 sm:text-3xl">
                {value}
              </strong>
              <span className="mt-1 text-xs leading-snug text-slate-500 sm:text-sm">{label}</span>
            </p>
          </li>
        ))}
      </ul>
    </HomeReveal>
  )
}

export default PlatformStatsBar
