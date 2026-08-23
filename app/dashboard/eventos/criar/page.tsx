import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { EventCreateForm } from './event-create-form'
import type { TaxonomyOption } from '@/components/taxonomy-combobox'

export default async function CriarEventoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/eventos/criar')

  const access = await resolveSessionAccess(supabase, user)
  if (!access || !['professional', 'venue_manager'].includes(access.role)) redirect('/dashboard/eventos')

  const { data: categoryRows, error } = await supabase
    .from('categories')
    .select('id,name,slug,parent_id,icon_key')
    .order('name')
  if (error) throw new Error('Não foi possível carregar as modalidades.')

  const categories: TaxonomyOption[] = categoryRows ?? []
  return <EventCreateForm categories={categories} />
}
