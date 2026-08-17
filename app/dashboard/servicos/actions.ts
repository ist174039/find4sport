'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getLimit } from '@/lib/billing/entitlements'

type ServiceInput = {
  name: string
  description?: string | null
  duration_minutes: number
  price?: number | null
  price_unit: string
  modality: string
}

const PRICE_UNITS = new Set(['sessao', 'hora', 'mes', 'pack'])
const MODALITIES = new Set(['presencial', 'online', 'ambos'])

function validateInput(input: ServiceInput) {
  const name = input.name.trim()
  if (!name) throw new Error('O nome do serviço é obrigatório.')
  if (name.length > 120) throw new Error('O nome do serviço é demasiado longo.')
  const description = input.description?.trim() || null
  if (description && description.length > 2000) throw new Error('A descrição não pode exceder 2000 caracteres.')
  const duration = Number(input.duration_minutes)
  if (!Number.isInteger(duration) || duration < 15 || duration > 480) throw new Error('A duração deve estar entre 15 e 480 minutos.')
  const price = input.price === null || input.price === undefined ? null : Number(input.price)
  if (price !== null && (!Number.isFinite(price) || price < 0 || price > 100000)) throw new Error('Preço inválido.')
  if (!PRICE_UNITS.has(input.price_unit)) throw new Error('Unidade de preço inválida.')
  if (!MODALITIES.has(input.modality)) throw new Error('Modalidade inválida.')
  return { name, description, duration_minutes: duration, price, price_unit: input.price_unit, modality: input.modality }
}

async function requireProfessional() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Sessão inválida')
  const admin = createAdminClient()
  const { data: platformUser } = await admin.from('platform_users').select('type').eq('id', user.id).maybeSingle()
  if (platformUser?.type !== 'professional') throw new Error('Apenas profissionais podem gerir serviços')
  const { data: professional } = await admin.from('professionals').select('id,status,is_verified').eq('user_id', user.id).maybeSingle()
  if (!professional) throw new Error('Perfil profissional não encontrado')
  return { user, admin: admin as any, professionalId: professional.id as string, professional }
}

function revalidateServiceSurfaces() {
  revalidatePath('/dashboard/servicos')
  revalidatePath('/profissionais')
}

export async function createService(input: ServiceInput) {
  const { user, admin, professionalId } = await requireProfessional()
  const clean = validateInput(input)
  const limit = await getLimit(user.id, 'services.max')
  if (limit !== null) {
    const { count, error: countError } = await admin.from('services').select('id', { count: 'exact', head: true }).eq('professional_id', professionalId)
    if (countError) throw countError
    if ((count ?? 0) >= limit) throw new Error(`Atingiu o limite de ${limit} serviços do seu plano`)
  }
  const { data, error } = await admin.from('services').insert({ professional_id: professionalId, ...clean, is_active: false, moderation_status: 'draft' }).select().single()
  if (error) throw error
  revalidateServiceSurfaces()
  return data
}

export async function updateService(serviceId: string, input: ServiceInput) {
  const { admin, professionalId } = await requireProfessional()
  const clean = validateInput(input)
  const { data: current, error: currentError } = await admin.from('services').select('moderation_status').eq('id', serviceId).eq('professional_id', professionalId).maybeSingle()
  if (currentError) throw currentError
  if (!current) throw new Error('Serviço não encontrado.')
  if (current.moderation_status === 'pending') throw new Error('O serviço está em validação. Aguarda a revisão ou a decisão do administrador.')
  const moderationReset = current.moderation_status === 'approved'
    ? { moderation_status: 'draft', is_active: false, moderation_reason: null, submitted_at: null, reviewed_at: null, reviewed_by: null }
    : {}
  const { data, error } = await admin.from('services').update({ ...clean, ...moderationReset }).eq('id', serviceId).eq('professional_id', professionalId).select().single()
  if (error) throw error
  revalidateServiceSurfaces()
  return data
}

export async function submitServiceForReview(serviceId: string) {
  const { user, admin, professionalId } = await requireProfessional()
  const now = new Date().toISOString()
  const { data, error } = await admin.from('services').update({ moderation_status: 'pending', is_active: false, moderation_reason: null, submitted_at: now }).eq('id', serviceId).eq('professional_id', professionalId).in('moderation_status', ['draft', 'rejected']).select().maybeSingle()
  if (error || !data) throw new Error(error?.message || 'Não foi possível submeter o serviço para validação.')
  await admin.from('service_moderation_events').insert({ service_id: serviceId, event_type: 'submitted', actor_user_id: user.id })
  revalidateServiceSurfaces()
  revalidatePath('/admin/servicos')
  return data
}

export async function toggleServiceActive(serviceId: string, isActive: boolean) {
  const { admin, professionalId } = await requireProfessional()
  if (isActive) {
    const { data: service, error: serviceError } = await admin.from('services').select('moderation_status').eq('id', serviceId).eq('professional_id', professionalId).maybeSingle()
    if (serviceError) throw serviceError
    if (!service || service.moderation_status !== 'approved') throw new Error('O serviço precisa de estar aprovado antes de poder ser ativado.')
  }
  const { data, error } = await admin.from('services').update({ is_active: Boolean(isActive) }).eq('id', serviceId).eq('professional_id', professionalId).select().single()
  if (error) throw error
  revalidateServiceSurfaces()
  return data
}

export async function deleteService(serviceId: string) {
  const { admin, professionalId } = await requireProfessional()
  const { error } = await admin.from('services').delete().eq('id', serviceId).eq('professional_id', professionalId)
  if (error) {
    if (String((error as { code?: string }).code || '') === '23503') throw new Error('Este serviço possui dados associados e não pode ser eliminado. Desative-o em vez disso.')
    throw error
  }
  revalidateServiceSurfaces()
}
