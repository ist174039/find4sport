'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowLeft, Image, Plus, Trash2, X } from 'lucide-react'

export default function ProfessionalGalleryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [gallery, setGallery] = useState<string[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [professionalId, setProfessionalId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        const { data: prof } = await supabase.from('professionals').select('id, gallery_urls').eq('user_id', user.id).single()
        if (prof) {
          setProfessionalId(prof.id)
          setGallery(prof.gallery_urls || [])
        }
      } catch (err) {
        setError('Erro ao carregar galeria')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  async function addImage() {
    if (!newUrl.trim() || !professionalId) return
    const updated = [...gallery, newUrl.trim()]
    const supabase = createClient()
    const { error: updErr } = await supabase.from('professionals').update({ gallery_urls: updated }).eq('id', professionalId)
    if (!updErr) {
      setGallery(updated)
      setNewUrl('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    }
  }

  async function removeImage(index: number) {
    if (!professionalId) return
    const updated = gallery.filter((_, i) => i !== index)
    const supabase = createClient()
    await supabase.from('professionals').update({ gallery_urls: updated }).eq('id', professionalId)
    setGallery(updated)
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Galeria</h1>

      {error && <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}
      {success && <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-600">Imagem adicionada!</div>}

      <div className="mb-6 flex gap-2">
        <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="URL da imagem..." />
        <Button onClick={addImage} disabled={!newUrl.trim()}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {gallery.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Image className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma imagem na galeria. Adicione fotos do seu trabalho.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((url, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg border">
              <img src={url} alt={`Foto ${index + 1}`} className="h-48 w-full object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => removeImage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
