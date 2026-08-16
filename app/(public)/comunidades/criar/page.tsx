import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateCommunityWizard } from '@/components/create-community-wizard'
import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import type { TaxonomyOption } from '@/components/taxonomy-combobox'

export default async function CreateCommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/comunidades/criar')

  const [{ data: profile }, { data: categoryRows }] = await Promise.all([
    supabase.from('platform_users').select('type').eq('id', user.id).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (profile?.type !== 'professional') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive"><ShieldAlert className="h-8 w-8" /></div>
          <h1 className="mb-4 text-2xl font-bold text-foreground">Acesso restrito</h1>
          <p className="mb-8 text-muted-foreground">A criação de comunidades desportivas é exclusiva para perfis profissionais.</p>
          <div className="flex flex-col gap-3">
            <Link href="/auth/registar/profissional" className="block w-full rounded-xl bg-primary py-3 text-center font-bold text-primary-foreground transition hover:bg-primary/90">Tornar-me profissional</Link>
            <Link href="/comunidades" className="block w-full rounded-xl bg-muted py-3 text-center font-bold text-muted-foreground transition hover:bg-muted/80">Voltar ao diretório</Link>
          </div>
        </div>
      </div>
    )
  }

  const categories: TaxonomyOption[] = (categoryRows || []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    name: String(row.name || ''),
    slug: String(row.slug || ''),
    emoji: typeof row.emoji === 'string' ? row.emoji : null,
    parent_id: typeof row.parent_id === 'string' ? row.parent_id : null,
  }))

  return <CreateCommunityWizard categories={categories} />
}
