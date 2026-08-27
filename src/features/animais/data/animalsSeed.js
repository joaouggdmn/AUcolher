// Coordenadas reais aproximadas das cidades usadas no seed — fonte única
// para os animais base E para o gerador de itens extras, evitando o
// descompasso entre "cidade exibida" e "posição usada no cálculo"
const CITY_COORDS = {
  Araranguá: { latitude: -28.9356, longitude: -49.4926 },
  Criciúma: { latitude: -28.6779, longitude: -49.3697 },
  Tubarão: { latitude: -28.4703, longitude: -49.0064 },
  Florianópolis: { latitude: -27.5954, longitude: -48.548 },
  Içara: { latitude: -28.7159, longitude: -49.2986 },
  Sombrio: { latitude: -29.1122, longitude: -49.6297 },
};

const baseAnimals = [
  {
    id: 1,
    name: "Thor",
    species: "DOG",
    breed: "Vira-lata",
    sex: "M",
    ageValue: 3,
    ageUnit: "ANOS",
    ageLabel: "3 anos",
    ageGroup: "ADULT",
    size: "LARGE",
    city: "Araranguá",
    state: "SC",
    distanceKm: 5,
    latitude: -28.9356,
    longitude: -49.4926, // 🆕
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517849845537-4d257902861a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80",
    ],
    photoUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80",
    listingType: "NGO",
    organizationName: "Patinhas Carentes",
    ownerName: "Patinhas Carentes",
    ownerPhotoUrl: null,
    ownerId: 1,
    vaccinated: true,
    neutered: true,
    dewormed: true,
    specialNeeds: false,
    energyLevel: "HIGH",
    temperament: "PROTECTIVE",
    independenceLevel: "MODERATE",
    vocalization: "MODERATE",
    goodWithChildren: true,
    goodWithDogs: true,
    goodWithCats: false,
    apartmentFriendly: false,
    summary:
      "Protetor e brincalhão, pronto para uma nova aventura ao seu lado!",
    story:
      "Thor foi resgatado ainda filhote de uma situação de abandono e cresceu cercado de cuidados na sede da ONG. É brincalhão, protetor e já convive bem com outros cães. Está castrado, vacinado e pronto para uma família que tenha espaço para ele correr.",
  },
  {
    id: 2,
    name: "Mel",
    species: "CAT",
    breed: "SRD",
    sex: "F",
    ageValue: 1,
    ageUnit: "ANOS",
    ageLabel: "1 ano",
    ageGroup: "ADULT",
    size: "SMALL",
    city: "Criciúma",
    state: "SC",
    distanceKm: 12,
    latitude: -28.6725,
    longitude: -49.3652, // 🆕
    images: [
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1200&q=80",
    ],
    photoUrl:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80",
    listingType: "USER",
    ownerName: "Fernanda Alves",
    ownerPhotoUrl:
      "https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?auto=format&fit=crop&w=200&q=80",
    ownerId: 2,
    vaccinated: true,
    neutered: false,
    dewormed: true,
    specialNeeds: false,
    energyLevel: "LOW",
    temperament: "INDEPENDENT",
    independenceLevel: "HIGH",
    vocalization: "LOW",
    goodWithChildren: true,
    goodWithDogs: false,
    goodWithCats: true,
    apartmentFriendly: true,
    summary:
      "Independente e cheia de charme, só precisa de uma janela ensolarada.",
    story:
      "Mel apareceu sozinha em um terreno baldio, ainda bem jovem. Hoje é uma gata independente e carinhosa nos seus próprios termos — adora uma janela ensolarada e um cantinho tranquilo para observar o mundo.",
  },
  {
    id: 3,
    name: "Bidu",
    species: "DOG",
    breed: "Poodle",
    sex: "M",
    ageValue: 8,
    ageUnit: "MESES",
    ageLabel: "8 meses",
    ageGroup: "PUPPY",
    size: "SMALL",
    city: "Tubarão",
    state: "SC",
    distanceKm: 25,
    latitude: -28.468,
    longitude: -49.009, // 🆕
    images: [
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
    ],
    photoUrl:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80",
    listingType: "USER",
    ownerName: "Rafael Lima",
    ownerPhotoUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80",
    ownerId: 3,
    vaccinated: true,
    neutered: false,
    dewormed: true,
    specialNeeds: false,
    energyLevel: "HIGH",
    temperament: "PLAYFUL",
    independenceLevel: "LOW",
    vocalization: "MODERATE",
    goodWithChildren: true,
    goodWithDogs: true,
    goodWithCats: true,
    apartmentFriendly: true,
    summary:
      "Filhote cheio de energia, ainda aprendendo e já cheio de amor pra dar!",
    story:
      "Bidu é filhote e está em fase de socialização. Curioso e cheio de energia, aprende rápido e já entende comandos básicos. Ideal para quem tem tempo disponível para continuar seu adestramento com paciência.",
  },
  {
    id: 4,
    name: "Nina",
    species: "CAT",
    breed: "Siamês",
    sex: "F",
    ageValue: 2,
    ageUnit: "ANOS",
    ageLabel: "2 anos",
    ageGroup: "ADULT",
    size: "SMALL",
    city: "Araranguá",
    state: "SC",
    distanceKm: 3,
    latitude: -28.9401,
    longitude: -49.488, // 🆕 mesma cidade de Thor, endereço diferente
    images: [
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1200&q=80",
    ],
    photoUrl:
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1200&q=80",
    listingType: "NGO",
    organizationName: "Abrigo Amigo Fiel",
    ownerName: "Abrigo Amigo Fiel",
    ownerPhotoUrl: null,
    ownerId: 4,
    vaccinated: true,
    neutered: true,
    dewormed: true,
    specialNeeds: true,
    energyLevel: "MODERATE",
    temperament: "AFFECTIONATE",
    independenceLevel: "MODERATE",
    vocalization: "HIGH",
    goodWithChildren: true,
    goodWithDogs: false,
    goodWithCats: true,
    apartmentFriendly: true,
    summary: "Elegante e conversadora, já castrada e pronta para um novo lar.",
    story:
      "Nina foi resgatada de uma casa com excesso de animais e hoje já está totalmente recuperada. É elegante, vocal e adora conversar com os tutores. Já está castrada e com as vacinas em dia.",
  },
  {
    id: 5,
    name: "Rex",
    species: "DOG",
    breed: "Labrador",
    sex: "M",
    ageValue: 4,
    ageUnit: "ANOS",
    ageLabel: "4 anos",
    ageGroup: "ADULT",
    size: "LARGE",
    city: "Florianópolis",
    state: "SC",
    distanceKm: 45,
    latitude: -27.5954,
    longitude: -48.548, // 🆕
    images: [
      "https://images.unsplash.com/photo-1517849845537-4d257902861a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=1200&q=80",
    ],
    photoUrl:
      "https://images.unsplash.com/photo-1517849845537-4d257902861a?auto=format&fit=crop&w=1200&q=80",
    listingType: "NGO",
    organizationName: "ONG Patas Unidas",
    ownerName: "ONG Patas Unidas",
    ownerPhotoUrl: null,
    ownerId: 5,
    vaccinated: true,
    neutered: true,
    dewormed: true,
    specialNeeds: false,
    energyLevel: "HIGH",
    temperament: "AFFECTIONATE",
    independenceLevel: "LOW",
    vocalization: "MODERATE",
    goodWithChildren: true,
    goodWithDogs: true,
    goodWithCats: true,
    apartmentFriendly: false,
    summary:
      "Leal, brincalhão e ótimo com crianças — o companheiro que faltava.",
    story:
      "Rex é o companheiro leal que todo mundo sonha em ter. Obediente e afetuoso, se dá bem com crianças e outros animais. Ideal para famílias com quintal amplo, já que adora um espaço para se exercitar.",
  },
  {
    id: 6,
    name: "Luna",
    species: "CAT",
    breed: "Persa",
    sex: "F",
    ageValue: 5,
    ageUnit: "ANOS",
    ageLabel: "5 anos",
    ageGroup: "ADULT",
    size: "MEDIUM",
    city: "Içara",
    state: "SC",
    distanceKm: 18,
    latitude: -28.7159,
    longitude: -49.2986, // 🆕
    images: [
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80",
    ],
    photoUrl:
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1200&q=80",
    listingType: "USER",
    ownerName: "Juliana Martins",
    ownerPhotoUrl:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=80",
    ownerId: 6,
    vaccinated: true,
    neutered: true,
    dewormed: false,
    specialNeeds: false,
    energyLevel: "LOW",
    temperament: "CALM",
    independenceLevel: "HIGH",
    vocalization: "LOW",
    goodWithChildren: true,
    goodWithDogs: false,
    goodWithCats: true,
    apartmentFriendly: true,
    summary:
      "Serena e companheira, ideal para quem busca tranquilidade em casa.",
    story:
      "Luna é serena e gosta de rotina. Prefere ambientes calmos e um tutor presente. Depois de um período de adaptação, se torna extremamente companheira e carinhosa.",
  },
  {
    id: 7,
    name: "Max",
    species: "DOG",
    breed: "Vira-lata",
    sex: "M",
    ageValue: 1.5,
    ageUnit: "ANOS",
    ageLabel: "1 ano e meio",
    ageGroup: "ADULT",
    size: "MEDIUM",
    city: "Sombrio",
    state: "SC",
    distanceKm: 30,
    latitude: -29.1122,
    longitude: -49.6297, // 🆕
    images: [
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80",
    ],
    photoUrl:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
    listingType: "USER",
    ownerName: "Eduardo Santos",
    ownerPhotoUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    ownerId: 7,
    vaccinated: true,
    neutered: false,
    dewormed: true,
    specialNeeds: false,
    energyLevel: "HIGH",
    temperament: "AFFECTIONATE",
    independenceLevel: "MODERATE",
    vocalization: "MODERATE",
    goodWithChildren: true,
    goodWithDogs: true,
    goodWithCats: false,
    apartmentFriendly: false,
    summary:
      "Resgatado, recuperado e grato — hoje só quer um lar para chamar de seu.",
    story:
      "Max é um vira-lata cheio de vida, resgatado de uma situação de maus-tratos. Hoje, totalmente recuperado, é dócil e grato por qualquer demonstração de carinho. Adora passeios longos.",
  },
  {
    id: 8,
    name: "Amora",
    species: "CAT",
    breed: "Vira-lata",
    sex: "F",
    ageValue: 6,
    ageUnit: "MESES",
    ageLabel: "6 meses",
    ageGroup: "PUPPY",
    size: "SMALL",
    city: "Araranguá",
    state: "SC",
    distanceKm: 4,
    latitude: -28.9312,
    longitude: -49.4977, // 🆕 terceiro ponto em Araranguá
    images: [
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=1200&q=80",
    ],
    photoUrl:
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1200&q=80",
    listingType: "NGO",
    organizationName: "Patinhas Carentes",
    ownerName: "Patinhas Carentes",
    ownerPhotoUrl: null,
    ownerId: 1,
    vaccinated: true,
    neutered: false,
    dewormed: true,
    specialNeeds: false,
    energyLevel: "HIGH",
    temperament: "PLAYFUL",
    independenceLevel: "LOW",
    vocalization: "MODERATE",
    goodWithChildren: true,
    goodWithDogs: true,
    goodWithCats: true,
    apartmentFriendly: true,
    summary: "A caçula do grupo: brincalhona, sociável e pronta para o mundo!",
    story:
      "Amora é a caçula do grupo — resgatada ainda recém-nascida junto de seus irmãos. Brincalhona e sociável, já está vermifugada e pronta para conhecer sua futura família.",
  },
];

