export type GeoPoint = { latitude: number; longitude: number }

export function parseGeoCookie(value?: string | null): GeoPoint | null {
  if (!value) return null
  const [latRaw, lngRaw] = value.split(',')
  const latitude = Number(latRaw)
  const longitude = Number(lngRaw)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
  return { latitude, longitude }
}

export function distanceKm(a: GeoPoint, b: GeoPoint) {
  const radius = 6371
  const toRad = (value: number) => value * Math.PI / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function distanceFrom(point: GeoPoint | null, latitude?: number | null, longitude?: number | null) {
  if (!point || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) return null
  return distanceKm(point, { latitude: Number(latitude), longitude: Number(longitude) })
}
