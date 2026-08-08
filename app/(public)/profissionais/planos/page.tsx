import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import PlanosClient from './planos-client'

export default async function PlanosPage() {
  const supabase = await createClient()
  
  // Try to get dynamic plans from CMS
  const { data } = await supabase
    .from('cms_pages')
    .select('content')
    .eq('slug', 'planos')
    .single()

  const defaultPlans = [
    {
      name: 'Grátis',
      monthlyPrice: 0,
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
    },
    {
      name: 'Pro',
      monthlyPrice: 9.99,
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
      basePopular: true,
    },
    {
      name: 'Premium',
      monthlyPrice: 19.99,
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
      basePopular: false,
    },
  ]

  // If no CMS data, fallback to default plans
  const cmsPlans = data?.content?.plans || defaultPlans
  const header = data?.content?.header || "Planos e Preços"
  const subheader = data?.content?.subheader || "Escolha o plano ideal para o seu negócio. Transparente, escalável e sem fidelização."

  return <PlanosClient initialPlans={cmsPlans} header={header} subheader={subheader} />
}
