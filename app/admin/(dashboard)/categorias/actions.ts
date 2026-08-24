'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/authorization'
import { writeAdminAudit } from '@/lib/admin/audit'

type TaxonomyType = 'modality' | 'profession' | 'specialty' | 'service'
type CategoryInput = { name: string; slug?: string; emoji?: string; color?: string; code?: string; taxonomy_type: TaxonomyType; is_active?: boolean; parent_id?: string | null }
const TYPES: TaxonomyType[] = ['modality','profession','specialty','service']
const selectFields = 'id,name,slug,emoji,color,icon_key,code,taxonomy_type,is_active,parent_id,created_at'

function normalizeSlug(value: string) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
function sanitizeColor(value: string) { return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#14b8a6' }
function normalizeInput(input: CategoryInput) {
  const name = input.name.trim(); if (!name) throw new Error('O nome é obrigatório.')
  const slug = normalizeSlug(input.slug?.trim() || name); if (!slug) throw new Error('Não foi possível gerar um slug válido.')
  if (!TYPES.includes(input.taxonomy_type)) throw new Error('Tipo de taxonomia inválido.')
  return { name, slug, emoji: input.emoji?.trim() || null, color: sanitizeColor(input.color || ''), code: input.code?.trim().toUpperCase() || null, taxonomy_type: input.taxonomy_type, is_active: input.is_active !== false, parent_id: input.parent_id || null }
}

export async function createCategoryAction(input: CategoryInput) {
  const { user, admin } = await requireAdmin(); const payload = normalizeInput(input)
  const { data, error } = await admin.from('categories').insert(payload).select(selectFields).single()
  if (error) { if ((error as any).code === '23505') throw new Error('Já existe uma entrada com este nome, slug ou código.'); throw new Error(error.message) }
  await writeAdminAudit(admin as any, { action:'INSERT', tableName:'categories', userEmail:user.email || 'admin', message:`Taxonomia ${payload.name} criada`, data:{ category_id:data.id, taxonomy_type:payload.taxonomy_type, code:payload.code } })
  revalidatePath('/admin/categorias'); revalidatePath('/modalidades'); return data
}

export async function updateCategoryAction(id: string, input: CategoryInput) {
  const { user, admin } = await requireAdmin(); if (!id) throw new Error('Entrada inválida.'); const payload = normalizeInput(input)
  if (payload.parent_id === id) throw new Error('Uma entrada não pode ser pai de si própria.')
  const { data, error } = await admin.from('categories').update(payload).eq('id', id).select(selectFields).single()
  if (error) { if ((error as any).code === '23505') throw new Error('Já existe uma entrada com este nome, slug ou código.'); throw new Error(error.message) }
  await writeAdminAudit(admin as any, { action:'UPDATE', tableName:'categories', userEmail:user.email || 'admin', message:`Taxonomia ${payload.name} atualizada`, data:{ category_id:id, taxonomy_type:payload.taxonomy_type, code:payload.code } })
  revalidatePath('/admin/categorias'); revalidatePath('/modalidades'); return data
}

export async function setCategoryActiveAction(id: string, isActive: boolean) {
  const { user, admin } = await requireAdmin(); if (!id) throw new Error('Entrada inválida.')
  const { data, error } = await admin.from('categories').update({ is_active:isActive }).eq('id',id).select(selectFields).single(); if (error) throw new Error(error.message)
  await writeAdminAudit(admin as any, { action:'UPDATE', tableName:'categories', userEmail:user.email || 'admin', message:`Taxonomia ${data.name} ${isActive ? 'ativada' : 'desativada'}`, data:{ category_id:id, is_active:isActive } })
  revalidatePath('/admin/categorias'); revalidatePath('/modalidades'); return data
}

export async function deleteCategoryAction(id: string) {
  const { user, admin } = await requireAdmin(); if (!id) throw new Error('Entrada inválida.')
  const { data:category } = await admin.from('categories').select('name,slug').eq('id',id).maybeSingle(); if (!category) throw new Error('Entrada não encontrada.')
  const { error } = await admin.from('categories').delete().eq('id',id)
  if (error) { if ((error as any).code === '23503') throw new Error('Esta entrada está em utilização. Desative-a em vez de a eliminar.'); throw new Error('Não foi possível eliminar a entrada.') }
  await writeAdminAudit(admin as any,{ action:'DELETE',tableName:'categories',userEmail:user.email || 'admin',message:`Taxonomia ${category.name} eliminada`,data:{category_id:id,slug:category.slug} })
  revalidatePath('/admin/categorias'); revalidatePath('/modalidades'); return {success:true}
}
