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
      <style dangerouslySetInnerHTML={{__html: `
        .f4s-map-popup-premium .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 0.75rem;
        }
        .f4s-map-popup-premium .leaflet-popup-content {
          margin: 0;
          width: 100% !important;
        }
      `}} />
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
            <Popup className="f4s-map-popup-premium" minWidth={260} maxWidth={280}>
              <div className="flex flex-col w-full overflow-hidden bg-card">
                {/* Hero Image */}
                <div className="relative h-[140px] w-full shrink-0">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=600'} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Badges Overlay */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="rounded-full bg-background/95 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-foreground shadow-sm border border-border/50">
                      {item.itemType === 'space' ? 'Espaço' : item.itemType === 'event' ? 'Evento' : 'Profissional'}
                    </span>
                  </div>
                  {item.is_verified && (
                    <div className="absolute top-2 right-2">
                       <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm flex items-center gap-0.5 border border-emerald-400/50">
                         Verificado
                       </span>
                    </div>
                  )}
                  {/* Gradient to smooth text below if wanted, but clean cut is better */}
                </div>
                
                {/* Details Section */}
                <div className="p-3.5 flex flex-col gap-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-foreground text-[15px] leading-tight line-clamp-2 flex-1">
                      {item.title}
                    </h3>
                    {item.rating_avg != null && item.rating_avg > 0 && (
                      <div className="flex items-center text-amber-500 text-xs font-bold shrink-0 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                        <Star className="h-3 w-3 fill-amber-500 mr-0.5" />
                        <span>{item.rating_avg.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" /> 
                    {item.address || 'Localização não especificada'}
                  </p>

                  <Link 
                    href={item.link}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] shadow-sm"
                  >
                    Ver Detalhes
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
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
