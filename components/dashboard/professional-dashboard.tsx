'use client'

import { 
  Calendar, Users, MessageSquare, Star, 
  Activity, ArrowRight, ShieldCheck 
} from 'lucide-react'

import { useRouter } from 'next/navigation'

export function ProfessionalDashboard({ professional }: { professional: any }) {
  const router = useRouter()
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Olá, {professional?.full_name?.split(' ')[0] || 'Profissional'}! 👋
          </h1>
          <p className="text-muted-foreground">Gerencie o seu perfil, serviços e clientes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium">Perfil Ativo</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Activity className="h-5 w-5" />
            </div>
            {/* Real data or placeholder if 0 */}
            <span className="text-sm font-medium text-primary">Visualizações</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total</p>
          <h3 className="text-3xl font-bold">{professional.views_count || 0}</h3>
        </div>
        
        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-blue-500">Contactos</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total</p>
          <h3 className="text-3xl font-bold">{professional.review_count || 0}</h3>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Star className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-amber-500">Excelência</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Rating Médio</p>
          <h3 className="text-3xl font-bold">{professional.rating_avg || 'N/A'}</h3>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Estado</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Aprovação</p>
          <h3 className="text-lg font-bold capitalize">{professional.status || 'Pendente'}</h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <h2 className="text-xl font-bold mb-4">Estado do Perfil</h2>
            <p className="text-muted-foreground mb-6 max-w-md">O seu perfil está preenchido e visível para todos os utilizadores na plataforma. Continue a atualizar as suas fotos e serviços para manter o interesse alto.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => router.push('/dashboard/servicos')}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all"
              >
                Atualizar Serviços
              </button>
              <button 
                onClick={() => router.push(`/profissionais/${professional?.public_slug || professional?.id}`)}
                className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-secondary/80 transition-all"
              >
                Ver Perfil Público
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Atalhos de Gestão</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button 
                onClick={() => router.push('/dashboard/clientes')}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl hover:bg-muted transition-all"
              >
                <Users className="h-6 w-6 text-primary" />
                <span className="font-medium text-sm">Clientes</span>
              </button>
              <button 
                onClick={() => router.push('/dashboard/agenda')}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl hover:bg-muted transition-all"
              >
                <Calendar className="h-6 w-6 text-blue-500" />
                <span className="font-medium text-sm">Agenda</span>
              </button>

              <button 
                onClick={() => router.push('/dashboard/eventos/criar')}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
              >
                <Calendar className="h-6 w-6" />
                <span className="font-medium text-sm">Novo Evento</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Mensagens Recentes</h2>
            </div>
            <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">Ainda não tem mensagens recentes.</p>
              <p className="text-xs mt-1">As mensagens enviadas por clientes aparecerão aqui.</p>
            </div>
            
            <button 
              onClick={() => router.push('/dashboard/mensagens')}
              className="w-full mt-6 py-2.5 bg-muted text-muted-foreground rounded-xl font-medium text-sm hover:text-foreground transition-all flex items-center justify-center gap-2"
            >
              Abrir Caixa de Mensagens <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
