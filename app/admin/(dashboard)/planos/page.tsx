import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { saveSubscriptionPlan } from '@/app/actions/admin-plans'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'

type PlanEntitlement = {
  id: string
  feature_key: string
  description: string | null
  value_type: 'boolean' | 'integer' | 'decimal' | 'text'
  boolean_value: boolean | null
  integer_value: number | null
  decimal_value: number | null
  text_value: string | null
  is_unlimited: boolean | null
}

type SubscriptionPlan = {
  id: string
  name: string
  code: string
  description: string | null
  audience: string
  monthly_price: number | null
  annual_price: number | null
  commission_rate: number | null
  customer_service_fee_rate: number | null
  is_active: boolean | null
  is_public: boolean | null
  plan_entitlements: PlanEntitlement[] | null
}

function entitlementValue(entitlement: PlanEntitlement) {
  if (entitlement.value_type === 'integer') return entitlement.integer_value ?? 0
  if (entitlement.value_type === 'decimal') return entitlement.decimal_value ?? 0
  if (entitlement.value_type === 'text') return entitlement.text_value ?? ''
  return ''
}

function labelForFeature(key: string, fallback?: string | null) {
  const labels: Record<string, string> = {
    'profile.photos.max': 'Fotos no perfil / galeria',
    'posts.monthly.max': 'Publicações por mês',
    'posts.images_per_post.max': 'Fotos por publicação',
    'chat.enabled': 'Chat',
    'chat.new_conversations_daily.max': 'Novas conversas por dia',
    'chat.messages_daily.max': 'Mensagens por dia',
    'chat.attachments.enabled': 'Anexos no chat',
    'communities.create.enabled': 'Criar comunidades',
    'communities.max': 'Número de comunidades',
    'communities.members.max': 'Membros por comunidade',
    'feed.create.enabled': 'Publicar no feed',
    'feed.posts_daily.max': 'Posts de feed por dia',
    'feed.video.enabled': 'Vídeo no feed',
    'services.max': 'Serviços ativos',
    'events.create.enabled': 'Criar eventos',
    'analytics.advanced.enabled': 'Analytics avançado',
    'profile.featured.enabled': 'Perfil / espaço destacado',
    'search.priority': 'Prioridade na pesquisa',
  }
  return labels[key] ?? fallback ?? key
}

