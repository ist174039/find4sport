'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight, Tag, User } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

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

export default function BlogPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Dicas, guias e novidades sobre desporto, bem-estar e a FIND4SPORT.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
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
                  <Calendar className="h-3 w-3" /> {post.date}
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

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">Mais artigos em breve. Subscreva a nossa newsletter para ser notificado.</p>
      </div>
    </div>
      <Footer />
    </>
  )
}
