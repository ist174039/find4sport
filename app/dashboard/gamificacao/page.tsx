'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Award, Star, Zap, Target, ArrowLeft, Medal, Flame, TrendingUp } from 'lucide-react'

type Badge = {
  id: string
  name: string
  description: string | null
  icon: string | null
  earned_at?: string
}

export default function GamificationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const [xpNextLevel, setXpNextLevel] = useState(1000)
  const [badges, setBadges] = useState<Badge[]>([])
  const [stats, setStats] = useState({ reviews: 0, events: 0, connections: 0 })
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        const { data: profile } = await supabase.from('user_profiles').select('xp_level, xp_points, xp_next_level, streak_days').eq('user_id', user.id).single()
        if (profile) {
          setLevel(profile.xp_level || 1)
          setXp(profile.xp_points || 0)
          setXpNextLevel(profile.xp_next_level || 1000)
          setStreak(profile.streak_days || 0)
        }

        const { data: userBadges } = await supabase.from('user_badges').select('badge:badge_id(id, name, description, icon), earned_at').eq('user_id', user.id)
        if (userBadges) {
          setBadges(userBadges.map((ub: any) => ({
            id: ub.badge.id,
            name: ub.badge.name,
            description: ub.badge.description,
            icon: ub.badge.icon,
            earned_at: ub.earned_at,
          })))
        }

        setStats({ reviews: 12, events: 3, connections: 8 })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>

  const xpPercent = xpNextLevel > 0 ? Math.min((xp / xpNextLevel) * 100, 100) : 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>

      <h1 className="mb-8 text-3xl font-bold tracking-tight">Gamificação</h1>

      {/* XP & Level Card */}
      <Card className="mb-6 bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">Nível {level}</p>
                <p className="text-sm text-muted-foreground">Gamificador</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{xp} / {xpNextLevel} XP</p>
              <Progress value={xpPercent} className="mt-1 h-2 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>Sequência de {streak} dias</span>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Star className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-xl font-bold">{stats.reviews}</p>
              <p className="text-xs text-muted-foreground">Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Zap className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-xl font-bold">{stats.events}</p>
              <p className="text-xs text-muted-foreground">Eventos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-xl font-bold">{stats.connections}</p>
              <p className="text-xs text-muted-foreground">Conexões</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-amber-500" />
            Medalhas e Conquistas
          </CardTitle>
          <CardDescription>Desbloqueie medalhas ao completar ações na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <div className="flex flex-col items-center py-8">
              <Award className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Ainda sem medalhas. Complete ações para ganhar conquistas!</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <span className="text-2xl">{badge.icon || '🏅'}</span>
                  <div>
                    <p className="text-sm font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Locked badges placeholder */}
          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Próximas conquistas</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {['Primeiro Evento', '5 Reviews', 'Perfil Completo'].map((name) => (
                <div key={name} className="flex items-center gap-3 rounded-lg border border-dashed p-3 opacity-50">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">Por desbloquear</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
