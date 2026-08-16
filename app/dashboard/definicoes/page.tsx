import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bell, CreditCard, FileText, ShieldAlert, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { SecuritySettings } from '@/components/dashboard/security-settings'
import { AccountLifecycleControls } from '@/components/dashboard/account-lifecycle-controls'
import { DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/definicoes')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.role) redirect('/auth/resolve')
  const hasCommercialPlan = access.role === 'professional' || access.role === 'venue_manager'

  return (
    <DashboardPage>
      <DashboardPageHeader title="Definições" description="Segurança, privacidade, faturação e controlo da conta." />

      <DashboardSection title="Segurança" description="A alteração de password é aplicada diretamente à conta autenticada."><SecuritySettings /></DashboardSection>

      <DashboardSection title="Conta e preferências" description="Cada opção abre o módulo responsável; não duplicamos configuração em vários ecrãs.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" className="min-h-16 h-auto justify-start gap-3 p-4"><Link href="/dashboard/perfil"><UserRound className="h-5 w-5 text-primary" /><span className="min-w-0 text-left"><span className="block font-semibold">Perfil</span><span className="block break-words text-xs font-normal text-muted-foreground">Identidade, contactos e informação pública</span></span></Link></Button>
          <Button asChild variant="outline" className="min-h-16 h-auto justify-start gap-3 p-4"><Link href="/dashboard/notificacoes"><Bell className="h-5 w-5 text-primary" /><span className="min-w-0 text-left"><span className="block font-semibold">Notificações</span><span className="block break-words text-xs font-normal text-muted-foreground">Consultar e gerir notificações recebidas</span></span></Link></Button>
          {hasCommercialPlan && <Button asChild variant="outline" className="min-h-16 h-auto justify-start gap-3 p-4"><Link href="/dashboard/faturacao"><CreditCard className="h-5 w-5 text-primary" /><span className="min-w-0 text-left"><span className="block font-semibold">Faturação e plano</span><span className="block break-words text-xs font-normal text-muted-foreground">Plano atual, Stripe e histórico financeiro</span></span></Link></Button>}
          <Button asChild variant="outline" className="min-h-16 h-auto justify-start gap-3 p-4"><Link href="/privacidade"><FileText className="h-5 w-5 text-primary" /><span className="min-w-0 text-left"><span className="block font-semibold">Privacidade e RGPD</span><span className="block break-words text-xs font-normal text-muted-foreground">Consultar política de proteção de dados</span></span></Link></Button>
        </div>
      </DashboardSection>

      <section className="overflow-hidden rounded-2xl border border-destructive/30 bg-destructive/[0.025]">
        <div className="flex items-start gap-3 border-b border-destructive/20 p-4 sm:p-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><ShieldAlert className="h-5 w-5" /></div><div><h2 className="text-lg font-bold">Zona da conta</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Aqui podes desativar temporariamente ou pedir a eliminação da conta. Estas ações não ficam escondidas atrás de uma política informativa.</p></div></div>
        <div className="p-4 sm:p-5"><AccountLifecycleControls /></div>
      </section>
    </DashboardPage>
  )
}
