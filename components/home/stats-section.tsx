import { Users, MapPin, Calendar, Star } from 'lucide-react'

const stats = [
  { label: 'Profissionais Ativos', value: '2.500+', icon: Users },
  { label: 'Espacos Desportivos', value: '1.200+', icon: MapPin },
  { label: 'Eventos Mensais', value: '500+', icon: Calendar },
  { label: 'Avaliacoes', value: '15.000+', icon: Star },
]

export function StatsSection() {
  return (
    <section className="border-y border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
