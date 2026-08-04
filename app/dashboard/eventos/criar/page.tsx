'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Loader2, ArrowLeft, Check, Image as ImageIcon, X } from 'lucide-react'

export default function CriarEventoProfissionalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string; emoji: string | null }[]>([])
  const [formData, setFormData] = useState({
    title: '', description: '', category_id: '',
    address: '', start_date: '', end_date: '',
    capacity: '', price_min: '', price_max: '',
  })
  
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('categories').select('id, name, emoji').then(({ data }) => {
      setCategories(data || [])
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      setUploading(true)
      let bannerUrl = null;
      let galleryUrls: string[] = [];
      const eventFolderId = crypto.randomUUID();

      // Upload Banner
      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop()
        const fileName = `banner_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${user.id}/${eventFolderId}/${fileName}`
        
        const { error: uploadError } = await supabase.storage.from('events').upload(filePath, bannerFile)
        if (uploadError) throw new Error('Erro ao fazer upload do banner.')
        
        const { data } = supabase.storage.from('events').getPublicUrl(filePath)
        bannerUrl = data.publicUrl
      }

      // Upload Gallery
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `gallery_${i}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${user.id}/${eventFolderId}/${fileName}`
        
        const { error: uploadError } = await supabase.storage.from('events').upload(filePath, file)
        if (!uploadError) {
          const { data } = supabase.storage.from('events').getPublicUrl(filePath)
          galleryUrls.push(data.publicUrl)
        }
      }

      // Fetch professional data for organizer_name and professional_id
      const { data: profs } = await supabase.from('professionals').select('id, full_name, professional_name').eq('user_id', user.id).single()

      // Check auto-approval setting
      const { data: configData } = await supabase.from('system_config').select('settings').single()
      const manualProfileApproval = configData?.settings?.manual_profile_approval ?? true
      const eventStatus = manualProfileApproval ? 'pending' : 'published'

      const { error: insertError } = await supabase.from('events').insert({
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id || null,
        address: formData.address,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        price_min: formData.price_min ? parseFloat(formData.price_min) : null,
        price_max: formData.price_max ? parseFloat(formData.price_max) : null,
        image_url: bannerUrl,
        gallery_urls: galleryUrls.length > 0 ? galleryUrls : null,
        created_by: user.id,
        professional_id: profs?.id || null,
        organizer_name: profs?.professional_name || profs?.full_name || user.user_metadata?.full_name || 'Profissional',
        status: eventStatus,
      })

      if (insertError) throw insertError
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/eventos'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar evento')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerFile(file)
      setBannerPreview(URL.createObjectURL(file))
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setGalleryFiles(prev => [...prev, ...files])
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setGalleryPreviews(prev => [...prev, ...newPreviews])
    }
  }

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold">Evento Criado! 🎉</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            O teu evento foi submetido para aprovação.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <Link href="/dashboard/eventos" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar aos Eventos
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Evento</CardTitle>
          <CardDescription>Preenche os dados para criares um evento desportivo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v || '' })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.emoji || '📌'} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Localização</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data de Início *</Label>
                <Input id="start_date" type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Data de Fim</Label>
                <Input id="end_date" type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade</Label>
                <Input id="capacity" type="number" placeholder="Nº lugares" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_min">Preço Mín. (€)</Label>
                <Input id="price_min" type="number" step="0.01" placeholder="0.00" value={formData.price_min} onChange={(e) => setFormData({ ...formData, price_min: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_max">Preço Máx. (€)</Label>
                <Input id="price_max" type="number" step="0.01" placeholder="0.00" value={formData.price_max} onChange={(e) => setFormData({ ...formData, price_max: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold">Imagens do Evento</h3>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Imagem de Capa (Banner)</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                    {bannerPreview ? (
                      <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                        <img src={bannerPreview} alt="Banner preview" className="object-cover w-full h-full" />
                        <Button 
                          type="button" variant="destructive" size="icon" 
                          className="absolute top-2 right-2 h-6 w-6" 
                          onClick={() => { setBannerFile(null); setBannerPreview(null); }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer py-6">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Carregar Banner</span>
                        <span className="text-xs text-muted-foreground mt-1">Recomendado: 1200x600px</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Galeria de Fotos</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                    <label className="flex flex-col items-center justify-center cursor-pointer py-6">
                      <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">Adicionar Fotos</span>
                      <span className="text-xs text-muted-foreground mt-1">Pode selecionar múltiplas</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
                    </label>
                  </div>
                </div>
              </div>

              {galleryPreviews.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label className="text-xs text-muted-foreground">Fotos selecionadas ({galleryPreviews.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {galleryPreviews.map((preview, i) => (
                      <div key={i} className="relative h-20 w-20 rounded-md overflow-hidden border">
                        <img src={preview} alt={`Gallery ${i}`} className="object-cover w-full h-full" />
                        <button 
                          type="button" 
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                          onClick={() => removeGalleryImage(i)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 mt-6" disabled={loading || uploading}>
              {(loading || uploading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
              {uploading ? 'A enviar imagens...' : loading ? 'A criar...' : 'Criar Evento'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
