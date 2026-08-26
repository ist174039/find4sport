'use server'

import { revalidatePath } from 'next/cache'
import { requireGeneralAdmin } from '@/lib/auth/authorization'
import { writeAdminAudit } from '@/lib/admin/audit'

const allowedTypes = new Set(['general', 'content', 'support', 'finance'])

export async function createAdministratorAction(input: { email: string; adminType: string }) {
  const { user, admin } = await requireGeneralAdmin()
  const email = input.email.trim().toLowerCase()
  const adminType = allowedTypes.has(input.adminType) ? input.adminType : 'support'
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Indique um email válido.')
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email)
  if (inviteError || !invited.user) throw new Error(inviteError?.message || 'Não foi possível enviar o convite.')
  const { data, error } = await admin.from('admins').insert({ auth_user_id: invited.user.id, email, admin_type: adminType }).select('id,auth_user_id,email,admin_type,created_at').single()
  if (error) { await admin.auth.admin.deleteUser(invited.user.id); throw new Error(error.message) }
  await writeAdminAudit(admin as any, { action: 'INSERT', tableName: 'admins', userEmail: user.email || 'admin', message: `Administrador ${email} convidado`, data: { admin_id: data.id, admin_type: adminType } })
  revalidatePath('/admin/administradores')
  return data
}

export async function updateAdministratorAction(id: string, input: { email: string; adminType: string }) {
  const { user, admin } = await requireGeneralAdmin()
  const email = input.email.trim().toLowerCase()
  const adminType = allowedTypes.has(input.adminType) ? input.adminType : 'support'
  const { data: current } = await admin.from('admins').select('*').eq('id', id).maybeSingle()
  if (!current) throw new Error('Administrador não encontrado.')
  if (current.auth_user_id === user.id && adminType !== 'general') throw new Error('Não pode remover a sua própria permissão de Administrador Geral.')
  if (current.auth_user_id) {
    const { error } = await admin.auth.admin.updateUserById(current.auth_user_id, { email })
    if (error) throw new Error(error.message)
  }
  const { data, error } = await admin.from('admins').update({ email, admin_type: adminType }).eq('id', id).select('id,auth_user_id,email,admin_type,created_at').single()
  if (error) throw new Error(error.message)
  await writeAdminAudit(admin as any, { action: 'UPDATE', tableName: 'admins', userEmail: user.email || 'admin', message: `Administrador ${email} atualizado`, data: { admin_id: id, admin_type: adminType } })
  revalidatePath('/admin/administradores')
  return data
}

export async function setAdministratorActiveAction(id: string, active: boolean) {
  const { user, admin } = await requireGeneralAdmin()
  const { data: current } = await admin.from('admins').select('*').eq('id', id).maybeSingle()
  if (!current?.auth_user_id) throw new Error('Administrador sem conta de autenticação associada.')
  if (!active && current.auth_user_id === user.id) throw new Error('Não pode desativar a sua própria conta.')
  const { error } = await admin.auth.admin.updateUserById(current.auth_user_id, { ban_duration: active ? 'none' : '876000h' })
  if (error) throw new Error(error.message)
  await writeAdminAudit(admin as any, { action: 'UPDATE', tableName: 'admins', userEmail: user.email || 'admin', message: `Administrador ${current.email} ${active ? 'ativado' : 'desativado'}`, data: { admin_id: id, active } })
  revalidatePath('/admin/administradores')
  return { success: true }
}
