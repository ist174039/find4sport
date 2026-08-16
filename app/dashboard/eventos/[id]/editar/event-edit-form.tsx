'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Upload, X } from 'lucide-react'
import { updateEventAction } from '@/app/actions/event-management'
import { useModal } from '@/components/providers/modal-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TaxonomyCombobox, type TaxonomyOption } from '@/components/taxonomy-combobox'

type EventData = { id: string; title: string; description: string | null; category_id: string | null; address: string | null; start_date: string; end_date: string | null; capacity: number | null; price_min: number | null; price_max: number | null; image_url: string | null; gallery_urls: string[] | null; status: string }

function localDateTime(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function EventEditForm({ event, categories }: { event: EventData; categories: TaxonomyOption[] }) {
  const router = useRouter()
  const { showAlert } = useModal()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: event.title, description: event.description || '', category_id: event.category_id || '', address: event.address || '', start_date: localDateTime(event.start_date), end_date: localDateTime(event.end_date), capacity: event.capacity?.toString() || '', price_min: event.price_min?.toString() || '', price_max: event.price_max?.toString() || '' })
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(event.image_url)
  const [removeBanner, setRemoveBanner] = useState(false)
  const [existingGallery, setExistingGallery] = useState<string[]>(event.gallery_urls || [])
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([])
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([])

  useEffect(() => () => newGalleryPreviews.forEach(URL.revokeObjectURL), [newGalleryPreviews])
  const change = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }))
  const chooseBanner = (file: File | null) => { if (bannerPreview?.startsWith('blob:')) URL.revokeObjectURL(bannerPreview); setBannerFile(file); setRemoveBanner(false); setBannerPreview(file ? URL.createObjectURL(file) : event.image_url) }
  const addGallery = (files: File[]) => { const next = [...newGalleryFiles, ...files].slice(0, Math.max(0, 12 - existingGallery.length)); newGalleryPreviews.forEach(URL.revokeObjectURL); setNewGalleryFiles(next); setNewGalleryPreviews(next.map(URL.createObjectURL)) }
  const removeNewGallery = (index: number) => { const next = newGalleryFiles.filter((_, i) => i !== index); newGalleryPreviews.forEach(URL.revokeObjectURL); setNewGalleryFiles(next); setNewGalleryPreviews(next.map(URL.createObjectURL)) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (saving) return; setSaving(true)
    try {
      const data = new FormData(); Object.entries(form).forEach(([key,value]) => data.set(key,value)); existingGallery.forEach(url => data.append('existing_gallery', url)); newGalleryFiles.forEach(file => data.append('gallery', file)); if (bannerFile) data.set('banner', bannerFile); data.set('remove_banner', String(removeBanner))
      await updateEventAction(event.id, data)
      showAlert('Evento atualizado', 'As alterações foram guardadas.', 'success')
      router.push('/dashboard/eventos'); router.refresh()
    } catch (error) { showAlert('Não foi possível atualizar', error instanceof Error ? error.message : 'Erro inesperado.', 'error') }
    finally { setSaving(false) }
  }

  return <div className="mx-auto max-w-4xl space-y-5"><Link href="/dashboard/eventos" className="inline-flex min-h-10 items-center text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" />Voltar aos eventos</Link><Card className="overflow-visible rounded-3xl"><CardHeader className="border-b"><CardTitle>Editar evento</CardTitle><CardDescription>O estado de publicação não pode ser alterado por este formulário. Apenas conteúdo e agenda do teu próprio evento podem ser editados.</CardDescription></CardHeader><CardContent className="p-4 sm:p-6"><form onSubmit={submit} className="space-y-5"><label className="block space-y-2"><Label>Título *</Label><Input value={form.title} onChange={e=>change('title',e.target.value)} maxLength={180} required className="min-h-11" /></label><label className="block space-y-2"><Label>Descrição</Label><Textarea value={form.description} onChange={e=>change('description',e.target.value)} rows={5} maxLength={5000} /></label><div className="grid gap-4 sm:grid-cols-2"><div className="relative z-20 space-y-2"><Label>Modalidade</Label><TaxonomyCombobox options={categories} value={form.category_id} onChange={value=>change('category_id',String(value))} placeholder="Pesquisar modalidade" /></div><label className="space-y-2"><Label>Localização</Label><Input value={form.address} onChange={e=>change('address',e.target.value)} maxLength={300} className="min-h-11" /></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><Label>Início *</Label><Input type="datetime-local" value={form.start_date} onChange={e=>change('start_date',e.target.value)} required className="min-h-11 text-base" /></label><label className="space-y-2"><Label>Fim</Label><Input type="datetime-local" value={form.end_date} onChange={e=>change('end_date',e.target.value)} className="min-h-11 text-base" /></label></div><div className="grid gap-4 sm:grid-cols-3"><label className="space-y-2"><Label>Capacidade</Label><Input type="number" min={1} value={form.capacity} onChange={e=>change('capacity',e.target.value)} className="min-h-11" /></label><label className="space-y-2"><Label>Preço mínimo (€)</Label><Input type="number" min={0} step="0.01" value={form.price_min} onChange={e=>change('price_min',e.target.value)} className="min-h-11" /></label><label className="space-y-2"><Label>Preço máximo (€)</Label><Input type="number" min={0} step="0.01" value={form.price_max} onChange={e=>change('price_max',e.target.value)} className="min-h-11" /></label></div><section className="space-y-4 border-t pt-5"><div><h3 className="font-semibold">Media</h3><p className="text-sm text-muted-foreground">As remoções só afetam ficheiros que pertencem a este evento.</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Capa</Label>{bannerPreview&&!removeBanner?<div className="relative aspect-video overflow-hidden rounded-2xl border"><img src={bannerPreview} alt="Capa" className="h-full w-full object-cover"/><button type="button" onClick={()=>{setRemoveBanner(true);setBannerFile(null);setBannerPreview(null)}} className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-destructive shadow" aria-label="Remover capa"><X className="h-4 w-4"/></button></div>:<label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4"><Upload className="mb-2 h-6 w-6 text-muted-foreground"/><span className="text-sm font-semibold">Selecionar nova capa</span><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>chooseBanner(e.target.files?.[0]||null)}/></label>}</div><div className="space-y-2"><Label>Adicionar à galeria</Label><label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4"><Upload className="mb-2 h-6 w-6 text-muted-foreground"/><span className="text-sm font-semibold">Selecionar fotografias</span><span className="mt-1 text-xs text-muted-foreground">{existingGallery.length+newGalleryFiles.length}/12</span><input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>addGallery(Array.from(e.target.files||[]))}/></label></div></div>{(existingGallery.length>0||newGalleryPreviews.length>0)&&<div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{existingGallery.map(url=><div key={url} className="relative aspect-square overflow-hidden rounded-xl border"><img src={url} alt="" className="h-full w-full object-cover"/><button type="button" onClick={()=>setExistingGallery(current=>current.filter(item=>item!==url))} className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-destructive shadow" aria-label="Remover fotografia"><X className="h-4 w-4"/></button></div>)}{newGalleryPreviews.map((url,index)=><div key={url} className="relative aspect-square overflow-hidden rounded-xl border"><img src={url} alt="" className="h-full w-full object-cover"/><button type="button" onClick={()=>removeNewGallery(index)} className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-destructive shadow" aria-label="Remover fotografia"><X className="h-4 w-4"/></button></div>)}</div>}</section><Button type="submit" disabled={saving} className="min-h-12 w-full sm:w-auto">{saving?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:<Save className="mr-2 h-4 w-4"/>}{saving?'A guardar…':'Guardar alterações'}</Button></form></CardContent></Card></div>
}
