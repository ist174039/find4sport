'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Target, Eye, Heart, Shield, Award, Users } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

const values = [
  {
    icon: Target,
    title: 'Missão',
    description: 'Democratizar o acesso ao desporto em Portugal, conectando atletas e clientes aos melhores profissionais e espaços desportivos.',
  },
  {
    icon: Eye,
    title: 'Visão',
    description: 'Ser a plataforma de referência em Portugal para a descoberta e contratação de serviços desportivos até 2030.',
  },
  {
    icon: Heart,
    title: 'Paixão pelo Desporto',
    description: 'Acreditamos que o desporto transforma vidas. Cada funcionalidade é pensada para promover um estilo de vida ativo e saudável.',
  },
  {
    icon: Shield,
    title: 'Confiança',
    description: 'Priorizamos a segurança e transparência em todas as interações. Cada profissional é verificado e cada avaliação é genuína.',
  },
  {
    icon: Award,
    title: 'Excelência',
    description: 'Trabalhamos para oferecer a melhor experiência, desde a pesquisa até à reserva, com padrões de qualidade elevados.',
  },
  {
    icon: Users,
    title: 'Comunidade',
    description: 'Fomentamos uma comunidade vibrante onde atletas, profissionais e espaços colaboram e crescem juntos.',
  },
]

const timeline = [
  { year: '2024', title: 'Ideia e Fundação', description: 'A FIND4SPORT nasceu da necessidade de simplificar a conexão entre profissionais de desporto e clientes em Portugal.' },
  { year: '2025', title: 'Lançamento da Plataforma', description: 'Lançamento oficial da plataforma com as primeiras funcionalidades de pesquisa e reserva.' },
  { year: '2026', title: 'Crescimento e Expansão', description: 'Expansão para todo o território nacional e lançamento de novas funcionalidades como comunidades e eventos.' },
]

export default function SobrePage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Sobre Nós</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Acreditamos que o desporto é para todos. A nossa missão é tornar mais fácil encontrar
            o profissional ou espaço ideal para cada modalidade.
          </p>
        </div>

        {/* Story */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>A Nossa História</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              A FIND4SPORT nasceu em 2024 da constatação de que encontrar um personal trainer,
              um espaço para praticar desporto ou um evento desportivo em Portugal era
              surpreendentemente difícil. Não existia uma plataforma centralizada que agregasse
              toda a oferta desportiva do país.
            </p>
            <p className="mt-4 text-muted-foreground">
              Com experiência em tecnologia e paixão pelo desporto, a nossa equipa decidiu criar
              a solução que faltava: uma plataforma intuitiva, confiável e completa que conecta
              atletas, profissionais e espaços desportivos de norte a sul de Portugal.
            </p>
            <p className="mt-4 text-muted-foreground">
              Hoje, somos uma equipa dedicada a transformar o panorama desportivo nacional,
              tornando o desporto mais acessível e promovendo um estilo de vida ativo para todos
              os portugueses.
            </p>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="mt-12">
          <h2 className="mb-8 text-center text-2xl font-bold">A Nossa Trajetória</h2>
          <div className="space-y-6">
            {timeline.map((item, i) => (
              <div key={item.year} className="relative pl-8">
                <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {i + 1}
                </div>
                {i < timeline.length - 1 && (
                  <div className="absolute left-3 top-7 h-full w-0.5 bg-border" />
                )}
                <div>
                  <span className="text-sm font-bold text-primary">{item.year}</span>
                  <h3 className="mt-1 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mt-12">
          <h2 className="mb-8 text-center text-2xl font-bold">Os Nossos Valores</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <Card key={value.title}>
                  <CardContent className="pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-xl bg-gradient-to-br from-primary/10 to-teal-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">Queres fazer parte?</h2>
          <p className="mt-2 text-muted-foreground">
            Junta-te à comunidade FIND4SPORT e ajuda-nos a transformar o desporto em Portugal.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button asChild>
              <Link href="/profissionais/registar">Registar como Profissional</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contacto">Fala Connosco</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
