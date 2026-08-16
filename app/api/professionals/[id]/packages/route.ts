import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function missingTable(error: any) { return ['42P01','PGRST205'].includes(String(error?.code||'')) || String(error?.message||'').includes('service_packages') }

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const db = admin as any
  const { data, error } = await db.from('service_packages').select('id,name,service_id,sessions_count,price,validity_days,service:services(name,is_active)').eq('professional_id', id).eq('is_active', true).order('price')
  if (error) {
    if (missingTable(error)) return NextResponse.json({ packages: [] })
    return NextResponse.json({ error: 'Não foi possível carregar os pacotes.' }, { status: 500 })
  }
  return NextResponse.json({ packages: (data || []).filter((row: any) => row.service?.is_active !== false).map((row: any) => ({ id: row.id, name: row.name, service_id: row.service_id, sessions_count: row.sessions_count, price: Number(row.price), validity_days: row.validity_days, service_name: row.service?.name || null })) })
}
