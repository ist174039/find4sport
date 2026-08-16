'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function removeFavoriteAction(favoriteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária.')

  const admin = createAdminClient()
  const { data: favorite } = await admin
    .from('favorites')
    .select('id, user_id')
    .eq('id', favoriteId)
    .maybeSingle()
  if (!favorite || favorite.user_id !== user.id) throw new Error('Favorito não encontrado.')

  const { error } = await admin.from('favorites').delete().eq('id', favorite.id)
  if (error) throw new Error('Não foi possível remover o favorito.')

  revalidatePath('/dashboard/favoritos')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function leaveCommunityAction(memberId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Autenticação necessária.')

  const admin = createAdminClient()
  const { data: membership } = await admin
    .from('community_members')
    .select('id, user_id, community_id, role')
    .eq('id', memberId)
    .maybeSingle()
  if (!membership || membership.user_id !== user.id) throw new Error('Adesão à comunidade não encontrada.')

  if (membership.role === 'admin') {
    const { count } = await admin
      .from('community_members')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', membership.community_id)
      .eq('role', 'admin')
    if ((count || 0) <= 1) {
      throw new Error('És o último administrador. Atribui outro administrador antes de sair da comunidade.')
    }
  }

  const { error } = await admin.from('community_members').delete().eq('id', membership.id)
  if (error) throw new Error('Não foi possível sair da comunidade.')

  revalidatePath('/dashboard/favoritos')
  revalidatePath(`/comunidades/${membership.community_id}`)
  revalidatePath('/dashboard')
  return { success: true }
}
