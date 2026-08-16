import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'

export const FEATURE_KEYS = [
  'profile.photos.max',
  'posts.monthly.max',
  'posts.images_per_post.max',
  'chat.enabled',
  'chat.new_conversations_daily.max',
  'chat.messages_daily.max',
  'chat.attachments.enabled',
  'communities.create.enabled',
  'communities.max',
  'communities.members.max',
  'feed.create.enabled',
  'feed.posts_daily.max',
  'feed.video.enabled',
  'services.max',
  'events.create.enabled',
  'analytics.advanced.enabled',
  'profile.featured.enabled',
  'search.priority',
] as const

export type FeatureKey = (typeof FEATURE_KEYS)[number]
export type EntitlementValue = boolean | number | string | Record<string, unknown> | null

export type EffectiveEntitlement = {
  featureKey: FeatureKey
  valueType: 'boolean' | 'integer' | 'decimal' | 'text' | 'json'
  value: EntitlementValue
  unlimited: boolean
  source: 'override' | 'plan'
  planId?: string
}

function readValue(row: any): EntitlementValue {
  if (row.is_unlimited) return null
  switch (row.value_type) {
    case 'boolean': return row.boolean_value
    case 'integer': return Number(row.integer_value)
    case 'decimal': return Number(row.decimal_value)
    case 'text': return row.text_value
    case 'json': return row.json_value
    default: return null
  }
}

async function resolvePlanId(userId: string) {
  const admin = createAdminClient()

  const { data: subscription } = await admin
    .from('user_subscriptions')
    .select('plan_id, tier')
    .eq('user_id', userId)
    .maybeSingle()

  if (subscription?.plan_id) return subscription.plan_id as string

  const { data: profile } = await admin
    .from('platform_users')
    .select('type')
    .eq('id', userId)
    .maybeSingle()

  if (!profile || !['professional', 'venue_manager'].includes(profile.type)) return null

  const tier = subscription?.tier ?? 'free'
  const { data: plan } = await admin
    .from('subscription_plans')
    .select('id')
    .eq('audience', profile.type)
    .eq('code', tier)
    .eq('is_active', true)
    .maybeSingle()

  return plan?.id ?? null
}

export async function getEffectiveEntitlement(userId: string, featureKey: FeatureKey): Promise<EffectiveEntitlement | null> {
  const admin = createAdminClient()
  const now = new Date().toISOString()

  const { data: override } = await admin
    .from('user_entitlement_overrides')
    .select('*')
    .eq('user_id', userId)
    .eq('feature_key', featureKey)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .maybeSingle()

  if (override) {
    return {
      featureKey,
      valueType: override.value_type,
      value: readValue(override),
      unlimited: Boolean(override.is_unlimited),
      source: 'override',
    }
  }

  const planId = await resolvePlanId(userId)
  if (!planId) return null

  const { data: entitlement } = await admin
    .from('plan_entitlements')
    .select('*')
    .eq('plan_id', planId)
    .eq('feature_key', featureKey)
    .maybeSingle()

  if (!entitlement) return null

  return {
    featureKey,
    valueType: entitlement.value_type,
    value: readValue(entitlement),
    unlimited: Boolean(entitlement.is_unlimited),
    source: 'plan',
    planId,
  }
}

export async function isFeatureEnabled(userId: string, featureKey: FeatureKey) {
  const entitlement = await getEffectiveEntitlement(userId, featureKey)
  if (!entitlement) return false
  if (entitlement.unlimited) return true
  return entitlement.valueType === 'boolean' ? entitlement.value === true : true
}

export async function requireFeature(userId: string, featureKey: FeatureKey) {
  const enabled = await isFeatureEnabled(userId, featureKey)
  if (!enabled) throw new Error(`Funcionalidade não disponível no plano atual: ${featureKey}`)
}

export async function getLimit(userId: string, featureKey: FeatureKey): Promise<number | null> {
  const entitlement = await getEffectiveEntitlement(userId, featureKey)
  if (!entitlement) return 0
  if (entitlement.unlimited) return null
  if (!['integer', 'decimal'].includes(entitlement.valueType)) {
    throw new Error(`Entitlement ${featureKey} não é um limite numérico`)
  }
  return Number(entitlement.value ?? 0)
}

function periodStart(periodType: 'day' | 'month' | 'lifetime') {
  const now = new Date()
  if (periodType === 'lifetime') return '1970-01-01'
  if (periodType === 'month') return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
}

export async function getUsage(userId: string, featureKey: FeatureKey, periodType: 'day' | 'month' | 'lifetime') {
  const admin = createAdminClient()
  const { data } = await admin
    .from('feature_usage')
    .select('usage_count')
    .eq('user_id', userId)
    .eq('feature_key', featureKey)
    .eq('period_type', periodType)
    .eq('period_start', periodStart(periodType))
    .maybeSingle()
  return Number(data?.usage_count ?? 0)
}

export async function assertWithinUsageLimit(
  userId: string,
  featureKey: FeatureKey,
  periodType: 'day' | 'month' | 'lifetime',
  incrementBy = 1,
) {
  const limit = await getLimit(userId, featureKey)
  if (limit === null) return
  const usage = await getUsage(userId, featureKey, periodType)
  if (usage + incrementBy > limit) {
    throw new Error(`Limite do plano atingido para ${featureKey}`)
  }
}

export async function incrementUsage(
  userId: string,
  featureKey: FeatureKey,
  periodType: 'day' | 'month' | 'lifetime',
  incrementBy = 1,
) {
  const admin = createAdminClient()
  const start = periodStart(periodType)
  const { data: current } = await admin
    .from('feature_usage')
    .select('id, usage_count')
    .eq('user_id', userId)
    .eq('feature_key', featureKey)
    .eq('period_type', periodType)
    .eq('period_start', start)
    .maybeSingle()

  if (current) {
    const { error } = await admin
      .from('feature_usage')
      .update({ usage_count: Number(current.usage_count) + incrementBy, updated_at: new Date().toISOString() })
      .eq('id', current.id)
    if (error) throw error
    return
  }

  const { error } = await admin.from('feature_usage').insert({
    user_id: userId,
    feature_key: featureKey,
    period_type: periodType,
    period_start: start,
    usage_count: incrementBy,
  })
  if (error) throw error
}
