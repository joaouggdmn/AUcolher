export const adoptionRequestsSeed = [
  {
    id: 1,
    animalId: 1, // Thor
    ownerId: 1,
    status: 'PENDING',
    createdAt: '2026-08-10T14:32:00',
    adopter: {
      userId: null, // pedido de demonstração, sem conta real vinculada
      name: 'Camila Rodrigues',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      profileCompletion: 90,
      city: 'Criciúma',
      state: 'SC',
      lifestyleSummary: 'Casa com quintal · Rotina ativa · Sem outros pets',
    },
  },
  {
    id: 2,
    animalId: 8, // Amora
    ownerId: 1,
    status: 'PENDING',
    createdAt: '2026-08-12T09:15:00',
    adopter: {
      userId: null,
      name: 'Lucas Ferreira',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      profileCompletion: 65,
      city: 'Araranguá',
      state: 'SC',
      lifestyleSummary: 'Apartamento · Rotina moderada · Já tem outro cão',
    },
  },
  {
    id: 3,
    animalId: 1, // Thor — segundo interessado no mesmo pet
    ownerId: 1,
    status: 'PENDING',
    createdAt: '2026-08-13T18:50:00',
    adopter: {
      userId: null,
      name: 'Beatriz Souza',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      profileCompletion: 100,
      city: 'Criciúma',
      state: 'SC',
      lifestyleSummary: 'Casa com quintal · Muito ativa · Tem crianças',
    },
  },
]