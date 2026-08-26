'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/authorization'
import { writeAdminAudit } from '@/lib/admin/audit'

function normalizeSlug(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function sanitizeColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#14b8a6'
}

type CategoryInput = { name: string; slug?: string; emoji?: string; color?: string; parentId?: string | null; iconKey?: string; taxonomyType?: string; code?: string; isActive?: boolean }

function categoryPayload(input: CategoryInput, name: string, slug: string) {
  return { name, slug, emoji: input.emoji?.trim() || null, color: sanitizeColor(input.color || ''), parent_id: input.parentId || null, icon_key: input.iconKey?.trim() || null, taxonomy_type: input.taxonomyType?.trim() || 'sport', code: input.code?.trim() || null, is_active: input.isActive !== false }
}

export async function createCategoryAction(input: CategoryInput) {
  const { user, admin } = await requireAdmin()
  const name = input.name.trim()
  if (!name) throw new Error('O nome é obrigatório.')
  const slug = normalizeSlug(input.slug?.trim() || name)
  if (!slug) throw new Error('Não foi possível gerar um slug válido.')

  if (input.parentId) { const { data: parent } = await admin.from('categories').select('id').eq('id', input.parentId).maybeSingle(); if (!parent) throw new Error('O nó-pai selecionado já não existe.') }
  const { data, error } = await admin.from('categories').insert(categoryPayload(input, name, slug)).select('*').single()
  if (error) {
    if ((error as any).code === '23505') throw new Error('Já existe uma categoria com este nome ou slug.')
    throw new Error(error.message)
  }
  await writeAdminAudit(admin as any, { action: 'INSERT', tableName: 'categories', userEmail: user.email || 'admin', message: `Categoria ${name} criada`, data: { category_id: data.id, slug } })
  revalidatePath('/admin/categorias')
  return data
}

export async function updateCategoryAction(id: string, input: CategoryInput) {
  const { user, admin } = await requireAdmin()
  if (!id) throw new Error('Categoria inválida.')
  const name = input.name.trim()
  if (!name) throw new Error('O nome é obrigatório.')
  const slug = normalizeSlug(input.slug?.trim() || name)
  if (!slug) throw new Error('Não foi possível gerar um slug válido.')

  if (input.parentId === id) throw new Error('Uma categoria não pode ser filha de si própria.')
  const { data, error } = await admin.from('categories').update(categoryPayload(input, name, slug)).eq('id', id).select('*').single()
  if (error) {
    if ((error as any).code === '23505') throw new Error('Já existe uma categoria com este nome ou slug.')
    throw new Error(error.message)
  }
  await writeAdminAudit(admin as any, { action: 'UPDATE', tableName: 'categories', userEmail: user.email || 'admin', message: `Categoria ${name} atualizada`, data: { category_id: id, slug } })
  revalidatePath('/admin/categorias')
  return data
}

export async function deleteCategoryAction(id: string) {
  const { user, admin } = await requireAdmin()
  if (!id) throw new Error('Categoria inválida.')
  const { data: category } = await admin.from('categories').select('name,slug').eq('id', id).maybeSingle()
  if (!category) throw new Error('Categoria não encontrada.')

  const { error } = await admin.from('categories').delete().eq('id', id)
  if (error) {
    if ((error as any).code === '23503') throw new Error('Esta categoria está a ser utilizada e não pode ser eliminada. Remova primeiro as associações existentes.')
    throw new Error('Não foi possível eliminar a categoria.')
  }
  await writeAdminAudit(admin as any, { action: 'DELETE', tableName: 'categories', userEmail: user.email || 'admin', message: `Categoria ${category.name} eliminada`, data: { category_id: id, slug: category.slug } })
  revalidatePath('/admin/categorias')
  return { success: true }
}
