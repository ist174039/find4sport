'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminPermission } from '@/lib/auth/authorization'
import { writeAdminAudit } from '@/lib/admin/audit'

export async function deleteReviewAdminAction(reviewId: string) {
  const { user, admin } = await requireAdminPermission('reviews.manage')
  if (!reviewId) throw new Error('Avaliação inválida.')

  const { data: review, error: readError } = await admin
    .from('reviews')
    .select('id,rating,professional_id,space_id,user_id')
    .eq('id', reviewId)
    .maybeSingle()
  if (readError || !review) throw new Error('Avaliação não encontrada.')

  const { error } = await admin.from('reviews').delete().eq('id', reviewId)
  if (error) throw new Error('Não foi possível eliminar a avaliação.')

  await writeAdminAudit(admin as any, {
    action: 'DELETE',
    tableName: 'reviews',
    userEmail: user.email || 'admin',
    message: `Avaliação ${reviewId} eliminada`,
    data: {
      rating: review.rating,
      professional_id: review.professional_id,
      space_id: review.space_id,
      author_user_id: review.user_id,
    },
  })

  revalidatePath('/admin/avaliacoes')
  return { success: true }
}
