'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Calendar, Users, MessageSquare, Star, 
  Activity, ArrowRight, ShieldCheck, Camera, 
  Upload, X, Plus, Image as ImageIcon, Loader2, Save, Globe
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useModal } from '@/components/providers/modal-provider'
import { Button } from '@/components/ui/button'

export function ProfessionalDashboard({ professional }: { professional: any }) {
  const router = useRouter()
  const { showAlert } = useModal()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [gallery, setGallery] = useState<string[]>(professional?.gallery_urls || [])
  const [newUrl, setNewUrl] = useState('')
  const [savingGallery, setSavingGallery] = useState(false)

  const saveGalleryToDb = async (updatedGallery: string[]) => {
    setSavingGallery(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('professionals')
        .update({ gallery_urls: updatedGallery })
        .eq('id', professional.id)

      if (error) throw error
      showAlert('Sucesso', 'Galeria atualizada com sucesso!', 'success')
    } catch (err: any) {
      console.error(err)
      showAlert('Erro', err.message || 'Erro ao guardar galeria.', 'error')
    } finally {
      setSavingGallery(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    let loadedCount = 0
    const newItems: string[] = []

    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const result = event.target?.result as string
        if (result) {
          newItems.push(result)
        }
        loadedCount++
        if (loadedCount === files.length) {
          const updated = [...gallery, ...newItems].slice(0, 12)
          setGallery(updated)
          await saveGalleryToDb(updated)
        }
      }
      reader.readAsDataURL(file)
    })

    if (e.target) e.target.value = ''
  }

  const handleAddUrl = async () => {
    if (!newUrl.trim()) return
    const updated = [...gallery, newUrl.trim()].slice(0, 12)
    setGallery(updated)
    setNewUrl('')
    await saveGalleryToDb(updated)
  }

  const handleRemovePhoto = async (index: number) => {
    const updated = gallery.filter((_, i) => i !== index)
    setGallery(updated)
    await saveGalleryToDb(updated)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Olá, {professional?.full_name?.split(' ')[0] || 'Profissional'}! 👋
          </h1>
          <p className="text-muted-foreground">Gerencie o seu perfil, galeria de fotos, serviços e clientes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/profissionais/${professional?.public_slug || professional?.id}`} target="_blank">
            <Button variant="outline" className="gap-2 shadow-sm border-primary text-primary hover:bg-primary/10">
              <Globe className="h-4 w-4" />
              Ver Perfil Público
            </Button>
          </Link>
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
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Camera className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Galeria</span>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Fotos</p>
          <h3 className="text-3xl font-bold">{gallery.length} / 12</h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Status Box */}
          <div className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <h2 className="text-xl font-bold mb-2">Estado do Perfil</h2>
            <p className="text-muted-foreground mb-6 max-w-md text-sm">O seu perfil está preenchido e visível para todos os utilizadores na plataforma. Mantenha as suas fotos e serviços atualizados.</p>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => router.push('/dashboard/servicos')}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all text-sm cursor-pointer"
              >
                Atualizar Serviços
              </button>
              <button 
                onClick={() => router.push(`/profissionais/${professional?.public_slug || professional?.id}`)}
                className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-secondary/80 transition-all text-sm cursor-pointer"
              >
                Ver Perfil Público
              </button>
            </div>
          </div>

          {/* Galeria do Profissional */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Galeria de Fotos do Profissional
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Adicione fotos dos seus treinos, instalações e certificações ({gallery.length}/12 fotos)
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={savingGallery || gallery.length >= 12}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {savingGallery ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Carregar do PC
              </button>
            </div>

            {/* URL Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="Ou cola aqui o URL da imagem (ex: https://...)"
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                disabled={!newUrl.trim() || gallery.length >= 12 || savingGallery}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-bold text-xs hover:bg-secondary/80 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                Adicionar URL
              </button>
            </div>

            {/* Photos Grid */}
            {gallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                {gallery.map((url, i) => (
                  <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted shadow-sm">
                    <img 
                      src={url} 
                      alt={`Galeria ${i + 1}`} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/e2e8f0/94a3b8?text=Imagem' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute top-2 right-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                      title="Remover foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary rounded-xl p-8 text-center cursor-pointer transition-colors bg-muted/20"
              >
                <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h4 className="font-semibold text-sm text-foreground">Sua galeria está vazia</h4>
                <p className="text-xs text-muted-foreground mt-1">Clica aqui para carregar fotos do teu computador ou cola o URL acima.</p>
              </div>
            )}
          </div>

          {/* Quick Management Shortcuts */}
          <div>
            <h2 className="text-xl font-bold mb-4">Atalhos de Gestão</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button 
                onClick={() => router.push('/dashboard/clientes')}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl hover:bg-muted transition-all cursor-pointer"
              >
                <Users className="h-6 w-6 text-primary" />
                <span className="font-medium text-sm">Clientes</span>
              </button>
              <button 
                onClick={() => router.push('/dashboard/agenda')}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-card border border-border rounded-xl hover:bg-muted transition-all cursor-pointer"
              >
                <Calendar className="h-6 w-6 text-blue-500" />
                <span className="font-medium text-sm">Agenda</span>
              </button>

              <button 
                onClick={() => router.push('/dashboard/eventos/criar')}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 cursor-pointer"
              >
                <Calendar className="h-6 w-6" />
                <span className="font-medium text-sm">Novo Evento</span>
              </button>
            </div>
          </div>
        </div>

        {/* Messages Pane */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Mensagens Recentes</h2>
            </div>
            <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">Sem mensagens pendentes</p>
              <p className="text-xs mt-1">As mensagens enviadas por clientes aparecerão aqui.</p>
            </div>
            
            <button 
              onClick={() => router.push('/dashboard/mensagens')}
              className="w-full mt-6 py-2.5 bg-muted text-muted-foreground rounded-xl font-medium text-sm hover:text-foreground transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Abrir Caixa de Mensagens <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
