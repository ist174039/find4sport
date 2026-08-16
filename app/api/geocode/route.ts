import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const address = String(url.searchParams.get('address') || '').trim().slice(0, 240)
  if (!address) return NextResponse.json({ error: 'Morada em falta.' }, { status: 400 })
  try {
    const endpoint = new URL('https://nominatim.openstreetmap.org/search')
    endpoint.searchParams.set('q', address)
    endpoint.searchParams.set('format', 'jsonv2')
    endpoint.searchParams.set('limit', '1')
    endpoint.searchParams.set('countrycodes', 'pt,es')
    const response = await fetch(endpoint, { headers: { 'User-Agent': 'Find4Sport/1.0 geocoding', 'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.6' }, next: { revalidate: 86400 } })
    if (!response.ok) return NextResponse.json({ error: 'Serviço de geolocalização indisponível.' }, { status: 502 })
    const data = await response.json() as Array<{ lat?: string; lon?: string; display_name?: string }>
    const first = data[0]
    const latitude = Number(first?.lat); const longitude = Number(first?.lon)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return NextResponse.json({ found: false })
    return NextResponse.json({ found: true, latitude, longitude, displayName: first.display_name || address })
  } catch {
    return NextResponse.json({ error: 'Não foi possível geocodificar a morada.' }, { status: 500 })
  }
}
