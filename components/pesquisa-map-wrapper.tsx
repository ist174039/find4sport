'use client'

import dynamic from 'next/dynamic'

const DynamicMap = dynamic(() => import('@/components/pesquisa-map').then((mod) => mod.PesquisaMap), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">A carregar mapa...</div>,
})

export function PesquisaMapWrapper({ items, userLocation }: { items: any[]; userLocation?: { latitude: number; longitude: number } | null }) {
  return <DynamicMap items={items} userLocation={userLocation || null} />
}
