'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Loader2, MessageSquare, Star, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { submitReviewAction } from '@/app/actions/reviews'
import { useModal } from '@/components/providers/modal-provider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export type TargetType = 'space' | 'professional' | 'event'

export function ReviewsSection({ targetType, targetId }: { targetType: TargetType; targetId: string }) {
  const { showAlert } = useModal()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchReviews = async () => {
    if (targetType === 'event') return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
      const typeColumn = targetType === 'space' ? 'space_id' : 'professional_id'
      const { data, error } = await supabase
        .from('reviews')
        .select('*, platform_users(full_name, avatar_url)')
        .eq(typeColumn, targetId)
        .order('created_at', { ascending: false })
      if (error) throw error
      const nextReviews = data || []
      setReviews(nextReviews)
      setHasReviewed(Boolean(user && nextReviews.some((review: any) => review.user_id === user.id)))
    } catch (error) {
      console.error('Error loading reviews:', error)
      showAlert('Erro', 'Não foi possível carregar as avaliações.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (targetType !== 'event') void fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, targetId])

  if (targetType === 'event') return null

  const averageRating = reviews.length
    ? (reviews.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0'

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!userId || rating === 0 || isSubmitting) return
    setIsSubmitting(true)
    try {
      await submitReviewAction(targetType, targetId, rating, comment)
      setIsModalOpen(false)
      setComment('')
      setRating(0)
      await fetchReviews()
      showAlert('Avaliação publicada', 'Obrigado por partilhares a tua experiência.', 'success')
    } catch (error: any) {
      console.error(error)
      showAlert('Erro', error?.message || 'Não foi possível submeter a avaliação.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-6 md:p-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-foreground md:text-5xl">{averageRating}</span>
              <div className="mt-1 flex gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-4 w-4" fill={star <= Math.round(Number(averageRating)) ? 'currentColor' : 'none'} />)}
              </div>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}</p>
            </div>
            <div className="hidden h-12 w-px bg-border sm:block" />
            <div><h2 className="text-xl font-bold text-foreground">Avaliações</h2><p className="mt-0.5 text-sm text-muted-foreground">Opiniões reais da comunidade.</p></div>
          </div>

          <Button
            className="h-11 w-full rounded-xl font-bold sm:w-auto"
            onClick={() => {
              if (!userId) {
                window.location.href = `/auth/login?redirect=${window.location.pathname}`
                return
              }
              setIsModalOpen(true)
            }}
            disabled={hasReviewed && userId !== null}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {hasReviewed ? 'Já avaliou' : 'Deixar avaliação'}
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : reviews.length ? (
          <div className="space-y-6">
            {reviews.map((review: any) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                      {review.platform_users?.avatar_url ? <img src={review.platform_users.avatar_url} alt={review.platform_users.full_name || 'Utilizador'} className="h-full w-full object-cover" /> : <User className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div><h4 className="text-sm font-bold text-foreground">{review.platform_users?.full_name || 'Utilizador'}</h4><p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: pt })}</p></div>
                  </div>
                  <div className="flex text-amber-500">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-3.5 w-3.5" fill={i < review.rating ? 'currentColor' : 'none'} />)}</div>
                </div>
                {review.comment && <p className="mt-3 pl-14 text-sm text-foreground/80">“{review.comment}”</p>}
                {review.response && <div className="ml-14 mt-3 rounded-lg border border-border bg-muted/50 p-3"><p className="mb-1 text-xs font-bold">Resposta do gestor</p><p className="text-sm text-foreground/80">{review.response}</p></div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground"><MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-30" /><h3 className="font-semibold text-foreground">Ainda não há avaliações</h3><p className="text-sm">Sê o primeiro a partilhar a tua experiência.</p></div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Star className="h-5 w-5 fill-amber-500 text-amber-500" />Escrever avaliação</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="flex flex-col items-center gap-2"><Label>Como classificas a experiência?</Label><div className="flex gap-2">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="transition-transform hover:scale-110"><Star className="h-10 w-10 text-amber-500" fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'} /></button>)}</div></div>
            <div className="space-y-2"><Label>Comentário opcional</Label><Textarea rows={4} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Partilha detalhes relevantes da tua experiência." /></div>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancelar</Button><Button type="submit" disabled={isSubmitting || rating === 0}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Publicar</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
