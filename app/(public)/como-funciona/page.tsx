'use client';
import { Activity, ArrowRight, Calendar, ChevronDown, CreditCard, MessageSquare, Search } from 'lucide-react'

import { useState } from 'react'

export default function Page() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => prev === index ? null : index)
  }

  return (
    <>
      {/*  Top Navigation  */}
      <main className="pt-16">
        {/*  Hero Search Section  */}
        <section className="emerald-gradient py-20 px-margin-mobile md:px-margin-desktop text-center text-primary-foreground">
          <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="font-bold text-3xl text-display-lg">Como podemos ajudar?</h1>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
              <input className="w-full pl-12 pr-6 py-4 rounded-xl bg-white text-foreground border-none focus:ring-4 focus:ring-primary/20 shadow-xl transition-all" placeholder="Pesquise por palavras-chave (ex: pagamentos, perfil, reservas)..." type="text"/>
            </div>
            <p className="text-base text-base opacity-90">Explore as categorias ou consulte as perguntas frequentes abaixo.</p>
          </div>
        </section>
        {/*  Category Bento Grid  */}
        <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Card 1 */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-xl text-xl mb-2">Pagamentos</h3>
              <p className="text-muted-foreground text-sm text-sm mb-6">Informações sobre faturas, reembolsos, taxas e métodos de pagamento aceites.</p>
              <div className="flex items-center text-primary font-semibold gap-2">
                Ver artigos <ArrowRight className="h-5 w-5" />
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-xl text-xl mb-2">Reservas</h3>
              <p className="text-muted-foreground text-sm text-sm mb-6">Como agendar sessões, políticas de cancelamento e reservas recorrentes.</p>
              <div className="flex items-center text-primary font-semibold gap-2">
                Ver artigos <ArrowRight className="h-5 w-5" />
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-xl text-xl mb-2">Espaços</h3>
              <p className="text-muted-foreground text-sm text-sm mb-6">Configuração de campos, horários e controlo de acessos desportivos.</p>
              <div className="flex items-center text-primary font-semibold gap-2">
                Ver artigos <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>
        {/*  FAQ Section  */}
        <section className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop mb-section-gap">
          <h2 className="font-bold text-2xl text-2xl mb-8 text-center">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {/*  FAQ Item 1  */}
            <div className="accordion-item border border-border rounded-xl bg-white overflow-hidden">
              <button className="w-full flex justify-between items-center p-6 text-left" onClick={() => toggleFaq(1)}>
                <span className="font-semibold text-xl text-base text-foreground font-semibold">Como posso cancelar uma reserva?</span>
                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openFaq === 1 ? 'rotate-180' : ''}`} />
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${openFaq === 1 ? 'max-h-[200px] border-t border-border' : 'max-h-0'}`}>
                <div className="px-6 py-4 text-muted-foreground text-sm">
                  Pode cancelar qualquer reserva através da sua área de perfil em "Minhas Reservas". Note que as políticas de cancelamento variam consoante o profissional ou o espaço desportivo escolhido.
                </div>
              </div>
            </div>
            {/*  FAQ Item 2  */}
            <div className="accordion-item border border-border rounded-xl bg-white overflow-hidden">
              <button className="w-full flex justify-between items-center p-6 text-left" onClick={() => toggleFaq(2)}>
                <span className="font-semibold text-xl text-base text-foreground font-semibold">Quais são os métodos de pagamento aceites?</span>
                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openFaq === 2 ? 'rotate-180' : ''}`} />
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${openFaq === 2 ? 'max-h-[200px] border-t border-border' : 'max-h-0'}`}>
                <div className="px-6 py-4 text-muted-foreground text-sm">
                  Aceitamos MB WAY, cartões de crédito/débito (Visa, Mastercard) e Referência Multibanco. Todos os pagamentos são processados de forma segura e imediata.
                </div>
              </div>
            </div>
            {/*  FAQ Item 3  */}
            <div className="accordion-item border border-border rounded-xl bg-white overflow-hidden">
              <button className="w-full flex justify-between items-center p-6 text-left" onClick={() => toggleFaq(3)}>
                <span className="font-semibold text-xl text-base text-foreground font-semibold">Como me torno um profissional verificado?</span>
                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openFaq === 3 ? 'rotate-180' : ''}`} />
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${openFaq === 3 ? 'max-h-[200px] border-t border-border' : 'max-h-0'}`}>
                <div className="px-6 py-4 text-muted-foreground text-sm">
                  Para obter o selo de verificação, deve submeter os seus certificados profissionais e cédula de treinador (se aplicável) na área de configurações do seu perfil de profissional.
                </div>
              </div>
            </div>
            {/*  FAQ Item 4  */}
            <div className="accordion-item border border-border rounded-xl bg-white overflow-hidden">
              <button className="w-full flex justify-between items-center p-6 text-left" onClick={() => toggleFaq(4)}>
                <span className="font-semibold text-xl text-base text-foreground font-semibold">É possível reservar para grupos?</span>
                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openFaq === 4 ? 'rotate-180' : ''}`} />
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${openFaq === 4 ? 'max-h-[200px] border-t border-border' : 'max-h-0'}`}>
                <div className="px-6 py-4 text-muted-foreground text-sm">
                  Sim, muitos dos nossos parceiros oferecem sessões de grupo. Ao pesquisar, pode filtrar por "Sessões Coletivas" ou "Aluguer Total" para espaços desportivos.
                </div>
              </div>
            </div>
          </div>
        </section>
        {/*  Support CTA Section  */}
        <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop mb-section-gap">
          <div className="bg-muted/50 rounded-3xl p-12 text-center relative overflow-hidden border border-border">
            <div className="relative z-10 space-y-6">
              <h2 className="font-bold text-2xl text-2xl text-foreground">Não encontrou o que procurava?</h2>
              <p className="text-base text-base text-muted-foreground max-w-xl mx-auto">A nossa equipa de suporte está disponível para o ajudar com qualquer questão técnica ou comercial.</p>
              <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-xl hover:shadow-xl hover:-translate-y-1 transition-all">
                <MessageSquare className="h-5 w-5" />
                Talk to Support
              </button>
            </div>
            {/*  Abstract visual element  */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl"></div>
          </div>
        </section>
      </main>
    </>
  )
}
