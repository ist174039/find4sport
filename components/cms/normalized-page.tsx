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
  content?: string
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
        <div className="bg-background rounded-2xl shadow-xl border border-border p-6 md:p-12 overflow-hidden prose prose-slate prose-lg max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button variant="ghost" asChild>
            <Link href={backUrl}><ArrowLeft className="w-4 h-4 mr-2" /> {backText}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
