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
  if (!access || !['professional', 'venue_manager', 'event_manager'].includes(access.role)) redirect('/dashboard/eventos')

  const [{ data: categoryRows, error }, { data: config }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('system_config').select('settings').eq('id', 'global').maybeSingle(),
  ])
  if (error) throw new Error('Não foi possível carregar as modalidades.')

  const categories: TaxonomyOption[] = (categoryRows || []).map(row => {
    const candidate = row as unknown as Record<string, unknown>
    return {
      id: String(candidate.id),
      name: String(candidate.name || ''),
      slug: String(candidate.slug || ''),
      emoji: typeof candidate.emoji === 'string' ? candidate.emoji : null,
      parent_id: typeof candidate.parent_id === 'string' ? candidate.parent_id : null,
    }
  })

  const settings = config?.settings && typeof config.settings === 'object' && !Array.isArray(config.settings) ? config.settings : {}
  return <EventCreateForm categories={categories} paidEventsEnabled={settings.paid_events_enabled !== false} />
}
