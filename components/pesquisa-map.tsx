'use client';
import { Star, Building, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'

// Fix Leaflet's default icon path issues in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

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
    const container = map.getContainer()
    if (container) {
      observer.observe(container)
    }
    return () => observer.disconnect()
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

  return (
    <div className="relative w-full h-full z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {itemsWithLocations.map((item) => (
          <Marker 
            key={item.id} 
            position={[item.latitude, item.longitude]}
            icon={customIcon}
          >
            <Popup className="custom-popup">
              <div className="flex flex-col gap-2 min-w-[200px] p-1">
                <div className="flex items-center gap-3">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=256'} 
                    alt={item.title}
                    className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm leading-tight truncate">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{item.address}</p>
                    {item.rating_avg && (
                      <div className="flex items-center text-amber-500 text-xs mt-0.5 font-bold">
                        <Star className="h-3 w-3 fill-amber-500 mr-0.5" />
                        <span>{item.rating_avg.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Link 
                  href={item.link}
                  className="mt-1 block w-full text-center bg-primary text-primary-foreground text-xs py-1.5 rounded-md font-medium hover:bg-primary/90 transition-all"
                >
                  Ver {item.itemType === 'space' ? 'Espaço' : 'Perfil'}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {itemsWithLocations.length > 0 && <FitBounds items={itemsWithLocations} />}
        <MapResizer />
      </MapContainer>
    </div>
  )
}
