'use client'

import dynamic from 'next/dynamic'

const DynamicMap = dynamic(
  () => import('@/components/pesquisa-map').then((mod) => mod.PesquisaMap),
  { 
    ssr: false, 
    loading: () => <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">A carregar mapa...</div> 
  }
)

export function PesquisaMapWrapper({ items }: { items: any[] }) {
  return <DynamicMap items={items} />
}
