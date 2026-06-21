'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Building2, Users, Star, Eye, Calendar, Settings, Plus, ExternalLink, MessageSquare } from 'lucide-react'
import type { SportSpace } from '@/lib/types'

export default function SpaceDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [spaces, setSpaces] = useState<SportSpace[]>([])
  const [stats, setStats] = useState({ views: 0, contacts: 0, reviews: 0, rating: 0 })

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/espaco/login'); return }

        const { data: userSpaces } = await supabase
          .from('sport_spaces')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })

        setSpaces(userSpaces || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard')
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [router])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel do Espaço</h1>
          <p className="mt-1 text-muted-foreground">Gerir os seus espaços desportivos</p>
        </div>
        <Button asChild>
          <Link href="/espaco/registar">
            <Plus className="mr-2 h-4 w-4" />
            Novo Espaço
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <Eye className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.views}</p>
              <p className="text-sm text-muted-foreground">Visualizações</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
              <MessageSquare className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.contacts}</p>
              <p className="text-sm text-muted-foreground">Contactos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rating.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Classificação</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.reviews}</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Spaces */}
      <Card>
        <CardHeader>
          <CardTitle>Os Meus Espaços</CardTitle>
        </CardHeader>
        <CardContent>
          {spaces.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Nenhum espaço registado</h3>
              <p className="mb-6 text-sm text-muted-foreground">Registe o seu espaço para começar.</p>
              <Button asChild>
                <Link href="/espaco/registar">Registar Espaço</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {spaces.map((space) => (
                <div key={space.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/espacos/${space.slug || space.id}`} className="flex items-center gap-2 hover:underline">
                      <h3 className="text-lg font-semibold">{space.name}</h3>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Link>
                    <p className="text-sm text-muted-foreground">{space.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/espaco/perfil?id=${space.id}`}>
                        <Settings className="mr-1 h-3 w-3" />
                        Gerir
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
