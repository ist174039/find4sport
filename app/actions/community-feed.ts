'use server'

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { canCreatePostForRole, normalizePlatformRole } from '@/lib/auth/roles'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createCommunityPostAction(communityId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')

  const { data: profile } = await supabase
    .from('platform_users')
    .select('type')
    .eq('id', user.id)
    .maybeSingle()

  const role = normalizePlatformRole(profile?.type ?? user.user_metadata?.type)
  if (!canCreatePostForRole(role)) {
    throw new Error('Atletas não podem publicar em comunidades.')
  }

  const trimmedContent = content.trim()
  if (!communityId) throw new Error('Comunidade inválida.')
  if (!trimmedContent) throw new Error('A publicação não pode estar vazia.')
  if (trimmedContent.length > 5000) throw new Error('A publicação excede o limite de 5000 caracteres.')

  // Check if member (or owner)
  const { data: member } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) {
    throw new Error('Apenas membros podem publicar nesta comunidade.')
  }

  // Find professional ID if available
  const { data: professional } = await supabase
    .from('professionals')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  const professionalId = professional?.id || null

  const { error } = await supabaseAdmin.from('posts').insert({
    user_id: user.id,
    professional_id: professionalId,
    community_id: communityId,
    content: trimmedContent,
    media_url: null,
    media_type: null
  })

  if (error) {
    console.error('Insert Error:', error)
    throw new Error('Database Error: ' + (error.message || JSON.stringify(error)))
  }

  revalidatePath(`/comunidades/${communityId}`)
  return { success: true }
}
