'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function NormalizedContentPage({ 
  title, 
  description, 
  content, 
  loading, 
  error,
  backUrl = '/',
  backText = 'Voltar à página inicial'
}: { 
  title?: string
  description?: string
  content?: any
  loading: boolean
  error?: string | null
  backUrl?: string
  backText?: string
}) {

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">A carregar conteúdo...</p>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <FileText className="w-16 h-16 text-muted-foreground opacity-20" />
        <h1 className="text-2xl font-bold">Página não encontrada</h1>
        <p className="text-muted-foreground max-w-md">
          {error || 'O conteúdo que procura não está disponível de momento ou ainda não foi publicado.'}
        </p>
        <Button asChild className="mt-4">
          <Link href={backUrl}><ArrowLeft className="w-4 h-4 mr-2" /> {backText}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      {/* Hero Header */}
      <div className="bg-card border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {content && typeof content === 'object' && Array.isArray(content.blocks) ? (
          <div className="space-y-12">
            {content.blocks.map((block: any) => {
              if (block.type === 'hero') {
                return (
                  <div key={block.id} className="text-center py-12">
                    {block.data.title && <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">{block.data.title}</h2>}
                    {block.data.subtitle && <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">{block.data.subtitle}</p>}
                    {block.data.ctaText && block.data.ctaLink && (
                      <Button asChild size="lg" className="px-8 rounded-full">
                        <Link href={block.data.ctaLink}>{block.data.ctaText}</Link>
                      </Button>
                    )}
                  </div>
                )
              }
              if (block.type === 'text') {
                return (
                  <div key={block.id} className="bg-background rounded-2xl shadow-sm border border-border p-6 md:p-12 overflow-hidden prose prose-slate prose-lg max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {block.data.content}
                    </ReactMarkdown>
                  </div>
                )
              }
              if (block.type === 'image') {
                return (
                  <div key={block.id} className="rounded-2xl overflow-hidden shadow-xl border border-border">
                    <img src={block.data.url} alt={block.data.alt || 'Imagem'} className="w-full h-auto object-cover max-h-[600px]" />
                  </div>
                )
              }
              if (block.type === 'features') {
                return (
                  <div key={block.id} className="py-8">
                    {block.data.title && <h3 className="text-2xl font-bold text-center mb-8">{block.data.title}</h3>}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Placeholder for features grid */}
                      <div className="bg-card p-6 rounded-xl border border-border text-center"><p className="text-muted-foreground">Funcionalidade 1</p></div>
                      <div className="bg-card p-6 rounded-xl border border-border text-center"><p className="text-muted-foreground">Funcionalidade 2</p></div>
                      <div className="bg-card p-6 rounded-xl border border-border text-center"><p className="text-muted-foreground">Funcionalidade 3</p></div>
                    </div>
                  </div>
                )
              }
              if (block.type === 'pricing') {
                return (
                  <div key={block.id} className="bg-primary/5 rounded-2xl border border-primary/20 p-8 text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-2">Planos e Preços</h3>
                    <p className="text-muted-foreground mb-6">Módulo de preços integrado com Stripe será carregado aqui.</p>
                    <Button variant="outline" asChild><Link href="/profissionais/planos">Ver Planos</Link></Button>
                  </div>
                )
              }
              if (block.type === 'jobs') {
                return (
                  <div key={block.id} className="bg-card rounded-2xl border border-border p-8">
                    <h3 className="text-2xl font-bold text-foreground mb-6">Ofertas de Trabalho</h3>
                    <div className="space-y-4 text-center py-12 text-muted-foreground">
                      Nenhuma vaga disponível neste momento.
                    </div>
                  </div>
                )
              }
              return null
            })}
          </div>
        ) : (
          <div className="bg-background rounded-2xl shadow-xl border border-border p-6 md:p-12 overflow-hidden prose prose-slate prose-lg max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {typeof content === 'string' ? content : content?.body || ''}
            </ReactMarkdown>
          </div>
        )}
        
        <div className="mt-8 flex justify-center">
          <Button variant="ghost" asChild>
            <Link href={backUrl}><ArrowLeft className="w-4 h-4 mr-2" /> {backText}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
