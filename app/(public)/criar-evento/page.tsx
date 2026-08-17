'use client'

import { useEffect, useState } from 'react'
import { Calendar, CheckCircle, Clock, Image as ImageIcon, Loader2, MapPin, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AppImage } from '@/components/ui/app-image'
import { Button } from '@/components/ui/button'

const MAX_COVER_BYTES = 5 * 1024 * 1024
const ALLOWED_COVER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

type FormState = {
  title: string
  category_slug: string
  capacity: string
  description: string
  date: string
  startTime: string
  endTime: string
  price: string
  location: string
}

const initialForm: FormState = {
  title: '',
  category_slug: '',
  capacity: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  price: '',
  location: '',
}

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormState>(initialForm)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
    }
  }, [coverPreview])

  const updateField = (field: keyof FormState, value: string) => {
    setFormData(previous => ({ ...previous, [field]: value }))
  }

  const handleCoverChange = (file: File | null) => {
    setErrorMessage(null)
    if (!file) return
    if (!ALLOWED_COVER_TYPES.has(file.type)) {
      setErrorMessage('A capa deve ser JPG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_COVER_BYTES) {
      setErrorMessage('A capa não pode ultrapassar 5 MB.')
      return
    }

    if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const clearCover = () => {
    if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
    setCoverFile(null)
    setCoverPreview(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setErrorMessage(null)

    if (!formData.title.trim() || !formData.date || !formData.location.trim()) {
      setErrorMessage('Preenche título, data e localização.')
      return
    }

    const start = new Date(`${formData.date}T${formData.startTime || '00:00'}`)
    const end = formData.endTime ? new Date(`${formData.date}T${formData.endTime}`) : null
    if (end && end <= start) {
      setErrorMessage('A hora de fim tem de ser posterior à hora de início.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    let uploadedPath: string | null = null

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push(`/login?redirect=${encodeURIComponent('/criar-evento')}`)
        return
      }

      const [{ data: professional }, categoryResult] = await Promise.all([
        supabase.from('professionals').select('id,full_name,professional_name').eq('user_id', user.id).maybeSingle(),
        formData.category_slug
          ? supabase.from('categories').select('id').eq('slug', formData.category_slug).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ])

      let imageUrl: string | null = null
      if (coverFile) {
        const extension = coverFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        uploadedPath = `${user.id}/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from('events').upload(uploadedPath, coverFile, {
          cacheControl: '3600',
          contentType: coverFile.type,
          upsert: false,
        })
        if (uploadError) throw new Error(`Não foi possível carregar a capa: ${uploadError.message}`)
        imageUrl = supabase.storage.from('events').getPublicUrl(uploadedPath).data.publicUrl
      }

      const price = Number.parseFloat(formData.price)
      const capacity = Number.parseInt(formData.capacity, 10)
      const { error: insertError } = await supabase.from('events').insert({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        address: formData.location.trim(),
        start_date: start.toISOString(),
        end_date: end?.toISOString() || null,
        capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : null,
        price_min: Number.isFinite(price) && price > 0 ? price : 0,
        price_max: Number.isFinite(price) && price > 0 ? price : 0,
        status: 'pending',
        category_id: categoryResult.data?.id || null,
        professional_id: professional?.id || null,
        organizer_name: professional?.professional_name || professional?.full_name || user.user_metadata?.full_name || user.email || 'Utilizador Find4Sport',
        image_url: imageUrl,
        created_by: user.id,
        source: 'find4sport',
      })

      if (insertError) throw new Error(insertError.message)

      setSuccess(true)
      setFormData(initialForm)
      clearCover()
      window.setTimeout(() => router.push('/dashboard/eventos'), 900)
    } catch (error) {
      if (uploadedPath) await supabase.storage.from('events').remove([uploadedPath])
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível criar o evento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-muted/20 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="mb-6">
          <p className="text-sm font-semibold text-primary">Eventos Find4Sport</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Criar evento</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">Preenche os dados essenciais. O evento fica pendente até validação da plataforma.</p>
        </div>

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="h-5 w-5" /> Evento submetido com sucesso.
          </div>
        )}
        {errorMessage && <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-bold">Informação principal</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-medium">Título *
                <input required value={formData.title} onChange={e => updateField('title', e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3 outline-none focus:border-primary" placeholder="Ex.: Torneio de Padel de Verão" />
              </label>
              <label className="text-sm font-medium">Categoria
                <select value={formData.category_slug} onChange={e => updateField('category_slug', e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3">
                  <option value="">Sem categoria</option><option value="corrida">Corrida</option><option value="yoga">Yoga</option><option value="padel">Padel</option><option value="crossfit">Crossfit</option><option value="natacao">Natação</option>
                </select>
              </label>
              <label className="text-sm font-medium">Capacidade
                <input min="1" type="number" value={formData.capacity} onChange={e => updateField('capacity', e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3" placeholder="Sem limite" />
              </label>
              <label className="sm:col-span-2 text-sm font-medium">Descrição
                <textarea rows={5} value={formData.description} onChange={e => updateField('description', e.target.value)} className="mt-2 w-full rounded-xl border bg-background p-3 outline-none focus:border-primary" placeholder="Objetivo, programa, requisitos e informação útil." />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /><h2 className="text-lg font-bold">Imagem de capa</h2></div>
            {coverPreview ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
                <AppImage src={coverPreview} alt="Pré-visualização da capa" fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
                <Button type="button" variant="secondary" size="icon" onClick={clearCover} className="absolute right-3 top-3 rounded-full" aria-label="Remover capa"><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 p-6 text-center transition hover:border-primary/50 hover:bg-primary/5">
                <Upload className="mb-3 h-7 w-7 text-primary" /><span className="font-semibold">Escolher imagem</span><span className="mt-1 text-xs text-muted-foreground">JPG, PNG ou WebP · máximo 5 MB</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => handleCoverChange(e.target.files?.[0] || null)} />
              </label>
            )}
          </section>

          <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /><h2 className="text-lg font-bold">Data e local</h2></div>
              <label className="text-sm font-medium">Data *<input required type="date" value={formData.date} onChange={e => updateField('date', e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3" /></label>
              <label className="text-sm font-medium">Preço (€)<input min="0" step="0.01" type="number" value={formData.price} onChange={e => updateField('price', e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3" placeholder="0,00" /></label>
              <label className="text-sm font-medium"><span className="flex items-center gap-1"><Clock className="h-4 w-4" />Início</span><input type="time" value={formData.startTime} onChange={e => updateField('startTime', e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3" /></label>
              <label className="text-sm font-medium"><span className="flex items-center gap-1"><Clock className="h-4 w-4" />Fim</span><input type="time" value={formData.endTime} onChange={e => updateField('endTime', e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3" /></label>
              <label className="sm:col-span-2 text-sm font-medium"><span className="flex items-center gap-1"><MapPin className="h-4 w-4" />Localização *</span><input required value={formData.location} onChange={e => updateField('location', e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border bg-background px-3 outline-none focus:border-primary" placeholder="Morada, recinto ou cidade" /></label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading || success}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submeter para validação</Button>
          </div>
        </form>
      </div>
    </main>
  )
}
