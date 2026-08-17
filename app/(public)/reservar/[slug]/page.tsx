'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Building2 } from 'lucide-react'
import { BookingWizard } from '@/components/booking-wizard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { PUBLIC_SPACE_STATUS } from '@/lib/domain/public-entities'

type PublicSpaceRef = { id: string; slug: string | null; status: string | null }

export default function BookSpacePage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const slug = params.slug
  const [space, setSpace] = useState<PublicSpaceRef | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const supabase = createClient()
        const isUuid = /^[0-9a-f-]{36}$/i.test(slug)
        let result = isUuid
          ? await supabase.from('sport_spaces').select('id,slug,status').eq('id', slug).maybeSingle()
          : await supabase.from('sport_spaces').select('id,slug,status').eq('slug', slug).maybeSingle()

        if (!result.data && !isUuid) {
          result = await supabase.from('sport_spaces').select('id,slug,status').eq('id', slug).maybeSingle()
        }

        if (cancelled) return
        const resolved = result.data as PublicSpaceRef | null
        if (!resolved || resolved.status !== PUBLIC_SPACE_STATUS) {
          setError('Este espaço não está disponível para reservas.')
          return
        }
        setSpace(resolved)
      } catch {
        if (!cancelled) setError('Não foi possível carregar este espaço.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [slug])

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>

  if (!space) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Reserva indisponível</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{error || 'O espaço pedido não foi encontrado.'}</p>
        <Button asChild className="mt-6"><Link href="/espacos"><ArrowLeft className="mr-2 h-4 w-4" />Ver espaços</Link></Button>
      </div>
    )
  }

  const spaceHref = `/espacos/${space.slug || space.id}`
  return (
    <main className="min-h-[70vh]">
      {error && <div className="mx-auto mt-6 flex max-w-lg items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}
      <BookingWizard open onOpenChange={(open) => { if (!open) router.replace(spaceHref) }} spaceId={space.id} />
    </main>
  )
}
