import Link from 'next/link'
import { ArrowRight, UserPlus, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CTASectionProps {
  isLoggedIn: boolean
}

export function CTASection({ isLoggedIn }: CTASectionProps) {
  return (
    <section className="bg-primary py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* For Professionals */}
          <div className="rounded-2xl bg-primary-foreground/10 p-8 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/20">
              <UserPlus className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-primary-foreground sm:text-2xl">
              E Profissional de Desporto?
            </h3>
            <p className="mt-3 text-primary-foreground/80">
              Junte-se a milhares de profissionais que ja usam o FIND4SPORT para 
              expandir a sua base de clientes e gerir a sua presenca online.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                Perfil profissional gratuito
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                Gestao de avaliacoes e contactos
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                Estatisticas e visibilidade
              </li>
            </ul>
            <Button
              asChild
              variant="secondary"
              className="mt-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link href={isLoggedIn ? '/profissionais/registar' : '/auth/registar?tipo=profissional'}>
                Registar como Profissional
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* For Space Owners */}
          <div className="rounded-2xl bg-primary-foreground/10 p-8 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/20">
              <Building className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-primary-foreground sm:text-2xl">
              Tem um Espaco Desportivo?
            </h3>
            <p className="mt-3 text-primary-foreground/80">
              Reivindique o seu espaco ou adicione um novo para aumentar a visibilidade 
              e atrair novos clientes para o seu negocio.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                Gestao completa do perfil
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                Promocao de eventos
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                Conexao com profissionais
              </li>
            </ul>
            <Button
              asChild
              variant="secondary"
              className="mt-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link href="/espacos/adicionar">
                Adicionar Espaco
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
