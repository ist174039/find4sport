'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, Users, Building2, Calendar, Star, TrendingUp, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Stats = {
  users: number
  professionals: number
  spaces: number
  events: number
  reviews: number
  pendingModeration: number
}

export default function AdminRelatoriosPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/'); return }

      const [
        { count: users },
        { count: professionals },
        { count: spaces },
        { count: events },
        { count: reviews },
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('professionals').select('*', { count: 'exact', head: true }),
        supabase.from('sport_spaces').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
      ])

      const { count: pendingMod } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      setStats({
        users: users || 0,
        professionals: professionals || 0,
        spaces: spaces || 0,
        events: events || 0,
        reviews: reviews || 0,
        pendingModeration: pendingMod || 0,
      })
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>

  const reportCards = [
    { title: 'Utilizadores', value: stats?.users ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Profissionais', value: stats?.professionals ?? 0, icon: Users, color: 'text-teal-600', bg: 'bg-teal-100' },
    { title: 'Espaços', value: stats?.spaces ?? 0, icon: Building2, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Eventos', value: stats?.events ?? 0, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Avaliações', value: stats?.reviews ?? 0, icon: Star, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Pendentes Mod.', value: stats?.pendingModeration ?? 0, icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-100' },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Visão geral das estatísticas da plataforma.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Notas</CardTitle>
          <CardDescription>Funcionalidades de relatórios avançados em breve.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Gráficos de crescimento mensal</li>
            <li>Top profissionais e espaços</li>
            <li>Relatórios de receita (futuro)</li>
            <li>Exportação CSV/PDF</li>
            <li>Análise de engajamento</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
