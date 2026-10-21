/** Offline aggregation only: no collection, network calls or personal fields. */
export type GrowthSegment = 'athlete' | 'professional' | 'venue_manager' | 'event_manager'
export type UsefulAction = 'offer_published' | 'contact_responded' | 'booking_confirmed' | 'event_registration_confirmed'
export interface GrowthAccount {
  id: string
  segment: GrowthSegment
  registeredAt: string
  isTest: boolean
}
export interface GrowthAction {
  id: string
  accountId: string
  action: UsefulAction
  occurredAt: string
  isTest: boolean
}
interface MetricWindow { eligible: number; achieved: number; rate: number | null }
export interface GrowthMetrics {
  registered: number
  activation: MetricWindow
  retention7: MetricWindow
  retention30: MetricWindow
}
const DAY = 86_400_000
const SEGMENTS = new Set(['athlete', 'professional', 'venue_manager', 'event_manager'])
const ACTIONS = new Set(['offer_published', 'contact_responded', 'booking_confirmed', 'event_registration_confirmed'])
function instant(value: string): number {
  // Require an explicit timezone: host timezone must never change a cohort.
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) throw new Error('Expected an ISO timestamp with timezone')
  const hour = Number(value.slice(11, 13)), minute = Number(value.slice(14, 16)), second = Number(value.slice(17, 19))
  if (hour > 23 || minute > 59 || second > 59) throw new Error('Invalid clock time')
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed)) throw new Error('Invalid timestamp')
  const date = value.slice(0, 10)
  const calendar = new Date(`${date}T00:00:00Z`)
  if (calendar.toISOString().slice(0, 10) !== date) throw new Error('Invalid calendar date')
  return parsed
}
function windowResult(eligible: number, achieved: number): MetricWindow {
  return { eligible, achieved, rate: eligible ? achieved / eligible : null }
}
/** Cohort [start, end), snapshot inclusive; activation [registration, +7 days).
 * Retention is a second useful action in [+7,+14) or [+30,+37) days,
 * among activated accounts whose complete retention window is observable.
 */
export function calculateActivationMetrics(input: {
  accounts: readonly GrowthAccount[]
  actions: readonly GrowthAction[]
  cohortStart: string
  cohortEnd: string
  asOf: string
  segment?: GrowthSegment
}): GrowthMetrics {
  const start = instant(input.cohortStart), end = instant(input.cohortEnd), asOf = instant(input.asOf)
  if (start >= end || end > asOf) throw new Error('Cohort must be nonempty and end at or before snapshot')
  if (input.segment && !SEGMENTS.has(input.segment)) throw new Error('Unknown segment')
  const accounts = new Map<string, { registered: number; eligible: boolean }>()
  for (const account of input.accounts) {
    if (!account.id || accounts.has(account.id)) throw new Error('Account IDs must be unique and nonempty')
    if (!SEGMENTS.has(account.segment) || typeof account.isTest !== 'boolean') throw new Error('Invalid account classification')
    const registered = instant(account.registeredAt)
    accounts.set(account.id, { registered, eligible: !account.isTest && registered >= start && registered < end && (!input.segment || account.segment === input.segment) })
  }
  const times = new Map<string, number[]>()
  const actionIds = new Set<string>()
  for (const action of input.actions) {
    if (!action.id || actionIds.has(action.id)) throw new Error('Action IDs must be unique and nonempty; deduplicate exports first')
    actionIds.add(action.id)
    if (!ACTIONS.has(action.action) || typeof action.isTest !== 'boolean') throw new Error('Invalid action classification')
    const time = instant(action.occurredAt)
    const account = accounts.get(action.accountId)
    if (!account || !account.eligible || action.isTest || time < account.registered || time > asOf) continue
    const values = times.get(action.accountId) ?? []
    values.push(time)
    times.set(action.accountId, values)
  }
  let registered = 0, activationEligible = 0, activated = 0
  let eligible7 = 0, retained7 = 0, eligible30 = 0, retained30 = 0
  for (const [id, account] of accounts) {
    if (!account.eligible) continue
    registered++
    const age = asOf - account.registered
    if (age < 7 * DAY) continue
    activationEligible++
    const actions = times.get(id) ?? []
    if (!actions.some(time => time < account.registered + 7 * DAY)) continue
    activated++
    if (age >= 14 * DAY) {
      eligible7++
      if (actions.some(time => time >= account.registered + 7 * DAY && time < account.registered + 14 * DAY)) retained7++
    }
    if (age >= 37 * DAY) {
      eligible30++
      if (actions.some(time => time >= account.registered + 30 * DAY && time < account.registered + 37 * DAY)) retained30++
    }
  }
  return { registered, activation: windowResult(activationEligible, activated), retention7: windowResult(eligible7, retained7), retention30: windowResult(eligible30, retained30) }
}
