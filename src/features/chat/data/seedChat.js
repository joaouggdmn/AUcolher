import { SEED_NGOS, SEED_PEOPLE } from '../../../core/services/mock/seedAccounts'
import { toLocalIsoDateTime } from '../../../core/utils/localDate'

// 🔴 Seed do banco falso do chat (chatMock.js): as conversas dos pedidos do
// banco de teste (docs/seed-banco-completo.sql) que já passaram do aceite.
// requestId é o id do pedido no banco; as datas são relativas ao momento em
// que o seed roda e batem com o status de cada pedido. Os avisos de sistema
// entram onde o backend os criaria (api-chat.md §2)

const { apacri, sosViralata, acapra, abrigoAnimal } = SEED_NGOS
const { mariana, lucas, fernanda, rafael, juliana, gabriel, beatriz, thiago, larissa, pedro } = SEED_PEOPLE

const DAY = 24 * 60 * 60 * 1000

// [dias atrás, quem (id) ou 'SYSTEM', texto ou código do evento]
const CONVERSATIONS = [
  {
    requestId: 1, adopter: mariana, owner: apacri,
    lines: [
      [46, apacri, 'Oi, Mariana! Aceitamos seu pedido para o Caramelo. Podemos marcar uma visita na sede no sábado?'],
      [46 - 2 / 24, mariana, 'Oba! Sábado às 10h fica bom para mim.'],
      [44, apacri, 'Perfeito. Traga um documento com foto e comprovante de residência.'],
      [41, 'SYSTEM', 'DELIVERY_REQUESTED'],
      [40, 'SYSTEM', 'ADOPTION_CONCLUDED'],
    ],
  },
  {
    requestId: 2, adopter: lucas, owner: apacri,
    lines: [
      [66, apacri, 'Lucas, o Frajola é seu! Quando você pode buscar?'],
      [66 - 1 / 24, lucas, 'Pode ser na quinta à tarde?'],
      [61, 'SYSTEM', 'DELIVERY_REQUESTED'],
      [60, 'SYSTEM', 'ADOPTION_CONCLUDED'],
      [5, 'SYSTEM', 'ANIMAL_REHOMED'],
    ],
  },
  {
    requestId: 3, adopter: fernanda, owner: apacri,
    lines: [
      [55, apacri, 'Oi, Fernanda! Pedido do Laranja aceito. Vamos combinar a entrega?'],
      [55 - 3 / 24, fernanda, 'Vamos! Moro em Içara, posso buscar aí em Criciúma.'],
      [51, 'SYSTEM', 'DELIVERY_REQUESTED'],
      [50, 'SYSTEM', 'ADOPTION_CONCLUDED'],
      [11, fernanda, 'Infelizmente o Laranja e a minha cachorra não se acertaram. Posso levar ele de volta?'],
      [10.5, apacri, 'Claro, Fernanda. Obrigado por avisar com cuidado. Traga ele amanhã.'],
      [10, 'SYSTEM', 'ANIMAL_RETURNED'],
    ],
  },
  {
    requestId: 4, adopter: larissa, owner: acapra,
    lines: [
      [19, acapra, 'Larissa, aceitamos seu pedido! A Luna vai adorar correr com você.'],
      [19 - 1 / 24, larissa, 'Que notícia boa! Posso buscar no sábado de manhã?'],
      [16, 'SYSTEM', 'DELIVERY_REQUESTED'],
      [15, 'SYSTEM', 'ADOPTION_CONCLUDED'],
    ],
  },
  {
    requestId: 5, adopter: juliana, owner: thiago,
    lines: [
      [24, thiago, 'Oi, Juliana! A Mel é sua. Você pode vir buscar em Cocal do Sul?'],
      [24 - 2 / 24, juliana, 'Posso sim! Domingo depois do almoço?'],
      [21, 'SYSTEM', 'DELIVERY_REQUESTED'],
      [20, 'SYSTEM', 'ADOPTION_CONCLUDED'],
    ],
  },
  {
    requestId: 9, adopter: gabriel, owner: apacri,
    lines: [
      [5, apacri, 'Oi, Gabriel! Aceitamos seu pedido para a Pantera. Ela é desconfiada no começo, tudo bem para você?'],
      [4.8, gabriel, 'Tudo bem! Moro num sítio em Araranguá, ela vai ter bastante espaço.'],
      [4, apacri, 'Que ótimo. Podemos fazer uma visita de adaptação na semana que vem?'],
      [0.3, gabriel, 'Pode ser na terça? Consigo sair mais cedo do trabalho.'],
    ],
  },
  {
    requestId: 10, adopter: beatriz, owner: apacri,
    lines: [
      [10, apacri, 'Beatriz, a Jade é sua! Vamos combinar a entrega?'],
      [9.9, beatriz, 'Eba! Pode ser lá em Forquilhinha? Não tenho carro.'],
      [9, apacri, 'Pode sim, um voluntário leva até você.'],
      [1, 'SYSTEM', 'DELIVERY_REQUESTED'],
    ],
  },
  {
    requestId: 11, adopter: thiago, owner: sosViralata,
    lines: [
      [4, sosViralata, 'Oi, Thiago! O Marley foi aprovado para você. Ele ainda puxa um pouco na guia, ok?'],
      [3.5, thiago, 'Sem problemas, vou fazer adestramento com ele.'],
      [0.2, thiago, 'Posso visitar ele amanhã à tarde?'],
    ],
  },
  {
    requestId: 14, adopter: juliana, owner: sosViralata,
    lines: [
      [12, sosViralata, 'Juliana, aceitamos seu pedido para o Faísca!'],
      [11, juliana, 'Obrigada! Só preciso confirmar com o condomínio se aceitam cachorro de porte médio.'],
      [7.2, juliana, 'Infelizmente o condomínio não aceitou. Vou ter que desistir, sinto muito.'],
      [7, 'SYSTEM', 'ADOPTER_WITHDREW'],
    ],
  },
  {
    requestId: 15, adopter: pedro, owner: abrigoAnimal,
    lines: [
      [2, abrigoAnimal, 'Oi, Pedro! Pedido do Chocolate aceito. Você pode vir ao abrigo no sábado à tarde?'],
      [1.5, pedro, 'Posso sim. Levo meus filhos para conhecerem ele?'],
      [0.1, abrigoAnimal, 'Pode e deve! É bom ver como ele reage com as crianças.'],
    ],
  },
  {
    requestId: 18, adopter: mariana, owner: rafael,
    lines: [
      [6, rafael, 'Oi, Mariana! A Salsicha é sua se você quiser. Você mora perto do centro?'],
      [5.8, mariana, 'Moro no Michel. Posso buscar quando for melhor para você.'],
      [0.4, rafael, 'Pode ser no sábado de manhã? Separo a caminha e a ração dela.'],
    ],
  },
  {
    requestId: 21, adopter: gabriel, owner: abrigoAnimal,
    lines: [
      [22, abrigoAnimal, 'Gabriel, aceitamos seu pedido para a Duquesa.'],
      [21, gabriel, 'Obrigado! Ela vai viajar bem até Araranguá?'],
      [18.2, abrigoAnimal, 'Gabriel, conversamos aqui e achamos que a viagem e a mudança de clima seriam demais para ela. Sentimos muito.'],
      [18, 'SYSTEM', 'OWNER_WITHDREW'],
    ],
  },
]

