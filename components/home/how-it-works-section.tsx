import { Search, UserCheck, MessageCircle, Star } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Pesquise',
    description: 'Encontre profissionais, espacos ou eventos na sua area usando a nossa pesquisa inteligente.',
  },
  {
    icon: UserCheck,
    title: 'Compare',
    description: 'Analise perfis, avaliacoes e servicos para encontrar a opcao perfeita para si.',
  },
  {
    icon: MessageCircle,
    title: 'Contacte',
    description: 'Entre em contacto diretamente com profissionais ou reserve espacos e eventos.',
  },
  {
    icon: Star,
    title: 'Avalie',
    description: 'Partilhe a sua experiencia e ajude outros utilizadores a encontrar os melhores servicos.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Como Funciona
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Encontrar o profissional ou espaco ideal e simples e rapido
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="relative text-center">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-border lg:block" />
                )}
                
                {/* Step Number & Icon */}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="h-7 w-7" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                    {index + 1}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
