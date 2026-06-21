'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-border-subtle h-16">
<div className="max-w-[1280px] mx-auto flex justify-between items-center h-full px-margin-desktop">
<div className="flex items-center gap-8">
<span className="text-headline-md font-headline-md font-extrabold text-primary">FIND4SPORT</span>

</div>
<div className="flex items-center gap-4">
<button className="hidden md:block bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md text-label-md hover:scale-95 transition-transform">Sou Profissional</button>
<div className="flex gap-4 text-on-surface-variant">
<span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors" data-icon="favorite">favorite</span>
<span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors" data-icon="notifications">notifications</span>
<span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors" data-icon="person">person</span>
</div>
</div>
</div>
</header>
<main className="pt-24 pb-20 max-w-[1280px] mx-auto px-margin-desktop min-h-screen">
<div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
{/*  Sidebar Navigation Index  */}
<aside className="hidden md:block md:col-span-3">
<div className="sticky top-24 p-6 bg-surface-container-lowest rounded-xl border border-border-subtle">
<h3 className="font-headline-md text-headline-md mb-6 text-text-primary">Conteúdo</h3>
<ul className="space-y-4">
<li>
<a className="block pl-4 py-1 text-on-surface-variant hover:text-primary transition-all active-nav-item border-l-2 border-transparent" href="#intro">Introdução</a>
</li>
<li>
<a className="block pl-4 py-1 text-on-surface-variant hover:text-primary transition-all border-l-2 border-transparent" href="#utilizacao">Utilização da Plataforma</a>
</li>
<li>
<a className="block pl-4 py-1 text-on-surface-variant hover:text-primary transition-all border-l-2 border-transparent" href="#profissionais">Regras para Profissionais</a>
</li>
<li>
<a className="block pl-4 py-1 text-on-surface-variant hover:text-primary transition-all border-l-2 border-transparent" href="#gestores">Gestores de Espaços</a>
</li>
<li>
<a className="block pl-4 py-1 text-on-surface-variant hover:text-primary transition-all border-l-2 border-transparent" href="#cancelamento">Política de Cancelamento</a>
</li>
<li>
<a className="block pl-4 py-1 text-on-surface-variant hover:text-primary transition-all border-l-2 border-transparent" href="#pagamentos">Pagamentos e Taxas</a>
</li>
</ul>
</div>
</aside>
{/*  Main Content Area  */}
<article className="md:col-span-9 bg-surface-container-lowest rounded-xl border border-border-subtle overflow-hidden">
<div className="h-48 bg-gradient-to-r from-primary to-primary-container relative overflow-hidden flex items-center px-12">
<div className="relative z-10">
<h1 className="font-display-lg text-display-lg text-on-primary">Termos e Condições</h1>
<p className="text-on-primary opacity-90 font-body-lg text-body-lg mt-2">Última atualização: 24 de Maio de 2024</p>
</div>
{/*  Decorative background pattern  */}
<div className="absolute inset-0 opacity-10 pointer-events-none">
<div className="w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.4),transparent)]"></div>
</div>
</div>
<div className="p-12 space-y-12">
{/*  Section: Intro  */}
<section className="scroll-mt-28" id="intro">
<h2 className="font-headline-lg text-headline-lg text-text-primary mb-6 flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="info">info</span>
                            1. Introdução
                        </h2>
<div className="space-y-4 text-on-surface-variant leading-relaxed">
<p>Bem-vindo ao FIND4SPORT. Estes Termos e Condições regem o uso da nossa plataforma, que atua como um ecossistema de alta performance ligando atletas, profissionais do desporto e gestores de recintos desportivos.</p>
<p>Ao aceder ou utilizar o FIND4SPORT, concorda em ficar vinculado por estes termos. Se não concordar com alguma parte do documento, não deverá utilizar os nossos serviços.</p>
</div>
</section>
{/*  Section: Utilização  */}
<section className="scroll-mt-28" id="utilizacao">
<h2 className="font-headline-lg text-headline-lg text-text-primary mb-6 flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="shield">shield</span>
                            2. Regras de Utilização
                        </h2>
<div className="bg-surface-container-low p-6 rounded-lg mb-6">
<p className="font-bold text-primary mb-2 italic">A nossa missão é a Performance com Clareza.</p>
<p className="text-body-md text-on-surface-variant">Todos os utilizadores devem manter um comportamento profissional e respeitoso dentro da plataforma e durante a realização das atividades desportivas.</p>
</div>
<ul className="list-disc pl-6 space-y-3 text-on-surface-variant">
<li>O registo de conta requer informações verídicas e atualizadas.</li>
<li>É estritamente proibida a utilização da plataforma para fins ilícitos ou abusivos.</li>
<li>O sistema de avaliações deve ser utilizado de forma honesta e construtiva.</li>
</ul>
</section>
{/*  Section: Profissionais  */}
<section className="scroll-mt-28" id="profissionais">
<h2 className="font-headline-lg text-headline-lg text-text-primary mb-6 flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="sports_handball">sports_handball</span>
                            3. Responsabilidades dos Profissionais
                        </h2>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div className="p-5 border border-border-subtle rounded-lg hover:border-primary transition-colors">
