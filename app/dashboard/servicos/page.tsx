import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ServicesManager } from '@/components/dashboard/services-manager'

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/servicos')

  const { data: professional } = await supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
  if (!professional) redirect('/dashboard')

  const { data, error } = await supabase.from('services').select('*').eq('professional_id', professional.id).order('created_at', { ascending: false })
  if (error) throw new Error(`Não foi possível carregar os serviços: ${error.message}`)

  return <ServicesManager initialServices={(data || []) as any} />
}
