'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type ReviewTargetType = 'space' | 'professional' | 'event'

export type PublicReview = {
  id: string
  user_id: string
  rating: number
  comment: string | null
  response: string | null
  created_at: string
  reviewer: {
    id: string
    full_name: string | null
    avatar_url: string | null
    type: string | null
    professional_slug: string | null
    space_slug: string | null
  }
}

function missingOptionalReviewColumn(error: any) {
  const code = String(error?.code || '')
  const message = String(error?.message || '')
  return ['42703', 'PGRST204'].includes(code) || /status|response|schema cache/i.test(message)
}

export async function getReviewsAction(targetType: ReviewTargetType, targetId: string) {
  if (!targetId || targetType === 'event') return { reviews: [] as PublicReview[], currentUserId: null }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdminClient()
  const typeColumn = targetType === 'space' ? 'space_id' : 'professional_id'

  const { data: rawRows, error } = await admin.from('reviews').select('*').eq(typeColumn, targetId).order('created_at', { ascending: false })
  if (error) {
    console.error('Erro ao carregar avaliações:', error)
    throw new Error(`Não foi possível carregar as avaliações: ${error.message}`)
  }

  const rows = (rawRows || []).filter((row: any) => !row.status || row.status === 'approved')
  const userIds = [...new Set(rows.map((row: any) => row.user_id).filter(Boolean))] as string[]
  const [{ data: profiles }, { data: professionals }, { data: spaces }] = userIds.length
    ? await Promise.all([
        admin.from('platform_users').select('id,full_name,avatar_url,type').in('id', userIds),
        admin.from('professionals').select('user_id,public_slug').in('user_id', userIds),
        admin.from('sport_spaces').select('owner_user_id,slug').in('owner_user_id', userIds),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  const profileMap = new Map((profiles || []).map(profile => [profile.id, profile]))
  const professionalMap = new Map((professionals || []).map(profile => [profile.user_id, profile.public_slug]))
  const spaceMap = new Map((spaces || []).map(space => [space.owner_user_id, space.slug]))

  const reviews: PublicReview[] = rows.map((row: any) => {
    const profile = profileMap.get(row.user_id)
    return {
      id: row.id,
      user_id: row.user_id,
      rating: Number(row.rating || 0),
      comment: row.comment || null,
      response: row.response || null,
      created_at: row.created_at,
      reviewer: {
        id: row.user_id,
        full_name: profile?.full_name || null,
        avatar_url: profile?.avatar_url || null,
        type: profile?.type || null,
        professional_slug: professionalMap.get(row.user_id) || null,
        space_slug: spaceMap.get(row.user_id) || null,
      },
    }
  })

  return { reviews, currentUserId: user?.id || null }
}

export async function submitReviewAction(targetType: ReviewTargetType, targetId: string, rating: number, comment: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  if (!targetId) throw new Error('Destino de avaliação inválido')
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Classificação inválida')

  const normalizedComment = comment.trim()
  if (normalizedComment.length > 2000) throw new Error('Comentário demasiado longo')
  if (targetType === 'event') throw new Error('Avaliações de eventos ainda não estão disponíveis.')

  const admin = createAdminClient()
  const typeColumn = targetType === 'space' ? 'space_id' : 'professional_id'
  const targetTable = targetType === 'space' ? 'sport_spaces' : 'professionals'
  const { data: target } = await admin.from(targetTable).select('id').eq('id', targetId).maybeSingle()
  if (!target) throw new Error(targetType === 'space' ? 'Espaço não encontrado' : 'Profissional não encontrado')

  const { data: existingReview } = await admin.from('reviews').select('id').eq('user_id', user.id).eq(typeColumn, targetId).maybeSingle()
  if (existingReview) throw new Error('Já avaliou este perfil.')

  const payload: Record<string, unknown> = { user_id: user.id, [typeColumn]: targetId, rating, comment: normalizedComment || null, status: 'approved' }
  let { error } = await admin.from('reviews').insert(payload)
  if (error && missingOptionalReviewColumn(error)) {
    const { status: _ignored, ...legacyPayload } = payload
    const retry = await admin.from('reviews').insert(legacyPayload)
    error = retry.error
  }
  if (error) {
    console.error('Erro ao submeter avaliação:', error)
    throw new Error(`Erro ao submeter avaliação: ${error.message}`)
  }
  return { success: true }
}
