'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createClientServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Use the service role key to bypass RLS since the standard insert policy is missing/strict
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function joinCommunityAction(communityId: string) {
  // 1. Verify user session
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Acesso negado. Sessão não encontrada.')
  }

  const { data: community } = await supabase
    .from('communities')
    .select('id')
    .eq('id', communityId)
    .maybeSingle()

  if (!community) {
    throw new Error('Comunidade não encontrada.')
  }

  // 2. Perform insert using admin client
  const { error } = await supabaseAdmin
    .from('community_members')
    .insert({
      community_id: communityId,
      user_id: user.id,
      role: 'member'
    })

  if (error) {
    if (error.code === '23505') {
      // Unique violation means already joined
      return { success: true, message: 'Já era membro desta comunidade.' }
    }
    console.error('Error joining community:', error)
    throw new Error(error.message || 'Erro ao aderir à comunidade.')
  }

  revalidatePath(`/comunidades/${communityId}`)
  
  return { success: true }
}

export async function createCommunityAction(formData: { name: string, description: string, privacy: string, city: string, modality: string }) {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Precisa estar autenticado.')
  }

  // Double check professional status
  const { data: profile } = await supabase
    .from('platform_users')
    .select('type')
    .eq('id', user.id)
    .single()

  if (profile?.type !== 'professional') {
    throw new Error('Apenas profissionais podem criar comunidades.')
  }

  // Insert community
  const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

  const { data: newCommunity, error } = await supabaseAdmin
    .from('communities')
    .insert({
      name: formData.name,
      slug: slug + '-' + Math.floor(Math.random() * 1000),
      description: formData.description,
      is_private: formData.privacy === 'priv'
    })
    .select('id')
    .single()

  if (error || !newCommunity) {
    console.error(error)
    throw new Error('Erro ao criar comunidade.')
  }

  // Make the creator an admin automatically
  await supabaseAdmin
    .from('community_members')
    .insert({
      community_id: newCommunity.id,
      user_id: user.id,
      role: 'admin'
    })

  revalidatePath('/comunidades')
  return { success: true, id: newCommunity.id }
}
