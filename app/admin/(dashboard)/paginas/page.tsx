'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Edit3, Eye, EyeOff, Globe, Loader2 } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'
import { CMS_PAGES } from '@/lib/cms/registry'

export default function AdminPagesList() {
  const { showAlert } = useModal()
  const [dbPages, setDbPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPages() {
      const supabase = createClient()
      const { data, error } = await supabase.from('cms_pages').select('slug, is_published, updated_at')
      if (error) showAlert('Erro', 'Não foi possível carregar o estado das páginas.', 'error')
      setDbPages(data || [])
      setLoading(false)
    }
    loadPages()
  }, [showAlert])

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold sm:text-3xl">Conteúdo institucional</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Edite apenas páginas institucionais reais. Planos, blog, empregos e dados operacionais são geridos nos respetivos módulos.</p>
      </header>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> : <div className="grid gap-3">
        {CMS_PAGES.map(definition => {
          const record = dbPages.find(page => page.slug === definition.slug)
          return <article key={definition.slug} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{definition.title}</h2>
                {record?.is_published ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400"><Globe className="h-3 w-3" />Publicada</span> : <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400"><EyeOff className="h-3 w-3" />{record ? 'Rascunho' : 'Por configurar'}</span>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{definition.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">/{definition.slug}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button asChild variant="secondary" className="min-h-11"><Link href={`/admin/paginas/${definition.slug}`}><Edit3 className="mr-2 h-4 w-4" />Editar</Link></Button>
              <Button asChild variant="outline" className="min-h-11" disabled={!record?.is_published}><Link href={`/${definition.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" />Ver</Link></Button>
            </div>
          </article>
        })}
      </div>}
    </div>
  )
}
