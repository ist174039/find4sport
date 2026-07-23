'use client';
import { Activity, BadgeCheck, Building2, CalendarX, CreditCard, Info, Shield } from 'lucide-react'

export default function Page() {
  return (
        <main className="pt-24 pb-20 max-w-[1280px] mx-auto px-margin-desktop min-h-screen">
<div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
{/*  Sidebar Navigation Index  */}
<aside className="hidden md:block md:col-span-3">
<div className="sticky top-24 p-6 bg-card rounded-xl border border-border">
<h3 className="font-semibold text-xl text-xl mb-6 text-foreground">Conteúdo</h3>
<ul className="space-y-4">
<li>
<a className="block pl-4 py-1 text-muted-foreground hover:text-primary transition-all active-nav-item border-l-2 border-transparent" href="#intro">Introdução</a>
</li>
<li>
<a className="block pl-4 py-1 text-muted-foreground hover:text-primary transition-all border-l-2 border-transparent" href="#utilizacao">Utilização da Plataforma</a>
</li>
<li>
<a className="block pl-4 py-1 text-muted-foreground hover:text-primary transition-all border-l-2 border-transparent" href="#profissionais">Regras para Profissionais</a>
</li>
<li>
<a className="block pl-4 py-1 text-muted-foreground hover:text-primary transition-all border-l-2 border-transparent" href="#gestores">Gestores de Espaços</a>
</li>
<li>
<a className="block pl-4 py-1 text-muted-foreground hover:text-primary transition-all border-l-2 border-transparent" href="#cancelamento">Política de Cancelamento</a>
</li>
<li>
<a className="block pl-4 py-1 text-muted-foreground hover:text-primary transition-all border-l-2 border-transparent" href="#pagamentos">Pagamentos e Taxas</a>
</li>
</ul>
</div>
</aside>
{/*  Main Content Area  */}
<article className="md:col-span-9 bg-card rounded-xl border border-border overflow-hidden">
<div className="h-48 bg-gradient-to-r from-primary to-primary-container relative overflow-hidden flex items-center px-12">
<div className="relative z-10">
<h1 className="font-bold text-3xl text-display-lg text-primary-foreground">Termos e Condições</h1>
<p className="text-primary-foreground opacity-90 text-base text-base mt-2">Última atualização: 24 de Maio de 2024</p>
</div>
{/*  Decorative background pattern  */}
<div className="absolute inset-0 opacity-10 pointer-events-none">
<div className="w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.4),transparent)]"></div>
</div>
</div>
<div className="p-12 space-y-12">
{/*  Section: Intro  */}
<section className="scroll-mt-28" id="intro">
<h2 className="font-bold text-2xl text-2xl text-foreground mb-6 flex items-center gap-3">
<Info className="text-primary h-5 w-5" />
                            1. Introdução
                        </h2>
<div className="space-y-4 text-muted-foreground leading-relaxed">
<p>Bem-vindo ao FIND4SPORT. Estes Termos e Condições regem o uso da nossa plataforma, que atua como um ecossistema de alta performance ligando atletas, profissionais do desporto e gestores de recintos desportivos.</p>
<p>Ao aceder ou utilizar o FIND4SPORT, concorda em ficar vinculado por estes termos. Se não concordar com alguma parte do documento, não deverá utilizar os nossos serviços.</p>
</div>
</section>
{/*  Section: Utilização  */}
<section className="scroll-mt-28" id="utilizacao">
<h2 className="font-bold text-2xl text-2xl text-foreground mb-6 flex items-center gap-3">
<Shield className="text-primary h-5 w-5" />
                            2. Regras de Utilização
                        </h2>
<div className="bg-muted/50 p-6 rounded-lg mb-6">
<p className="font-bold text-primary mb-2 italic">A nossa missão é a Performance com Clareza.</p>
<p className="text-sm text-muted-foreground">Todos os utilizadores devem manter um comportamento profissional e respeitoso dentro da plataforma e durante a realização das atividades desportivas.</p>
</div>
<ul className="list-disc pl-6 space-y-3 text-muted-foreground">
<li>O registo de conta requer informações verídicas e atualizadas.</li>
<li>É estritamente proibida a utilização da plataforma para fins ilícitos ou abusivos.</li>
<li>O sistema de avaliações deve ser utilizado de forma honesta e construtiva.</li>
</ul>
</section>
{/*  Section: Profissionais  */}
<section className="scroll-mt-28" id="profissionais">
<h2 className="font-bold text-2xl text-2xl text-foreground mb-6 flex items-center gap-3">
<Activity className="text-primary h-5 w-5" />
                            3. Responsabilidades dos Profissionais
                        </h2>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div className="p-5 border border-border rounded-lg hover:border-primary transition-colors">
<h4 className="font-bold text-foreground mb-2">Qualificações</h4>
<p className="text-sm text-muted-foreground">Os profissionais devem comprovar as certificações e seguros necessários para o exercício da atividade.</p>
</div>
<div className="p-5 border border-border rounded-lg hover:border-primary transition-colors">
<h4 className="font-bold text-foreground mb-2">Pontualidade</h4>
<p className="text-sm text-muted-foreground">O incumprimento de horários sem aviso prévio pode levar à suspensão da conta de profissional.</p>
</div>
</div>
</section>
{/*  Section: Gestores  */}
<section className="scroll-mt-28" id="gestores">
<h2 className="font-bold text-2xl text-2xl text-foreground mb-6 flex items-center gap-3">
<Building2 className="text-primary h-5 w-5" />
                            4. Gestores de Espaços
                        </h2>
<div className="space-y-4 text-muted-foreground">
<p>Os gestores garantem que as instalações desportivas listadas no FIND4SPORT cumprem todos os requisitos de segurança e higiene vigentes.</p>
<div className="flex items-start gap-4 p-4 bg-emerald-500/10 rounded-lg">
<BadgeCheck className="text-primary mt-1 h-5 w-5" />
<div>
<p className="font-bold text-primary-foreground-fixed-variant">Selo de Qualidade FIND4SPORT</p>
<p className="text-sm">Espaços com manutenção regular e feedbacks positivos recebem prioridade no algoritmo de descoberta.</p>
</div>
</div>
</div>
</section>
{/*  Section: Cancelamento  */}
<section className="scroll-mt-28" id="cancelamento">
<h2 className="font-bold text-2xl text-2xl text-foreground mb-6 flex items-center gap-3">
<CalendarX className="text-primary h-5 w-5" />
                            5. Política de Cancelamento
                        </h2>
<div className="overflow-hidden border border-border rounded-xl">
<table className="w-full text-left border-collapse">
<thead className="bg-muted">
<tr>
<th className="p-4 font-bold border-b border-border">Antecedência</th>
<th className="p-4 font-bold border-b border-border">Reembolso</th>
<th className="p-4 font-bold border-b border-border">Taxas</th>
</tr>
</thead>
<tbody className="text-muted-foreground">
<tr className="hover:bg-muted/50 transition-colors">
<td className="p-4 border-b border-border">+ de 48 horas</td>
<td className="p-4 border-b border-border">100%</td>
<td className="p-4 border-b border-border">Sem taxa</td>
</tr>
<tr className="hover:bg-muted/50 transition-colors">
<td className="p-4 border-b border-border">24 a 48 horas</td>
<td className="p-4 border-b border-border">50%</td>
<td className="p-4 border-b border-border">5% Transação</td>
</tr>
<tr className="hover:bg-muted/50 transition-colors">
<td className="p-4 border-b border-border">- de 24 horas</td>
<td className="p-4 border-b border-border">0%</td>
<td className="p-4 border-b border-border">Retenção total</td>
</tr>
</tbody>
</table>
</div>
</section>
{/*  Section: Pagamentos  */}
<section className="scroll-mt-28" id="pagamentos">
<h2 className="font-bold text-2xl text-2xl text-foreground mb-6 flex items-center gap-3">
<CreditCard className="text-primary h-5 w-5" />
                            6. Pagamentos e Taxas
                        </h2>
<p className="text-muted-foreground mb-6">Todos os pagamentos são processados de forma segura através de parceiros certificados. O FIND4SPORT retém uma taxa de serviço por cada reserva efetuada, destinada à manutenção e melhoria contínua da infraestrutura tecnológica.</p>
<div className="bg-primary text-primary-foreground p-6 rounded-xl shadow-lg flex items-center justify-between">
<div>
<p className="font-bold text-xl">Dúvidas sobre Faturação?</p>
<p className="opacity-80">A nossa equipa de suporte responde em menos de 2 horas.</p>
</div>
<button className="bg-on-primary text-primary px-6 py-2 rounded-lg font-bold hover:bg-secondary-fixed transition-colors">Contactar Ajuda</button>
</div>
</section>
</div>
</article>
</div>
</main>
  )
}
