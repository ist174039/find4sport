'use client'

import { ArrowUpRight, MapPin, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'

type ItemType = 'space' | 'professional' | 'event'
type UserLocation = { latitude: number; longitude: number } | null

const markerTypeMap: Record<ItemType, { symbol: string; label: string }> = {
  space: { symbol: 'S', label: 'Espaço' },
  professional: { symbol: 'P', label: 'Profissional' },
  event: { symbol: 'E', label: 'Evento' },
}

function getMarkerIcon(itemType: string, isVerified: boolean) {
  const resolvedType: ItemType = itemType === 'space' || itemType === 'professional' || itemType === 'event' ? itemType : 'space'
  const markerInfo = markerTypeMap[resolvedType]
  return L.divIcon({ className: 'f4s-marker-wrapper', html: `<div class="f4s-marker f4s-marker-${resolvedType}" title="${markerInfo.label}"><span class="f4s-marker-symbol">${markerInfo.symbol}</span>${isVerified ? '<span class="f4s-marker-check">✓</span>' : ''}</div>`, iconSize: [38, 50], iconAnchor: [19, 46], popupAnchor: [0, -40] })
}

const userMarker = L.divIcon({
  className: 'f4s-user-marker-wrapper',
  html: '<div class="f4s-user-marker"><span></span></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function FitBounds({ items, userLocation }: { items: any[]; userLocation: UserLocation }) {
  const map = useMap()
  useEffect(() => {
    const points: [number, number][] = items.filter(i => i.latitude != null && i.longitude != null).map(i => [Number(i.latitude), Number(i.longitude)])
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
    const handleToggle = () => [50, 150, 300, 500].forEach(ms => setTimeout(() => map.invalidateSize(), ms))
    window.addEventListener('map-toggle', handleToggle)
    const timers = [50, 150, 300, 500].map(ms => setTimeout(() => map.invalidateSize(), ms))
    return () => { observer.disconnect(); timers.forEach(clearTimeout); window.removeEventListener('map-toggle', handleToggle) }
  }, [map])
  return null
}

export function PesquisaMap({ items = [], userLocation = null }: { items: any[]; userLocation?: UserLocation }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const itemsWithLocations = items.filter(i => i.latitude != null && i.longitude != null && !isNaN(i.latitude) && !isNaN(i.longitude))
  const defaultCenter: [number, number] = userLocation ? [userLocation.latitude, userLocation.longitude] : itemsWithLocations.length ? [itemsWithLocations[0].latitude, itemsWithLocations[0].longitude] : [38.7223, -9.1393]
  if (!mounted) return <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">A carregar mapa...</div>
  const hasMissingCoordinates = items.length > 0 && itemsWithLocations.length !== items.length

  return <div className="absolute inset-0 z-0 bg-[#e7edf2]">
    <style dangerouslySetInnerHTML={{ __html: `
      .f4s-map-popup-premium .leaflet-popup-content-wrapper{padding:0;overflow:hidden;border-radius:.9rem;box-shadow:0 12px 35px rgba(0,0,0,.18)}
      .f4s-map-popup-premium .leaflet-popup-content{margin:0;width:100%!important}
      .leaflet-control-zoom{border:0!important;box-shadow:0 4px 16px rgba(0,0,0,.18)!important}
      .leaflet-control-zoom a{width:40px!important;height:40px!important;line-height:40px!important;border-color:rgba(0,0,0,.08)!important}
      .f4s-user-marker{width:24px;height:24px;border-radius:9999px;background:#fff;display:grid;place-items:center;box-shadow:0 2px 10px rgba(0,0,0,.25)}
      .f4s-user-marker span{width:12px;height:12px;border-radius:9999px;background:#2563eb;border:2px solid #dbeafe;box-shadow:0 0 0 5px rgba(37,99,235,.18)}
    ` }} />
    <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom zoomControl={false} style={{ height: '100%', width: '100%' }} className="z-0 h-full w-full">
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ZoomControl position="topright" />
      {userLocation && <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userMarker}><Popup><strong>A tua localização</strong><br /><span className="text-xs">Resultados próximos são priorizados.</span></Popup></Marker>}
      {itemsWithLocations.map(item => <Marker key={item.id} position={[item.latitude, item.longitude]} icon={getMarkerIcon(item.itemType, Boolean(item.is_verified))}>
        <Popup className="f4s-map-popup-premium" minWidth={260} maxWidth={280}>
          <div className="flex w-full flex-col overflow-hidden bg-card"><div className="relative h-[140px] w-full shrink-0 bg-muted">{item.image_url ? <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><MapPin className="h-10 w-10 text-muted-foreground/35" /></div>}<div className="absolute left-2 top-2"><span className="rounded-full border border-border/50 bg-background/95 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-foreground shadow-sm backdrop-blur">{item.itemType === 'space' ? 'Espaço' : item.itemType === 'event' ? 'Evento' : 'Profissional'}</span></div>{item.is_verified && <div className="absolute right-2 top-2"><span className="rounded-full bg-emerald-500/90 px-2 py-1 text-[9px] font-bold text-white shadow-sm">Verificado</span></div>}</div><div className="flex flex-col gap-1.5 p-3.5"><div className="flex items-start justify-between gap-2"><h3 className="line-clamp-2 flex-1 text-[15px] font-bold leading-tight text-foreground">{item.title}</h3>{item.rating_avg > 0 && <div className="flex shrink-0 items-center rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-xs font-bold text-amber-600"><Star className="mr-0.5 h-3 w-3 fill-amber-500 text-amber-500" />{Number(item.rating_avg).toFixed(1)}</div>}</div><p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />{item.address || 'Localização não especificada'}</p>{item.distanceKm != null && <p className="text-xs font-medium text-primary">A {item.distanceKm < 1 ? `${Math.round(item.distanceKm * 1000)} m` : `${item.distanceKm.toFixed(1)} km`} de ti</p>}<Link href={item.link} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90">Ver detalhes<ArrowUpRight className="h-4 w-4" /></Link></div></div>
        </Popup>
      </Marker>)}
      <FitBounds items={itemsWithLocations} userLocation={userLocation} />
      <MapResizer />
    </MapContainer>
    {hasMissingCoordinates && <div className="pointer-events-none absolute left-3 top-3 z-[400] max-w-[70%] rounded-lg border border-border bg-background/90 px-3 py-2 text-[11px] text-muted-foreground shadow-sm backdrop-blur-sm">Alguns resultados não aparecem no mapa por não terem coordenadas.</div>}
  </div>
}
