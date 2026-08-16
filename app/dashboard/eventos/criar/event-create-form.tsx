'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Check, Image as ImageIcon, Loader2, X } from 'lucide-react'
import { createEventAction } from '@/app/actions/event-management'
import { useModal } from '@/components/providers/modal-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type Category = { id: string; name: string; emoji: string | null }

type EventFormState = {
  title: string
  description: string
  category_id: string
  address: string
  start_date: string
  end_date: string
  capacity: string
  price_min: string
  price_max: string
}

const initialForm: EventFormState = { title: '', description: '', category_id: '', address: '', start_date: '', end_date: '', capacity: '', price_min: '', price_max: '' }

export function EventCreateForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const { showAlert } = useModal()
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  useEffect(() => () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview)
    galleryPreviews.forEach(URL.revokeObjectURL)
  }, [bannerPreview, galleryPreviews])

  const change = (key: keyof EventFormState, value: string) => setForm(current => ({ ...current, [key]: value }))

  const setBanner = (file: File | null) => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview)
    setBannerFile(file)
    setBannerPreview(file ? URL.createObjectURL(file) : null)
  }

  const addGallery = (files: File[]) => {
    const next = [...galleryFiles, ...files].slice(0, 12)
    galleryPreviews.forEach(URL.revokeObjectURL)
    setGalleryFiles(next)
    setGalleryPreviews(next.map(URL.createObjectURL))
  }

  const removeGallery = (index: number) => {
    const next = galleryFiles.filter((_, itemIndex) => itemIndex !== index)
    galleryPreviews.forEach(URL.revokeObjectURL)
    setGalleryFiles(next)
    setGalleryPreviews(next.map(URL.createObjectURL))
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, value]) => data.set(key, value))
      if (bannerFile) data.set('banner', bannerFile)
      galleryFiles.forEach(file => data.append('gallery', file))
      const result = await createEventAction(data)
      showAlert('Evento criado', result.status === 'published' ? 'O evento já está publicado.' : 'O evento foi submetido para aprovação.', 'success')
      router.push('/dashboard/eventos')
      router.refresh()
    } catch (error) {
      showAlert('Não foi possível criar o evento', error instanceof Error ? error.message : 'Erro inesperado.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return <div className="mx-auto max-w-4xl space-y-5">
    <Link href="/dashboard/eventos" className="inline-flex min-h-10 items-center text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" />Voltar aos eventos</Link>
    <Card className="overflow-hidden rounded-3xl"><CardHeader className="border-b"><CardTitle>Criar evento</CardTitle><CardDescription>Preenche apenas informação real. Publicação e permissões são validadas no servidor.</CardDescription></CardHeader><CardContent className="p-4 sm:p-6"><form onSubmit={submit} className="space-y-5">
      <label className="block space-y-2"><Label>Título *</Label><Input value={form.title} onChange={event => change('title', event.target.value)} maxLength={180} required className="min-h-11" /></label>
      <label className="block space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={event => change('description', event.target.value)} rows={5} maxLength={5000} /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><Label>Modalidade</Label><Select value={form.category_id} onValueChange={value => change('category_id', value || '')}><SelectTrigger className="min-h-11"><SelectValue placeholder="Selecionar modalidade" /></SelectTrigger><SelectContent>{categories.map(category => <SelectItem key={category.id} value={category.id}>{category.emoji || '•'} {category.name}</SelectItem>)}</SelectContent></Select></label><label className="space-y-2"><Label>Localização</Label><Input value={form.address} onChange={event => change('address', event.target.value)} maxLength={300} className="min-h-11" /></label></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><Label>Início *</Label><Input type="datetime-local" value={form.start_date} onChange={event => change('start_date', event.target.value)} required className="min-h-11 text-base" /></label><label className="space-y-2"><Label>Fim</Label><Input type="datetime-local" value={form.end_date} onChange={event => change('end_date', event.target.value)} className="min-h-11 text-base" /></label></div>
      <div className="grid gap-4 sm:grid-cols-3"><label className="space-y-2"><Label>Capacidade</Label><Input type="number" min={1} max={100000} value={form.capacity} onChange={event => change('capacity', event.target.value)} className="min-h-11" /></label><label className="space-y-2"><Label>Preço mínimo (€)</Label><Input type="number" min={0} step="0.01" value={form.price_min} onChange={event => change('price_min', event.target.value)} className="min-h-11" /></label><label className="space-y-2"><Label>Preço máximo (€)</Label><Input type="number" min={0} step="0.01" value={form.price_max} onChange={event => change('price_max', event.target.value)} className="min-h-11" /></label></div>
      {(Number(form.price_min) > 0 || Number(form.price_max) > 0) && <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">Comissões e taxas são determinadas pelo plano ativo e pelo checkout Stripe. Não são calculadas por valores fixos nesta página.</div>}
      <section className="space-y-4 border-t pt-5"><div><h3 className="font-semibold">Imagens</h3><p className="text-sm text-muted-foreground">JPEG, PNG ou WebP. Máximo 8 MB por imagem e 12 imagens de galeria.</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Capa</Label>{bannerPreview ? <div className="relative aspect-video overflow-hidden rounded-2xl border bg-muted"><img src={bannerPreview} alt="Pré-visualização da capa" className="h-full w-full object-cover" /><Button type="button" variant="destructive" size="icon" className="absolute right-2 top-2" onClick={() => setBanner(null)} aria-label="Remover capa"><X className="h-4 w-4" /></Button></div> : <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center hover:bg-muted/30"><ImageIcon className="mb-2 h-7 w-7 text-muted-foreground" /><span className="text-sm font-semibold">Selecionar capa</span><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={event => setBanner(event.target.files?.[0] || null)} /></label>}</div><div className="space-y-2"><Label>Galeria</Label><label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center hover:bg-muted/30"><ImageIcon className="mb-2 h-7 w-7 text-muted-foreground" /><span className="text-sm font-semibold">Adicionar fotografias</span><span className="mt-1 text-xs text-muted-foreground">{galleryFiles.length}/12 selecionadas</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={event => addGallery(Array.from(event.target.files || []))} /></label></div></div>{galleryPreviews.length > 0 && <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{galleryPreviews.map((preview, index) => <div key={preview} className="relative aspect-square overflow-hidden rounded-xl border"><img src={preview} alt="" className="h-full w-full object-cover" /><button type="button" className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-destructive shadow" onClick={() => removeGallery(index)} aria-label="Remover fotografia"><X className="h-4 w-4" /></button></div>)}</div>}</section>
      <Button type="submit" disabled={saving} className="min-h-12 w-full rounded-xl sm:w-auto">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}{saving ? 'A criar…' : 'Criar evento'}</Button>
    </form></CardContent></Card>
  </div>
}
