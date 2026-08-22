'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/authorization'

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
    throw new Error('A desativação de comunidades não está implementada no schema atual. A denúncia não foi marcada como resolvida.')
  } else {
    throw new Error(`Tipo de conteúdo não suportado pela moderação: ${report.target_type}`)
  }

  const { error: updateError } = await admin
    .from('content_reports')
    .update({ status: 'resolved', reviewed_by: user.id, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', reportId)
  if (updateError) throw new Error('Conteúdo removido, mas não foi possível fechar a denúncia.')

  revalidatePath('/admin/moderacao')
  revalidatePath('/feed')
}
