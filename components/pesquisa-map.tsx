'use client';
import { ArrowUpRight, Building, Calendar, MapPin, Star, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'

type ItemType = 'space' | 'professional' | 'event'

const markerTypeMap: Record<ItemType, { symbol: string; label: string }> = {
  space: { symbol: 'S', label: 'Espaço' },
  professional: { symbol: 'P', label: 'Profissional' },
  event: { symbol: 'E', label: 'Evento' },
}

function getMarkerIcon(itemType: string, isVerified: boolean) {
  const resolvedType: ItemType = itemType === 'space' || itemType === 'professional' || itemType === 'event'
    ? itemType
    : 'space'

  const markerInfo = markerTypeMap[resolvedType]

  return L.divIcon({
    className: 'f4s-marker-wrapper',
    html: `
      <div class="f4s-marker f4s-marker-${resolvedType}" title="${markerInfo.label}">
        <span class="f4s-marker-symbol">${markerInfo.symbol}</span>
        ${isVerified ? '<span class="f4s-marker-check">✓</span>' : ''}
      </div>
    `,
    iconSize: [38, 50],
    iconAnchor: [19, 46],
    popupAnchor: [0, -40],
  })
}

// Helper component to auto-fit bounds
function FitBounds({ items }: { items: any[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (items && items.length > 0) {
      const validPoints = items.filter(i => i.latitude != null && i.longitude != null)
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints.map(i => [i.latitude, i.longitude]))
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [items, map])
  
  return null
}

// Helper component to invalidate size on container resize (fixes gray tiles on mobile toggle)
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    
    // Multiple fallbacks for mobile browsers/CSS transitions
    const timeouts = [50, 150, 300, 500, 1000].map(ms => 
      setTimeout(() => map.invalidateSize(), ms)
    )

    const container = map.getContainer()
    if (container) {
      observer.observe(container)
    }

    const handleToggle = () => {
      const delays = [50, 150, 300, 500]
      delays.forEach(ms => setTimeout(() => map.invalidateSize(), ms))
    }
    window.addEventListener('map-toggle', handleToggle)
    
    return () => {
      observer.disconnect()
      timeouts.forEach(clearTimeout)
      window.removeEventListener('map-toggle', handleToggle)
    }
  }, [map])
  return null
}

interface PesquisaMapProps {
  items: any[]
}

export function PesquisaMap({ items = [] }: PesquisaMapProps) {
  const [mounted, setMounted] = useState(false)

  // Ensure map only renders on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter items that have valid coordinates
  const itemsWithLocations = items.filter(i => i.latitude != null && i.longitude != null && !isNaN(i.latitude) && !isNaN(i.longitude))
  
  // Default center: Lisbon if no valid locations
  const defaultCenter: [number, number] = itemsWithLocations.length > 0 
    ? [itemsWithLocations[0].latitude, itemsWithLocations[0].longitude] 
    : [38.7223, -9.1393]

  if (!mounted) {
    return <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">A carregar mapa...</div>
  }

  const hasMissingCoordinates = items.length > 0 && itemsWithLocations.length !== items.length

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="z-0 h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {itemsWithLocations.map((item) => (
          <Marker 
            key={item.id} 
            position={[item.latitude, item.longitude]}
            icon={getMarkerIcon(item.itemType, Boolean(item.is_verified))}
          >
            <Popup className="f4s-map-popup" minWidth={245} maxWidth={280}>
              <div className="flex flex-col gap-2 min-w-[220px] p-1.5">
                <div className="flex items-center gap-3">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=256'} 
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground/90">
                        {item.itemType === 'space' ? 'Espaço' : item.itemType === 'event' ? 'Evento' : 'Profissional'}
                      </span>
                      {item.is_verified && <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">Verificado</span>}
                    </div>
                    <p className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{item.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                      <MapPin className="h-3 w-3 shrink-0" /> {item.address}
                    </p>
                    {item.rating_avg != null && item.rating_avg > 0 && (
                      <div className="flex items-center text-amber-500 text-xs mt-1 font-bold">
                        <Star className="h-3 w-3 fill-amber-500 mr-0.5" />
                        <span>{item.rating_avg.toFixed(1)}</span>
                        {item.review_count ? <span className="ml-1 text-muted-foreground font-medium">({item.review_count})</span> : null}
                      </div>
                    )}
                  </div>
                </div>

                <Link 
                  href={item.link}
                  className="mt-1 flex w-full items-center justify-center gap-1 rounded-md bg-primary px-2 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  Ver {item.itemType === 'space' ? 'Espaço' : item.itemType === 'event' ? 'Evento' : 'Perfil'}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {itemsWithLocations.length > 0 && <FitBounds items={itemsWithLocations} />}
        <MapResizer />
      </MapContainer>

      {hasMissingCoordinates && (
        <div className="pointer-events-none absolute right-3 top-3 z-[400] rounded-lg border border-border bg-background/90 px-3 py-2 text-[11px] text-muted-foreground shadow-sm backdrop-blur-sm">
          Alguns resultados não aparecem no mapa por não terem coordenadas.
        </div>
      )}
    </div>
  )
}
