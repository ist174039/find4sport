import { createClient } from '@/lib/supabase/server'
import { ReviewsManager } from '@/components/admin/reviews-manager'

export default async function Page() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      title,
      comment,
      created_at,
      platform_users:user_id(full_name, email),
      professionals:professional_id(full_name),
      sport_spaces:space_id(name)
    `)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw new Error(`Não foi possível carregar as avaliações: ${error.message}`)

  const reviews = (data || []).map((review: any) => ({
    id: review.id,
    rating: Number(review.rating || 0),
    title: review.title || null,
    comment: review.comment || null,
    created_at: review.created_at,
    author_name: review.platform_users?.full_name || 'Utilizador',
    author_email: review.platform_users?.email || '',
    entity_name: review.professionals?.full_name || review.sport_spaces?.name || 'Entidade indisponível',
    entity_type: review.professionals ? 'professional' as const : review.sport_spaces ? 'space' as const : 'unknown' as const,
  }))

  return <ReviewsManager initialReviews={reviews} />
}
