import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateCommunityWizard } from '@/components/create-community-wizard'
import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default async function CreateCommunityPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/comunidades/criar')
  }

  // Check if user is professional
  const { data: profile } = await supabase
    .from('platform_users')
    .select('type')
    .eq('id', user.id)
    .single()

  if (profile?.type !== 'professional') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-card border border-border p-8 rounded-2xl max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-8">
            A criação de comunidades desportivas é uma funcionalidade exclusiva para perfis profissionais (Treinadores, Ginásios, Clubes).
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/auth/registar/profissional" 
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-all block text-center"
            >
              Tornar-me Profissional
            </Link>
            <Link 
              href="/comunidades" 
              className="w-full bg-muted text-muted-foreground py-3 rounded-xl font-bold hover:bg-muted/80 transition-all block text-center"
            >
              Voltar ao Diretório
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <CreateCommunityWizard />
}
