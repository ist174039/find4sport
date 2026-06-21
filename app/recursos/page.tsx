'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, Video, FileText, Download, ExternalLink, ArrowRight } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

const categories = [
  {
    title: 'Guias de Iniciação',
    icon: BookOpen,
    items: [
      { title: 'Guia de Registo para Profissionais', description: 'Passo a passo para criar o seu perfil profissional na FIND4SPORT.' },
      { title: 'Como Criar o Perfil Perfeito', description: 'Dicas para destacar o seu perfil e atrair mais clientes.' },
      { title: 'Guia de Registo de Espaços', description: 'Tudo o que precisa para registar o seu espaço desportivo.' },
    ],
  },
  {
    title: 'Tutoriais em Vídeo',
    icon: Video,
    items: [
      { title: 'Tour pela Plataforma', description: 'Conheça todas as funcionalidades da FIND4SPORT.' },
      { title: 'Como Gerir a sua Agenda', description: 'Aprenda a gerir a sua disponibilidade e reservas.' },
      { title: 'Como Utilizar o Dashboard', description: 'Explore as métricas e ferramentas do seu painel.' },
    ],
  },
  {
    title: 'Documentação',
    icon: FileText,
    items: [
      { title: 'Termos de Serviço para Profissionais', description: 'Condições específicas para prestadores de serviços.' },
      { title: 'Política de Cancelamentos', description: 'Como gerir cancelamentos e reembolsos na plataforma.' },
      { title: 'Guia de Pagamentos e Comissões', description: 'Entenda como funcionam os pagamentos e taxas.' },
    ],
  },
]

export default function RecursosPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Recursos</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Guias, tutoriais e documentação para aproveitar ao máximo a plataforma FIND4SPORT.
        </p>
      </div>

      <div className="mt-12 space-y-10">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <div key={category.title}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{category.title}</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <Card key={item.title} className="transition-shadow hover:shadow-md">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      <Button variant="link" className="mt-3 h-auto p-0 text-sm">
                        Saber mais <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
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
                { name: 'Kit de Boas-Vindas', format: 'PDF, 2.4 MB' },
                { name: 'Manual do Profissional', format: 'PDF, 5.1 MB' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.format}</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
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
      <Footer />
    </>
  )
}
