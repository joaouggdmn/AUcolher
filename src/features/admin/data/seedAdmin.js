import { addDaysIso, todayLocalIso } from '../../../core/utils/localDate'
import { mockPublicProfiles } from '../../perfil/data/mockPublicProfiles'

// 🔴 Seed do banco falso do admin (adminMock.js): as contas da plataforma,
// que a API ainda não lista. Começa pelos perfis públicos mockados (ids
// 1 a 7, os mesmos donos de campanhas e eventos do mock, para "Ver perfil"
// abrir a página certa) e soma contas geradas a partir do id 101, com o
// cadastro espalhado nos últimos 12 meses para o gráfico de novas contas

// [nome, tipo, cidade, dias desde o cadastro]
const GENERATED_ACCOUNTS = [
  ['Instituto Focinho Feliz', 'NGO', 'Criciúma', 342],
  ['Mariana Costa', 'PERSON', 'Araranguá', 330],
  ['Bruno Henrique Souza', 'PERSON', 'Tubarão', 311],
  ['Patrícia Lemos', 'PERSON', 'Florianópolis', 296],
  ['Lar Temporário Quatro Patas', 'NGO', 'Tubarão', 281],
  ['Gustavo Ramos', 'PERSON', 'Criciúma', 266],
  ['Aline Duarte', 'PERSON', 'Içara', 249],
  ['Thiago Martins', 'PERSON', 'Joinville', 231],
  ['Projeto Miau Sul', 'NGO', 'Laguna', 214],
  ['Carolina Pires', 'PERSON', 'Blumenau', 198],
  ['Rodrigo Alves', 'PERSON', 'Araranguá', 183],
  ['Beatriz Nunes', 'PERSON', 'Criciúma', 166],
  ['Felipe Andrade', 'PERSON', 'Urussanga', 149],
  ['Associação Amigos de Rua', 'NGO', 'Imbituba', 133],
  ['Larissa Moura', 'PERSON', 'Florianópolis', 118],
  ['Diego Fernandes', 'PERSON', 'Tubarão', 104],
  ['Vanessa Rocha', 'PERSON', 'Criciúma', 88],
  ['Leonardo Teixeira', 'PERSON', 'Içara', 73],
  ['Natália Barros', 'PERSON', 'Araranguá', 59],
  ['SOS Bichos Laguna', 'NGO', 'Laguna', 46],
  ['Ricardo Lima', 'PERSON', 'Joinville', 34],
  ['Isabela Cardoso', 'PERSON', 'Criciúma', 23],
  ['Mateus Oliveira', 'PERSON', 'Blumenau', 14],
  ['Camila Torres', 'PERSON', 'Florianópolis', 7],
  ['João Victor Prado', 'PERSON', 'Tubarão', 2],
]

const GENERATED_FIRST_ID = 101

function slug(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '')
}

function emailFor(name, userType) {
  return userType === 'NGO' ? `contato@${slug(name).replace(/\./g, '')}.org.br` : `${slug(name)}@email.com`
}

// Toda ONG é verificada (regras §7); pessoa não tem selo
function profileAccount(profile) {
  const userType = profile.userType === 'ONG' ? 'NGO' : 'PERSON'
  return {
    id: profile.id,
    name: profile.name,
    email: profile.institutionalEmail ?? emailFor(profile.name, userType),
    userType,
    photoUrl: profile.photoUrl ?? null,
    city: profile.city ?? null,
    state: profile.state ?? null,
    isVerified: userType === 'NGO',
    active: true,
    createdAt: profile.memberSince ? `${profile.memberSince}T10:00:00` : null,
  }
}

export function buildSeedAdmin() {
  const today = todayLocalIso()

  const generated = GENERATED_ACCOUNTS.map(([name, userType, city, daysAgo], index) => ({
    id: GENERATED_FIRST_ID + index,
    name,
    email: emailFor(name, userType),
    userType,
    photoUrl: null,
    city,
    state: 'SC',
    isVerified: userType === 'NGO',
    active: true,
    createdAt: `${addDaysIso(today, -daysAgo)}T${String(9 + (index % 10)).padStart(2, '0')}:15:00`,
  }))

  return { accounts: [...mockPublicProfiles.map(profileAccount), ...generated] }
}
