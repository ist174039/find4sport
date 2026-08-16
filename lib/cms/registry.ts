export type CmsPageSlug =
  | 'sobre'
  | 'como-funciona'
  | 'recursos'
  | 'contacto'
  | 'termos'
  | 'privacidade'
  | 'cookies'

export type CmsPageDefinition = {
  slug: CmsPageSlug
  title: string
  description: string
  footerGroup: 'profissionais' | 'empresa' | 'legal'
}

export const CMS_PAGES: CmsPageDefinition[] = [
  {
    slug: 'como-funciona',
    title: 'Como Funciona',
    description: 'Explica o funcionamento da Find4Sport para atletas, profissionais e espaços.',
    footerGroup: 'profissionais',
  },
  {
    slug: 'recursos',
    title: 'Recursos e Ajuda',
    description: 'Conteúdo de ajuda e orientação para utilização da plataforma.',
    footerGroup: 'profissionais',
  },
  {
    slug: 'sobre',
    title: 'Sobre Nós',
    description: 'Missão, visão e informação institucional da Find4Sport.',
    footerGroup: 'empresa',
  },
  {
    slug: 'contacto',
    title: 'Contacto',
    description: 'Canais oficiais de contacto e suporte.',
    footerGroup: 'empresa',
  },
  {
    slug: 'termos',
    title: 'Termos de Serviço',
    description: 'Termos e condições de utilização da plataforma.',
    footerGroup: 'legal',
  },
  {
    slug: 'privacidade',
    title: 'Privacidade e RGPD',
    description: 'Política de privacidade e informação sobre proteção de dados pessoais.',
    footerGroup: 'legal',
  },
  {
    slug: 'cookies',
    title: 'Política de Cookies',
    description: 'Informação sobre cookies e tecnologias semelhantes.',
    footerGroup: 'legal',
  },
]

export const CMS_PAGE_MAP = new Map(CMS_PAGES.map(page => [page.slug, page]))

export function getCmsPage(slug: string) {
  return CMS_PAGE_MAP.get(slug as CmsPageSlug) || null
}
