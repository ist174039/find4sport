'use client';
import Link from 'next/link'
import { Activity, ArrowRight, Calendar, ChevronDown, CreditCard, MessageSquare, Search, User, Building2 } from 'lucide-react'

import { useMemo, useState } from 'react'

type Audience = 'atleta' | 'profissional' | 'espaco'

const journeyByAudience: Record<Audience, Array<{ title: string; description: string }>> = {
  atleta: [
    { title: 'Descobre', description: 'Pesquisa por modalidade, localização e avaliações para encontrar o parceiro ideal.' },
    { title: 'Reserva', description: 'Escolhe horário, confirma a sessão e recebe notificações automáticas.' },
    { title: 'Evolui', description: 'Acompanha progresso, participa em comunidades e deixa avaliações.' },
  ],
  profissional: [
    { title: 'Regista o perfil', description: 'Cria perfil com serviços, preços, especialidades e disponibilidade.' },
    { title: 'Recebe pedidos', description: 'Gere reservas e mensagens num dashboard único.' },
    { title: 'Escala o negócio', description: 'Usa destaque, métricas e automações para crescer mais rápido.' },
  ],
  espaco: [
    { title: 'Publica o espaço', description: 'Adiciona campos, horários e condições de utilização.' },
    { title: 'Gere ocupação', description: 'Controla reservas, bloqueios e regras de cancelamento.' },
    { title: 'Monetiza melhor', description: 'Aumenta taxa de ocupação com visibilidade segmentada.' },
  ],
}

const categoryCards = [
  {
    title: 'Pagamentos',
    icon: CreditCard,
    description: 'Faturas, comissões, reembolsos e métodos de pagamento aceites.',
    href: '/termos',
  },
  {
    title: 'Reservas',
    icon: Calendar,
    description: 'Agendamentos, reagendamentos, cancelamentos e sessões de grupo.',
    href: '/reservar',
  },
  {
    title: 'Espaços',
    icon: Activity,
    description: 'Gestão de disponibilidade, regras e performance de ocupação.',
    href: '/espacos',
  },
]

const faqs = [
  {
    id: 1,
    q: 'Como posso cancelar uma reserva?',
    a: 'Pode cancelar na área de reservas. A política depende das regras configuradas pelo profissional ou espaço.',
    tags: ['reservas', 'cancelamento'],
  },
  {
    id: 2,
    q: 'Quais são os métodos de pagamento aceites?',
    a: 'Aceitamos MB WAY, cartões de crédito/débito e Referência Multibanco, com processamento seguro.',
    tags: ['pagamentos', 'mbway', 'cartao'],
  },
  {
    id: 3,
    q: 'Como me torno um profissional verificado?',
    a: 'Submeta certificações e documentos na área de perfil para validação da equipa.',
    tags: ['profissional', 'verificacao'],
  },
  {
    id: 4,
    q: 'É possível reservar para grupos?',
    a: 'Sim, pode filtrar por sessões coletivas e verificar capacidade diretamente no evento ou espaço.',
    tags: ['reservas', 'grupos'],
  },
]

export default function Page() {
  const [selectedAudience, setSelectedAudience] = useState<Audience>('atleta')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => prev === index ? null : index)
  }

  const normalizedSearch = search.trim().toLowerCase()

  const filteredFaqs = useMemo(() => {
    if (!normalizedSearch) return faqs
    return faqs.filter((faq) => {
      const inQuestion = faq.q.toLowerCase().includes(normalizedSearch)
      const inAnswer = faq.a.toLowerCase().includes(normalizedSearch)
      const inTags = faq.tags.some((tag) => tag.includes(normalizedSearch))
      return inQuestion || inAnswer || inTags
    })
  }, [normalizedSearch])

  const filteredCategories = useMemo(() => {
    if (!normalizedSearch) return categoryCards
    return categoryCards.filter((card) => {
      return card.title.toLowerCase().includes(normalizedSearch) || card.description.toLowerCase().includes(normalizedSearch)
    })
  }, [normalizedSearch])

  return (
    <main className="pt-16">
        <section className="emerald-gradient py-20 px-margin-mobile md:px-margin-desktop text-center text-primary-foreground">
          <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="font-bold text-3xl text-display-lg">Como Funciona a FIND4SPORT</h1>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
              <input
                className="w-full pl-12 pr-6 py-4 rounded-xl bg-white text-foreground border-none focus:ring-4 focus:ring-primary/20 shadow-xl transition-all"
                placeholder="Pesquise por tema (ex: pagamentos, perfil, reservas)..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-base opacity-90">Escolha o seu perfil e siga o fluxo ideal para começar a usar a plataforma.</p>

            <div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 p-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setSelectedAudience('atleta')}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${selectedAudience === 'atleta' ? 'bg-white text-emerald-700' : 'text-white'}`}
              >
                <User className="mr-1 inline h-4 w-4" /> Atleta
              </button>
              <button
                type="button"
                onClick={() => setSelectedAudience('profissional')}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${selectedAudience === 'profissional' ? 'bg-white text-emerald-700' : 'text-white'}`}
              >
                <Activity className="mr-1 inline h-4 w-4" /> Profissional
              </button>
              <button
                type="button"
                onClick={() => setSelectedAudience('espaco')}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${selectedAudience === 'espaco' ? 'bg-white text-emerald-700' : 'text-white'}`}
              >
                <Building2 className="mr-1 inline h-4 w-4" /> Espaço
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop py-14">
          <h2 className="text-center text-2xl font-bold text-foreground">Fluxo Recomendado</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {journeyByAudience[selectedAudience].map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="mb-3 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                  Passo {index + 1}
                </p>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {filteredCategories.map((card) => {
              const Icon = card.icon
              return (
                <Link key={card.title} href={card.href} className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-xl mb-2">{card.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{card.description}</p>
                  <div className="flex items-center text-primary font-semibold gap-2">
                    Ver artigos <ArrowRight className="h-5 w-5" />
                  </div>
                </Link>
              )
            })}
          </div>
          {filteredCategories.length === 0 && (
            <p className="mt-6 rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Sem resultados para esta pesquisa nas categorias.
            </p>
          )}
        </section>

        <section className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop mb-section-gap">
          <h2 className="font-bold text-2xl mb-8 text-center">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="accordion-item border border-border rounded-xl bg-white overflow-hidden">
                <button className="w-full flex justify-between items-center p-6 text-left" onClick={() => toggleFaq(faq.id)}>
                  <span className="text-base text-foreground font-semibold">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openFaq === faq.id ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${openFaq === faq.id ? 'max-h-[200px] border-t border-border' : 'max-h-0'}`}>
                  <div className="px-6 py-4 text-muted-foreground text-sm">{faq.a}</div>
                </div>
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Sem perguntas frequentes para esta pesquisa.
              </p>
            )}
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop mb-section-gap">
          <div className="bg-muted/50 rounded-3xl p-12 text-center relative overflow-hidden border border-border">
            <div className="relative z-10 space-y-6">
              <h2 className="font-bold text-2xl text-foreground">Não encontrou o que procurava?</h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">A nossa equipa de suporte está disponível para ajudar com questões técnicas e comerciais.</p>
              <Link href="/contacto" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:-translate-y-1 transition-all">
                <MessageSquare className="h-5 w-5" />
                Falar com suporte
              </Link>
            </div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl"></div>
          </div>
        </section>
    </main>
  )
}
