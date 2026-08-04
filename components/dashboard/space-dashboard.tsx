'use client'

import { 
  Building2, Users, Star, Activity, 
  ArrowRight, ShieldCheck, CalendarCheck, Globe
} from 'lucide-react'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SpaceDashboard({ space }: { space: any }) {
  const router = useRouter()
  const [latestReservations, setLatestReservations] = useState<any[]>([])
  const [loadingRes, setLoadingRes] = useState(true)

  useEffect(() => {
    async function load() {
      if (!space?.id) return
      const supabase = createClient()
      const { data } = await supabase
        .from('reservations')
        .select('*, user:platform_users(full_name)')
        .eq('space_id', space.id)
        .order('created_at', { ascending: false })
        .limit(3)
      setLatestReservations(data || [])
      setLoadingRes(false)
    }
    load()
  }, [space?.id])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Gestão: {space?.name || 'Espaço Desportivo'}
          </h1>
          <p className="text-muted-foreground">Monitorize as reservas, visualizações e desempenho do seu espaço.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/espacos/${space?.id}`} target="_blank">
            <Button variant="outline" className="gap-2 shadow-sm border-primary text-primary hover:bg-primary/10">
              <Globe className="h-4 w-4" />
              Ver Perfil Público
            </Button>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium">{space?.is_verified ? 'Recinto Verificado' : 'Recinto Ativo'}</span>
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
            <span className="text-sm font-medium text-primary">Visualizações</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total acumulado</p>
          <h3 className="text-3xl font-bold">{space?.views_count || 0}</h3>
        </div>
        
        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Star className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-amber-500">Avaliações</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Rating Médio</p>
          <h3 className="text-3xl font-bold">{space?.rating_avg ? space.rating_avg.toFixed(1) : 'N/A'}</h3>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-blue-500">Comentários</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total de Reviews</p>
          <h3 className="text-3xl font-bold">{space?.review_count || 0}</h3>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-emerald-500">Estado</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Status da Conta</p>
          <h3 className="text-lg font-bold capitalize">{space?.status || 'Ativo'}</h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <h2 className="text-xl font-bold mb-4">Gestão do Recinto Desportivo</h2>
            <p className="text-muted-foreground mb-6 max-w-md">O seu espaço desportivo está registado na plataforma FIND4SPORT. Mantenha os dados, horários de funcionamento e fotos atualizados para captar mais atletas.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => router.push(`/espacos/${space?.slug || space?.id}`)}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all text-sm"
              >
                Ver Página Pública
              </button>
            </div>
          </div>

        </div>

        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Últimas Reservas</h2>
              </div>
              
              <div className="space-y-3 mt-4">
                {loadingRes ? (
                  <div className="py-8 text-center text-muted-foreground border border-dashed border-border rounded-xl p-6">
                    <p className="text-sm">A carregar...</p>
                  </div>
                ) : latestReservations.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground border border-dashed border-border rounded-xl p-6">
                    <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-30 text-primary" />
                    <p className="font-semibold text-sm text-foreground">Sem reservas registadas</p>
                    <p className="text-xs mt-1">As reservas agendadas pelos atletas para este recinto surgirão nesta lista.</p>
                  </div>
                ) : (
                  latestReservations.map(res => (
                    <div key={res.id} className="p-3 bg-muted/40 border border-border rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{res.user?.full_name || 'Desconhecido'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(res.date).toLocaleDateString('pt-PT')} • {res.start_time.substring(0,5)}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        res.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        res.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {res.status.toUpperCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/dashboard/agenda')}
              className="w-full mt-6 py-2.5 bg-muted text-muted-foreground rounded-xl font-medium text-sm hover:text-foreground transition-all flex items-center justify-center gap-2"
            >
              Agenda Completa <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
