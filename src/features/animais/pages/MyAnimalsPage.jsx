import { useCallback, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { FaBullhorn, FaHeart, FaPlus } from 'react-icons/fa6'
import { LuSparkles } from 'react-icons/lu'
import SuccessToast from '../../../core/components/ui/SuccessToast'
import AdoptedAnimalsTab from '../components/mine/AdoptedAnimalsTab'
import ListedAnimalsTab from '../components/mine/ListedAnimalsTab'

const TABS = [
  { key: 'anunciados', label: 'Anunciados por mim', icon: FaBullhorn },
  { key: 'adotados', label: 'Adotados por mim', icon: FaHeart },
]

// /meus-animais (só pessoa física; a ONG usa o painel): os anúncios que a
// pessoa fez e os animais que ela adotou. A aba vai na URL (?aba=adotados)
// para os outros fluxos voltarem direto para ela
function MyAnimalsPage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeKey = searchParams.get('aba') === 'adotados' ? 'adotados' : 'anunciados'

  // Aviso de uma ação aqui (`notice`) ou vindo de outra tela (edição salva)
  const [notice, setNotice] = useState(null)
  const [dismissedFlashKey, setDismissedFlashKey] = useState(null)
  const flash = location.state?.flash && dismissedFlashKey !== location.key ? location.state.flash : null
  const closeToast = useCallback(() => {
    setNotice(null)
    setDismissedFlashKey(location.key)
  }, [location.key])

  const selectTab = (key) => setSearchParams(key === 'adotados' ? { aba: 'adotados' } : {}, { replace: true })

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
            <LuSparkles size={15} />
            Meus animais
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">Seus anúncios e suas adoções</h1>
          <p className="mt-1 text-slate-600">Gerencie os animais que você anunciou e acompanhe os que você adotou.</p>
        </div>
        <Link
          to="/animais/criar"
          className="flex w-fit shrink-0 items-center gap-2 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-900"
        >
          <FaPlus size={12} />
          Cadastrar animal
        </Link>
      </header>

      <div role="tablist" aria-label="Meus animais" className="mb-6 flex flex-wrap gap-2">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = key === activeKey
          return (
            <button
              key={key}
              id={`my-animals-tab-${key}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="my-animals-panel"
              onClick={() => selectTab(key)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/20'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-800'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-amber-300' : 'text-emerald-600'} />
              {label}
            </button>
          )
        })}
      </div>

      {/* key força remontagem a cada troca, disparando a animação de entrada */}
      <div
        key={activeKey}
        id="my-animals-panel"
        role="tabpanel"
        aria-labelledby={`my-animals-tab-${activeKey}`}
        className="animate-fade-slide-in"
      >
        {activeKey === 'adotados' ? <AdoptedAnimalsTab onNotify={setNotice} /> : <ListedAnimalsTab onNotify={setNotice} />}
      </div>

      <SuccessToast message={notice ?? flash} onClose={closeToast} />
    </div>
  )
}

export default MyAnimalsPage
