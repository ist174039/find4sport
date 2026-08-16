'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const DISCOVERY_PATHS = new Set(['/', '/pesquisa', '/profissionais', '/espacos', '/eventos'])

export function LocationSync() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!DISCOVERY_PATHS.has(pathname) || !('geolocation' in navigator)) return
    const cacheKey = 'f4s_geo_updated_at'
    const last = Number(localStorage.getItem(cacheKey) || 0)
    if (Date.now() - last < 30 * 60 * 1000 && document.cookie.includes('f4s_geo=')) return

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latitude = Math.round(coords.latitude * 100000) / 100000
        const longitude = Math.round(coords.longitude * 100000) / 100000
        document.cookie = `f4s_geo=${latitude},${longitude}; Path=/; Max-Age=1800; SameSite=Lax`
        localStorage.setItem(cacheKey, String(Date.now()))
        router.refresh()
      },
      () => localStorage.setItem(cacheKey, String(Date.now())),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 15 * 60 * 1000 },
    )
  }, [pathname, router])

  return null
}
