'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Star, MessageSquare, User, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'

export type TargetType = 'space' | 'professional' | 'event'

interface ReviewsSectionProps {
  targetType: TargetType
  targetId: string
}

export function ReviewsSection({ targetType, targetId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [hasReviewed, setHasReviewed] = useState(false)

  // Form State
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchReviews = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    setUserId(user?.id || null)

    const typeColumn = targetType === 'space' 
      ? 'space_id' 
      : targetType === 'professional' 
        ? 'professional_id' 
        : 'event_id'

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        platform_users ( full_name, avatar_url )
      `)
      .eq(typeColumn, targetId)
      .order('created_at', { ascending: false })

    if (data && !error) {
      setReviews(data)
      if (user) {
        setHasReviewed(data.some(r => r.user_id === user.id))
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, targetId])

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : '0.0'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || rating === 0) return

    setIsSubmitting(true)
    const supabase = createClient()
    
    const typeColumn = targetType === 'space' 
      ? 'space_id' 
      : targetType === 'professional' 
        ? 'professional_id' 
        : 'event_id'

    try {
      const { error } = await supabase.from('reviews').insert({
        user_id: userId,
        [typeColumn]: targetId,
        rating,
        comment,
        status: 'approved' // Auto-approve as per user request
      })

      if (error) throw error
      
      setIsModalOpen(false)
      setComment('')
      setRating(0)
      fetchReviews()
      alert("Avaliação submetida com sucesso!")
    } catch (err: any) {
      console.error(err)
      alert("Erro ao submeter avaliação.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 border-b border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-black text-foreground">
                {averageRating}
              </span>
              <div className="flex gap-1 mt-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4"
                    fill={star <= Math.round(Number(averageRating)) ? "currentColor" : "none"}
                    strokeWidth={star <= Math.round(Number(averageRating)) ? 0 : 2}
                  />
                ))}
              </div>
              <p className="text-xs font-semibold text-muted-foreground mt-1">
                {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
              </p>
            </div>
            <div className="h-12 w-px bg-border hidden sm:block"></div>
            <div>
              <h2 className="text-xl font-bold text-foreground">O que dizem sobre nós</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Leia as opiniões da comunidade ou partilhe a sua experiência.
              </p>
            </div>
          </div>
          
          <Button 
            className="w-full sm:w-auto font-bold rounded-xl h-11"
            onClick={() => {
              if (!userId) {
                window.location.href = `/auth/login?redirect=${window.location.pathname}`
                return
              }
              setIsModalOpen(true)
            }}
            disabled={hasReviewed && userId !== null}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {hasReviewed ? 'Já avaliou' : 'Deixar Avaliação'}
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {review.platform_users?.avatar_url ? (
                        <img src={review.platform_users.avatar_url} alt={review.platform_users.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {review.platform_users?.full_name || 'Utilizador Anónimo'}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: pt })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5"
                        fill={i < review.rating ? "currentColor" : "none"}
                        strokeWidth={i < review.rating ? 0 : 2}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-foreground/80 mt-3 pl-14">
                    "{review.comment}"
                  </p>
                )}
                {review.response && (
                  <div className="mt-3 ml-14 bg-muted/50 p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-foreground">Resposta do Gestor</span>
                      {review.response_at && (
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(review.response_at), { addSuffix: true, locale: pt })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/80">{review.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="text-base font-semibold text-foreground">Ainda não há avaliações</h3>
            <p className="text-sm">Seja o primeiro a partilhar a sua experiência!</p>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              Escreva a sua avaliação
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <Label className="text-sm font-semibold">Como classifica a sua experiência?</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className="w-10 h-10 text-amber-500 transition-colors"
                      fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                      strokeWidth={(hoverRating || rating) >= star ? 0 : 1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Comentário (Opcional)</Label>
              <Textarea 
                placeholder="Partilhe os detalhes da sua experiência (instalações, ambiente, atendimento...)"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || rating === 0} className="font-bold">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submeter Avaliação
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
