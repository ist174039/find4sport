'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, MapPin, Calendar as CalendarIcon, ArrowRight, Activity, Users, Trash2, LogOut } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useModal } from '@/components/providers/modal-provider'

type FavoriteItem = {
  id: string
  professional_id: string | null
  space_id: string | null
  event_id: string | null
  professional: any | null
  space: any | null
  event: any | null
}

type CommunityItem = {
  memberId: string
  community: any
}

export default function FavoritosPage() {
  const { showAlert } = useModal()
  const [favorites, setFavorites] = useState<{ professionals: FavoriteItem[], spaces: FavoriteItem[], events: FavoriteItem[], communities: CommunityItem[] }>({
    professionals: [],
    spaces: [],
    events: [],
    communities: []
  })
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const removeFavorite = async (favoriteId: string) => {
    setBusyId(favoriteId)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('favorites').delete().eq('id', favoriteId)
      if (error) throw error

      setFavorites(prev => ({
        professionals: prev.professionals.filter(item => item.id !== favoriteId),
        spaces: prev.spaces.filter(item => item.id !== favoriteId),
        events: prev.events.filter(item => item.id !== favoriteId),
        communities: prev.communities,
      }))
      showAlert('Sucesso', 'Favorito removido.', 'success')
    } catch (err: any) {
      console.error(err)
      showAlert('Erro', err.message || 'Não foi possível remover favorito.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const leaveCommunity = async (memberId: string) => {
    setBusyId(memberId)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('community_members').delete().eq('id', memberId)
      if (error) throw error

      setFavorites(prev => ({
        ...prev,
        communities: prev.communities.filter(item => item.memberId !== memberId),
      }))
      showAlert('Sucesso', 'Saiu da comunidade.', 'success')
    } catch (err: any) {
      console.error(err)
      showAlert('Erro', err.message || 'Não foi possível sair da comunidade.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  useEffect(() => {
    async function loadFavorites() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('favorites')
        .select(`
          id,
          professional_id,
          space_id,
          event_id,
          professional:professionals(id, full_name, professional_name, avatar_url, address, public_slug),
          space:sport_spaces(id, name, address, gallery_urls, slug),
          event:events(id, title, image_url, start_date, slug)
        `)
        .eq('user_id', user.id)

      if (data) {
        const favoriteRows = data as FavoriteItem[]
        const professionals = favoriteRows.filter(f => f.professional_id && f.professional)
        const spaces = favoriteRows.filter(f => f.space_id && f.space)
        const events = favoriteRows.filter(f => f.event_id && f.event)
        
        // Fetch communities from community_members
        const { data: commData } = await supabase
          .from('community_members')
          .select(`
            id,
            community:communities(id, name, sport_category, icon_url)
          `)
          .eq('user_id', user.id)

        const communities = (commData || [])
          .filter((c: any) => c.community)
          .map((c: any) => ({ memberId: c.id, community: c.community }))

        setFavorites({ professionals, spaces, events, communities })
      }
      setLoading(false)
    }
    loadFavorites()
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section - Standard Homepage Layout */}
      <div className="flex justify-between items-end mb-10 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Os Meus Favoritos</h1>
          <p className="mt-2 text-muted-foreground">Os profissionais e recintos desportivos que guardaste para acesso rápido.</p>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-64 rounded-xl bg-card border border-border animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Profissionais Section */}
          {favorites.professionals.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 text-primary" /> Profissionais
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {favorites.professionals.map((fav) => {
                  const pro = fav.professional
                  return (
                  <div key={fav.id} className="relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all group p-4">
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      disabled={busyId === fav.id}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-background/90 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                      title="Remover favorito"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="relative aspect-square rounded-full w-24 h-24 mx-auto mt-4 overflow-hidden bg-muted border border-border group-hover:border-primary/50 transition-colors">
                      {pro?.avatar_url ? (
                        <img src={pro.avatar_url} alt={pro.full_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl">
                          {pro?.full_name?.charAt(0) || 'P'}
                        </div>
                      )}
                    </div>
                    <div className="pt-4 flex-1 flex flex-col items-center text-center">
                      <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {pro?.professional_name || pro?.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 justify-center">
                        <MapPin className="h-3.5 w-3.5" /> {pro?.address || 'Localização não disponível'}
                      </p>
                      
                      <div className="mt-6 pt-4 border-t border-border w-full">
                        <Button asChild variant="ghost" className="w-full text-primary hover:text-primary/95 transition-all text-sm font-medium gap-1">
                          <Link href={`/profissionais/${pro?.public_slug || pro?.id}`}>
                            Ver Perfil <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {/* Espaços Section */}
          {favorites.spaces.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Activity className="h-5 w-5 text-teal-500" /> Recintos Desportivos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {favorites.spaces.map((fav) => {
                  const space = fav.space
                  return (
                  <div key={fav.id} className="relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      disabled={busyId === fav.id}
                      className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-background/90 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                      title="Remover favorito"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="relative aspect-[4/3] bg-muted">
                      <img 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        alt={space.name} 
                        src={space.gallery_urls?.[0] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'} 
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">{space?.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 truncate">
                        <MapPin className="h-3.5 w-3.5" /> {space?.address || 'Endereço não disponível'}
                      </p>
                      <div className="mt-auto pt-4 flex justify-between items-center border-t border-border mt-4">
                        <Button asChild variant="ghost" className="w-full text-primary hover:text-primary/95 transition-all text-sm font-medium gap-1">
                          <Link href={`/espacos/${space?.slug || space?.id}`}>
                            Reservar <CalendarIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {/* Eventos Section */}
          {favorites.events.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <CalendarIcon className="h-5 w-5 text-amber-500" /> Eventos Guardados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {favorites.events.map((fav) => {
                  const event = fav.event
                  return (
                  <div key={fav.id} className="relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      disabled={busyId === fav.id}
                      className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-background/90 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                      title="Remover favorito"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="relative aspect-[4/3] bg-muted">
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={event?.title}
                        src={event?.image_url || 'https://images.unsplash.com/photo-1517649763962-0c623266013b?q=80&w=1000&auto=format&fit=crop'}
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">{event?.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 truncate">
                        <CalendarIcon className="h-3.5 w-3.5" /> {event?.start_date ? new Date(event.start_date).toLocaleDateString('pt-PT') : 'Data por definir'}
                      </p>
                      <div className="mt-auto pt-4 border-t border-border mt-4">
                        <Button asChild variant="ghost" className="w-full text-primary hover:text-primary/95 transition-all text-sm font-medium gap-1">
                          <Link href={`/eventos/${event?.slug || event?.id}`}>
                            Ver Evento <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {/* Comunidades Section */}
          {favorites.communities.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 text-indigo-500" /> As Minhas Comunidades
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {favorites.communities.map((item) => {
                  const comm = item.community
                  return (
                  <div key={item.memberId} className="relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all group p-4">
                    <button
                      onClick={() => leaveCommunity(item.memberId)}
                      disabled={busyId === item.memberId}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-background/90 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
                      title="Sair da comunidade"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                    <div className="relative aspect-square rounded-full w-24 h-24 mx-auto mt-4 overflow-hidden bg-muted border border-border group-hover:border-primary/50 transition-colors">
                      {comm?.icon_url ? (
                        <img src={comm.icon_url} alt={comm.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl">
                          {comm?.name?.charAt(0) || 'C'}
                        </div>
                      )}
                    </div>
                    <div className="pt-4 flex-1 flex flex-col items-center text-center">
                      <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {comm?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 bg-secondary px-2 py-0.5 rounded-full">
                        {comm?.sport_category || 'Comunidade'}
                      </p>
                      
                      <div className="mt-6 pt-4 border-t border-border w-full">
                        <Button asChild variant="ghost" className="w-full text-primary hover:text-primary/95 transition-all text-sm font-medium gap-1">
                          <Link href={`/comunidades/${comm?.id}`}>
                            Ver Hub <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {/* Empty State Standard */}
          {favorites.professionals.length === 0 && favorites.spaces.length === 0 && favorites.events.length === 0 && favorites.communities.length === 0 && (
            <div className="bg-card border border-border p-12 rounded-xl flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Nenhum favorito guardado</h3>
              <p className="text-muted-foreground max-w-md mt-2 mb-6">
                Explora a plataforma e utiliza o ícone de coração para guardares os teus profissionais e recintos preferidos.
              </p>
              <div className="flex gap-4">
                <Button asChild className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/profissionais">Explorar Profissionais</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-lg">
                  <Link href="/pesquisa">Pesquisa Global</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
