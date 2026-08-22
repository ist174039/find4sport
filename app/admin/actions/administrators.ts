'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminPermission } from '@/lib/auth/authorization'
import { parseAdminType } from '@/lib/auth/admin-permissions'
import { writeAdminAudit } from '@/lib/admin/audit'

async function getTarget(db: any, adminId: string) {
  const { data, error } = await db
    .from('admins')
    .select('id, auth_user_id, name, email, admin_type, active')
    .eq('id', adminId)
    .maybeSingle()
  if (error || !data) throw new Error('Administrador não encontrado')
  return data
}

async function activeGeneralCount(db: any) {
  const { count, error } = await db
    .from('admins')
    .select('id', { count: 'exact', head: true })
    .eq('admin_type', 'general')
    .eq('active', true)
  if (error) throw error
  return count ?? 0
}

export async function updateAdministratorAction(adminId: string, formData: FormData) {
  const { user, admin: db } = await requireAdminPermission('admin.manage')
  const target = await getTarget(db, adminId)
  const adminType = parseAdminType(formData.get('adminType'))
  if (!adminType) throw new Error('Tipo de administrador inválido')

  const name = String(formData.get('name') || '').trim()
  if (!name) throw new Error('Nome obrigatório')

  const active = formData.get('active') === 'on'
  const removesGeneralPrivilege = target.admin_type === 'general' && (adminType !== 'general' || !active)

  if (target.auth_user_id === user.id && !active) {
    throw new Error('Não podes desativar a tua própria conta administrativa')
  }
  if (removesGeneralPrivilege && (await activeGeneralCount(db)) <= 1) {
    throw new Error('Não é permitido remover ou desativar o último General Admin ativo')
  }

  const { error } = await db
    .from('admins')
    .update({ name, admin_type: adminType, active, updated_at: new Date().toISOString() })
    .eq('id', adminId)
  if (error) throw error

  await writeAdminAudit(db, {
    action: 'UPDATE',
    tableName: 'admins',
    userEmail: user.email || user.id,
    message: 'Conta administrativa atualizada.',
    data: {
      admin_id: adminId,
      previous_admin_type: target.admin_type,
      admin_type: adminType,
      previous_active: target.active,
      active,
    },
  })

  revalidatePath('/admin/administradores')
  return { success: true }
}

export async function deactivateAdministratorAction(adminId: string) {
  const { user, admin: db } = await requireAdminPermission('admin.manage')
  const target = await getTarget(db, adminId)

  if (target.auth_user_id === user.id) {
    throw new Error('Não podes desativar a tua própria conta administrativa')
  }
  if (target.admin_type === 'general' && target.active && (await activeGeneralCount(db)) <= 1) {
    throw new Error('Não é permitido desativar o último General Admin ativo')
  }

  const { error } = await db
    .from('admins')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', adminId)
  if (error) throw error

  await writeAdminAudit(db, {
    action: 'UPDATE',
    tableName: 'admins',
    userEmail: user.email || user.id,
    message: 'Conta administrativa desativada.',
    data: { admin_id: adminId, admin_type: target.admin_type },
  })

  revalidatePath('/admin/administradores')
  return { success: true }
}
