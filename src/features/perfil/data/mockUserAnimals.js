// features/perfil/data/mockUserAnimals.js
export const mockUserAnimals = [
  {
    id: 201,
    name: 'Bento',
    breed: 'Vira-lata',
    photoUrl: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=400&q=80',
    status: 'DISPONIVEL',
  },
  {
    id: 202,
    name: 'Pipoca',
    breed: 'SRD',
    photoUrl: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=400&q=80',
    status: 'EM_PROCESSO',
  },
  {
    id: 203,
    name: 'Fred',
    breed: 'Beagle',
    photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
    status: 'ADOTADO',
  },
]

export const ANIMAL_STATUS_META = {
  DISPONIVEL: { label: 'Disponível', className: 'bg-emerald-50 text-emerald-700' },
  EM_PROCESSO: { label: 'Em processo', className: 'bg-amber-50 text-amber-700' },
  ADOTADO: { label: 'Adotado', className: 'bg-slate-100 text-slate-500' },
}