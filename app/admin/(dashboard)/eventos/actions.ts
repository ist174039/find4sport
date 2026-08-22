'use server'

import { requireAdminPermission } from '@/lib/auth/authorization'

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
  return {
    title,
    description: input.description ? String(input.description).trim() : null,
    category_id: input.category_id || null,
    address,
    start_date: startDate.toISOString(),
    end_date: endDate?.toISOString() || null,
    capacity,
    price_min: priceMin,
    price_max: priceMax,
    status: 'pending' as const,
  }
}

export async function getAdminEvents() {
  const { admin } = await requireAdminPermission('events.manage')
  const { data, error } = await admin.from('events').select('*').order('start_date', { ascending: false })
  if (error) {
    console.error('Error fetching admin events:', error)
    return []
  }
  return data || []
}

export async function approveEventAction(id: string) {
  const { user, admin } = await requireAdminPermission('events.manage')
  const { error } = await admin.from('events').update({ status: 'published' }).eq('id', id)
  if (!error) await admin.from('audit_logs').insert([{ action: 'UPDATE', table_name: 'events', user_email: user.email || 'admin@find4sport.pt', new_data: { action: `Evento ${id} aprovado` } }])
  return { error }
}

export async function rejectEventAction(id: string) {
  const { user, admin } = await requireAdminPermission('events.manage')
  const { error } = await admin.from('events').update({ status: 'cancelled' }).eq('id', id)
  if (!error) await admin.from('audit_logs').insert([{ action: 'UPDATE', table_name: 'events', user_email: user.email || 'admin@find4sport.pt', new_data: { action: `Evento ${id} rejeitado` } }])
  return { error }
}

export async function deleteEventAction(id: string) {
  const { admin } = await requireAdminPermission('events.manage')
  const { error } = await admin.from('events').delete().eq('id', id)
  return { error }
}

export async function createAdminEventAction(newEvent: AdminEventInput) {
  const { admin } = await requireAdminPermission('events.manage')
  const payload = validateAdminEventInput(newEvent)
  const { data, error } = await admin.from('events').insert([payload]).select()
  return { data, error }
}
