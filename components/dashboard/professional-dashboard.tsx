'use client'

import { 
  Calendar, Users, MessageSquare, Star, 
  Activity, ArrowRight, ShieldCheck 
} from 'lucide-react'

export function ProfessionalDashboard({ professional }: { professional: any }) {
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
            <span className="text-sm font-medium text-primary">+12% este mês</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Visualizações</p>
          <h3 className="text-3xl font-bold">1.2K</h3>
        </div>
        
        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-blue-500">+5 hoje</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Contactos</p>
          <h3 className="text-3xl font-bold">340</h3>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Star className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-amber-500">Excelência</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Rating Médio</p>
          <h3 className="text-3xl font-bold">4.8</h3>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">3 marcados</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Eventos Próximos</p>
          <h3 className="text-3xl font-bold">12</h3>
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
              <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all">
                Atualizar Serviços
              </button>
              <button className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-secondary/80 transition-all">
                Ver Perfil Público
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Atalhos de Gestão</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl hover:bg-muted transition-all">
                <Users className="h-6 w-6 text-primary" />
                <span className="font-medium text-sm">Clientes</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl hover:bg-muted transition-all">
                <Calendar className="h-6 w-6 text-blue-500" />
                <span className="font-medium text-sm">Agenda</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl hover:bg-muted transition-all">
                <Activity className="h-6 w-6 text-green-500" />
                <span className="font-medium text-sm">Finanças</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-3 p-6 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
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
              <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">3 Novas</span>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'Ana Silva', time: '14:20', msg: 'Ainda tem vaga para amanhã?', unread: true },
                { name: 'Marco Dias', time: '12:05', msg: 'Obrigado pela aula de hoje!', unread: false },
                { name: 'Clara Santos', time: 'Ontem', msg: 'Gostaria de agendar uma sessão...', unread: true },
              ].map((msg, idx) => (
                <div key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-muted cursor-pointer transition-colors relative">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    {msg.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="font-semibold text-sm truncate">{msg.name}</p>
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className={`text-sm truncate ${msg.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {msg.msg}
                    </p>
                  </div>
                  {msg.unread && <div className="w-2 h-2 bg-primary rounded-full absolute right-3 top-1/2 -translate-y-1/2"></div>}
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-2.5 bg-muted text-muted-foreground rounded-xl font-medium text-sm hover:text-foreground transition-all flex items-center justify-center gap-2">
              Ver Todas as Mensagens <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
