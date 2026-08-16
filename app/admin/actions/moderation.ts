'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária.')

  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) throw new Error('Sem permissões de administração.')
  return { user, admin: createAdminClient() }
}

export async function dismissContentReportAction(reportId: string) {
  const { user, admin } = await requireAdmin()
  const { error } = await admin
    .from('content_reports')
    .update({ status: 'dismissed', reviewed_by: user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', reportId)
  if (error) throw new Error('Não foi possível arquivar a denúncia.')
  revalidatePath('/admin/moderacao')
}

export async function removeReportedContentAction(reportId: string) {
  const { user, admin } = await requireAdmin()
  const { data: report, error: reportError } = await admin
    .from('content_reports')
    .select('id, target_type, target_id')
    .eq('id', reportId)
    .maybeSingle()
  if (reportError || !report) throw new Error('Denúncia não encontrada.')

  if (report.target_type === 'post') {
    const { error } = await admin.from('posts').delete().eq('id', report.target_id)
    if (error) throw new Error('Não foi possível remover a publicação.')
  } else if (report.target_type === 'comment') {
    const { error } = await admin.from('post_comments').delete().eq('id', report.target_id)
    if (error) throw new Error('Não foi possível remover o comentário.')
  } else if (report.target_type === 'community') {
    const { error } = await admin.from('communities').update({ is_active: false }).eq('id', report.target_id)
    if (error) throw new Error('Não foi possível desativar a comunidade.')
  }

  const { error: updateError } = await admin
    .from('content_reports')
    .update({ status: 'resolved', reviewed_by: user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', reportId)
  if (updateError) throw new Error('Conteúdo removido, mas não foi possível fechar a denúncia.')

  revalidatePath('/admin/moderacao')
  revalidatePath('/feed')
}
