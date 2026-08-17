import { NextResponse } from 'next/server'
import { processDueAutoConfirmations } from '@/lib/billing/reservation-settlement'

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const results = await processDueAutoConfirmations(100)
    const failures = results.filter(result => !result.ok)
    if (failures.length) {
      console.error('settlement_cron_partial_failure', {
        processed: results.length,
        failed: failures.length,
        failures: failures.map(({ id, kind, error }) => ({ id, kind, error })),
      })
      return NextResponse.json({ processed: results.length, failed: failures.length }, { status: 500 })
    }
    return NextResponse.json({ processed: results.length, failed: 0 })
  } catch (error) {
    console.error('settlement_cron_failed', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: 'settlement processing failed' }, { status: 500 })
  }
}
