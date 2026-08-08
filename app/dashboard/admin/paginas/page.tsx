'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Edit3, Globe, EyeOff, Loader2 } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'

export default function AdminPagesList() {
  const router = useRouter()
  const { showAlert } = useModal()
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPages()
  }, [])

  async function loadPages() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cms_pages')
      .select('id, slug, title, is_published, updated_at')
      .order('slug', { ascending: true })

    if (error) {
      console.error(error)
      showAlert('Erro', 'Não foi possível carregar as páginas do CMS.', 'error')
    } else {
      setPages(data || [])
    }
    setLoading(false)
  }

  const handleCreateNew = async () => {
    const slug = prompt('Qual o slug da nova página? (ex: sobre, termos, faq)')
    if (!slug) return
    
    const formattedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    
    const supabase = createClient()
    const { data, error } = await supabase.from('cms_pages').insert({
      slug: formattedSlug,
      title: 'Nova Página',
      is_published: false,
      content: { body: '' }
    }).select().single()

    if (error) {
      if (error.code === '23505') showAlert('Erro', 'Já existe uma página com esse slug.', 'error')
      else showAlert('Erro', 'Erro ao criar página.', 'error')
    } else {
      router.push(`/dashboard/admin/paginas/${data.slug}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Páginas Dinâmicas (CMS)</h1>
          <p className="text-muted-foreground mt-1">Gerencie o conteúdo das páginas institucionais e legais.</p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Página
        </Button>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : pages.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p>Ainda não existem páginas criadas no CMS.</p>
            <Button variant="outline" className="mt-4" onClick={handleCreateNew}>Criar a Primeira Página</Button>
          </div>
        ) : (
          <div className="divide-y">
            {pages.map((page) => (
              <div key={page.id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-muted/50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg">{page.title}</h3>
                    {page.is_published ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Publicada
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 text-[10px] font-bold flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Rascunho
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">/{page.slug}</p>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="secondary" size="sm" className="flex-1 sm:flex-none" onClick={() => router.push(`/dashboard/admin/paginas/${page.slug}`)}>
                    <Edit3 className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                    <a href={`/${page.slug}`} target="_blank" rel="noreferrer">
                      Ver no Site
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
