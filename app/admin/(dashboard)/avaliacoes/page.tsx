'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Star, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer_name: string | null
  target_type: string
  target_name: string | null
}

export default function AdminAvaliacoesPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [filtered, setFiltered] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'admin') { router.push('/'); return }

      const { data } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, reviewer_id, target_type, target_id')
        .order('created_at', { ascending: false })

      if (data) {
        const mapped = await Promise.all((data || []).map(async (r) => {
          let reviewer_name = null
          let target_name = null

          if (r.reviewer_id) {
            const { data: prof } = await supabase.from('professionals').select('full_name').eq('id', r.reviewer_id).single()
            if (prof) reviewer_name = prof.full_name
          }
          if (r.target_type === 'professional' && r.target_id) {
            const { data: t } = await supabase.from('professionals').select('full_name').eq('id', r.target_id).single()
            if (t) target_name = t.full_name
          } else if (r.target_type === 'space' && r.target_id) {
            const { data: t } = await supabase.from('sport_spaces').select('name').eq('id', r.target_id).single()
            if (t) target_name = t.name
          }

          return { ...r, reviewer_name, target_name }
        }))
        setReviews(mapped)
        setFiltered(mapped)
      }
      setLoading(false)
    }
    load()
  }, [router])

  useEffect(() => {
    if (!search.trim()) { setFiltered(reviews); return }
    const term = search.toLowerCase()
    setFiltered(reviews.filter(r =>
      r.comment?.toLowerCase().includes(term) ||
      r.reviewer_name?.toLowerCase().includes(term) ||
      r.target_name?.toLowerCase().includes(term)
    ))
  }, [search, reviews])

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('reviews').delete().eq('id', id)
    setReviews(reviews.filter(r => r.id !== id))
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Avaliações</h1>
          <p className="text-sm text-muted-foreground">Gerir todas as avaliações da plataforma.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {search ? 'Nenhuma avaliação corresponde à pesquisa.' : 'Nenhuma avaliação encontrada.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <Card key={review.id}>
              <CardContent className="flex items-start justify-between pt-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <Badge variant="outline">
                      {review.target_type === 'professional' ? 'Profissional' : 'Espaço'}
                    </Badge>
                  </div>
                  {review.target_name && (
                    <p className="mt-1 text-xs text-muted-foreground">Sobre: {review.target_name}</p>
                  )}
                  {review.reviewer_name && (
                    <p className="text-xs text-muted-foreground">Por: {review.reviewer_name}</p>
                  )}
                  {review.comment && (
                    <p className="mt-2 text-sm text-foreground">{review.comment}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('pt-PT')}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(review.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
