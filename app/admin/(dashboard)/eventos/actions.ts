'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminPermission } from '@/lib/auth/authorization'
import { writeAdminAudit } from '@/lib/admin/audit'

type AdminEventInput = {
  title: string
  description?: string | null
  category_id?: string | null
  address: string
  start_date: string
  end_date?: string | null
  capacity?: number | null
  price_min?: number | null
  price_max?: number | null
}

function validateAdminEventInput(input: AdminEventInput) {
  const title = String(input?.title || '').trim()
  const address = String(input?.address || '').trim()
  const startDate = new Date(input?.start_date)
  const endDate = input?.end_date ? new Date(input.end_date) : null
  if (!title || !address || Number.isNaN(startDate.getTime())) throw new Error('Título, localização e data de início válidos são obrigatórios.')
  if (endDate && (Number.isNaN(endDate.getTime()) || endDate < startDate)) throw new Error('A data de fim é inválida.')
  const capacity = input.capacity == null ? null : Math.max(0, Math.floor(Number(input.capacity)))
  const priceMin = input.price_min == null ? null : Number(input.price_min)
  const priceMax = input.price_max == null ? null : Number(input.price_max)
  if ((priceMin != null && (!Number.isFinite(priceMin) || priceMin < 0)) || (priceMax != null && (!Number.isFinite(priceMax) || priceMax < 0))) throw new Error('Preço inválido.')
  if (priceMin != null && priceMax != null && priceMax < priceMin) throw new Error('O preço máximo não pode ser inferior ao mínimo.')
  return { title, description: input.description ? String(input.description).trim() : null, category_id: input.category_id || null, address, start_date: startDate.toISOString(), end_date: endDate?.toISOString() || null, capacity, price_min: priceMin, price_max: priceMax, status: 'pending' as const }
}

async function transitionEvent(id: string, status: 'published' | 'cancelled', auditAction: string) {
  const { user, admin } = await requireAdminPermission('events.manage')
  const { data: current } = await admin.from('events').select('id,title,status').eq('id', id).maybeSingle()
  if (!current) throw new Error('Evento não encontrado.')
  if (current.status === status) return { error: null }
  const { data: updated, error } = await admin.from('events').update({ status }).eq('id', id).eq('status', current.status).select('id').maybeSingle()
  if (error) return { error }
  if (!updated) throw new Error('O evento foi alterado por outro administrador. Atualiza a página e tenta novamente.')
  await writeAdminAudit(admin as any, { action: 'UPDATE', tableName: 'events', userEmail: user.email || 'admin', message: `${auditAction}: ${current.title || id}`, data: { event_id: id, previous_status: current.status, status } })
  revalidatePath('/admin/eventos'); revalidatePath('/admin/eventos/validacao'); revalidatePath(`/admin/eventos/${id}`); revalidatePath('/eventos')
  return { error: null }
}

export async function getAdminEvents() {
  const { admin } = await requireAdminPermission('events.manage')
  const { data, error } = await admin.from('events').select('*').order('start_date', { ascending: false })
  if (error) { console.error('Error fetching admin events:', error); return [] }
  return data || []
}

export async function approveEventAction(id: string) { return transitionEvent(id, 'published', 'Evento aprovado') }
export async function rejectEventAction(id: string) { return transitionEvent(id, 'cancelled', 'Evento rejeitado/cancelado') }

// Compatibility action kept for existing UI callers. Events are lifecycle records and are never hard-deleted by the admin UI.
export async function deleteEventAction(id: string) { return transitionEvent(id, 'cancelled', 'Evento removido da publicação') }

export async function createAdminEventAction(newEvent: AdminEventInput) {
  const { user, admin } = await requireAdminPermission('events.manage')
  const payload = validateAdminEventInput(newEvent)
  const { data, error } = await admin.from('events').insert([payload]).select()
  if (!error && data?.[0]) await writeAdminAudit(admin as any, { action: 'INSERT', tableName: 'events', userEmail: user.email || 'admin', message: `Evento criado para curadoria: ${payload.title}`, data: { event_id: data[0].id, status: payload.status } })
  revalidatePath('/admin/eventos'); revalidatePath('/admin/eventos/validacao')
  return { data, error }
}
