'use client'

import { useState, useRef } from 'react'
import { 
  Camera, Upload, X, Image as ImageIcon, Loader2, Save, Trash2, 
  Eye, EyeOff, User, LayoutTemplate, Star, CheckCircle2, Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useModal } from '@/components/providers/modal-provider'

interface GaleriaManagerProps {
  initialEntity: { 
    type: 'professional' | 'space'
    data: any 
  } | null
}

export function GaleriaManager({ initialEntity }: GaleriaManagerProps) {
  const { showAlert } = useModal()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const entity = initialEntity?.data
  const type = initialEntity?.type

  // State
  const [publicGallery, setPublicGallery] = useState<string[]>(entity?.gallery_urls || [])
  const [privateGallery, setPrivateGallery] = useState<string[]>(entity?.private_gallery_urls || [])
  const [activeCover, setActiveCover] = useState<string>(entity?.cover_url || '')
  const [activeAvatar, setActiveAvatar] = useState<string>(
    type === 'space' ? (entity?.logo_url || '') : (entity?.avatar_url || '')
  )

  const [filterTab, setFilterTab] = useState<'all' | 'public' | 'private'>('all')
  const [newUrl, setNewUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const saveAllGalleryData = async (
    pub: string[], 
    priv: string[], 
    cover: string = activeCover, 
    avatar: string = activeAvatar
  ) => {
    if (!entity || !type) return
    setSaving(true)
    try {
      const supabase = createClient()
      const tableName = type === 'professional' ? 'professionals' : 'sport_spaces'
      
      const payload: any = {
        gallery_urls: pub,
        private_gallery_urls: priv,
        cover_url: cover,
      }

      if (type === 'professional') {
        payload.avatar_url = avatar
      } else {
        payload.logo_url = avatar
      }

      const { error } = await supabase
        .from(tableName)
        .update(payload)
        .eq('id', entity.id)

      if (error) throw error

      // If updating professional avatar, also update platform_users / auth
      if (type === 'professional' && avatar && entity.user_id) {
        await supabase.from('platform_users').update({ avatar_url: avatar }).eq('id', entity.user_id)
      }

      showAlert('Sucesso', 'Galeria e fotos de perfil/banner atualizadas!', 'success')
    } catch (err: any) {
      console.error(err)
      showAlert('Erro', err.message || 'Erro ao guardar as alterações.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    let count = 0
    const newItems: string[] = []

    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const result = event.target?.result as string
        if (result) {
          newItems.push(result)
        }
        count++
        if (count === files.length) {
          // Default uploaded items to public gallery
          const updatedPub = [...publicGallery, ...newItems]
          setPublicGallery(updatedPub)
          await saveAllGalleryData(updatedPub, privateGallery)
        }
      }
      reader.readAsDataURL(file)
    })

    if (e.target) e.target.value = ''
  }

  const handleAddUrl = async () => {
    if (!newUrl.trim()) return
    const updatedPub = [...publicGallery, newUrl.trim()]
    setPublicGallery(updatedPub)
    setNewUrl('')
    await saveAllGalleryData(updatedPub, privateGallery)
  }

  // Toggle Visibility between Public & Private
  const handleToggleVisibility = async (url: string, isCurrentlyPublic: boolean) => {
    let updatedPub = [...publicGallery]
    let updatedPriv = [...privateGallery]

    if (isCurrentlyPublic) {
      // Move from Public -> Private
      updatedPub = updatedPub.filter(u => u !== url)
      if (!updatedPriv.includes(url)) updatedPriv.push(url)
    } else {
      // Move from Private -> Public
      updatedPriv = updatedPriv.filter(u => u !== url)
      if (!updatedPub.includes(url)) updatedPub.push(url)
    }

    setPublicGallery(updatedPub)
    setPrivateGallery(updatedPriv)
    await saveAllGalleryData(updatedPub, updatedPriv)
  }

  // Set Cover Banner
  const handleSetCover = async (url: string) => {
    const newCover = activeCover === url ? '' : url
    setActiveCover(newCover)
    await saveAllGalleryData(publicGallery, privateGallery, newCover, activeAvatar)
  }

  // Set Profile Avatar
  const handleSetAvatar = async (url: string) => {
    const newAvatar = activeAvatar === url ? '' : url
    setActiveAvatar(newAvatar)
    await saveAllGalleryData(publicGallery, privateGallery, activeCover, newAvatar)
  }

  // Delete photo
  const handleRemovePhoto = async (url: string) => {
    const updatedPub = publicGallery.filter(u => u !== url)
    const updatedPriv = privateGallery.filter(u => u !== url)
    const newCover = activeCover === url ? '' : activeCover
    const newAvatar = activeAvatar === url ? '' : activeAvatar

    setPublicGallery(updatedPub)
    setPrivateGallery(updatedPriv)
    setActiveCover(newCover)
    setActiveAvatar(newAvatar)

    await saveAllGalleryData(updatedPub, updatedPriv, newCover, newAvatar)
  }

  if (!entity) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-bold text-foreground">Perfil não encontrado</h3>
        <p className="text-sm text-muted-foreground mt-1">Crie um perfil para gerir a sua galeria de fotos.</p>
      </div>
    )
  }

  // Combine items for display
  const allItems = [
    ...publicGallery.map(url => ({ url, isPublic: true })),
    ...privateGallery.map(url => ({ url, isPublic: false }))
  ]

  const filteredItems = allItems.filter(item => {
    if (filterTab === 'public') return item.isPublic
    if (filterTab === 'private') return !item.isPublic
    return true
  })

  return (
    <div className="space-y-6">
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Header Controls & Upload Bar */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Gestão da Galeria & Fotografia
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Organize fotos do seu trabalho, escolha a foto de perfil, banner de capa e visibilidade.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Carregar Fotos do PC
            </button>
          </div>
        </div>

        {/* URL Input */}
        <div className="pt-4 border-t border-border flex gap-2">
          <input
            type="text"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="Ou digite o URL da imagem (ex: https://...)"
            className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!newUrl.trim() || saving}
            className="bg-secondary text-secondary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-secondary/80 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            Adicionar URL
          </button>
        </div>

        {/* Visibility Filter Tabs */}
        <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'all' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Todas ({allItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('public')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'public' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Públicas ({publicGallery.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('private')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'private' ? 'bg-amber-600 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              Privadas ({privateGallery.length})
            </button>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Banner Capa</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Foto Perfil</span>
          </div>
        </div>
      </div>

      {/* Gallery Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(({ url, isPublic }, index) => {
            const isCover = activeCover === url
            const isAvatar = activeAvatar === url

            return (
              <div 
                key={index} 
                className={`group relative rounded-2xl overflow-hidden border bg-muted shadow-sm hover:shadow-md transition-all flex flex-col ${
                  isCover ? 'border-amber-400 ring-2 ring-amber-400/50' : isAvatar ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-border'
                }`}
              >
                {/* Photo Preview Container */}
                <div className="relative aspect-square w-full overflow-hidden bg-black/5">
                  <img 
                    src={url} 
                    alt={`Foto ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/e2e8f0/94a3b8?text=Imagem' }}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {isCover && (
                      <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <LayoutTemplate className="w-3 h-3" /> Banner Capa
                      </span>
                    )}
                    {isAvatar && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <User className="w-3 h-3" /> Foto Perfil
                      </span>
                    )}
                  </div>

                  {/* Visibility Badge */}
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 ${
                    isPublic ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'
                  }`}>
                    {isPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {isPublic ? 'Pública' : 'Privada'}
                  </span>

                  {/* Hover Overlay Controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between z-20">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(url)}
                        className="bg-destructive text-destructive-foreground p-2 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-md cursor-pointer"
                        title="Eliminar fotografia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {/* Set Banner Button */}
                      <button
                        type="button"
                        onClick={() => handleSetCover(url)}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isCover ? 'bg-amber-500 text-black' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
                        }`}
                      >
                        <LayoutTemplate className="w-3.5 h-3.5" />
                        {isCover ? 'Banner Ativo' : 'Definir como Banner'}
                      </button>

                      {/* Set Avatar Button */}
                      <button
                        type="button"
                        onClick={() => handleSetAvatar(url)}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isAvatar ? 'bg-blue-600 text-white' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        {isAvatar ? 'Perfil Ativo' : 'Definir como Perfil'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Footer Bar */}
                <div className="p-3 bg-card flex items-center justify-between border-t border-border">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {isPublic ? 'Visível no perfil' : 'Oculto do público'}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(url, isPublic)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      isPublic 
                        ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                    }`}
                  >
                    {isPublic ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {isPublic ? 'Tornar Privada' : 'Tornar Pública'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-12 text-center cursor-pointer transition-all bg-card hover:bg-muted/30"
        >
          <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">Sem fotografias nesta vista</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Clica aqui para escolher imagens do teu computador ou muda os filtros acima.
          </p>
        </div>
      )}
    </div>
  )
}