const EXTRA_ANIMAL_NAMES = [
  "Bento",
  "Pipoca",
  "Fred",
  "Duke",
  "Mimi",
  "Zeca",
  "Lola",
  "Bolt",
  "Sushi",
  "Preta",
  "Simba",
  "Naomi",
  "Toby",
  "Fiona",
];
const EXTRA_CITIES = [
  "Araranguá",
  "Criciúma",
  "Tubarão",
  "Florianópolis",
  "Içara",
  "Sombrio",
];

function buildExtraAnimals() {
  return EXTRA_ANIMAL_NAMES.map((name, index) => {
    const base = baseAnimals[index % baseAnimals.length];
    const city = EXTRA_CITIES[index % EXTRA_CITIES.length];
    const cityCoords = CITY_COORDS[city];

    // Deslocamento pequeno e determinístico (não aleatório, para os dados
    // ficarem estáveis entre reloads) — simula endereços diferentes dentro
    // da mesma cidade, em vez de coordenadas idênticas para todo animal
    // que caiu na mesma cidade
    const jitter = (index % 5) * 0.006;

    return {
      ...base,
      id: 100 + index,
      name,
      sex: index % 2 === 0 ? "M" : "F",
      city,
      state: "SC",
      latitude: cityCoords.latitude + jitter, // 🆕 antes: herdava do `base`, causando descompasso com `city`
      longitude: cityCoords.longitude - jitter, // 🆕
      distanceKm: 2 + ((index * 3) % 40),
      listingType: index % 3 === 0 ? "NGO" : "USER",
      organizationName:
        index % 3 === 0
          ? (base.organizationName ?? "Patinhas Carentes")
          : undefined,
      summary: `${name} está esperando por um novo lar cheio de amor!`,
    };
  });
}

export const animalsSeed = [...baseAnimals, ...buildExtraAnimals()];
