'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface dark:bg-inverse-surface border-r border-outline-variant dark:border-outline flex flex-col h-full py-8 px-4 z-50">
<div className="mb-10 px-2">
<h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim tracking-tight">FIND4SPORT</h1>
<p className="font-label-md text-label-md text-on-surface-variant opacity-70">Painel do Profissional</p>
</div>

<button className="mt-4 mb-8 w-full bg-primary text-on-primary py-3 px-4 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm">
<span className="material-symbols-outlined text-[18px]">add_circle</span>
            Criar Novo Evento
        </button>
<div className="pt-6 border-t border-outline-variant space-y-1">
<a className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out text-on-surface-variant hover:bg-secondary-container" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-label-md text-label-md">Configurações</span>
</a>
<a className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out text-on-surface-variant hover:bg-error-container/20 hover:text-error" href="#">
<span className="material-symbols-outlined">logout</span>
<span className="font-label-md text-label-md">Sair</span>
</a>
</div>
</aside><main className="flex-grow pl-64 pt-12 pb-20 md:pb-8 max-w-[1400px] mx-auto w-full px-12">
{/*  Header Stats & Efficiency Row  */}
<div className="grid grid-cols-1 lg:grid-cols-4 gap-gutter mb-8">
<div className="lg:col-span-3 flex flex-col md:flex-row gap-gutter">
{/*  Stat 1: Occupancy  */}
<div className="flex-1 bg-surface-container-lowest p-6 rounded-xl border border-border-subtle flex flex-col justify-between">
<div>
<p className="text-label-md font-label-md text-text-secondary uppercase tracking-wider mb-1">Ocupação Hoje</p>
<h3 className="text-display-lg font-display-lg text-primary">82%</h3>
</div>
<div className="mt-4 flex items-center gap-2">
<div className="flex-grow h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary" style={{   width: '82%' }}></div>
</div>
<span className="text-label-md font-label-md text-primary">+5% vs ontem</span>
</div>
</div>
{/*  Stat 2: Weekly Revenue  */}
<div className="flex-1 bg-surface-container-lowest p-6 rounded-xl border border-border-subtle flex flex-col justify-between">
<div>
<p className="text-label-md font-label-md text-text-secondary uppercase tracking-wider mb-1">Receita Semanal</p>
<h3 className="text-display-lg font-display-lg text-text-primary">2.480€</h3>
</div>
<p className="text-label-md font-label-md text-tertiary mt-4 flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="trending_up">trending_up</span>
                        12% acima da média
                    </p>
</div>
</div>
{/*  Quick Actions / Date Toggle  */}
<div className="bg-primary text-on-primary p-6 rounded-xl flex flex-col justify-center items-center text-center">
<p className="text-label-md font-label-md opacity-80 mb-2">Hoje, 24 Mai</p>
<button className="bg-on-primary text-primary px-6 py-3 rounded-lg font-headline-md text-[16px] w-full hover:bg-primary-fixed transition-colors">
                    Nova Reserva Manual
                </button>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/*  Left Side: Calendar View (Bento Style)  */}
