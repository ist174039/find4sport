import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { EventEditForm } from './event-edit-form'

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=${encodeURIComponent(`/dashboard/eventos/${id}/editar`)}`)

  const access = await resolveSessionAccess(supabase, user)
  if (!access || !['professional', 'venue_manager'].includes(access.role)) redirect('/dashboard/eventos')

  const [{ data: event, error: eventError }, { data: categories, error: categoriesError }] = await Promise.all([
    supabase.from('events').select('id,title,description,category_id,address,start_date,end_date,capacity,price_min,price_max,image_url,gallery_urls,status,created_by').eq('id', id).eq('created_by', user.id).maybeSingle(),
    supabase.from('categories').select('id,name,emoji').order('name'),
  ])

  if (eventError) throw new Error('Não foi possível carregar o evento.')
  if (!event) redirect('/dashboard/eventos')
  if (categoriesError) throw new Error('Não foi possível carregar as modalidades.')

  return <EventEditForm event={event} categories={categories || []} />
}
