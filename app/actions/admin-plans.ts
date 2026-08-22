'use server'

import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'
import { requireAdmin } from '@/lib/auth/authorization'

function decimal(formData: FormData, key: string, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const value = Number(formData.get(key))
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`Valor inválido: ${key}`)
  return value
}

function cents(value: number) {
  return Math.round(value * 100)
}

export async function saveSubscriptionPlan(formData: FormData) {
  const { user: adminUser, admin } = await requireAdmin()
  const planId = String(formData.get('planId') || '')
  if (!planId) throw new Error('Plano inválido')

  const { data: currentPlan } = await admin.from('subscription_plans').select('*').eq('id', planId).single()
  if (!currentPlan) throw new Error('Plano não encontrado')

  const planUpdate: any = {
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

  const paidPlan = currentPlan.code !== 'free'
  const monthlyChanged = Number(currentPlan.monthly_price) !== Number(planUpdate.monthly_price)
  const annualChanged = Number(currentPlan.annual_price) !== Number(planUpdate.annual_price)
  const productChanged = currentPlan.name !== planUpdate.name || (currentPlan.description || null) !== planUpdate.description
  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

  const newlyCreatedPriceIds: string[] = []
  try {
    if (paidPlan && (monthlyChanged || annualChanged || productChanged)) {
      if (!stripe) throw new Error('Stripe não está configurado; não é possível alterar preços de um plano pago')
      if (!currentPlan.stripe_product_id) throw new Error('Plano pago sem Stripe Product associado')

      if (productChanged) {
        await stripe.products.update(currentPlan.stripe_product_id, {
          name: planUpdate.name,
          description: planUpdate.description || undefined,
        })
      }

      if (monthlyChanged) {
        const price = await stripe.prices.create({
          product: currentPlan.stripe_product_id,
          currency: 'eur',
          unit_amount: cents(planUpdate.monthly_price),
          recurring: { interval: 'month' },
          metadata: {
            app: 'find4sport',
            audience: currentPlan.audience,
            plan_code: currentPlan.code,
            billing_cycle: 'monthly',
            replaced_price_id: currentPlan.stripe_monthly_price_id || '',
          },
          nickname: `${planUpdate.name} — Mensal`,
        })
        newlyCreatedPriceIds.push(price.id)
        planUpdate.stripe_monthly_price_id = price.id
      }

      if (annualChanged) {
        const price = await stripe.prices.create({
          product: currentPlan.stripe_product_id,
          currency: 'eur',
          unit_amount: cents(planUpdate.annual_price),
          recurring: { interval: 'year' },
          metadata: {
            app: 'find4sport',
            audience: currentPlan.audience,
            plan_code: currentPlan.code,
            billing_cycle: 'annual',
            replaced_price_id: currentPlan.stripe_annual_price_id || '',
          },
          nickname: `${planUpdate.name} — Anual`,
        })
        newlyCreatedPriceIds.push(price.id)
        planUpdate.stripe_annual_price_id = price.id
      }
    }

    const { error: planError } = await admin.from('subscription_plans').update(planUpdate).eq('id', planId)
    if (planError) throw planError

    if (stripe) {
      if (monthlyChanged && currentPlan.stripe_monthly_price_id) {
        await stripe.prices.update(currentPlan.stripe_monthly_price_id, { active: false })
      }
      if (annualChanged && currentPlan.stripe_annual_price_id) {
        await stripe.prices.update(currentPlan.stripe_annual_price_id, { active: false })
      }
    }
  } catch (error) {
    if (stripe) {
      await Promise.allSettled(newlyCreatedPriceIds.map((priceId) => stripe.prices.update(priceId, { active: false })))
    }
    throw error
  }

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
