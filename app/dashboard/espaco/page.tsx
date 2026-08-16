import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ManagedSpaceEditor } from '@/components/dashboard/managed-space-editor'

export default async function EspacoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/espaco')

  const { data, error } = await supabase
    .from('sport_spaces')
    .select('*')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Não foi possível carregar os espaços: ${error.message}`)
  return <ManagedSpaceEditor initialSpaces={(data || []) as any} />
}
