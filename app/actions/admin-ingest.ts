'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'

async function requireAdminAccess() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Utilizador não autenticado')
  }

  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) {
    throw new Error('Sem permissões de administrador')
  }

  return { userEmail: user.email || 'admin@find4sport.pt' }
}

export async function adminIngestData(queueItems: any[]) {
  const { userEmail } = await requireAdminAccess()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: 'Credenciais de administração (SUPABASE_SERVICE_ROLE_KEY) não configuradas no servidor.' }
  }

  // Create admin Supabase client using Service Role Key (bypasses RLS completely)
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    const spaceRows = queueItems
      .filter(item => item.type === 'space')
      .map(item => ({
        name: item.name,
        slug: item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4),
        address: item.address,
        latitude: item.lat || 38.7223,
        longitude: item.lon || -9.1393,
        phone: item.phone || null,
        rating_avg: item.rating_avg || 4.5,
        review_count: item.review_count || 1,
        is_verified: true,
        status: 'active',
        description: `${item.name} é um espaço desportivo de referência em ${item.address}. Oferece excelentes condições para treinos e atividades desportivas.`
      }))

    const proRows = queueItems
      .filter(item => item.type === 'professional')
      .map(item => ({
        full_name: item.name,
        professional_name: item.name,
        public_slug: item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4),
        email: `${item.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@exemplo.pt`,
        phone: item.phone || null,
        address: item.address,
        latitude: item.lat || 38.7223,
        longitude: item.lon || -9.1393,
        rating_avg: item.rating_avg || 4.8,
        review_count: item.review_count || 1,
        is_verified: true,
        status: 'active',
        bio: `${item.name} é um profissional de desporto com vasta experiência na área de treino e acompanhamento personalizado.`
      }))

    let countInserted = 0

    if (spaceRows.length > 0) {
      const { data: spacesData, error: spaceErr } = await supabaseAdmin
        .from('sport_spaces')
        .insert(spaceRows)
        .select('id')

      if (spaceErr) {
        console.error('Admin Server Space Ingest Error:', spaceErr)
        // Individual fallback
        for (const row of spaceRows) {
          const { error: sErr } = await supabaseAdmin.from('sport_spaces').insert([row])
          if (!sErr) countInserted++
        }
        if (countInserted === 0) throw spaceErr
      } else {
        countInserted += (spacesData?.length || spaceRows.length)
      }
    }

    if (proRows.length > 0) {
      const { data: proData, error: proErr } = await supabaseAdmin
        .from('professionals')
        .insert(proRows)
        .select('id')

      if (proErr) {
        console.error('Admin Server Professional Ingest Error:', proErr)
        for (const row of proRows) {
          const { error: pErr } = await supabaseAdmin.from('professionals').insert([row])
          if (!pErr) countInserted++
        }
        if (countInserted === 0 && spaceRows.length === 0) throw proErr
      } else {
        countInserted += (proData?.length || proRows.length)
      }
    }

    // Log action to audit logs
    await supabaseAdmin.from('audit_logs').insert([{
      action: 'ADMIN_BULK_INGEST',
      table_name: 'sport_spaces/professionals',
      user_email: userEmail,
      new_data: { count: countInserted }
    }])

    return { success: true, countInserted }
  } catch (err: any) {
    console.error('adminIngestData Error:', err)
    return { error: err.message || err.details || 'Erro ao ingerir dados no servidor' }
  }
}
