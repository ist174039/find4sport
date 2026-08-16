import Link from 'next/link'
import { CMS_PAGES } from '@/lib/cms/registry'

const platformLinks = [
  { name: 'Profissionais', href: '/profissionais' },
  { name: 'Espaços', href: '/espacos' },
  { name: 'Eventos', href: '/eventos' },
  { name: 'Comunidades', href: '/comunidades' },
]

const professionalLinks = [
  { name: 'Registar como profissional', href: '/auth/registar/profissional' },
  { name: 'Planos e preços', href: '/profissionais/planos' },
  ...CMS_PAGES.filter(page => page.footerGroup === 'profissionais').map(page => ({ name: page.title, href: `/${page.slug}` })),
]

const companyLinks = CMS_PAGES.filter(page => page.footerGroup === 'empresa').map(page => ({ name: page.title, href: `/${page.slug}` }))
const legalLinks = CMS_PAGES.filter(page => page.footerGroup === 'legal').map(page => ({ name: page.title, href: `/${page.slug}` }))

function FooterColumn({ title, links }: { title: string; links: Array<{ name: string; href: string }> }) {
  return <div><h2 className="text-sm font-semibold text-foreground">{title}</h2><ul className="mt-4 space-y-3">{links.map(link => <li key={link.href}><Link href={link.href} className="inline-flex min-h-10 items-center text-sm text-muted-foreground transition-colors hover:text-primary">{link.name}</Link></li>)}</ul></div>
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20 pb-16 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_3fr]">
          <div>
            <Link href="/" className="inline-flex min-h-11 items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><span className="font-bold">F4S</span></div>
              <span className="text-xl font-bold tracking-tight">FIND<span className="text-primary">4</span>SPORT</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Descubra profissionais, espaços, eventos e comunidades desportivas numa única plataforma.</p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            <FooterColumn title="Plataforma" links={platformLinks} />
            <FooterColumn title="Profissionais" links={professionalLinks} />
            <FooterColumn title="Empresa" links={companyLinks} />
            <FooterColumn title="Legal" links={legalLinks} />
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground sm:text-sm">© {new Date().getFullYear()} FIND4SPORT. Todos os direitos reservados.</div>
      </div>
    </footer>
  )
}
