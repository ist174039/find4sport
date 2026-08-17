import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, ArrowRight, User, MapPin, Phone, Mail, Award, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppImage } from '@/components/ui/app-image'

type CategoryRelation = { category: Array<{ id: string; name: string | null }> }

export default async function ProfissionalEstadoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: prof } = await supabase.from('professionals').select(`
      *,
      professional_categories (
        category:categories (id, name)
      )
    `).eq('user_id', user.id).single()

  if (!prof) redirect('/auth/registar/profissional')

  const isVerified = Boolean(prof.is_verified)
  const categories = ((prof.professional_categories || []) as unknown as CategoryRelation[]).flatMap(row => row.category || [])
  const displayName = prof.full_name || prof.professional_name || 'Profissional'

  return (
    <main className="min-h-[calc(100vh-64px)] bg-muted/20 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-lg space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            {isVerified ? <CheckCircle2 className="w-10 h-10" /> : <Clock className="w-10 h-10 text-amber-600" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{isVerified ? 'Conta de Profissional Ativa' : 'Candidatura Submetida com Sucesso!'}</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">{isVerified ? 'O teu perfil de profissional está verificado e visível para todos os utilizadores da plataforma FIND4SPORT.' : 'O teu perfil de profissional foi submetido e encontra-se em fase de validação rápida pela nossa equipa.'}</p>
          <div className="flex justify-center pt-2">
            <Badge variant={isVerified ? 'default' : 'secondary'} className={`px-4 py-1.5 text-xs font-bold rounded-full ${isVerified ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>{isVerified ? 'Verificado & Ativo' : 'Em Análise'}</Badge>
          </div>
        </div>

        <div className="bg-background border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="relative w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
              {prof.avatar_url ? <AppImage src={prof.avatar_url} alt={displayName} fill sizes="56px" className="object-cover" /> : <User className="w-6 h-6 text-primary" />}
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">{displayName}</h2>
              {prof.professional_name && <p className="text-xs text-primary font-semibold">{prof.professional_name}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">{prof.bio || 'Profissional de Desporto'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
            {prof.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary shrink-0" /><span className="truncate">{prof.email}</span></div>}
            {prof.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary shrink-0" /><span>{prof.phone}</span></div>}
            {prof.address && <div className="flex items-center gap-2 sm:col-span-2"><MapPin className="w-4 h-4 text-primary shrink-0" /><span className="truncate">{prof.address}</span></div>}
          </div>

          {categories.length > 0 && <div className="pt-2 flex flex-wrap gap-1.5">{categories.map(category => <Badge key={category.id} variant="outline" className="text-[11px] bg-muted/50"><Award className="w-3 h-3 mr-1 text-primary" />{category.name || 'Modalidade'}</Badge>)}</div>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/dashboard" className="flex-1"><Button className="w-full font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2 py-3"><LayoutDashboard className="w-4 h-4" />Ir para o Meu Dashboard</Button></Link>
          <Link href={`/profissionais/${prof.public_slug || prof.id}`} className="flex-1"><Button variant="outline" className="w-full font-semibold rounded-xl border-border hover:bg-muted gap-2 py-3">Ver Perfil Público<ArrowRight className="w-4 h-4" /></Button></Link>
        </div>
      </div>
    </main>
  )
}
