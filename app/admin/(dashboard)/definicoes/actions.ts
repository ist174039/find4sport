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
    slides: slides || [],
  }
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
