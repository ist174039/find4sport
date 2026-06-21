import { SearchBar } from '@/components/search-bar'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[500px] w-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(20,184,166,0.15),transparent)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Plataforma #1 em Portugal
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Encontre o{' '}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              profissional de desporto
            </span>{' '}
            ideal para si
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Descubra personal trainers, espacos desportivos e eventos perto de si. 
            A plataforma portuguesa que conecta atletas a profissionais de excelencia.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-10 max-w-2xl">
            <SearchBar
              variant="hero"
              placeholder="O que procura? (ex: Personal Trainer, Yoga, Ginasio...)"
              showLocation
            />
          </div>

          {/* Popular Searches */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Pesquisas populares:</span>
            {['Personal Trainer', 'Yoga', 'Ginasio', 'Natacao'].map((term) => (
              <a
                key={term}
                href={`/pesquisa?q=${encodeURIComponent(term.toLowerCase())}`}
                className="rounded-full border border-border bg-background px-4 py-1.5 font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                {term}
              </a>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-10">
            {[
              { value: '2.500+', label: 'Profissionais' },
              { value: '850+', label: 'Espacos' },
              { value: '15.000+', label: 'Utilizadores' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
