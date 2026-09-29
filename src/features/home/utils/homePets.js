export function plural(count, singular, pluralForm) {
  return count === 1 ? singular : pluralForm
}

export function getFirstName(name) {
  return name?.trim().split(/\s+/)[0] ?? ''
}

// As fotos do seed vêm do Unsplash em 1200px — na home os cards são bem
// menores, então pedimos a versão do tamanho certo. Fotos cadastradas no app
// (data URL ou outro host) passam intactas
export function resizePhoto(url, width) {
  if (typeof url !== 'string' || !url.includes('images.unsplash.com')) return url
  return url.replace(/([?&])w=\d+/, `$1w=${width}`).replace(/([?&])q=\d+/, '$1q=70')
}

// O seed reaproveita as mesmas fotos em vários animais extras: numa vitrine
// curta, dois cards com a mesma foto passariam a impressão de anúncio duplicado
export function uniqueByPhoto(pets) {
  const seen = new Set()
  return pets.filter((pet) => {
    if (!pet.photoUrl || seen.has(pet.photoUrl)) return false
    seen.add(pet.photoUrl)
    return true
  })
}

// Só o que o anúncio realmente confirma — campo falso ou ausente não vira selo
export function healthTags(pet) {
  const isFemale = pet?.sex === 'F'
  return [
    pet?.vaccinated && (isFemale ? 'Vacinada' : 'Vacinado'),
    pet?.neutered && (isFemale ? 'Castrada' : 'Castrado'),
    pet?.dewormed && (isFemale ? 'Vermifugada' : 'Vermifugado'),
  ].filter(Boolean)
}
