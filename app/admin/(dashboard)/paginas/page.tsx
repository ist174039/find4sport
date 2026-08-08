'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Edit3, Globe, EyeOff, Loader2 } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'

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

export default function AdminPagesList() {
  const router = useRouter()
  const { showAlert } = useModal()
  const [dbPages, setDbPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPages()
  }, [])

  async function loadPages() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cms_pages')
      .select('id, slug, is_published, updated_at')

    if (error) {
      console.error(error)
      showAlert('Erro', 'Não foi possível carregar o estado das páginas.', 'error')
    } else {
      setDbPages(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Páginas Institucionais (Conteúdo)</h1>
          <p className="text-muted-foreground mt-1">Gere o texto das páginas fixas do site.</p>
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="divide-y">
            {FIXED_PAGES.map((fixedPage) => {
              const dbRecord = dbPages.find(p => p.slug === fixedPage.slug)
              
              return (
                <div key={fixedPage.slug} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg">{fixedPage.title}</h3>
                      {dbRecord?.is_published ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Publicada
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 text-[10px] font-bold flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> {dbRecord ? 'Rascunho' : 'Vazia / Padrão'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">/{fixedPage.slug}</p>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="secondary" size="sm" className="flex-1 sm:flex-none" onClick={() => router.push(`/admin/paginas/${fixedPage.slug}`)}>
                      <Edit3 className="w-4 h-4 mr-2" /> Editar Conteúdo
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                      <a href={fixedPage.slug === 'planos' ? '/profissionais/planos' : `/${fixedPage.slug}`} target="_blank" rel="noreferrer">
                        Ver
                      </a>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
