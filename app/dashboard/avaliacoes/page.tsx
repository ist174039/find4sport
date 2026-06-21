'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Star, ThumbsUp, Flag } from 'lucide-react'
import type { Review } from '@/lib/types'

export default function ProfessionalReviewsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<(Review & { user?: { full_name: string; avatar_url?: string } })[]>([])

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        const { data: prof } = await supabase.from('professionals').select('id').eq('user_id', user.id).single()
        if (prof) {
          const { data } = await supabase.from('reviews').select('*, user:user_id(full_name, avatar_url)').eq('professional_id', prof.id).order('created_at', { ascending: false }).limit(50)
          setReviews(data || [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
        <p className="text-muted-foreground">Todas as reviews recebidas</p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Star className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma avaliação recebida ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.user?.avatar_url} />
                    <AvatarFallback>{review.user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{review.user?.full_name || 'Anónimo'}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                    <div className="mt-1 flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`} />
                      ))}
                    </div>
                    {review.title && <p className="mt-1 text-sm font-medium">{review.title}</p>}
                    {review.comment && <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>}
                    <div className="mt-2 flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <ThumbsUp className="mr-1 h-3 w-3" /> Útil
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">
                        <Flag className="mr-1 h-3 w-3" /> Denunciar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