// Quem ainda não leu a última mensagem da conversa (o badge do chat)
const UNREAD_LAST_BY = { 9: apacri, 11: sosViralata, 15: pedro, 18: mariana }

// Ids na ordem das datas, como no banco: as conversas se intercalam
export function buildSeedChat() {
  const now = Date.now()
  const rows = CONVERSATIONS.flatMap(({ requestId, lines }) =>
    lines.map(([daysAgo, who, content]) => ({ requestId: String(requestId), who, content, time: now - daysAgo * DAY }))
  ).sort((a, b) => a.time - b.time)

  const messages = rows.map(({ requestId, who, content, time }, index) => {
    const isSystem = who === 'SYSTEM'
    return {
      id: index + 1,
      requestId,
      type: isSystem ? 'SYSTEM' : 'USER',
      senderId: isSystem ? null : who.id,
      text: isSystem ? null : content,
      systemEvent: isSystem ? content : null,
      createdAt: toLocalIsoDateTime(new Date(time)),
    }
  })

  const reads = CONVERSATIONS.flatMap(({ requestId, adopter, owner }) => {
    const ids = messages.filter((row) => row.requestId === String(requestId)).map((row) => row.id)
    return [adopter, owner].map((participant) => ({
      requestId: String(requestId),
      userId: participant.id,
      lastReadMessageId: UNREAD_LAST_BY[requestId] === participant ? ids.at(-2) : ids.at(-1),
    }))
  })

  return { messages, reads }
}
