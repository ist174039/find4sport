'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { BookOpen, Video, FileText, Download, ArrowRight, Search } from 'lucide-react'

type ResourceType = 'guia' | 'video' | 'documentacao'

type ResourceItem = {
  title: string
  description: string
  href: string
  type: ResourceType
}

const categories = [
  {
    title: 'Guias de Iniciação',
    icon: BookOpen,
    items: [
      { title: 'Guia de Registo para Profissionais', description: 'Passo a passo para criar o seu perfil profissional na FIND4SPORT.', href: '/profissionais/registar', type: 'guia' as const },
      { title: 'Como Criar o Perfil Perfeito', description: 'Dicas para destacar o seu perfil e atrair mais clientes.', href: '/como-funciona', type: 'guia' as const },
      { title: 'Guia de Registo de Espaços', description: 'Tudo o que precisa para registar o seu espaço desportivo.', href: '/auth/registar/espaco', type: 'guia' as const },
    ],
  },
  {
    title: 'Tutoriais em Vídeo',
    icon: Video,
    items: [
      { title: 'Tour pela Plataforma', description: 'Conheça todas as funcionalidades da FIND4SPORT.', href: '/dashboard', type: 'video' as const },
      { title: 'Como Gerir a sua Agenda', description: 'Aprenda a gerir a sua disponibilidade e reservas.', href: '/dashboard/agenda', type: 'video' as const },
      { title: 'Como Utilizar o Dashboard', description: 'Explore as métricas e ferramentas do seu painel.', href: '/dashboard', type: 'video' as const },
    ],
  },
  {
    title: 'Documentação',
    icon: FileText,
    items: [
      { title: 'Termos de Serviço para Profissionais', description: 'Condições específicas para prestadores de serviços.', href: '/termos', type: 'documentacao' as const },
      { title: 'Política de Privacidade', description: 'Como tratamos dados pessoais e obrigações de privacidade.', href: '/privacidade', type: 'documentacao' as const },
      { title: 'Guia de Pagamentos e Comissões', description: 'Entenda como funcionam os pagamentos e taxas.', href: '/termos', type: 'documentacao' as const },
    ],
  },
]

const typeOptions: Array<{ id: ResourceType | 'all'; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'guia', label: 'Guias' },
  { id: 'video', label: 'Vídeos' },
  { id: 'documentacao', label: 'Documentação' },
]

export default function RecursosPage() {
  const [query, setQuery] = useState('')
  const [activeType, setActiveType] = useState<ResourceType | 'all'>('all')

  const flatResources = useMemo<ResourceItem[]>(() => {
    return categories.flatMap((category) => category.items)
  }, [])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return flatResources.filter((item) => {
      const typeMatch = activeType === 'all' || item.type === activeType
      if (!typeMatch) return false
      if (!normalized) return true
      return item.title.toLowerCase().includes(normalized) || item.description.toLowerCase().includes(normalized)
    })
  }, [flatResources, query, activeType])

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Recursos</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Guias, tutoriais e documentação para aproveitar ao máximo a plataforma FIND4SPORT.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar recursos (ex: pagamentos, agenda, registo)..."
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setActiveType(option.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${activeType === option.id ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-muted-foreground hover:text-foreground'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 space-y-10">
        {categories.map((category) => {
          const Icon = category.icon
          const categoryItems = category.items.filter((item) => filtered.some((f) => f.title === item.title))
          if (categoryItems.length === 0) return null

          return (
            <div key={category.title}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{category.title}</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryItems.map((item) => (
                  <Card key={item.title} className="transition-shadow hover:shadow-md">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      <Button variant="link" asChild className="mt-3 h-auto p-0 text-sm">
                        <Link href={item.href}>
                          Saber mais <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Não encontrámos recursos para essa pesquisa.
          </p>
        )}
      </div>

      {/* Downloads */}
      <div className="mt-12">
        <Card className="bg-gradient-to-br from-primary/10 to-teal-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" /> Transferências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { name: 'Kit de Boas-Vindas', format: 'PDF, 2.4 MB', href: '/como-funciona' },
                { name: 'Manual do Profissional', format: 'PDF, 5.1 MB', href: '/profissionais/planos' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.format}</p>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={item.href} aria-label={`Abrir ${item.name}`}>
                      <Download className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Precisa de ajuda?{' '}
          <Link href="/contacto" className="font-medium text-primary hover:underline">
            Contacte o nosso suporte
          </Link>
        </p>
      </div>
    </div>
  )
}