<div className="lg:col-span-8 space-y-gutter">
<div className="bg-surface-container-lowest rounded-xl border border-border-subtle overflow-hidden">
{/*  Calendar Controls  */}
<div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-container-low">
<div className="flex items-center gap-4">
<h2 className="font-headline-md text-headline-md text-text-primary">Agenda de Espaços</h2>
<div className="flex bg-surface-container-highest rounded-lg p-1">
<button className="px-3 py-1 bg-surface-container-lowest rounded-md text-label-md font-label-md shadow-sm">Dia</button>
<button className="px-3 py-1 text-label-md font-label-md text-on-surface-variant">Semana</button>
</div>
</div>
<div className="flex items-center gap-2">
<button className="p-2 hover:bg-surface-container rounded-full"><span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span></button>
<span className="font-label-md text-label-md px-2">24 de Maio, 2024</span>
<button className="p-2 hover:bg-surface-container rounded-full"><span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span></button>
</div>
</div>
{/*  Visual Calendar Grid  */}
<div className="overflow-x-auto scrollbar-hide">
<div className="min-w-[800px]">
{/*  Grid Headers  */}
<div className="calendar-grid bg-surface-container-low border-b border-border-subtle">
<div className="p-4"></div>
<div className="p-4 text-center font-label-md text-label-md text-text-secondary border-l border-border-subtle">Campo Padel 1</div>
<div className="p-4 text-center font-label-md text-label-md text-text-secondary border-l border-border-subtle">Campo Padel 2</div>
<div className="p-4 text-center font-label-md text-label-md text-text-secondary border-l border-border-subtle">Sala Fitness</div>
<div className="p-4 text-center font-label-md text-label-md text-text-secondary border-l border-border-subtle">Campo Ténis</div>
<div className="p-4 text-center font-label-md text-label-md text-text-secondary border-l border-border-subtle">Estúdio Yoga</div>
</div>
{/*  Grid Body  */}
<div className="relative h-[600px] overflow-y-auto">
{/*  Time Slots Background  */}
<div className="absolute inset-0 grid grid-rows-12">
<div className="calendar-grid h-[50px] border-b border-border-subtle/50">
<div className="flex items-center justify-center text-[10px] text-outline font-bold">08:00</div>
<div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div>
</div>
<div className="calendar-grid h-[50px] border-b border-border-subtle/50">
<div className="flex items-center justify-center text-[10px] text-outline font-bold">09:00</div>
<div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div>
</div>
<div className="calendar-grid h-[50px] border-b border-border-subtle/50">
<div className="flex items-center justify-center text-[10px] text-outline font-bold">10:00</div>
<div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div>
</div>
<div className="calendar-grid h-[50px] border-b border-border-subtle/50 bg-surface-container-low/20">
<div className="flex items-center justify-center text-[10px] text-outline font-bold">11:00</div>
<div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div>
</div>
<div className="calendar-grid h-[50px] border-b border-border-subtle/50">
<div className="flex items-center justify-center text-[10px] text-outline font-bold">12:00</div>
<div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div><div className="border-l border-border-subtle/30"></div>
</div>
</div>
{/*  Actual Events (Absolute Positioned)  */}
{/*  Event 1: Padel 1 08:30-10:00  */}
<div className="absolute left-[80px] top-[25px] w-[calc((100%-80px)/5-10px)] h-[75px] bg-primary-container/10 border-l-4 border-primary p-2 m-1 rounded-r-lg shadow-sm">
<p className="text-[11px] font-bold text-primary">08:30 - 10:00</p>
<p className="text-[12px] font-semibold text-text-primary truncate">Ricardo Silva</p>
<p className="text-[10px] text-text-secondary">Padel Intermédio</p>
</div>
{/*  Event 2: Fitness 09:00-11:00  */}
<div className="absolute left-[calc(80px+2*(100%-80px)/5)] top-[50px] w-[calc((100%-80px)/5-10px)] h-[100px] bg-tertiary-container/10 border-l-4 border-tertiary p-2 m-1 rounded-r-lg shadow-sm">
<p className="text-[11px] font-bold text-tertiary">09:00 - 11:00</p>
<p className="text-[12px] font-semibold text-text-primary truncate">Bootcamp Pro</p>
<p className="text-[10px] text-text-secondary">Aula Grupo</p>
</div>
{/*  Event 3: Yoga 11:00-12:30  */}
<div className="absolute left-[calc(80px+4*(100%-80px)/5)] top-[150px] w-[calc((100%-80px)/5-10px)] h-[75px] bg-secondary-container/30 border-l-4 border-secondary p-2 m-1 rounded-r-lg shadow-sm">
<p className="text-[11px] font-bold text-secondary">11:00 - 12:30</p>
<p className="text-[12px] font-semibold text-text-primary truncate">Ana Martins</p>
<p className="text-[10px] text-text-secondary">Hatha Yoga</p>
</div>
</div>
</div>
</div>
</div>
</div>
{/*  Right Side: Pending Bookings & Task Management  */}
<div className="lg:col-span-4 space-y-gutter">
{/*  Pending Bookings Section  */}
<div className="bg-surface-container-lowest rounded-xl border border-border-subtle flex flex-col h-full max-h-[720px]">
<div className="p-6 border-b border-border-subtle flex justify-between items-center">
<h2 className="font-headline-md text-headline-md text-text-primary">Pendentes</h2>
<span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full text-label-md font-label-md">3 Novas</span>
</div>
<div className="p-6 space-y-4 overflow-y-auto scrollbar-hide">
{/*  Pending Item 1  */}
<div className="p-4 rounded-xl border border-border-subtle bg-background hover:border-primary transition-colors group">
<div className="flex justify-between items-start mb-3">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">JS</div>
<div>
<p className="font-bold text-text-primary">João Soares</p>
<p className="text-label-md font-label-md text-text-secondary">Padel • Campo 2</p>
</div>
</div>
<span className="text-label-md font-label-md text-primary">45€</span>
</div>
<div className="flex items-center gap-2 text-label-md font-label-md text-text-secondary mb-4">
<span className="material-symbols-outlined text-[16px]" data-icon="calendar_today">calendar_today</span>
                                Hoje, 18:00 - 19:30
                            </div>
