import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GaleriaManagerV2 } from '@/components/dashboard/galeria-manager-v2'
import { resolveSessionAccess } from '@/lib/auth/access'
import { isProviderRole } from '@/lib/auth/roles'
import Link from 'next/link'

export default async function GaleriaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/galeria')

  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessDashboard || !isProviderRole(access.role)) redirect('/dashboard')

  const entityResult: { data: any } = access.role === 'professional'
    ? await supabase.from('professionals').select('*').eq('user_id', user.id).maybeSingle()
    : await supabase.from('sport_spaces').select('*').eq('owner_user_id', user.id).order('created_at', { ascending: true }).limit(1).maybeSingle()
  const { data: managedSpaces } = access.role === 'venue_manager'
    ? await supabase.from('sport_spaces').select('id,name').eq('owner_user_id', user.id).order('created_at', { ascending: true })
    : { data: [] as { id: string; name: string }[] }

  if (!entityResult.data) redirect('/dashboard')

  const { data: subscription } = await supabase.from('user_subscriptions').select('plan_id, tier').eq('user_id', user.id).maybeSingle()
  let planId = subscription?.plan_id || null
  if (!planId) {
    const { data: plan } = await supabase.from('subscription_plans').select('id').eq('audience', access.role).eq('code', subscription?.tier || 'free').maybeSingle()
    planId = plan?.id || null
  }

  let maxPhotos: number | null = null
  if (planId) {
    const { data: entitlement } = await supabase.from('plan_entitlements').select('integer_value, is_unlimited').eq('plan_id', planId).eq('feature_key', 'profile.photos.max').maybeSingle()
    maxPhotos = entitlement?.is_unlimited ? null : Number(entitlement?.integer_value ?? 0)
  }

  return <div className="space-y-6"><div><h1 className="text-3xl font-bold tracking-tight">{access.role === 'venue_manager' ? 'Galeria do espaço principal' : 'Galeria de Fotos'}</h1><p className="mt-2 text-muted-foreground">{access.role === 'venue_manager' ? `Esta galeria pertence a ${entityResult.data.name}. As galerias dos restantes espaços são geridas na ficha de cada espaço.` : 'Gira fotografias, visibilidade, capa e imagem de perfil.'}</p>{access.role === 'venue_manager' && (managedSpaces?.length || 0) > 1 && <div className="mt-3 flex flex-wrap gap-2">{managedSpaces?.slice(1).map(space => <Link key={space.id} href={`/dashboard/espaco?space=${space.id}`} className="rounded-full border bg-card px-3 py-2 text-sm font-medium hover:border-primary">Gerir {space.name}</Link>)}</div>}</div><GaleriaManagerV2 userId={user.id} entity={{ type: access.role, data: entityResult.data }} maxPhotos={maxPhotos} /></div>
}
