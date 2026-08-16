'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useModal } from '@/components/providers/modal-provider'
import { BlockBuilder, type CMSBlock } from '@/components/cms/block-builder'
import { getCmsPage } from '@/lib/cms/registry'
import { loadCmsPageAction, saveCmsPageAction } from '@/app/admin/actions/cms'

export default function AdminPageEditor() {
  const params = useParams()
  const slug = String(params?.slug || '')
  const router = useRouter()
  const { showAlert } = useModal()
  const definition = getCmsPage(slug)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(definition?.title || '')
  const [description, setDescription] = useState(definition?.description || '')
  const [isPublished, setIsPublished] = useState(false)
  const [blocks, setBlocks] = useState<CMSBlock[]>([])

  useEffect(() => {
    if (!definition) {
      router.replace('/admin/paginas')
      return
    }
    loadCmsPageAction(slug)
      .then(({ page }) => {
        if (!page) return
        setTitle(page.title || definition.title)
        setDescription(page.description || definition.description)
        setIsPublished(Boolean(page.is_published))
        const content: any = page.content || {}
        if (Array.isArray(content.blocks)) {
          setBlocks(content.blocks.filter((block: any) => ['hero', 'text', 'image'].includes(block.type)))
        } else if (content.body) {
          setBlocks([{ id: crypto.randomUUID(), type: 'text', data: { content: String(content.body) } }])
        }
      })
      .catch(error => showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível carregar a página.', 'error'))
      .finally(() => setLoading(false))
  }, [definition, router, showAlert, slug])

  if (!definition) return null
  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  async function handleSave() {
    setSaving(true)
    try {
      await saveCmsPageAction({ slug, title, description, isPublished, blocks })
      showAlert('Guardado', 'A página foi atualizada com sucesso.', 'success')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível guardar a página.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" onClick={() => router.push('/admin/paginas')} aria-label="Voltar"><ArrowLeft className="h-5 w-5" /></Button>
          <div className="min-w-0"><h1 className="truncate text-2xl font-bold">{definition.title}</h1><p className="text-sm text-muted-foreground">/{definition.slug}</p></div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="min-h-11 w-full gap-2 sm:w-auto">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Guardar</Button>
      </header>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div><h2 className="font-semibold">Publicação e SEO</h2><p className="text-sm text-muted-foreground">Título e descrição usados na página e nos motores de pesquisa.</p></div>
        <div className="space-y-2"><Label>Título</Label><Input className="min-h-11 text-base" value={title} onChange={event => setTitle(event.target.value)} /></div>
        <div className="space-y-2"><Label>Descrição</Label><Textarea className="min-h-24 text-base" value={description} onChange={event => setDescription(event.target.value)} /></div>
        <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border border-border p-3"><div><p className="text-sm font-semibold">Publicar página</p><p className="text-xs text-muted-foreground">Quando desligado, a página não fica acessível ao público.</p></div><Switch checked={isPublished} onCheckedChange={setIsPublished} /></label>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div><h2 className="font-semibold">Conteúdo</h2><p className="text-sm text-muted-foreground">Construa a página com apenas três blocos previsíveis: cabeçalho, texto e imagem.</p></div>
        <BlockBuilder blocks={blocks} onChange={setBlocks} />
      </section>
    </div>
  )
}
