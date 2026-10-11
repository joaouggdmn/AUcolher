import { addDaysIso, todayLocalIso } from '../../../core/utils/localDate'
import { mockPublicProfiles } from '../../perfil/data/mockPublicProfiles'

// 🔴 Seed do banco falso de denúncias (denunciasMock.js): alguns perfis
// fictícios já denunciados, para a tela do admin não começar vazia. Quem
// denuncia são contas geradas do seed do admin (ids a partir de 101); os
// alvos são os perfis 5, 6 e 7, que não repetem id com as contas de teste
// do banco local. Anúncios de animais vêm do banco real, então só entram
// quando alguém denuncia pelo site

const REPORTERS = {
  mariana: { id: 102, name: 'Mariana Costa', photoUrl: null, userType: 'PERSON' },
  gustavo: { id: 106, name: 'Gustavo Ramos', photoUrl: null, userType: 'PERSON' },
  thiago: { id: 108, name: 'Thiago Martins', photoUrl: null, userType: 'PERSON' },
  carolina: { id: 110, name: 'Carolina Pires', photoUrl: null, userType: 'PERSON' },
  rodrigo: { id: 111, name: 'Rodrigo Alves', photoUrl: null, userType: 'PERSON' },
}

// [perfil, quem denunciou, motivo, descrição, dias atrás, resolução?: [dias atrás, como]]
const REPORTS = [
  [7, 'gustavo', 'SCAM', 'Pediu R$ 150 de "taxa de vacina" por PIX antes de eu conhecer o animal.', 1],
  [
    7,
    'mariana',
    'FAKE_PROFILE',
    'As fotos do perfil são de banco de imagens e ele pediu meu CPF logo na primeira mensagem.',
    3,
  ],
  [
    5,
    'carolina',
    'OTHER',
    'Fui ao endereço do abrigo no horário de visita e não encontrei ninguém. Os vizinhos disseram que não existe abrigo ali.',
    2,
  ],
  [6, 'thiago', 'SPAM', 'Publica o mesmo texto de divulgação de um canil pago em vários lugares.', 5],
  [1, 'rodrigo', 'IMPROPER_CONTENT', 'Não gostei da foto de capa do perfil.', 20, [18, 'DISMISSED']],
]

function profileTarget(profile) {
  return {
    name: profile.name,
    photoUrl: profile.photoUrl ?? null,
    userType: profile.userType === 'ONG' ? 'NGO' : 'PERSON',
    city: profile.city ?? null,
    state: profile.state ?? null,
    species: null,
    ownerId: null,
    ownerName: null,
    ownerUserType: null,
  }
}

export function buildSeedDenuncias() {
  const today = todayLocalIso()

  const reports = REPORTS.map(([profileId, reporterKey, reason, description, daysAgo, resolved], index) => ({
    id: index + 1,
    targetType: 'USER',
    targetId: profileId,
    target: profileTarget(mockPublicProfiles.find((profile) => profile.id === profileId)),
    reason,
    description,
    status: resolved ? 'RESOLVED' : 'PENDING',
    resolution: resolved ? resolved[1] : null,
    createdAt: `${addDaysIso(today, -daysAgo)}T${String(10 + index).padStart(2, '0')}:20:00`,
    resolvedAt: resolved ? `${addDaysIso(today, -resolved[0])}T09:00:00` : null,
    reporter: REPORTERS[reporterKey],
  }))

  return { reports }
}
