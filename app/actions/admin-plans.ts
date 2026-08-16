'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Utilizador não autenticado')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) throw new Error('Sem permissões de administrador')
  return user
}

function decimal(formData: FormData, key: string, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const value = Number(formData.get(key))
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`Valor inválido: ${key}`)
  return value
}

export async function saveSubscriptionPlan(formData: FormData) {
  const adminUser = await requireAdmin()
  const admin = createAdminClient()
  const planId = String(formData.get('planId') || '')
  if (!planId) throw new Error('Plano inválido')

  const { data: currentPlan } = await admin.from('subscription_plans').select('*').eq('id', planId).single()
  if (!currentPlan) throw new Error('Plano não encontrado')

  const planUpdate = {
    name: String(formData.get('name') || '').trim(),
    description: String(formData.get('description') || '').trim() || null,
    monthly_price: decimal(formData, 'monthlyPrice'),
    annual_price: decimal(formData, 'annualPrice'),
    commission_rate: decimal(formData, 'commissionRate', 0, 100),
    customer_service_fee_rate: decimal(formData, 'customerServiceFeeRate', 0, 100),
    is_active: formData.get('isActive') === 'on',
    is_public: formData.get('isPublic') === 'on',
    updated_at: new Date().toISOString(),
  }

  if (!planUpdate.name) throw new Error('O nome do plano é obrigatório')

  const { error: planError } = await admin.from('subscription_plans').update(planUpdate).eq('id', planId)
  if (planError) throw planError

  const { data: entitlements } = await admin.from('plan_entitlements').select('*').eq('plan_id', planId)
  const history: any[] = [{
    plan_id: planId,
    changed_by: adminUser.id,
    change_type: 'plan_update',
    old_value: currentPlan,
    new_value: { ...currentPlan, ...planUpdate },
  }]

  for (const entitlement of entitlements ?? []) {
    const prefix = `ent_${entitlement.id}`
    const unlimited = formData.get(`${prefix}_unlimited`) === 'on'
    const raw = formData.get(`${prefix}_value`)
    const update: any = { is_unlimited: unlimited, updated_at: new Date().toISOString() }

    if (entitlement.value_type === 'boolean') {
      update.boolean_value = formData.get(`${prefix}_boolean`) === 'on'
      update.is_unlimited = false
    } else if (entitlement.value_type === 'integer') {
      const value = Number(raw)
      if (!unlimited && (!Number.isInteger(value) || value < 0)) throw new Error(`Limite inválido: ${entitlement.feature_key}`)
      update.integer_value = unlimited ? 0 : value
    } else if (entitlement.value_type === 'decimal') {
      const value = Number(raw)
      if (!unlimited && (!Number.isFinite(value) || value < 0)) throw new Error(`Valor inválido: ${entitlement.feature_key}`)
      update.decimal_value = unlimited ? 0 : value
    } else if (entitlement.value_type === 'text') {
      update.text_value = String(raw ?? '').trim()
      update.is_unlimited = false
    }

    const changed = JSON.stringify({
      is_unlimited: entitlement.is_unlimited,
      boolean_value: entitlement.boolean_value,
      integer_value: entitlement.integer_value,
      decimal_value: entitlement.decimal_value,
      text_value: entitlement.text_value,
    }) !== JSON.stringify({
      is_unlimited: update.is_unlimited,
      boolean_value: update.boolean_value ?? entitlement.boolean_value,
      integer_value: update.integer_value ?? entitlement.integer_value,
      decimal_value: update.decimal_value ?? entitlement.decimal_value,
      text_value: update.text_value ?? entitlement.text_value,
    })

    if (changed) {
      const { error } = await admin.from('plan_entitlements').update(update).eq('id', entitlement.id)
      if (error) throw error
      history.push({
        plan_id: planId,
        changed_by: adminUser.id,
        change_type: 'entitlement_update',
        field_name: entitlement.feature_key,
        old_value: entitlement,
        new_value: { ...entitlement, ...update },
      })
    }
  }

  const { error: historyError } = await admin.from('plan_change_history').insert(history)
  if (historyError) throw historyError

  revalidatePath('/admin/planos')
  revalidatePath('/profissionais/planos')
}
