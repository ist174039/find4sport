import { createAdminClient } from '@/lib/supabase/admin'
import { ReviewsManager } from '@/components/admin/reviews-manager'

export default async function Page() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('reviews')
    .select(`
      id,
      rating,
      title,
      comment,
      created_at,
      user_id,
      platform_users:user_id(full_name),
      professionals:professional_id(full_name),
      sport_spaces:space_id(name)
    `)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw new Error(`Não foi possível carregar as avaliações: ${error.message}`)

  const authEmail = new Map<string, string>()
  const userIds = [...new Set((data || []).map((review: any) => review.user_id).filter(Boolean))] as string[]
  await Promise.all(userIds.map(async id => {
    const { data: authData } = await admin.auth.admin.getUserById(id)
    if (authData?.user?.email) authEmail.set(id, authData.user.email)
  }))

  const reviews = (data || []).map((review: any) => ({
    id: review.id,
    rating: Number(review.rating || 0),
    title: review.title || null,
    comment: review.comment || null,
    created_at: review.created_at,
    author_name: review.platform_users?.full_name || 'Utilizador',
    author_email: authEmail.get(review.user_id) || '',
    entity_name: review.professionals?.full_name || review.sport_spaces?.name || 'Entidade indisponível',
    entity_type: review.professionals ? 'professional' as const : review.sport_spaces ? 'space' as const : 'unknown' as const,
  }))

  return <ReviewsManager initialReviews={reviews} />
}
