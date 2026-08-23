import Link from 'next/link'
import { Users } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { isProviderRole } from '@/lib/auth/roles'
import { Button } from '@/components/ui/button'
import { EventEditForm } from './event-edit-form'
import type { TaxonomyOption } from '@/components/taxonomy-combobox'

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=${encodeURIComponent(`/dashboard/eventos/${id}/editar`)}`)

  const access = await resolveSessionAccess(supabase, user)
  if (!access || !isProviderRole(access.role)) redirect('/dashboard/eventos')

  const [{ data: event, error: eventError }, { data: categoryRows, error: categoriesError }] = await Promise.all([
    supabase.from('events').select('id,title,description,category_id,address,start_date,end_date,capacity,price_min,price_max,image_url,gallery_urls,status,created_by').eq('id', id).eq('created_by', user.id).maybeSingle(),
    supabase.from('categories').select('id,name,slug,parent_id,icon_key').order('name'),
  ])

  if (eventError) throw new Error('Não foi possível carregar o evento.')
  if (!event) redirect('/dashboard/eventos')
  if (categoriesError) throw new Error('Não foi possível carregar as modalidades.')

  const categories: TaxonomyOption[] = categoryRows ?? []

  return <div className="mx-auto max-w-4xl space-y-4">
    <div className="flex justify-end"><Button asChild variant="outline"><Link href={`/dashboard/eventos/${id}/participantes`}><Users className="mr-2 h-4 w-4" />Gerir participantes</Link></Button></div>
    <EventEditForm event={{ ...event, status: event.status ?? 'draft' }} categories={categories} />
  </div>
}
