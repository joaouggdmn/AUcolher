const EARTH_RADIUS_KM = 6371

function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

export function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const nLat1 = Number(lat1)
  const nLng1 = Number(lng1)
  const nLat2 = Number(lat2)
  const nLng2 = Number(lng2)

  if (![nLat1, nLng1, nLat2, nLng2].every(Number.isFinite)) {
    return null
  }

  const dLat = toRadians(nLat2 - nLat1)
  const dLng = toRadians(nLng2 - nLng1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(nLat1)) * Math.cos(toRadians(nLat2)) * Math.sin(dLng / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = EARTH_RADIUS_KM * c

  return Number.isFinite(distance) ? distance : null
}