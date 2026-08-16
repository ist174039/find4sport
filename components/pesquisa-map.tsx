'use client'

import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Navigation,
  Star,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'

type ItemType = 'space' | 'professional' | 'event' | 'community'
type UserLocation = { latitude: number; longitude: number } | null

type MapItem = {
  id: string
  itemType: ItemType
  title: string
  subtitle?: string | null
  address?: string | null
  mapAddress?: string | null
  rating_avg?: number | null
  review_count?: number | null
  is_verified?: boolean
  image_url?: string | null
  link: string
  start_date?: string | null
  latitude?: number | null
  longitude?: number | null
  distanceKm?: number | null
}

const markerTypeMap: Record<ItemType, { symbol: string; label: string; cta: string }> = {
  space: { symbol: 'S', label: 'Espaço', cta: 'Ver espaço' },
  professional: { symbol: 'P', label: 'Profissional', cta: 'Ver perfil' },
  event: { symbol: 'E', label: 'Evento', cta: 'Ver evento' },
  community: { symbol: 'C', label: 'Comunidade', cta: 'Ver comunidade' },
}

function resolveItemType(itemType: string): ItemType {
  return itemType === 'space' || itemType === 'professional' || itemType === 'event' || itemType === 'community'
    ? itemType
    : 'space'
}

function getMarkerIcon(itemType: string, isVerified: boolean) {
  const resolved = resolveItemType(itemType)
  const info = markerTypeMap[resolved]
  return L.divIcon({
    className: 'f4s-marker-wrapper',
    html: `<div class="f4s-marker f4s-marker-${resolved}" title="${info.label}"><span class="f4s-marker-symbol">${info.symbol}</span>${isVerified ? '<span class="f4s-marker-check">✓</span>' : ''}</div>`,
    iconSize: [38, 50],
    iconAnchor: [19, 46],
    popupAnchor: [0, -40],
  })
}

const userMarker = L.divIcon({
  className: 'f4s-user-marker-wrapper',
  html: '<div class="f4s-user-marker"><span></span></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function FitBounds({ items, userLocation }: { items: MapItem[]; userLocation: UserLocation }) {
  const map = useMap()
  useEffect(() => {
    const points: [number, number][] = items
      .filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)))
      .map((item) => [Number(item.latitude), Number(item.longitude)])
    if (userLocation) points.push([userLocation.latitude, userLocation.longitude])
    if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 14 })
    else if (points.length === 1) map.setView(points[0], 13)
  }, [items, map, userLocation])
  return null
}

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    const container = map.getContainer()
    if (container) observer.observe(container)
    const handle = () => [50, 150, 300, 500].forEach((ms) => setTimeout(() => map.invalidateSize(), ms))
    window.addEventListener('map-toggle', handle)
    const timers = [50, 150, 300, 500].map((ms) => setTimeout(() => map.invalidateSize(), ms))
    return () => {
      observer.disconnect()
      timers.forEach(clearTimeout)
      window.removeEventListener('map-toggle', handle)
    }
  }, [map])
  return null
}

function FocusController({ selectedId, items, markerRefs }: { selectedId: string | null; items: MapItem[]; markerRefs: React.MutableRefObject<Record<string, L.Marker>> }) {
  const map = useMap()
  useEffect(() => {
    if (!selectedId) return
    const item = items.find((candidate) => candidate.id === selectedId)
    if (!item) return
    map.setView([Number(item.latitude), Number(item.longitude)], Math.max(map.getZoom(), 14), { animate: true })
    setTimeout(() => markerRefs.current[selectedId]?.openPopup(), 280)
  }, [selectedId, items, map, markerRefs])
  return null
}

function formatDistance(distanceKm?: number | null) {
  if (distanceKm == null || !Number.isFinite(Number(distanceKm))) return null
  const distance = Number(distanceKm)
  return distance < 1 ? `${Math.max(50, Math.round(distance * 1000 / 50) * 50)} m` : `${distance.toFixed(distance < 10 ? 1 : 0)} km`
}

function formatEventDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function TypeIcon({ type }: { type: ItemType }) {
  const className = 'h-4 w-4'
  if (type === 'professional') return <UserRound className={className} />
  if (type === 'event') return <CalendarDays className={className} />
  if (type === 'community') return <UsersRound className={className} />
  return <Building2 className={className} />
}

