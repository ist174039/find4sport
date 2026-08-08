'use server'

import { createClient } from '@/lib/supabase/server'

export type ReviewTargetType = 'space' | 'professional' | 'event'

export async function submitReviewAction(targetType: ReviewTargetType, targetId: string, rating: number, comment: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Não autenticado')
  }

  if (!targetId) {
    throw new Error('Destino de avaliação inválido')
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Classificação inválida')
  }

  const normalizedComment = comment.trim()
  if (normalizedComment.length > 2000) {
    throw new Error('Comentário demasiado longo')
  }

  if (targetType === 'event') {
    throw new Error('Avaliações de eventos ainda não estão disponíveis.')
  }

  const typeColumn = targetType === 'space' ? 'space_id' : 'professional_id'

  if (targetType === 'space') {
    const { data: targetSpace } = await supabase
      .from('sport_spaces')
      .select('id')
      .eq('id', targetId)
      .maybeSingle()

    if (!targetSpace) {
      throw new Error('Espaço não encontrado')
    }
  }

  if (targetType === 'professional') {
    const { data: targetProfessional } = await supabase
      .from('professionals')
      .select('id')
      .eq('id', targetId)
      .maybeSingle()

    if (!targetProfessional) {
      throw new Error('Profissional não encontrado')
    }
  }

  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .eq(typeColumn, targetId)
    .maybeSingle()

  if (existingReview) {
    throw new Error('Já avaliou este perfil.')
  }

  const { error } = await supabase.from('reviews').insert({
    user_id: user.id,
    [typeColumn]: targetId,
    rating,
    comment: normalizedComment || null,
    status: 'approved',
  })

  if (error) {
    console.error('Erro ao submeter avaliação:', error)
    throw new Error('Erro ao submeter avaliação')
  }

  return { success: true }
}
