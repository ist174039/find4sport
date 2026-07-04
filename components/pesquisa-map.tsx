'use client'

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
function FitBounds({ professionals }: { professionals: any[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (professionals && professionals.length > 0) {
      const bounds = L.latLngBounds(professionals.map(p => [p.latitude, p.longitude]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [professionals, map])
  
  return null
}

interface PesquisaMapProps {
  professionals: any[]
}

export function PesquisaMap({ professionals }: PesquisaMapProps) {
  const [mounted, setMounted] = useState(false)

  // Ensure map only renders on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter professionals that have valid coordinates
  const profsWithLocations = professionals.filter(p => p.latitude != null && p.longitude != null)
  
  // Default to Lisbon if no valid locations
  const defaultCenter: [number, number] = profsWithLocations.length > 0 
    ? [profsWithLocations[0].latitude, profsWithLocations[0].longitude] 
    : [38.7223, -9.1393]

  if (!mounted) {
    return <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">A carregar mapa...</div>
  }

  return (
    <div className="relative w-full h-full z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {profsWithLocations.map((prof) => (
          <Marker 
            key={prof.id} 
            position={[prof.latitude, prof.longitude]}
            icon={customIcon}
          >
            <Popup className="custom-popup">
              <div className="flex flex-col gap-2 min-w-[200px]">
                <div className="flex items-center gap-3">
                  <img 
                    src={prof.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=256&auto=format&fit=crop'} 
                    alt={prof.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground text-sm leading-tight">{prof.full_name}</p>
                    {prof.rating_avg && (
                      <div className="flex items-center text-yellow-500 text-xs mt-0.5">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-medium ml-0.5">{prof.rating_avg.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Link 
                  href={`/profissionais/${prof.public_slug || prof.id}`}
                  className="mt-2 block w-full text-center bg-primary text-primary-foreground text-xs py-1.5 rounded-md font-medium hover:bg-primary/90"
                >
                  Ver Perfil
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {profsWithLocations.length > 0 && <FitBounds professionals={profsWithLocations} />}
      </MapContainer>
    </div>
  )
}
