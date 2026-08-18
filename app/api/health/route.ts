import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startedAt = Date.now()
  const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || 'local'
  const checks = {
    database: 'unknown' as 'ok' | 'error' | 'unknown',
    stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) ? 'configured' : 'missing',
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.from('subscription_plans').select('id').limit(1)
    checks.database = error ? 'error' : 'ok'
  } catch {
    checks.database = 'error'
  }

  const production = environment === 'production'
  const healthy = checks.database === 'ok' && (!production || checks.stripe === 'configured')
  const response = NextResponse.json({
    status: healthy ? 'ok' : 'degraded',
    environment,
    checks,
    version: process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || 'local',
    timestamp: new Date().toISOString(),
    duration_ms: Date.now() - startedAt,
  }, { status: healthy ? 200 : 503 })

  response.headers.set('Cache-Control', 'no-store, max-age=0')
  return response
}
