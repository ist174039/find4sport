'use server'

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createCommunityPostAction(communityId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')

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
    content,
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
