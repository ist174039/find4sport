import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function missingTable(error: any) { return ['42P01','PGRST205'].includes(String(error?.code||'')) || String(error?.message||'').includes('service_package_purchases') }

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ purchases: [] })
  const admin = createAdminClient()
  const db = admin as any
  const { data, error } = await db.from('service_package_purchases').select('id,sessions_remaining,expires_at,status,package:service_packages(name)').eq('user_id', user.id).eq('service_id', id).eq('status', 'active').gt('sessions_remaining', 0).order('expires_at', { ascending: true, nullsFirst: false })
  if (error) {
    if (missingTable(error)) return NextResponse.json({ purchases: [] })
    return NextResponse.json({ error: 'Não foi possível carregar os créditos do pacote.' }, { status: 500 })
  }
  const now = Date.now()
  const purchases = (data || []).filter((row: any) => !row.expires_at || new Date(row.expires_at).getTime() > now).map((row: any) => ({ id: row.id, sessions_remaining: Number(row.sessions_remaining), expires_at: row.expires_at || null, package_name: row.package?.name || 'Pacote de sessões' }))
  return NextResponse.json({ purchases })
}
