'use client'

import { 
  Building2, Users, DollarSign, CalendarCheck, 
  Settings, ArrowRight, ShieldCheck 
} from 'lucide-react'

export function SpaceDashboard({ space }: { space: any }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Gestão: {space?.name || 'Espaço Desportivo'}
          </h1>
          <p className="text-muted-foreground">Monitorize as reservas, faturação e desempenho do seu espaço.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium">Recinto Ativo</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-primary">Hoje</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Reservas Ativas</p>
          <h3 className="text-3xl font-bold">14</h3>
        </div>
        
        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-green-500">+15% vs último mês</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Faturação (Mês)</p>
          <h3 className="text-3xl font-bold">€3,450</h3>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Novos Clientes</p>
          <h3 className="text-3xl font-bold">28</h3>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">3 / 4</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Campos Ocupados</p>
          <h3 className="text-3xl font-bold">75%</h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <h2 className="text-xl font-bold mb-4">Verificação de Conta Comercial</h2>
            <p className="text-muted-foreground mb-6 max-w-md">O seu espaço desportivo está registado. Atualize o calendário de disponibilidades e as fotografias do recinto para aumentar a taxa de conversão nas reservas online.</p>
            <div className="flex gap-3">
              <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all">
                Gerir Campos
              </button>
            </div>
          </div>

        </div>

        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Últimas Reservas</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'João M.', time: '18:00 - 19:30', field: 'Campo 1 (Padel)', status: 'Confirmado' },
                { name: 'Tiago F.', time: '19:30 - 21:00', field: 'Campo 2 (Padel)', status: 'Pendente' },
                { name: 'Marta S.', time: '21:00 - 22:30', field: 'Estúdio 1 (Yoga)', status: 'Confirmado' },
              ].map((res, idx) => (
                <div key={idx} className="flex gap-4 p-3 rounded-xl border border-border hover:bg-muted transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm truncate">{res.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${res.status === 'Confirmado' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                        {res.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{res.time}</p>
                    <p className="text-xs font-medium text-foreground">{res.field}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-2.5 bg-muted text-muted-foreground rounded-xl font-medium text-sm hover:text-foreground transition-all flex items-center justify-center gap-2">
              Agenda Completa <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
