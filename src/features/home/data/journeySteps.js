import { FaHeart, FaShieldHalved, FaComments, FaHouseChimney } from 'react-icons/fa6'

// Cada frase confere com o fluxo real: o like vira pedido (createRequest),
// o responsável aceita ou recusa, o chat abre nos pedidos aceitos e a
// adoção termina com a confirmação de entrega e a avaliação
export const JOURNEY_STEPS = [
  {
    number: '01',
    icon: FaHeart,
    title: 'Você curte',
    description: 'O like envia seu interesse para quem cuida do pet.',
    isMatchAction: true,
  },
  {
    number: '02',
    icon: FaShieldHalved,
    title: 'Quem cuida decide',
    description: 'O responsável vê seu perfil e aceita ou recusa.',
    ongDescription: 'Você vê o perfil de quem quer adotar e decide.',
  },
  {
    number: '03',
    icon: FaComments,
    title: 'Vocês conversam',
    description: 'Pedido aceito, o chat é liberado para combinar tudo.',
  },
  {
    number: '04',
    icon: FaHouseChimney,
    title: 'Adoção concluída',
    description: 'Entrega confirmada, os dois lados se avaliam.',
  },
]
