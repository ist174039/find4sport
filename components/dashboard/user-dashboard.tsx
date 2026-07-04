'use client'

import { 
  CalendarCheck, Heart, MapPin, 
  ArrowRight, Search, Activity
} from 'lucide-react'
import Link from 'next/link'

export function UserDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Pronto para treinar, {user?.user_metadata?.full_name?.split(' ')[0] || 'Atleta'}? 🏃‍♂️
          </h1>
          <p className="text-muted-foreground">Aqui tens o resumo da tua atividade e os teus próximos desafios.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pesquisa" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm">
            <Search className="h-4 w-4" />
            Descobrir
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Focus) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Próximos Eventos / Reservas */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                Os Meus Próximos Eventos
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  title: 'Aula de Padel Iniciação', 
                  date: 'Amanhã, 18:30', 
                  loc: 'Padel Club Porto',
                  status: 'Confirmado'
                },
                { 
                  title: 'Treino de Força (PT Igor)', 
                  date: 'Sábado, 10:00', 
                  loc: 'Ginásio Iron',
                  status: 'Pendente'
                }
              ].map((evt, idx) => (
                <div key={idx} className="bg-card border border-border p-5 rounded-2xl hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${evt.status === 'Confirmado' ? 'bg-primary' : 'bg-amber-500'}`}></div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${evt.status === 'Confirmado' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600'}`}>
                      {evt.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-1 truncate">{evt.title}</h3>
                  <div className="space-y-1 mt-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4" /> {evt.date}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {evt.loc}
                    </p>
                  </div>
                  <button className="mt-4 w-full py-2 bg-muted hover:bg-primary/10 hover:text-primary transition-colors rounded-xl text-sm font-medium">
                    Ver Detalhes
                  </button>
                </div>
              ))}
              
              <div className="bg-card border border-dashed border-border p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer min-h-[200px]">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Junta-te a mais uma aula</h3>
                <p className="text-sm text-muted-foreground">Explora novas modalidades</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Favoritos */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" /> Favoritos
              </h2>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'Igor Sanchez', type: 'Personal Trainer' },
                { name: 'Yoga Studio Lx', type: 'Espaço Desportivo' },
              ].map((fav, idx) => (
                <div key={idx} className="flex gap-4 p-3 rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 text-secondary-foreground font-bold">
                    {fav.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{fav.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{fav.type}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-2 bg-muted text-muted-foreground rounded-xl font-medium text-sm hover:text-foreground transition-all flex items-center justify-center gap-2">
              Ver Todos <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
