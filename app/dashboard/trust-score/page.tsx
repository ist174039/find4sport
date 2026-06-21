'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft, Shield, ShieldCheck, ShieldAlert, Check, X,
  FileText, Star, MessageSquare, Award, AlertTriangle, Loader2,
} from 'lucide-react'

export default function TrustScorePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [maxScore] = useState(100)
  const [factors, setFactors] = useState<{ label: string; value: number; max: number; icon: string; met: boolean }[]>([])

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        const { data: prof } = await supabase.from('professionals').select('*').eq('user_id', user.id).single()
        if (prof) {
          const trustFactors = [
            { label: 'Email verificado', value: prof.email_confirmed ? 10 : 0, max: 10, icon: '📧', met: !!prof.email_confirmed },
            { label: 'Telemóvel verificado', value: prof.phone_confirmed ? 10 : 0, max: 10, icon: '📱', met: !!prof.phone_confirmed },
            { label: 'Perfil completo', value: (prof.bio && prof.full_name) ? 15 : 0, max: 15, icon: '👤', met: !!(prof.bio && prof.full_name) },
            { label: 'Foto de perfil', value: prof.avatar_url ? 10 : 0, max: 10, icon: '🖼️', met: !!prof.avatar_url },
            { label: 'Documentos verificados', value: prof.documents_verified ? 20 : 0, max: 20, icon: '📄', met: !!prof.documents_verified },
            { label: 'Avaliações positivas', value: (prof.rating_avg || 0) >= 4 ? 15 : (prof.rating_avg || 0) >= 3 ? 10 : 0, max: 15, icon: '⭐', met: (prof.rating_avg || 0) >= 4 },
            { label: 'Redes sociais ligadas', value: prof.social_linked ? 10 : 0, max: 10, icon: '🔗', met: !!prof.social_linked },
            { label: 'Histórico de eventos', value: prof.events_count >= 5 ? 10 : prof.events_count >= 2 ? 5 : 0, max: 10, icon: '📅', met: prof.events_count >= 5 },
          ]
          setFactors(trustFactors)
          setScore(trustFactors.reduce((a, f) => a + f.value, 0))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const trustLevel = score >= 80 ? 'alto' : score >= 50 ? 'médio' : 'baixo'
  const trustColors = { alto: 'text-green-500', médio: 'text-yellow-500', baixo: 'text-destructive' }
  const trustIcons = { alto: ShieldCheck, médio: Shield, baixo: ShieldAlert }

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>

  const TrustIcon = trustIcons[trustLevel]

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Pontuação de Confiança</h1>
        <p className="text-muted-foreground">A sua credibilidade na plataforma</p>
      </div>

      <Card className="mb-6 bg-gradient-to-br from-primary/5 via-background to-green-500/5">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-green-500/20">
            <TrustIcon className={`h-10 w-10 ${trustColors[trustLevel]}`} />
          </div>
          <p className="mb-1 text-5xl font-bold">{score}/{maxScore}</p>
          <p className={`mb-4 text-lg font-medium capitalize ${trustColors[trustLevel]}`}>
            Confiança {trustLevel}
          </p>
          <Progress value={(score / maxScore) * 100} className="mx-auto h-3 max-w-xs" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Fatores de Confiança
          </CardTitle>
          <CardDescription>Complete os seguintes itens para aumentar a sua pontuação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {factors.map((factor) => (
              <div key={factor.label} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{factor.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{factor.label}</p>
                    <p className="text-xs text-muted-foreground">{factor.value}/{factor.max} pontos</p>
                  </div>
                </div>
                {factor.met ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
