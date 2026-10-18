import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NormalizedContentPage } from '@/components/cms/normalized-page'

const PRIVACY_FALLBACK = `# Informação de privacidade\n\n**Estado:** informação-base da aplicação, a completar e aprovar pelo responsável pelo tratamento antes de ser apresentada como política legal definitiva.\n\n## Dados e finalidades observáveis na aplicação\n\nA Find4Sport utiliza dados de conta e perfil (como nome, email, fotografia e função), dados necessários a serviços de marketplace (reservas, eventos, mensagens, pagamentos e faturação), conteúdos e interações (publicações, avaliações, comunidades e denúncias), dados técnicos de sessão e segurança e, apenas após autorização do utilizador, localização aproximada para ordenar resultados próximos.\n\nOs dados são tratados para criar e proteger contas, disponibilizar pesquisa e funcionalidades sociais, gerir reservas e pagamentos, prestar suporte, prevenir abuso, cumprir obrigações legais e manter a segurança. Os dados de pagamento são processados por prestadores de pagamento; a aplicação armazena referências e registos necessários à operação e reconciliação.\n\n## Localização\n\nA localização do dispositivo só deve ser obtida depois de uma ação explícita do utilizador. A coordenada aproximada é guardada no browser num cookie temporário de 30 minutos para ordenar resultados; pode ser removida nas definições de cookies do browser e a permissão pode ser revogada nas definições do dispositivo.\n\n## Direitos e pedidos\n\nPode solicitar acesso, retificação, apagamento, limitação, oposição e portabilidade quando aplicável, bem como retirar consentimento sem afetar o tratamento anterior. Use os controlos de conta para desativar ou pedir eliminação, ou contacte o responsável através dos contactos oficiais indicados na página de contacto. Pedidos que envolvam reservas, pagamentos, prevenção de fraude ou obrigações legais podem exigir retenção limitada ou anonimização em vez de apagamento imediato. Pode apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD).\n\n## Informação a completar pelo responsável\n\nAntes da publicação definitiva, o responsável deve identificar nome legal, morada, email de privacidade, contacto do EPD/DPO (se designado), bases legais por finalidade, prazos de retenção por categoria, lista de subcontratantes e países de tratamento, transferências internacionais e salvaguardas, critérios de decisões automatizadas, processo e prazo de resposta a pedidos e data de entrada em vigor. Esta página não substitui essa validação.\n\n**Última revisão técnica:** 18-10-2026.`

const COOKIES_FALLBACK = String.raw`# Cookies e armazenamento local\n\n**Estado:** inventário técnico inicial; confirmar com uma inspeção do browser em produção e completar a aprovação do responsável antes de tratar esta página como política definitiva.\n\n## Tecnologias observadas\n\n- Cookies de sessão Supabase, necessários à autenticação e segurança da sessão.\n- Cookie próprio \u0060f4s_geo\u0060 com coordenadas aproximadas, duração de 30 minutos, escrito apenas após o utilizador acionar “Perto de mim”. Serve para ordenar resultados de proximidade.\n- Chave \u0060f4s_geo_updated_at\u0060 em localStorage para controlar a frequência de atualização da localização.\n- Vercel Analytics é carregado em produção. O responsável deve confirmar configuração, dados recolhidos, cookies/identificadores utilizados, localização do tratamento e base legal. Até essa confirmação, não assumir que é estritamente necessário.\n- Preferência visual de tema pode ser guardada pelo fornecedor do componente de tema no browser. Confirmar chave, duração e finalidade na versão de produção.\n\n## Como controlar\n\nA localização depende de ação explícita e da permissão do browser. Pode apagar \u0060f4s_geo\u0060 e \u0060f4s_geo_updated_at\u0060 nas definições do browser e revogar a permissão de localização no dispositivo. Apagar cookies de sessão termina ou pode afetar a sessão autenticada.\n\nNão foi encontrado um mecanismo de consentimento para analytics ou outras tecnologias não essenciais. O responsável deve confirmar se Vercel Analytics e preferências de tema requerem consentimento e implementar gestão de consentimento antes de ativar tecnologias que o exijam.\n\n**Última revisão técnica:** 18-10-2026.`

export async function PublicCmsPage({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cms_pages')
    .select('title, description, content, is_published')
    .eq('slug', slug)
    .maybeSingle()

  if ((!data || !data.is_published) && slug !== 'privacidade' && slug !== 'cookies') notFound()

  return (
    <NormalizedContentPage
      title={data?.title || fallbackTitle}
      description={data?.description || undefined}
      content={data?.content || (slug === 'privacidade' ? PRIVACY_FALLBACK : slug === 'cookies' ? COOKIES_FALLBACK : null)}
      loading={false}
    />
  )
}
