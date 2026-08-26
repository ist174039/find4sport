'use server'

import { revalidatePath } from 'next/cache'
import { requireGeneralAdmin } from '@/lib/auth/authorization'
import { writeAdminAudit } from '@/lib/admin/audit'
import type { Json } from '@/lib/supabase-types'

function isJsonObject(value: Json | null | undefined): value is { [key: string]: Json | undefined } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function getRealAdminSettingsAction() {
  const { admin } = await requireGeneralAdmin()
  const [{ data: config }, { data: slides }] = await Promise.all([
    admin.from('system_config').select('settings').eq('id', 'global').maybeSingle(),
    admin.from('carousel_slides').select('*').order('display_order', { ascending: true }),
  ])
  const settings = isJsonObject(config?.settings) ? config.settings : {}
  return {
    manualProfileApproval: typeof settings.manual_profile_approval === 'boolean' ? settings.manual_profile_approval : true,
    operational: {
      maintenanceMode: settings.maintenance_mode === true,
      registrationsEnabled: settings.registrations_enabled !== false,
      claimsEnabled: settings.space_claims_enabled !== false,
      eventsRequireApproval: settings.events_require_approval === true,
      supportEmail: typeof settings.support_email === 'string' ? settings.support_email : '',
      maxUploadMb: typeof settings.max_upload_mb === 'number' ? settings.max_upload_mb : 10,
      claimReviewDays: typeof settings.claim_review_days === 'number' ? settings.claim_review_days : 5,
    },
    slides: slides || [],
  }
}

export async function saveOperationalSettingsAction(input: { maintenanceMode:boolean; registrationsEnabled:boolean; claimsEnabled:boolean; eventsRequireApproval:boolean; supportEmail:string; maxUploadMb:number; claimReviewDays:number }) {
  const { user, admin } = await requireGeneralAdmin()
  const { data: existing } = await admin.from('system_config').select('settings').eq('id', 'global').maybeSingle()
  const current = isJsonObject(existing?.settings) ? existing.settings : {}
  const settings: Json = { ...current, maintenance_mode: input.maintenanceMode, registrations_enabled: input.registrationsEnabled, space_claims_enabled: input.claimsEnabled, events_require_approval: input.eventsRequireApproval, support_email: input.supportEmail.trim(), max_upload_mb: Math.min(50,Math.max(1,Number(input.maxUploadMb)||10)), claim_review_days: Math.min(60,Math.max(1,Number(input.claimReviewDays)||5)) }
  const { error } = await admin.from('system_config').upsert({ id:'global',settings,updated_at:new Date().toISOString() }); if(error)throw error
  await writeAdminAudit(admin as any,{action:'UPDATE',tableName:'system_config',userEmail:user.email||'admin',message:'Parâmetros operacionais atualizados'})
  revalidatePath('/admin/definicoes')
}

export async function saveRegistrationApprovalAction(enabled: boolean) {
  const { user, admin } = await requireGeneralAdmin()
  const { data: existing } = await admin.from('system_config').select('settings').eq('id', 'global').maybeSingle()
  const currentSettings = isJsonObject(existing?.settings) ? existing.settings : {}
  const settings: Json = { ...currentSettings, manual_profile_approval: enabled }
  const { error } = await admin.from('system_config').upsert({ id: 'global', settings, updated_at: new Date().toISOString() })
  if (error) throw error
  await writeAdminAudit(admin as any, {
    action: 'UPDATE', tableName: 'system_config', userEmail: user.email || 'admin',
    message: 'Definição de aprovação manual de perfis atualizada',
    data: { manual_profile_approval: enabled },
  })
  revalidatePath('/admin/definicoes')
}

export async function createCarouselSlideAction(input: { imageUrl: string; title: string; subtitle: string; buttonText: string; buttonLink: string; displayOrder: number }) {
  const { user, admin } = await requireGeneralAdmin()
  if (!input.imageUrl.trim()) throw new Error('A imagem é obrigatória.')
  const { data, error } = await admin.from('carousel_slides').insert({
    image_url: input.imageUrl.trim(),
    title: input.title.trim() || null,
    subtitle: input.subtitle.trim() || null,
    button_text: input.buttonText.trim() || null,
    button_link: input.buttonLink.trim() || null,
    display_order: Number.isFinite(input.displayOrder) ? input.displayOrder : 0,
    is_active: true,
  }).select().single()
  if (error) throw error
  await writeAdminAudit(admin as any, { action: 'INSERT', tableName: 'carousel_slides', userEmail: user.email || 'admin', message: `Slide ${data.id} criado` })
  revalidatePath('/')
  revalidatePath('/admin/definicoes')
  return data
}

export async function toggleCarouselSlideAction(id: string, isActive: boolean) {
  const { user, admin } = await requireGeneralAdmin()
  const { error } = await admin.from('carousel_slides').update({ is_active: isActive }).eq('id', id)
  if (error) throw error
  await writeAdminAudit(admin as any, { action: 'UPDATE', tableName: 'carousel_slides', userEmail: user.email || 'admin', message: `Slide ${id} ${isActive ? 'ativado' : 'desativado'}` })
  revalidatePath('/')
  revalidatePath('/admin/definicoes')
}

export async function deleteCarouselSlideAction(id: string) {
  const { user, admin } = await requireGeneralAdmin()
  const { error } = await admin.from('carousel_slides').delete().eq('id', id)
  if (error) throw error
  await writeAdminAudit(admin as any, { action: 'DELETE', tableName: 'carousel_slides', userEmail: user.email || 'admin', message: `Slide ${id} eliminado` })
  revalidatePath('/')
  revalidatePath('/admin/definicoes')
}
