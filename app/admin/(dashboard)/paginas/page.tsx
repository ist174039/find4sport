'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Edit3, Eye, EyeOff, Globe, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useModal } from '@/components/providers/modal-provider'
import { CMS_PAGES } from '@/lib/cms/registry'
import { DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'

type CmsPageState = {
  slug: string
  is_published: boolean | null
  updated_at: string | null
}

export default function AdminPagesList() {
  const { showAlert } = useModal()
  const [dbPages, setDbPages] = useState<CmsPageState[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPages() {
      const supabase = createClient()
      const { data, error } = await supabase.from('cms_pages').select('slug, is_published, updated_at')
      if (error) showAlert('Erro', 'Não foi possível carregar o estado das páginas.', 'error')
      setDbPages((data || []) as CmsPageState[])
      setLoading(false)
    }
    void loadPages()
  }, [showAlert])

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Conteúdo institucional"
        description="Gere apenas páginas institucionais. Planos, blog, empregos e dados operacionais continuam nos respetivos módulos."
      />

      <DashboardSection
        title="Páginas públicas"
        description="Cada página usa uma estrutura simples e previsível, com estado de publicação visível antes de editar."
      >
        {loading ? (
          <div className="flex justify-center py-16" role="status" aria-label="A carregar páginas">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-3">
            {CMS_PAGES.map(definition => {
              const record = dbPages.find(page => page.slug === definition.slug)
              return (
                <article
                  key={definition.slug}
                  className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words font-semibold">{definition.title}</h2>
                      {record?.is_published ? (
                        <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <Globe className="h-3 w-3" />Publicada
                        </span>
                      ) : (
                        <span className="inline-flex min-h-7 items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                          <EyeOff className="h-3 w-3" />{record ? 'Rascunho' : 'Por configurar'}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">{definition.description}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">/{definition.slug}</p>
                  </div>

                  <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                    <Button asChild variant="secondary" className="min-h-11">
                      <Link href={`/admin/paginas/${definition.slug}`}><Edit3 className="mr-2 h-4 w-4" />Editar</Link>
                    </Button>
                    <Button asChild variant="outline" className="min-h-11" disabled={!record?.is_published}>
                      <Link href={`/${definition.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" />Ver</Link>
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </DashboardSection>
    </DashboardPage>
  )
}