<div className="grid grid-cols-2 gap-2">
<button className="py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:brightness-110 transition-all flex items-center justify-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="check">check</span> Aprovar
                                </button>
<button className="py-2 bg-surface-container text-on-surface-variant rounded-lg font-label-md text-label-md hover:bg-error-container hover:text-error transition-all flex items-center justify-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="close">close</span> Recusar
                                </button>
</div>
</div>
{/*  Pending Item 2  */}
<div className="p-4 rounded-xl border border-border-subtle bg-background hover:border-primary transition-colors group">
<div className="flex justify-between items-start mb-3">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">MC</div>
<div>
<p className="font-bold text-text-primary">Marta Costa</p>
<p className="text-label-md font-label-md text-text-secondary">Yoga • Estúdio</p>
</div>
</div>
<span className="text-label-md font-label-md text-primary">12€</span>
</div>
<div className="flex items-center gap-2 text-label-md font-label-md text-text-secondary mb-4">
<span className="material-symbols-outlined text-[16px]" data-icon="calendar_today">calendar_today</span>
                                Amanhã, 09:00 - 10:00
                            </div>
<div className="grid grid-cols-2 gap-2">
<button className="py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:brightness-110 transition-all flex items-center justify-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="check">check</span> Aprovar
                                </button>
<button className="py-2 bg-surface-container text-on-surface-variant rounded-lg font-label-md text-label-md hover:bg-error-container hover:text-error transition-all flex items-center justify-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="close">close</span> Recusar
                                </button>
</div>
</div>
{/*  Pending Item 3  */}
<div className="p-4 rounded-xl border border-border-subtle bg-background hover:border-primary transition-colors group">
<div className="flex justify-between items-start mb-3">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold">PL</div>
<div>
<p className="font-bold text-text-primary">Paulo Lopes</p>
<p className="text-label-md font-label-md text-text-secondary">Ténis • Campo 1</p>
</div>
</div>
<span className="text-label-md font-label-md text-primary">30€</span>
</div>
<div className="flex items-center gap-2 text-label-md font-label-md text-text-secondary mb-4">
<span className="material-symbols-outlined text-[16px]" data-icon="calendar_today">calendar_today</span>
                                Hoje, 21:00 - 22:30
                            </div>
<div className="grid grid-cols-2 gap-2">
<button className="py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:brightness-110 transition-all flex items-center justify-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="check">check</span> Aprovar
                                </button>
<button className="py-2 bg-surface-container text-on-surface-variant rounded-lg font-label-md text-label-md hover:bg-error-container hover:text-error transition-all flex items-center justify-center gap-1">
<span className="material-symbols-outlined text-[16px]" data-icon="close">close</span> Recusar
                                </button>
</div>
</div>
</div>
<div className="p-4 mt-auto border-t border-border-subtle bg-surface-container-low">
<button className="w-full text-center text-primary font-bold text-label-md py-2 hover:underline">Ver todas as solicitações</button>
</div>
</div>
</div>
</div>
</main>
{/*  BottomNavBar (Mobile Only)  */}

{/*  Footer (Desktop)  */}
      </main>
      <Footer />
    </div>
  )
}
