'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Eye, Star, MessageSquare, TrendingUp, Calendar, Users } from 'lucide-react'
import Link from 'next/link'

export default function SpaceStatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalViews: 0, totalReviews: 0, avgRating: 0, totalContacts: 0, totalEvents: 0 })

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/espaco/login'); return }

        const { data: spaces } = await supabase.from('sport_spaces').select('id, views_count, rating_avg, review_count').eq('created_by', user.id)
        if (spaces) {
          setStats({
            totalViews: spaces.reduce((a, s) => a + (s.views_count || 0), 0),
            totalReviews: spaces.reduce((a, s) => a + (s.review_count || 0), 0),
            avgRating: spaces.length > 0 ? spaces.reduce((a, s) => a + (s.rating_avg || 0), 0) / spaces.length : 0,
            totalContacts: 0,
            totalEvents: 0,
          })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/espaco/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Estatísticas</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10"><Eye className="h-6 w-6 text-blue-500" /></div>
            <div><p className="text-2xl font-bold">{stats.totalViews}</p><p className="text-sm text-muted-foreground">Visualizações</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10"><Star className="h-6 w-6 text-yellow-500" /></div>
            <div><p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p><p className="text-sm text-muted-foreground">Classificação</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10"><MessageSquare className="h-6 w-6 text-green-500" /></div>
            <div><p className="text-2xl font-bold">{stats.totalReviews}</p><p className="text-sm text-muted-foreground">Reviews</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
