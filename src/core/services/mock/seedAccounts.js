// Contas do banco de teste (docs/seed-banco-completo.sql): o mock do módulo
// que ainda não tem tabela (o chat) usa os mesmos ids, nomes e fotos, para
// conversar com os dados reais da API. Mudou o seed do banco? Mude aqui também

const portrait = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=80`

export const SEED_NGOS = {
  apacri: { id: 2, name: 'Associação Protetora dos Animais de Criciúma - Apacri', city: 'Criciúma', state: 'SC' },
  sosViralata: { id: 3, name: 'Associação de Proteção dos Animais - SOS Vira-lata', city: 'Criciúma', state: 'SC' },
  acapra: { id: 4, name: 'Associação Catarinense de Proteção aos Animais - Acapra', city: 'Florianópolis', state: 'SC' },
  protecaoUnida: { id: 5, name: 'Proteção Unida de Santa Catarina', city: 'São José', state: 'SC' },
  abrigoAnimal: { id: 6, name: 'Associação Abrigo Animal', city: 'Joinville', state: 'SC' },
  amparoAnimal: { id: 7, name: 'Amparo Animal Chapecó', city: 'Chapecó', state: 'SC' },
}

export const SEED_PEOPLE = {
  mariana: { id: 8, name: 'Mariana Bortolotto', photoUrl: portrait('1494790108377-be9c29b29330') },
  lucas: { id: 9, name: 'Lucas Zanette', photoUrl: portrait('1527980965255-d3b416303d12') },
  fernanda: { id: 10, name: 'Fernanda De Luca', photoUrl: portrait('1438761681033-6461ffad8d80') },
  rafael: { id: 11, name: 'Rafael Cechinel', photoUrl: portrait('1599566150163-29194dcaad36') },
  juliana: { id: 12, name: 'Juliana Mazzuchello', photoUrl: portrait('1544005313-94ddf0286df2') },
  gabriel: { id: 13, name: 'Gabriel Rosso', photoUrl: portrait('1539571696357-5a69c17a67c6') },
  beatriz: { id: 14, name: 'Beatriz Cardoso', photoUrl: portrait('1531123897727-8f129e1688ce') },
  thiago: { id: 15, name: 'Thiago Milanez', photoUrl: portrait('1507003211169-0a1dd7228f2d') },
  larissa: { id: 16, name: 'Larissa Fontanella', photoUrl: portrait('1580489944761-15a19d654956') },
  pedro: { id: 17, name: 'Pedro Henrique Schmitz', photoUrl: portrait('1506794778202-cad84cf45f1d') },
  anaClara: { id: 18, name: 'Ana Clara Dal Pont', photoUrl: portrait('1502685104226-ee32379fefbe') },
  vitor: { id: 19, name: 'Vitor Pagani', photoUrl: null },
}
