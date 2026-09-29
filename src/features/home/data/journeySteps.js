import { FaHeart, FaShieldHalved, FaComments, FaHouseChimney } from 'react-icons/fa6'

// Cada frase confere com o fluxo real: o like vira pedido (createRequest),
// o responsável aceita ou recusa, o chat abre nos pedidos aceitos e a
// adoção termina com a confirmação de entrega e a avaliação
export const JOURNEY_STEPS = [
  {
    number: '01',
    icon: FaHeart,
    title: 'Você curte',
    description: 'No AUmatch, curtir um pet envia um pedido de interesse para o protetor ou a ONG responsável.',
    isMatchAction: true,
  },
  {
    number: '02',
    icon: FaShieldHalved,
    title: 'Quem cuida decide',
    description: 'O responsável recebe seu pedido junto com o seu perfil e escolhe aceitar ou recusar.',
    ongDescription: 'Você recebe o pedido com o perfil de quem quer adotar e decide aceitar ou recusar.',
  },
  {
    number: '03',
    icon: FaComments,
    title: 'Vocês conversam',
    description: 'Pedido aceito, o chat do AUcolher é liberado para combinar visita, tirar dúvidas e acertar a entrega.',
  },
  {
    number: '04',
    icon: FaHouseChimney,
    title: 'Adoção concluída',
    description: 'Com a entrega confirmada, a adoção é concluída e os dois lados podem se avaliar.',
  },
]
