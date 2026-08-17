import { createAdminClient } from '@/lib/supabase/admin'
import PlanosClient, { type PublicPlan } from './planos-client'

export const dynamic = 'force-dynamic'

type EntitlementRow = {
  feature_key: string
  value_type: string
  boolean_value: boolean | null
  integer_value: number | null
  decimal_value: number | string | null
  text_value: string | null
  is_unlimited: boolean | null
  description: string | null
}
type PlanRow = {
  code: string
  name: string
  description: string | null
  monthly_price: number | string | null
  annual_price: number | string | null
  commission_rate: number | string | null
  customer_service_fee_rate: number | string | null
  plan_entitlements: EntitlementRow[]
}

function formatEntitlement(row: EntitlementRow) {
  const label = row.description || row.feature_key
  if (row.value_type === 'boolean') return row.boolean_value ? label : null
  if (row.is_unlimited) return `${label}: ilimitado`
  if (row.value_type === 'integer' || row.value_type === 'decimal') return `${label}: ${Number(row.integer_value ?? row.decimal_value ?? 0)}`
  if (row.value_type === 'text') {
    const value = String(row.text_value ?? '')
    if (!value || value === 'normal') return label
    return `${label}: ${value}`
  }
  return label
}

export default async function PlanosPage() {
  const admin = createAdminClient()
  const { data: plans, error } = await admin.from('subscription_plans').select(`
      id, code, name, description, monthly_price, annual_price,
      commission_rate, customer_service_fee_rate, sort_order,
      plan_entitlements (
        feature_key, value_type, boolean_value, integer_value,
        decimal_value, text_value, is_unlimited, description
      )
    `).eq('audience', 'professional').eq('is_active', true).eq('is_public', true).order('sort_order', { ascending: true })

  if (error) throw new Error('Não foi possível carregar os planos.')

  const initialPlans: PublicPlan[] = ((plans || []) as unknown as PlanRow[]).map((plan) => {
    const included: string[] = []
    const excluded: string[] = []
    for (const entitlement of plan.plan_entitlements || []) {
      const formatted = formatEntitlement(entitlement)
      if (entitlement.value_type === 'boolean' && entitlement.boolean_value === false) excluded.push(entitlement.description || entitlement.feature_key)
      else if (formatted) included.push(formatted)
    }
    included.push(`Comissão da plataforma: ${Number(plan.commission_rate).toFixed(2)}%`)
    if (Number(plan.customer_service_fee_rate) > 0) included.push(`Service fee ao cliente: ${Number(plan.customer_service_fee_rate).toFixed(2)}%`)
    return {
      code: plan.code,
      name: plan.name,
      monthlyPrice: Number(plan.monthly_price),
      annualPrice: Number(plan.annual_price),
      description: plan.description || '',
      features: included,
      notIncluded: excluded,
      cta: plan.code === 'free' ? 'Começar Grátis' : `Assinar ${plan.name}`,
      href: '/profissionais/registar',
      basePopular: plan.code === 'pro',
    }
  })

  return <PlanosClient initialPlans={initialPlans} header="Planos e Preços" subheader="Escolha o plano ideal para o seu negócio. Os preços, comissões e limites são geridos centralmente pela FIND4SPORT." />
}
