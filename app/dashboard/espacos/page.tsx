'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { MapPin, ExternalLink, Users } from 'lucide-react'

type Association = {
  space_id: string
  space_name: string
  space_address: string | null
  status: string
}

export default function DashboardEspacosPage() {
  const router = useRouter()
  const [associations, setAssociations] = useState<Association[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!professional) { setLoading(false); return }

      const { data: rels } = await supabase
        .from('space_professionals')
        .select('space_id')
        .eq('professional_id', professional.id)

      if (rels && rels.length > 0) {
        const spaceIds = rels.map(r => r.space_id)
        const { data: spaces } = await supabase
          .from('sport_spaces')
          .select('id, name, address')
          .in('id', spaceIds)

        if (spaces) {
          setAssociations(spaces.map(s => ({
            space_id: s.id,
            space_name: s.name,
            space_address: s.address,
            status: 'active',
          })))
        }
      }
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Espaços Associados</h1>
        <p className="text-sm text-muted-foreground">Espaços onde estás associado como profissional.</p>
      </div>

      {associations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Nenhum espaço associado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ainda não estás associado a nenhum espaço desportivo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {associations.map((assoc) => (
            <Card key={assoc.space_id} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{assoc.space_name}</h3>
                    {assoc.space_address && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {assoc.space_address}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    Ativo
                  </Badge>
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/espacos/${assoc.space_id}`}>
                      <ExternalLink className="mr-1 h-4 w-4" /> Ver Espaço
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
