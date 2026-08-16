import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bell, CreditCard, FileText, Shield, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { SecuritySettings } from '@/components/dashboard/security-settings'
import { DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/definicoes')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.role) redirect('/dashboard')
  const hasCommercialPlan = access.role === 'professional' || access.role === 'venue_manager'

  return (
    <DashboardPage>
      <DashboardPageHeader title="Definições" description="Segurança da conta e atalhos para configurações que têm uma implementação real na plataforma." />

      <DashboardSection title="Segurança" description="A alteração de password é aplicada diretamente à conta Supabase Auth autenticada.">
        <SecuritySettings />
      </DashboardSection>

      <DashboardSection title="Conta e preferências" description="Cada opção abre o módulo responsável; não duplicamos configurações em vários ecrãs.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" className="min-h-16 h-auto justify-start gap-3 p-4"><Link href="/dashboard/perfil"><UserRound className="h-5 w-5 text-primary" /><span className="text-left"><span className="block font-semibold">Perfil</span><span className="block text-xs font-normal text-muted-foreground">Identidade, contactos e informação pública</span></span></Link></Button>
          <Button asChild variant="outline" className="min-h-16 h-auto justify-start gap-3 p-4"><Link href="/dashboard/notificacoes"><Bell className="h-5 w-5 text-primary" /><span className="text-left"><span className="block font-semibold">Notificações</span><span className="block text-xs font-normal text-muted-foreground">Consultar e gerir notificações recebidas</span></span></Link></Button>
          {hasCommercialPlan && <Button asChild variant="outline" className="min-h-16 h-auto justify-start gap-3 p-4"><Link href="/dashboard/faturacao"><CreditCard className="h-5 w-5 text-primary" /><span className="text-left"><span className="block font-semibold">Faturação e plano</span><span className="block text-xs font-normal text-muted-foreground">Plano atual, Stripe e histórico financeiro</span></span></Link></Button>}
          <Button asChild variant="outline" className="min-h-16 h-auto justify-start gap-3 p-4"><Link href="/privacidade"><FileText className="h-5 w-5 text-primary" /><span className="text-left"><span className="block font-semibold">Privacidade e RGPD</span><span className="block text-xs font-normal text-muted-foreground">Consultar a política de proteção de dados</span></span></Link></Button>
        </div>
      </DashboardSection>

      <DashboardSection title="Eliminação de conta" description="Esta opção não é apresentada enquanto o lifecycle de reservas, pagamentos, documentos fiscais e conteúdo publicado não tiver uma política de eliminação definida e auditável.">
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4"><Shield className="mt-0.5 h-5 w-5 text-muted-foreground" /><p className="text-sm leading-relaxed text-muted-foreground">Não existe um botão fictício de eliminação. Quando este fluxo for implementado, terá confirmação, regras de retenção legal e tratamento explícito de Stripe/marketplace.</p></div>
      </DashboardSection>
    </DashboardPage>
  )
}
