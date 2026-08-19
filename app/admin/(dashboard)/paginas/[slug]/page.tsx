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
import { DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'

type StoredCmsContent = {
  blocks?: CMSBlock[]
  body?: string
}

function normalizeBlocks(content: unknown): CMSBlock[] {
  if (!content || typeof content !== 'object') return []
  const stored = content as StoredCmsContent
  if (Array.isArray(stored.blocks)) {
    return stored.blocks.filter(block => block && ['hero', 'text', 'image'].includes(block.type))
  }
  if (stored.body) {
    return [{ id: crypto.randomUUID(), type: 'text', data: { content: String(stored.body) } }]
  }
  return []
}

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
        setBlocks(normalizeBlocks(page.content))
      })
      .catch(error => showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível carregar a página.', 'error'))
      .finally(() => setLoading(false))
  }, [definition, router, showAlert, slug])

  if (!definition) return null
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="A carregar editor">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
    <DashboardPage className="mx-auto max-w-4xl pb-24">
      <Button
        variant="ghost"
        className="min-h-11 w-fit gap-2 px-2"
        onClick={() => router.push('/admin/paginas')}
      >
        <ArrowLeft className="h-4 w-4" />Voltar às páginas
      </Button>

      <DashboardPageHeader
        title={definition.title}
        description={`/${definition.slug}`}
        action={(
          <Button onClick={handleSave} disabled={saving} className="min-h-11 gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </Button>
        )}
      />

      <DashboardSection
        title="Publicação e SEO"
        description="Define como a página aparece na plataforma e nos motores de pesquisa."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cms-title">Título</Label>
            <Input id="cms-title" className="min-h-11 text-base" value={title} onChange={event => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cms-description">Descrição</Label>
            <Textarea id="cms-description" className="min-h-24 text-base" value={description} onChange={event => setDescription(event.target.value)} />
          </div>
          <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border border-border p-3 transition hover:bg-muted/40">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Publicar página</p>
              <p className="text-xs leading-5 text-muted-foreground">Quando desligado, a página não fica acessível ao público.</p>
            </div>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} className="shrink-0" />
          </label>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Conteúdo"
        description="Constrói a página com três blocos previsíveis: cabeçalho, texto e imagem."
      >
        <BlockBuilder blocks={blocks} onChange={setBlocks} />
      </DashboardSection>
    </DashboardPage>
  )
}
