'use server'

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { canCreatePostForRole, parsePlatformRole } from '@/lib/auth/roles'
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

  const role = parsePlatformRole(profile?.type)
  if (!role || !canCreatePostForRole(role)) {
    throw new Error('Apenas profissionais e gestores de espaço podem publicar em comunidades.')
  }

  const trimmedContent = content.trim()
  if (!communityId) throw new Error('Comunidade inválida.')
  if (!trimmedContent) throw new Error('A publicação não pode estar vazia.')
  if (trimmedContent.length > 5000) throw new Error('A publicação excede o limite de 5000 caracteres.')

  const { data: member } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member) {
    throw new Error('Apenas membros podem publicar nesta comunidade.')
  }

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
