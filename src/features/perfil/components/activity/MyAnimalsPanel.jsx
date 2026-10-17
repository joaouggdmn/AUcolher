import { Link } from 'react-router-dom'
import { FaArrowRight, FaPaw, FaPlus } from 'react-icons/fa6'
import { MY_ANIMALS_PATH } from '../../../animais/utils/myAnimalsPaths'
import { PANEL_PATHS } from '../../../ong/panel/panelPaths'
import ActivityEmptyState from './ActivityEmptyState'

// Minha conta só resume: a lista com as ações mora em "Meus animais"
// (pessoa) ou no painel (ONG), para não haver duas listas iguais
function MyAnimalsPanel({ animals, isOng }) {
  if (animals.length === 0) {
    return (
      <ActivityEmptyState
        icon={FaPaw}
        title="Você ainda não cadastrou nenhum animal."
        description="Os animais que você anunciar aparecem aqui e, enquanto estiverem disponíveis, no seu perfil público."
        action={{ to: isOng ? PANEL_PATHS.animalNew : '/animais/criar', label: 'Cadastrar animal', icon: FaPlus }}
      />
    )
  }

  const preview = animals.slice(0, 4)

  return (
    <Link
      to={isOng ? PANEL_PATHS.animals : MY_ANIMALS_PATH}
      className="group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-emerald-50/40 p-5 transition-all duration-300 hover:border-emerald-200 hover:bg-emerald-50 sm:flex-row sm:items-center"
    >
      <div className="flex -space-x-3">
        {preview.map((animal) => (
          <span
            key={animal.id}
            className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-emerald-100 text-emerald-600"
          >
            {animal.photoUrl ? (
              <img src={animal.photoUrl} alt={animal.name} className="h-full w-full object-cover" />
            ) : (
              <FaPaw size={14} />
            )}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-emerald-950">
          {isOng ? 'Gerencie os animais no painel da ONG' : 'Gerencie seus anúncios em Meus animais'}
        </p>
        <p className="text-xs text-slate-500">
          Editar ou tirar do ar{isOng ? '' : ', e acompanhar os animais que você adotou'}.
        </p>
      </div>
      <FaArrowRight
        size={13}
        className="shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-emerald-600"
      />
    </Link>
  )
}

export default MyAnimalsPanel
