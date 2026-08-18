'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PackageCheck, CreditCard, Clock3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type PublicServicePackage = {
  id: string
  name: string
  service_id: string
  sessions_count: number
  price: number
  validity_days: number | null
  service_name?: string | null
}

export function ServicePackageOffers({ packages, paymentsEnabled = true }: { packages: PublicServicePackage[]; paymentsEnabled?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  if (!packages.length) return null

  async function buy(packageId: string) {
    if (!paymentsEnabled) return
    setLoadingId(packageId); setError('')
    try {
      const response = await fetch('/api/package-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageId }) })
      const payload = await response.json().catch(() => ({}))
      if (response.status === 401) { router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`); return }
      if (!response.ok || !payload.url) throw new Error(payload.error || 'Não foi possível iniciar a compra do pacote.')
      window.location.assign(payload.url)
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível iniciar a compra do pacote.'); setLoadingId(null) }
  }

  return <section className="rounded-2xl border bg-card p-4 sm:p-6">
    <div className="mb-4 flex items-center gap-2"><PackageCheck className="h-5 w-5 text-primary"/><div><h3 className="font-semibold">Pacotes de sessões</h3><p className="text-sm text-muted-foreground">Compra várias sessões com este profissional e usa-as ao reservar.</p></div></div>
    {!paymentsEnabled && <div className="mb-4 rounded-xl border bg-muted/40 p-3 text-sm text-muted-foreground">Compras temporariamente indisponíveis. O profissional ainda precisa de concluir a configuração de pagamentos.</div>}
    {error && <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
    <div className="grid gap-3 sm:grid-cols-2">
      {packages.map(pack => <article key={pack.id} className="rounded-2xl border bg-muted/20 p-4">
        <p className="font-semibold">{pack.name}</p>{pack.service_name&&<p className="mt-1 text-xs text-muted-foreground">{pack.service_name}</p>}
        <div className="mt-3 flex flex-wrap gap-3 text-sm"><span className="font-medium text-primary">{pack.sessions_count} sessões</span>{pack.validity_days&&<span className="flex items-center gap-1 text-muted-foreground"><Clock3 className="h-3.5 w-3.5"/>{pack.validity_days} dias</span>}</div>
        <div className="mt-4 flex items-end justify-between gap-3"><div><p className="text-xl font-bold">{Number(pack.price).toFixed(2)} €</p><p className="text-xs text-muted-foreground">{(Number(pack.price)/Number(pack.sessions_count)).toFixed(2)} € / sessão</p></div><Button onClick={()=>buy(pack.id)} disabled={!paymentsEnabled||loadingId===pack.id} className="min-h-11 rounded-xl"><CreditCard className="mr-2 h-4 w-4"/>{!paymentsEnabled?'Indisponível':loadingId===pack.id?'A abrir…':'Comprar'}</Button></div>
      </article>)}
    </div>
  </section>
}
