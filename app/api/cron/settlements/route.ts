import { NextResponse } from 'next/server'
import { processDueAutoConfirmations } from '@/lib/billing/reservation-settlement'
import { reconcileProcessingSettlements } from '@/lib/billing/reconcile-processing-settlements'

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    // Recover stale processing locks first. This prevents an earlier successful
    // Stripe transfer with a failed local write from being retried blindly.
    const reconciliation = await reconcileProcessingSettlements(15, 50)
    const reconciliationFailures = reconciliation.filter(result => !result.ok)

    const results = await processDueAutoConfirmations(100)
    const failures = results.filter(result => !result.ok)

    if (reconciliationFailures.length || failures.length) {
      console.error('settlement_cron_partial_failure', {
        reconciled: reconciliation.length,
        reconciliationFailed: reconciliationFailures.length,
        processed: results.length,
        failed: failures.length,
        reconciliationFailures: reconciliationFailures.map(({ id, action, error }) => ({ id, action, error })),
        failures: failures.map(({ id, kind, error }) => ({ id, kind, error })),
      })
      return NextResponse.json({
        reconciled: reconciliation.length,
        reconciliationFailed: reconciliationFailures.length,
        processed: results.length,
        failed: failures.length,
      }, { status: 500 })
    }

    return NextResponse.json({
      reconciled: reconciliation.length,
      reconciliationFailed: 0,
      processed: results.length,
      failed: 0,
    })
  } catch (error) {
    console.error('settlement_cron_failed', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: 'settlement processing failed' }, { status: 500 })
  }
}
