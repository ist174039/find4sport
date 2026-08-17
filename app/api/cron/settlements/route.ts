import {NextResponse} from 'next/server'
import {processDueAutoConfirmations} from '@/lib/billing/reservation-settlement'
export async function GET(req:Request){const secret=process.env.CRON_SECRET;if(!secret||req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({error:'unauthorized'},{status:401});const results=await processDueAutoConfirmations(100);return NextResponse.json({processed:results.length,failed:results.filter(r=>!r.ok).length})}
