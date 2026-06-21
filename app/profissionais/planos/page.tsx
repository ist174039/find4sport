'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

const plans = [
  {
    name: 'Grátis',
    price: '0',
    description: 'Perfeito para começar',
    features: [
      'Perfil profissional básico',
      'Até 5 fotos na galeria',
      'Gestão de agenda manual',
      'Notificações por email',
      'Avaliações de clientes',
    ],
    notIncluded: [
      'Destaque nas pesquisas',
      'Estatísticas avançadas',
      'Suporte prioritário',
      'API de integração',
    ],
    cta: 'Começar Grátis',
    href: '/profissionais/registar',
    popular: false,
  },
  {
    name: 'Pro',
    price: '9,99',
    period: '/mês',
    description: 'Para profissionais a sério',
    features: [
      'Perfil profissional completo',
      'Fotos ilimitadas na galeria',
      'Gestão de agenda automática',
      'Notificações por email e SMS',
      'Avaliações de clientes',
      'Destaque nas pesquisas',
      'Estatísticas avançadas',
      'Suporte prioritário',
    ],
    notIncluded: [
      'API de integração',
      'Remoção da marca FIND4SPORT',
    ],
    cta: 'Assinar Pro',
    href: '/profissionais/registar',
    popular: true,
  },
  {
    name: 'Premium',
    price: '19,99',
    period: '/mês',
    description: 'Para profissionais de topo',
    features: [
      'Tudo do plano Pro',
      'API de integração',
      'Remoção da marca FIND4SPORT',
      'Perfil verificado com selo',
      'Prioridade máxima nas pesquisas',
      'Gestor de conta dedicado',
      'Relatórios mensais personalizados',
    ],
    notIncluded: [],
    cta: 'Assinar Premium',
    href: '/profissionais/registar',
    popular: false,
  },
]

export default function PlanosPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Planos e Preços</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Escolha o plano ideal para o seu negócio. Sem surpresas, cancele quando quiser.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col transition-shadow hover:shadow-lg ${
              plan.popular ? 'border-primary shadow-md' : ''
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white">
                Mais Popular
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}€</span>
                {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span>{f}</span>
                  </li>
                ))}
                {plan.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                    <span className="text-muted-foreground/60">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`mt-6 w-full ${
                  plan.popular ? 'bg-teal-600 hover:bg-teal-700' : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-muted/30 p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">Precisa de algo diferente?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Oferecemos planos personalizados para espaços desportivos e organizações.
        </p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/contacto">Fale Connosco</Link>
        </Button>
      </div>
      </div>
      <Footer />
    </>
  )
}
