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

function entitlementValue(entitlement: any) {
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
  const { data: plans, error } = await admin
    .from('subscription_plans')
    .select('*, plan_entitlements(*)')
    .order('audience')
    .order('sort_order')

  if (error) throw error

  const groups = [
    { key: 'professional', title: 'Profissionais' },
    { key: 'venue_manager', title: 'Gestores de Espaço' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Planos e Monetização</h1>
        <p className="mt-2 text-muted-foreground">
          Preços, comissões e privilégios são lidos em runtime. Alterações aplicam-se a novas operações sem novo deploy.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        Alterar uma comissão não altera transações já criadas. O valor efetivo de cada transação deve ser guardado no momento da reserva. Alterações de preço Stripe serão sincronizadas através de novos Price IDs, sem editar preços históricos.
      </div>

      {groups.map((group) => (
        <section key={group.key} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{group.title}</h2>
            <Badge variant="outline">{plans?.filter((p: any) => p.audience === group.key).length ?? 0} planos</Badge>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            {plans?.filter((p: any) => p.audience === group.key).map((plan: any) => (
              <form key={plan.id} action={saveSubscriptionPlan}>
                <input type="hidden" name="planId" value={plan.id} />
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.code} · {plan.audience}</CardDescription>
                      </div>
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>{plan.is_active ? 'Ativo' : 'Inativo'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label>Nome</Label>
                        <Input name="name" defaultValue={plan.name} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Descrição</Label>
                        <Input name="description" defaultValue={plan.description ?? ''} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>Preço mensal (€)</Label>
                          <Input name="monthlyPrice" type="number" min="0" step="0.01" defaultValue={plan.monthly_price} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Preço anual (€)</Label>
                          <Input name="annualPrice" type="number" min="0" step="0.01" defaultValue={plan.annual_price} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Comissão (%)</Label>
                          <Input name="commissionRate" type="number" min="0" max="100" step="0.01" defaultValue={plan.commission_rate} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Service fee cliente (%)</Label>
                          <Input name="customerServiceFeeRate" type="number" min="0" max="100" step="0.01" defaultValue={plan.customer_service_fee_rate} />
                        </div>
                      </div>
                      <div className="flex gap-5 text-sm">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" name="isActive" defaultChecked={plan.is_active} /> Ativo
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" name="isPublic" defaultChecked={plan.is_public} /> Público
                        </label>
                      </div>
                    </div>

                    <div className="border-t pt-5">
                      <h3 className="mb-4 font-semibold">Privilégios e limites</h3>
                      <div className="space-y-4">
                        {plan.plan_entitlements
                          ?.sort((a: any, b: any) => a.feature_key.localeCompare(b.feature_key))
                          .map((entitlement: any) => {
                            const prefix = `ent_${entitlement.id}`
                            return (
                              <div key={entitlement.id} className="rounded-lg border p-3">
                                <div className="mb-2 text-sm font-medium">{labelForFeature(entitlement.feature_key, entitlement.description)}</div>
                                <div className="text-[11px] text-muted-foreground mb-2 font-mono">{entitlement.feature_key}</div>
                                {entitlement.value_type === 'boolean' ? (
                                  <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" name={`${prefix}_boolean`} defaultChecked={Boolean(entitlement.boolean_value)} /> Permitido
                                  </label>
                                ) : (
                                  <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                      <Label className="text-xs">Valor</Label>
                                      <Input
                                        name={`${prefix}_value`}
                                        type={['integer','decimal'].includes(entitlement.value_type) ? 'number' : 'text'}
                                        min={['integer','decimal'].includes(entitlement.value_type) ? '0' : undefined}
                                        step={entitlement.value_type === 'decimal' ? '0.01' : undefined}
                                        defaultValue={entitlementValue(entitlement)}
                                        disabled={entitlement.is_unlimited}
                                      />
                                    </div>
                                    {['integer','decimal'].includes(entitlement.value_type) && (
                                      <label className="flex h-10 items-center gap-2 text-xs">
                                        <input type="checkbox" name={`${prefix}_unlimited`} defaultChecked={Boolean(entitlement.is_unlimited)} /> ∞
                                      </label>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    </div>

                    <Button type="submit" className="w-full">Guardar plano</Button>
                  </CardContent>
                </Card>
              </form>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
