'use client'

import Link from 'next/link'
import { ArrowLeft, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function NormalizedContentPage({ title, description, content, loading, error, backUrl = '/', backText = 'Voltar à página inicial' }: {
  title?: string
  description?: string
  content?: any
  loading: boolean
  error?: string | null
  backUrl?: string
  backText?: string
}) {
  if (loading) return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><Loader2 className="h-10 w-10 animate-spin text-primary" /><p className="text-muted-foreground">A carregar conteúdo...</p></div>

  const blocks = Array.isArray(content?.blocks) ? content.blocks.filter((block: any) => ['hero', 'text', 'image'].includes(block?.type)) : []
  const legacyBody = typeof content === 'string' ? content : content?.body
  const hasContent = blocks.length > 0 || Boolean(legacyBody)

  if (error || !hasContent) {
    return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center"><FileText className="h-16 w-16 text-muted-foreground/20" /><h1 className="text-2xl font-bold">Página não encontrada</h1><p className="max-w-md text-muted-foreground">{error || 'Este conteúdo ainda não está disponível.'}</p><Button asChild><Link href={backUrl}><ArrowLeft className="mr-2 h-4 w-4" />{backText}</Link></Button></div>
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 sm:py-14">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">{title}</h1>
          {description && <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>}
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        {blocks.length > 0 ? blocks.map((block: any) => {
          if (block.type === 'hero') return <section key={block.id} className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-10">{block.data?.title && <h2 className="text-2xl font-bold sm:text-3xl">{block.data.title}</h2>}{block.data?.subtitle && <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{block.data.subtitle}</p>}{block.data?.ctaText && block.data?.ctaLink && <Button asChild className="mt-6 min-h-11"><Link href={block.data.ctaLink}>{block.data.ctaText}</Link></Button>}</section>
          if (block.type === 'text') return <section key={block.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8"><div className="prose prose-slate max-w-none dark:prose-invert"><ReactMarkdown remarkPlugins={[remarkGfm]}>{block.data?.content || ''}</ReactMarkdown></div></section>
          if (block.type === 'image' && block.data?.url) return <figure key={block.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><img src={block.data.url} alt={block.data?.alt || ''} className="h-auto max-h-[640px] w-full object-cover" /></figure>
          return null
        }) : <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8"><div className="prose prose-slate max-w-none dark:prose-invert"><ReactMarkdown remarkPlugins={[remarkGfm]}>{legacyBody || ''}</ReactMarkdown></div></section>}

        <div className="pt-2 text-center"><Button variant="ghost" asChild className="min-h-11"><Link href={backUrl}><ArrowLeft className="mr-2 h-4 w-4" />{backText}</Link></Button></div>
      </main>
    </div>
  )
}