export default async function AdminPlanosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) redirect('/')

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('subscription_plans')
    .select('*, plan_entitlements(*)')
    .order('audience')
    .order('sort_order')

  if (error) throw error
  const plans = (data || []) as SubscriptionPlan[]

  const groups = [
    { key: 'professional', title: 'Profissionais', description: 'Planos e limites aplicados a perfis profissionais.' },
    { key: 'venue_manager', title: 'Gestores de Espaço', description: 'Planos e limites aplicados à gestão de espaços.' },
  ]

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Planos e monetização"
        description="Preços, comissões e privilégios são lidos em runtime. Alterações aplicam-se a novas operações sem novo deploy."
      />

      <div className="rounded-2xl border border-border bg-muted/35 p-4 text-sm leading-6 text-muted-foreground sm:p-5">
        Alterar uma comissão não modifica transações já criadas. O valor efetivo de cada transação deve permanecer guardado no momento da reserva. Alterações de preço Stripe devem usar novos Price IDs, preservando o histórico.
      </div>

      {groups.map(group => {
        const groupPlans = plans.filter(plan => plan.audience === group.key)
        return (
          <DashboardSection
            key={group.key}
            title={group.title}
            description={group.description}
            action={<Badge variant="outline" className="min-h-7">{groupPlans.length} planos</Badge>}
          >
            <div className="grid gap-5 xl:grid-cols-3">
              {groupPlans.map(plan => (
                <form key={plan.id} action={saveSubscriptionPlan} className="min-w-0">
                  <input type="hidden" name="planId" value={plan.id} />
                  <Card className="h-full min-w-0">
                    <CardHeader className="gap-3">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="break-words">{plan.name}</CardTitle>
                          <CardDescription className="mt-1 break-all">{plan.code} · {plan.audience}</CardDescription>
                        </div>
                        <Badge className="shrink-0" variant={plan.is_active ? 'default' : 'secondary'}>{plan.is_active ? 'Ativo' : 'Inativo'}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor={`name-${plan.id}`}>Nome</Label>
                          <Input id={`name-${plan.id}`} className="min-h-11 text-base" name="name" defaultValue={plan.name} required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`description-${plan.id}`}>Descrição</Label>
                          <Input id={`description-${plan.id}`} className="min-h-11 text-base" name="description" defaultValue={plan.description ?? ''} />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label htmlFor={`monthly-${plan.id}`}>Preço mensal (€)</Label>
                            <Input id={`monthly-${plan.id}`} className="min-h-11 text-base" name="monthlyPrice" type="number" min="0" step="0.01" defaultValue={plan.monthly_price ?? 0} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`annual-${plan.id}`}>Preço anual (€)</Label>
                            <Input id={`annual-${plan.id}`} className="min-h-11 text-base" name="annualPrice" type="number" min="0" step="0.01" defaultValue={plan.annual_price ?? 0} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`commission-${plan.id}`}>Comissão (%)</Label>
                            <Input id={`commission-${plan.id}`} className="min-h-11 text-base" name="commissionRate" type="number" min="0" max="100" step="0.01" defaultValue={plan.commission_rate ?? 0} />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`service-fee-${plan.id}`}>Service fee cliente (%)</Label>
                            <Input id={`service-fee-${plan.id}`} className="min-h-11 text-base" name="customerServiceFeeRate" type="number" min="0" max="100" step="0.01" defaultValue={plan.customer_service_fee_rate ?? 0} />
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border px-3 text-sm font-medium transition hover:bg-muted/40">
                            <input className="h-5 w-5 accent-current" type="checkbox" name="isActive" defaultChecked={Boolean(plan.is_active)} /> Ativo
                          </label>
                          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border px-3 text-sm font-medium transition hover:bg-muted/40">
                            <input className="h-5 w-5 accent-current" type="checkbox" name="isPublic" defaultChecked={Boolean(plan.is_public)} /> Público
                          </label>
                        </div>
                      </div>

                      <div className="border-t border-border pt-5">
                        <h3 className="mb-4 font-semibold">Privilégios e limites</h3>
                        <div className="space-y-3">
                          {[...(plan.plan_entitlements || [])]
                            .sort((a, b) => a.feature_key.localeCompare(b.feature_key))
                            .map(entitlement => {
                              const prefix = `ent_${entitlement.id}`
                              const numeric = entitlement.value_type === 'integer' || entitlement.value_type === 'decimal'
                              return (
                                <div key={entitlement.id} className="min-w-0 rounded-xl border border-border p-3 sm:p-4">
                                  <div className="break-words text-sm font-medium">{labelForFeature(entitlement.feature_key, entitlement.description)}</div>
                                  <div className="mb-3 mt-1 break-all font-mono text-[11px] text-muted-foreground">{entitlement.feature_key}</div>
                                  {entitlement.value_type === 'boolean' ? (
                                    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg bg-muted/30 px-3 text-sm">
                                      <input className="h-5 w-5 accent-current" type="checkbox" name={`${prefix}_boolean`} defaultChecked={Boolean(entitlement.boolean_value)} /> Permitido
                                    </label>
                                  ) : (
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                      <div className="min-w-0 flex-1">
                                        <Label htmlFor={`${prefix}_value`} className="text-xs">Valor</Label>
                                        <Input
                                          id={`${prefix}_value`}
                                          className="mt-1 min-h-11 text-base"
                                          name={`${prefix}_value`}
                                          type={numeric ? 'number' : 'text'}
                                          min={numeric ? '0' : undefined}
                                          step={entitlement.value_type === 'decimal' ? '0.01' : undefined}
                                          defaultValue={entitlementValue(entitlement)}
                                          disabled={Boolean(entitlement.is_unlimited)}
                                        />
                                      </div>
                                      {numeric ? (
                                        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm">
                                          <input className="h-5 w-5 accent-current" type="checkbox" name={`${prefix}_unlimited`} defaultChecked={Boolean(entitlement.is_unlimited)} /> Ilimitado
                                        </label>
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                        </div>
                      </div>

                      <Button type="submit" className="min-h-11 w-full">Guardar plano</Button>
                    </CardContent>
                  </Card>
                </form>
              ))}
            </div>
          </DashboardSection>
        )
      })}
    </DashboardPage>
  )
}
