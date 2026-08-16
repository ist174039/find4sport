'use client'

import { useState } from 'react'
import { LocateFixed, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useModal } from '@/components/providers/modal-provider'
import { cn } from '@/lib/utils'

export function UseMyLocationButton({ className, compact = false }: { className?: string; compact?: boolean }) {
  const router = useRouter()
  const { showAlert } = useModal()
  const [loading, setLoading] = useState(false)

  function requestLocation() {
    if (!('geolocation' in navigator)) { showAlert('Localização', 'Este dispositivo não disponibiliza geolocalização.', 'error'); return }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const latitude = Math.round(coords.latitude * 100000) / 100000
      const longitude = Math.round(coords.longitude * 100000) / 100000
      document.cookie = `f4s_geo=${latitude},${longitude}; Path=/; Max-Age=1800; SameSite=Lax`
      localStorage.setItem('f4s_geo_updated_at', String(Date.now()))
      setLoading(false)
      router.refresh()
    }, (error) => {
      setLoading(false)
      const denied = error.code === error.PERMISSION_DENIED
      showAlert('Localização', denied ? 'A permissão de localização está bloqueada. Ativa-a nas definições do browser para ordenar e filtrar por proximidade.' : 'Não foi possível obter a tua localização neste momento.', 'error')
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 })
  }

  return <Button type="button" variant="outline" onClick={requestLocation} disabled={loading} className={cn('min-h-11 shrink-0 rounded-xl', compact ? 'px-3' : '', className)} aria-label="Usar a minha localização">{loading?<Loader2 className="h-4 w-4 animate-spin"/>:<LocateFixed className="h-4 w-4"/>}{!compact&&<span className="ml-2">Perto de mim</span>}</Button>
}