function EntityPopup({ item }: { item: MapItem }) {
  const type = resolveItemType(item.itemType)
  const config = markerTypeMap[type]
  const distance = formatDistance(item.distanceKm)
  const eventDate = type === 'event' ? formatEventDate(item.start_date) : null
  const rating = Number(item.rating_avg || 0)
  const reviews = Number(item.review_count || 0)
  const address = item.address || item.mapAddress || 'Localização de referência'
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${Number(item.latitude)},${Number(item.longitude)}`)}`

  return (
    <div className="w-full overflow-hidden bg-card text-card-foreground">
      <div className="relative h-[150px] w-full overflow-hidden bg-muted sm:h-[158px]">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background/80 text-primary shadow-sm">
              <TypeIcon type={type} />
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/15" />
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5 pr-10">
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-background/95 px-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground shadow-sm backdrop-blur">
            <TypeIcon type={type} />
            {config.label}
          </span>
          {item.is_verified ? (
            <span className="inline-flex h-7 items-center gap-1 rounded-full bg-emerald-600 px-2.5 text-[10px] font-bold text-white shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verificado
            </span>
          ) : null}
        </div>
        {distance ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Navigation className="h-3.5 w-3.5" /> {distance}
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <h3 className="line-clamp-2 min-w-0 flex-1 text-[17px] font-bold leading-[1.18] tracking-tight">{item.title}</h3>
            {rating > 0 ? (
              <div className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {rating.toFixed(1)}
              </div>
            ) : null}
          </div>
          {item.subtitle ? <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.subtitle}</p> : null}
        </div>

        <div className="space-y-2 rounded-xl bg-muted/45 p-2.5">
          {eventDate ? (
            <div className="flex items-start gap-2 text-xs">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div><span className="font-semibold text-foreground">Quando</span><span className="ml-1.5 text-muted-foreground">{eventDate}</span></div>
            </div>
          ) : null}
          <div className="flex items-start gap-2 text-xs">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0"><span className="font-semibold text-foreground">Onde</span><span className="ml-1.5 line-clamp-2 text-muted-foreground">{address}</span></div>
          </div>
          {rating > 0 && reviews > 0 ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Star className="h-4 w-4 shrink-0 text-amber-500" />
              <span><strong className="font-semibold text-foreground">{reviews}</strong> {reviews === 1 ? 'avaliação' : 'avaliações'}</span>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Link href={item.link} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition hover:brightness-95 active:scale-[.99]">
            {config.cta}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border bg-background px-3 text-foreground transition hover:bg-muted" aria-label={`Obter direções para ${item.title}`} title="Como chegar">
            <Navigation className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

export function PesquisaMap({ items = [], userLocation = null }: { items: MapItem[]; userLocation?: UserLocation }) {
  const [mounted, setMounted] = useState(false)
  const [resolvedItems, setResolvedItems] = useState<MapItem[]>(items)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const markerRefs = useRef<Record<string, L.Marker>>({})

  useEffect(() => setMounted(true), [])
  useEffect(() => setResolvedItems(items), [items])
  useEffect(() => {
    const handler = (event: Event) => setSelectedId((event as CustomEvent<{ id?: string }>).detail?.id || null)
    window.addEventListener('f4s-map-focus', handler)
    return () => window.removeEventListener('f4s-map-focus', handler)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function resolveMissing() {
      const missing = items.filter((item) => (!Number.isFinite(Number(item.latitude)) || !Number.isFinite(Number(item.longitude))) && (item.mapAddress || item.address)).slice(0, 30)
      if (!missing.length) return
      const updates = await Promise.all(missing.map(async (item) => {
        const address = String(item.mapAddress || item.address || '').trim()
        const key = `f4s_geocode:${address.toLowerCase()}`
        try {
          const cached = sessionStorage.getItem(key)
          if (cached) return { id: item.id, ...JSON.parse(cached) }
          const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
          const data = await response.json()
          if (response.ok && data.found) {
            const value = { latitude: Number(data.latitude), longitude: Number(data.longitude) }
            sessionStorage.setItem(key, JSON.stringify(value))
            return { id: item.id, ...value }
          }
        } catch {}
        return null
      }))
      if (cancelled) return
      const byId = new Map(updates.filter(Boolean).map((update: any) => [update.id, update]))
      setResolvedItems(items.map((item) => byId.has(item.id) ? { ...item, ...byId.get(item.id) } : item))
    }
    void resolveMissing()
    return () => { cancelled = true }
  }, [items])

  const itemsWithLocations = useMemo(() => resolvedItems.filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))), [resolvedItems])
  const defaultCenter: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : itemsWithLocations.length
      ? [Number(itemsWithLocations[0].latitude), Number(itemsWithLocations[0].longitude)]
      : [38.7223, -9.1393]

  if (!mounted) return <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">A carregar mapa...</div>

  const hasMissingCoordinates = resolvedItems.length > 0 && itemsWithLocations.length !== resolvedItems.length
  const popupCss = `
    .f4s-map-popup-premium .leaflet-popup-content-wrapper{padding:0;overflow:hidden;border:0;border-radius:20px;background:transparent;box-shadow:0 18px 50px rgba(15,23,42,.24)}
    .f4s-map-popup-premium .leaflet-popup-content{margin:0!important;width:320px!important;max-width:calc(100vw - 32px)!important}
    .f4s-map-popup-premium .leaflet-popup-tip{background:var(--card);box-shadow:4px 4px 12px rgba(15,23,42,.08)}
    .f4s-map-popup-premium .leaflet-popup-close-button{top:9px!important;right:9px!important;z-index:30!important;width:32px!important;height:32px!important;border-radius:9999px!important;background:rgba(15,23,42,.72)!important;color:white!important;font-size:22px!important;font-weight:400!important;line-height:29px!important;text-align:center!important;box-shadow:0 2px 10px rgba(0,0,0,.18)!important;backdrop-filter:blur(8px)}
    .f4s-map-popup-premium .leaflet-popup-close-button:hover{background:rgba(15,23,42,.9)!important;color:white!important}
    .f4s-user-popup .leaflet-popup-content-wrapper{border-radius:14px;box-shadow:0 10px 30px rgba(15,23,42,.16)}
    .leaflet-control-zoom{border:0!important;box-shadow:0 4px 16px rgba(0,0,0,.18)!important}
    .leaflet-control-zoom a{width:40px!important;height:40px!important;line-height:40px!important}
    .f4s-user-marker{width:24px;height:24px;border-radius:9999px;background:#fff;display:grid;place-items:center;box-shadow:0 2px 10px rgba(0,0,0,.25)}
    .f4s-user-marker span{width:12px;height:12px;border-radius:9999px;background:#2563eb;border:2px solid #dbeafe;box-shadow:0 0 0 5px rgba(37,99,235,.18)}
    .f4s-marker-community{background:#7c3aed!important}
    @media (max-width:480px){.f4s-map-popup-premium .leaflet-popup-content{width:min(310px,calc(100vw - 28px))!important}.f4s-map-popup-premium{margin-bottom:6px}}
  `

  return (
    <div className="absolute inset-0 z-0 bg-[#e7edf2]">
      <style dangerouslySetInnerHTML={{ __html: popupCss }} />
      <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom zoomControl={false} style={{ height: '100%', width: '100%' }} className="z-0 h-full w-full">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomControl position="topright" />
        {userLocation ? (
          <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userMarker}>
            <Popup className="f4s-user-popup">
              <div className="space-y-1 py-1">
                <p className="font-bold text-foreground">A tua localização</p>
                <p className="text-xs leading-relaxed text-muted-foreground">Usamos este ponto para ordenar os resultados mais próximos.</p>
              </div>
            </Popup>
          </Marker>
        ) : null}
        {itemsWithLocations.map((item) => (
          <Marker
            key={item.id}
            ref={(ref) => { if (ref) markerRefs.current[item.id] = ref }}
            position={[Number(item.latitude), Number(item.longitude)]}
            icon={getMarkerIcon(item.itemType, Boolean(item.is_verified))}
          >
            <Popup className="f4s-map-popup-premium" minWidth={300} maxWidth={320}>
              <EntityPopup item={item} />
            </Popup>
          </Marker>
        ))}
        <FitBounds items={itemsWithLocations} userLocation={userLocation} />
        <FocusController selectedId={selectedId} items={itemsWithLocations} markerRefs={markerRefs} />
        <MapResizer />
      </MapContainer>
      {hasMissingCoordinates ? (
        <div className="pointer-events-none absolute left-3 top-3 z-[400] max-w-[70%] rounded-lg border border-border bg-background/90 px-3 py-2 text-[11px] text-muted-foreground shadow-sm backdrop-blur-sm">
          Alguns resultados não têm uma morada suficientemente precisa para aparecer no mapa.
        </div>
      ) : null}
    </div>
  )
}
