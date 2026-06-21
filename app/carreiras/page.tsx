'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Briefcase, Code, Users, Star, MapPin, Clock, Mail } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

const openPositions = [
  {
    title: 'Desenvolvedor Full Stack',
    department: 'Engenharia',
    location: 'Lisboa / Remoto',
    type: 'Tempo Integral',
    description: 'Procuramos um desenvolvedor apaixonado por tecnologia para ajudar a construir e escalar a nossa plataforma.',
    icon: Code,
  },
  {
    title: 'Community Manager',
    department: 'Marketing',
    location: 'Lisboa',
    type: 'Tempo Integral',
    description: 'Gerir e fazer crescer a nossa comunidade de atletas, profissionais e espaços desportivos.',
    icon: Users,
  },
  {
    title: 'Designer UX/UI',
    department: 'Design',
    location: 'Lisboa / Remoto',
    type: 'Tempo Integral',
    description: 'Criar experiências intuitivas e agradáveis para todos os utilizadores da plataforma.',
    icon: Star,
  },
]

const benefits = [
  { icon: MapPin, title: 'Trabalho Híbrido', description: 'Flexibilidade entre escritório e trabalho remoto' },
  { icon: Clock, title: 'Horário Flexível', description: 'Adaptamos o horário às tuas necessidades' },
  { icon: Briefcase, title: 'Formação Contínua', description: 'Orçamento anual para desenvolvimento profissional' },
  { icon: Star, title: 'Desporto Incluído', description: 'Acesso a instalações e eventos desportivos' },
]

export default function CarreirasPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Trabalha Connosco</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Junta-te à equipa que está a transformar o desporto em Portugal. Procuramos
          pessoas apaixonadas por tecnologia e desporto.
        </p>
      </div>

      {/* Why join us */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">Porquê a FIND4SPORT?</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <Card key={benefit.title}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Open positions */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">Posições Abertas</h2>
        <div className="space-y-4">
          {openPositions.length > 0 ? (
            openPositions.map((position) => {
              const Icon = position.icon
              return (
                <Card key={position.title}>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{position.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {position.department}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" /> {position.location}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" /> {position.type}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{position.description}</p>
                      <div className="mt-4">
                        <Button size="sm" variant="outline" asChild>
                          <a href="mailto:careers@find4sport.pt?subject=Candidatura: Candidatura Espontânea">
                            <Mail className="mr-2 h-4 w-4" /> Candidatar-me
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-semibold text-foreground">Nenhuma vaga aberta de momento</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Mas estamos sempre à procura de talento! Envia-nos uma candidatura espontânea.
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <a href="mailto:careers@find4sport.pt">
                      <Mail className="mr-2 h-4 w-4" /> Candidatura Espontânea
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-xl bg-gradient-to-br from-primary/10 to-teal-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Não encontraste o que procuras?</h2>
        <p className="mt-2 text-muted-foreground">
          Envia-nos uma candidatura espontânea. Estamos sempre abertos a conhecer novos talentos.
        </p>
        <div className="mt-6">
          <Button asChild>
            <a href="mailto:careers@find4sport.pt">
              <Mail className="mr-2 h-4 w-4" /> candidatura@find4sport.pt
            </a>
          </Button>
        </div>
      </div>
      </div>
      <Footer />
    </>
  )
}
