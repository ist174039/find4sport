'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Loader2, Code, LayoutDashboard } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'
import { BlockBuilder, type CMSBlock } from '@/components/cms/block-builder'

export default function AdminPageEditor() {
  const params = useParams()
  const slug = params?.slug as string
  const router = useRouter()
  const { showAlert } = useModal()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState<any>(null)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [markdownBody, setMarkdownBody] = useState('')
  const [blocks, setBlocks] = useState<CMSBlock[]>([])
  const [rawJson, setRawJson] = useState('{}')
  const [editorMode, setEditorMode] = useState<'visual' | 'markdown' | 'raw'>('visual')

  const isPlanosPage = slug === 'profissionais-planos' || slug === 'planos'

  const FIXED_PAGES = [
    { slug: 'planos', title: 'Planos e Preços' },
    { slug: 'como-funciona', title: 'Como Funciona' },
    { slug: 'recursos', title: 'Recursos e Ajuda' },
    { slug: 'sobre', title: 'Sobre Nós' },
    { slug: 'blog', title: 'Blog Oficial' },
    { slug: 'contacto', title: 'Contacto' },
    { slug: 'carreiras', title: 'Carreiras' },
    { slug: 'termos', title: 'Termos e Condições' },
    { slug: 'privacidade', title: 'Política de Privacidade' },
    { slug: 'cookies', title: 'Política de Cookies' },
    { slug: 'rgpd', title: 'RGPD' }
  ]

  useEffect(() => {
    if (slug) loadPage()
  }, [slug])

  async function loadPage() {
    setLoading(true)
    
    // Check if slug is valid
    const fixedPage = FIXED_PAGES.find(p => p.slug === slug)
    if (!fixedPage) {
      showAlert('Aviso', 'Esta página não faz parte das páginas editáveis.', 'error')
      router.push('/admin/paginas')
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .eq('slug', slug)
      .single()

    if (data) {
      setPage(data)
      setTitle(data.title || '')
      setDescription(data.description || '')
      setIsPublished(data.is_published || false)
      
      const content = data.content || {}
      
      if (Array.isArray(content.blocks)) {
        setBlocks(content.blocks)
        setEditorMode('visual')
      } else if (content.body) {
        setMarkdownBody(content.body)
        setEditorMode('markdown')
      } else {
        setRawJson(JSON.stringify(content, null, 2))
        setEditorMode(isPlanosPage ? 'raw' : 'visual')
      }
    } else {
      // Row doesn't exist yet
      setTitle(fixedPage.title)
      if (isPlanosPage) {
        setEditorMode('raw')
        setRawJson(JSON.stringify({
          plans: [
            { id: 'free', name: 'Gratuito', price: 0 }
          ]
        }, null, 2))
      } else {
        setEditorMode('visual')
      }
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    
    let contentToSave = {}
    
    if (editorMode === 'visual') {
      contentToSave = { blocks }
    } else if (editorMode === 'raw') {
      try {
        contentToSave = JSON.parse(rawJson)
      } catch (e) {
        showAlert('Erro de Formato', 'O JSON inserido é inválido. Corrija-o antes de guardar.', 'error')
        setSaving(false)
        return
      }
    } else {
      contentToSave = { body: markdownBody }
    }

    const { error } = await supabase.from('cms_pages').upsert({
      slug: slug,
      title,
      description,
      is_published: isPublished,
      content: contentToSave,
      updated_at: new Date().toISOString()
    }, { onConflict: 'slug' })

    if (error) {
      console.error('Supabase Save Error:', error)
      showAlert('Erro', `Erro ao guardar a página: ${error.message || 'Erro desconhecido'}`, 'error')
    } else {
      showAlert('Sucesso', 'Página guardada com sucesso!', 'success')
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex justify-center p-24"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/paginas')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar: {page?.title || slug}</h1>
            <p className="text-muted-foreground text-sm">/{slug}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Alterações
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Meta / SEO */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-lg border-b pb-2 mb-4">Informação Base & SEO</h2>
          
          <div className="space-y-2">
            <Label>Título da Página (SEO H1)</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Termos e Condições" />
          </div>
          
          <div className="space-y-2">
            <Label>Descrição (SEO Meta Description)</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve resumo da página para os motores de busca..." />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <div>
              <Label className="font-bold cursor-pointer" onClick={() => setIsPublished(!isPublished)}>Publicar Página</Label>
              <p className="text-xs text-muted-foreground">Se inativo, a página mostrará um erro 404 ao público.</p>
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Conteúdo da Página</h2>
            <div className="flex bg-muted rounded-xl p-1">
              <button 
                onClick={() => setEditorMode('visual')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${editorMode === 'visual' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Blocos (Visual)
              </button>
              <button 
                onClick={() => setEditorMode('markdown')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${editorMode === 'markdown' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Markdown
              </button>
              <button 
                onClick={() => setEditorMode('raw')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${editorMode === 'raw' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Code className="w-3.5 h-3.5" /> JSON Raw
              </button>
            </div>
          </div>

          <div className="mt-4">
            {editorMode === 'visual' ? (
              <BlockBuilder blocks={blocks} onChange={setBlocks} />
            ) : editorMode === 'raw' ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">O formato JSON é usado para injetar dados estruturados (ex: tabelas de preços avançadas).</p>
                <Textarea 
                  value={rawJson} 
                  onChange={e => setRawJson(e.target.value)} 
                  className="min-h-[400px] font-mono text-xs bg-muted/30"
                />
              </div>
            ) : (
              <Textarea 
                value={markdownBody} 
                onChange={e => setMarkdownBody(e.target.value)} 
                className="min-h-[400px] leading-relaxed"
                placeholder="Escreva aqui o conteúdo da página..."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