<h4 className="font-bold text-text-primary mb-2">Qualificações</h4>
<p className="text-body-md text-on-surface-variant">Os profissionais devem comprovar as certificações e seguros necessários para o exercício da atividade.</p>
</div>
<div className="p-5 border border-border-subtle rounded-lg hover:border-primary transition-colors">
<h4 className="font-bold text-text-primary mb-2">Pontualidade</h4>
<p className="text-body-md text-on-surface-variant">O incumprimento de horários sem aviso prévio pode levar à suspensão da conta de profissional.</p>
</div>
</div>
</section>
{/*  Section: Gestores  */}
<section className="scroll-mt-28" id="gestores">
<h2 className="font-headline-lg text-headline-lg text-text-primary mb-6 flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="stadium">stadium</span>
                            4. Gestores de Espaços
                        </h2>
<div className="space-y-4 text-on-surface-variant">
<p>Os gestores garantem que as instalações desportivas listadas no FIND4SPORT cumprem todos os requisitos de segurança e higiene vigentes.</p>
<div className="flex items-start gap-4 p-4 bg-success-mint rounded-lg">
<span className="material-symbols-outlined text-primary mt-1" data-icon="verified">verified</span>
<div>
<p className="font-bold text-on-primary-fixed-variant">Selo de Qualidade FIND4SPORT</p>
<p className="text-sm">Espaços com manutenção regular e feedbacks positivos recebem prioridade no algoritmo de descoberta.</p>
</div>
</div>
</div>
</section>
{/*  Section: Cancelamento  */}
<section className="scroll-mt-28" id="cancelamento">
<h2 className="font-headline-lg text-headline-lg text-text-primary mb-6 flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="event_busy">event_busy</span>
                            5. Política de Cancelamento
                        </h2>
<div className="overflow-hidden border border-border-subtle rounded-xl">
<table className="w-full text-left border-collapse">
<thead className="bg-surface-container-high">
<tr>
<th className="p-4 font-bold border-b border-border-subtle">Antecedência</th>
<th className="p-4 font-bold border-b border-border-subtle">Reembolso</th>
<th className="p-4 font-bold border-b border-border-subtle">Taxas</th>
</tr>
</thead>
<tbody className="text-on-surface-variant">
<tr className="hover:bg-surface-container-low transition-colors">
<td className="p-4 border-b border-border-subtle">+ de 48 horas</td>
<td className="p-4 border-b border-border-subtle">100%</td>
<td className="p-4 border-b border-border-subtle">Sem taxa</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="p-4 border-b border-border-subtle">24 a 48 horas</td>
<td className="p-4 border-b border-border-subtle">50%</td>
<td className="p-4 border-b border-border-subtle">5% Transação</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="p-4 border-b border-border-subtle">- de 24 horas</td>
<td className="p-4 border-b border-border-subtle">0%</td>
<td className="p-4 border-b border-border-subtle">Retenção total</td>
</tr>
</tbody>
</table>
</div>
</section>
{/*  Section: Pagamentos  */}
<section className="scroll-mt-28" id="pagamentos">
<h2 className="font-headline-lg text-headline-lg text-text-primary mb-6 flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="payments">payments</span>
                            6. Pagamentos e Taxas
                        </h2>
<p className="text-on-surface-variant mb-6">Todos os pagamentos são processados de forma segura através de parceiros certificados. O FIND4SPORT retém uma taxa de serviço por cada reserva efetuada, destinada à manutenção e melhoria contínua da infraestrutura tecnológica.</p>
<div className="bg-primary text-on-primary p-6 rounded-xl shadow-lg flex items-center justify-between">
<div>
<p className="font-bold text-headline-md">Dúvidas sobre Faturação?</p>
<p className="opacity-80">A nossa equipa de suporte responde em menos de 2 horas.</p>
</div>
<button className="bg-on-primary text-primary px-6 py-2 rounded-lg font-bold hover:bg-secondary-fixed transition-colors">Contactar Ajuda</button>
</div>
</section>
</div>
</article>
</div>
</main>


{/*  BottomNavBar (Mobile Only)  */}
      </main>
      <Footer />
    </div>
  )
}
