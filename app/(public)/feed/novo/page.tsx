'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertCircle,
  ArrowLeft,
  Image,
  Link as LinkIcon,
  Loader2,
  Rss,
  Calendar,
  MapPin,
  X,
} from 'lucide-react'

export default function NewFeedPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [postType, setPostType] = useState('text')
  const [form, setForm] = useState({
    title: '',
    content: '',
    image_url: '',
    event_link: '',
    location: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.content.trim()) { setError('O conteúdo é obrigatório'); return }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { error: insertError } = await supabase.from('feed_posts').insert({
        user_id: user.id,
        title: form.title || null,
        content: form.content,
        post_type: postType,
        image_url: form.image_url || null,
        event_link: form.event_link || null,
        location: form.location || null,
      })

      if (insertError) {
        setError(insertError.message)
        return
      }

      router.push('/feed')
    } catch (err) {
      setError('Ocorreu um erro ao publicar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/feed">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Feed
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Rss className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-center text-2xl">Nova Publicação</CardTitle>
          <CardDescription className="text-center">
            Partilha novidades, eventos ou pensamentos com a comunidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label>Tipo de Publicação</Label>
              <Tabs value={postType} onValueChange={setPostType}>
                <TabsList className="w-full">
                  <TabsTrigger value="text" className="flex-1">Texto</TabsTrigger>
                  <TabsTrigger value="event" className="flex-1">Evento</TabsTrigger>
                  <TabsTrigger value="achievement" className="flex-1">Conquista</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Dá um título à tua publicação..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="O que queres partilhar?"
                rows={5}
                required
              />
            </div>

            {postType === 'event' && (
              <div className="space-y-2">
                <Label htmlFor="event_link">Link do Evento</Label>
                <Input
                  id="event_link"
                  value={form.event_link}
                  onChange={(e) => setForm({ ...form, event_link: e.target.value })}
                  placeholder="https://find4sport.pt/eventos/..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="image">URL de Imagem (opcional)</Label>
              <Input
                id="image"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização (opcional)</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ex: Lisboa, Portugal"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !form.content.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A publicar...
                </>
              ) : (
                <>
                  <Rss className="mr-2 h-4 w-4" />
                  Publicar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
