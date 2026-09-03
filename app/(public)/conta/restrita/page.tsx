import { redirect } from 'next/navigation'
import { AlertTriangle, CalendarClock, ShieldX } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function RestrictedAccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/conta/restrita')
  const { data: profile } = await supabase.from('platform_users').select('full_name,account_status,moderation_reason,suspended_until').eq('id', user.id).maybeSingle()
  const active = profile?.account_status === 'blocked' || (profile?.account_status === 'suspended' && (!profile.suspended_until || new Date(profile.suspended_until).getTime() > Date.now()))
  if (!active) redirect('/dashboard')
  const blocked = profile.account_status === 'blocked'

  return <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4"><section className="w-full max-w-xl rounded-3xl border bg-card p-6 shadow-sm sm:p-9"><div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">{blocked ? <ShieldX className="h-7 w-7"/> : <AlertTriangle className="h-7 w-7"/>}</div><p className="text-sm font-semibold text-destructive">Acesso restringido</p><h1 className="mt-1 text-3xl font-bold">Conta {blocked ? 'bloqueada' : 'suspensa'}</h1><p className="mt-3 text-muted-foreground">Olá, {profile.full_name || 'utilizador'}. O teu perfil deixou de estar visível publicamente e as funcionalidades da plataforma estão temporariamente indisponíveis.</p><div className="mt-7 space-y-4 rounded-2xl border p-5"><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Justificação</p><p className="mt-1 whitespace-pre-line font-medium">{profile.moderation_reason || 'Contacta o suporte para obter mais informações.'}</p></div>{!blocked && <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><CalendarClock className="h-4 w-4"/>Duração</p><p className="mt-1 font-medium">{profile.suspended_until ? `Até ${new Date(profile.suspended_until).toLocaleString('pt-PT', { dateStyle: 'long', timeStyle: 'short' })}` : 'Sem data de fim definida'}</p></div>}</div><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Button asChild variant="outline"><a href="mailto:suporte@find4sport.pt">Contactar suporte</a></Button><form action="/auth/logout" method="POST"><Button type="submit" variant="ghost" className="w-full">Terminar sessão</Button></form></div></section></main>
}
