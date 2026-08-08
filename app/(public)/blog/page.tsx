'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight, User, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

// Static blog posts for now
const posts = [
  {
    slug: 'como-escolher-personal-trainer',
    title: 'Como Escolher o Personal Trainer Ideal para Si',
    excerpt: 'Descubra os fatores mais importantes a considerar na escolha de um personal trainer e como a FIND4SPORT pode ajudar.',
    author: 'Equipa FIND4SPORT',
    date: '2026-05-28',
    readTime: '5 min',
    category: 'Dicas',
  },
  {
    slug: 'beneficios-treino-ao-ar-livre',
    title: 'Benefícios do Treino ao Ar Livre: Guia Completo',
    excerpt: 'Conheça todas as vantagens de praticar exercício ao ar livre e encontre o espaço perfeito para os seus treinos.',
    author: 'Equipa FIND4SPORT',
    date: '2026-05-20',
    readTime: '7 min',
    category: 'Saúde',
  },
  {
    slug: 'espacos-desportivos-lisboa-2026',
    title: 'Melhores Espaços Desportivos em Lisboa em 2026',
    excerpt: 'Guia atualizado com os melhores espaços desportivos em Lisboa para diversas modalidades.',
    author: 'Equipa FIND4SPORT',
    date: '2026-05-12',
    readTime: '8 min',
    category: 'Guias',
  },
]

function parseReadTime(value: string): number {
  const number = Number(value.replace(/[^\d]/g, ''))
  return Number.isFinite(number) ? number : 0
}

function formatDateToPt(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export default function BlogPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('Todas')
  const [sortBy, setSortBy] = useState<'recentes' | 'leitura'>('recentes')

  const categories = useMemo(() => {
    const values = Array.from(new Set(posts.map((post) => post.category)))
    return ['Todas', ...values]
  }, [])

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    let list = posts.filter((post) => {
      const categoryMatch = activeCategory === 'Todas' || post.category === activeCategory
      if (!categoryMatch) return false
      if (!normalized) return true

      const haystack = [post.title, post.excerpt, post.author, post.category].join(' ').toLowerCase()
      return haystack.includes(normalized)
    })

    list = [...list].sort((a, b) => {
      if (sortBy === 'leitura') {
        return parseReadTime(b.readTime) - parseReadTime(a.readTime)
      }

      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return list
  }, [query, activeCategory, sortBy])

  const featuredPost = filteredPosts[0]
  const remainingPosts = filteredPosts.slice(1)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Dicas, guias e novidades sobre desporto, bem-estar e a FIND4SPORT.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1.8fr,1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar no blog..."
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recentes' | 'leitura')}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
          >
            <option value="recentes">Mais recentes</option>
            <option value="leitura">Leitura mais longa</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${activeCategory === category ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-muted-foreground hover:text-foreground'}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {featuredPost && (
        <article className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="flex min-h-[220px] flex-col justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
              <div>
                <p className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> Em destaque
                </p>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-foreground">{featuredPost.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{featuredPost.excerpt}</p>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{featuredPost.category}</span>
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {featuredPost.author}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDateToPt(featuredPost.date)}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {featuredPost.readTime}</span>
              </div>
            </div>
            <div className="flex items-center justify-center border-t border-border p-6 md:border-l md:border-t-0 md:p-8">
              <Button asChild size="lg" className="w-full md:w-auto">
                <Link href={`/blog/${featuredPost.slug}`}>
                  Ler artigo em destaque <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </article>
      )}

      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {remainingPosts.map((post) => (
          <Card key={post.slug} className="flex flex-col transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                  {post.category}
                </span>
              </div>
              <CardTitle className="mt-2 text-lg leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {formatDateToPt(post.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {post.readTime}
                </span>
              </div>
              <Button variant="link" asChild className="mt-4 h-auto p-0 text-sm">
                <Link href={`/blog/${post.slug}`}>
                  Ler mais <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Não encontrámos artigos para os filtros selecionados.
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">Mais artigos em breve. Subscreva a nossa newsletter para ser notificado.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/contacto">Quero receber novidades</Link>
        </Button>
      </div>
    </div>
  )
}
