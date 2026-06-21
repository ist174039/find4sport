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
<span className="material-symbols-outlined text-[18px]" data-icon="add_circle">add_circle</span>
            Criar Novo Evento
        </button>
<div className="pt-6 border-t border-outline-variant space-y-1">
<a className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out text-on-surface-variant hover:bg-secondary-container" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="font-label-md text-label-md">Configurações</span>
</a>
<a className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out text-on-surface-variant hover:bg-error-container/20 hover:text-error" href="#">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span className="font-label-md text-label-md">Sair</span>
</a>
</div>
</aside>
<main className="mt-24 pb-24 max-w-[1280px] mx-auto px-margin-desktop pl-64">
{/*  Header Section  */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
<div>
<h1 className="font-headline-lg text-headline-lg text-text-primary mb-2">Configuração de Serviços</h1>
<p className="font-body-md text-body-md text-text-secondary">Gere o preçário, horários e visibilidade dos seus serviços desportivos.</p>
</div>
<button className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md hover:shadow-lg transition-all active:scale-95">
<span className="material-symbols-outlined" data-icon="add_circle">add_circle</span>
                Novo Serviço
            </button>
</div>
<div className="bento-grid">
{/*  Summary Stats (Top Bar of Bento)  */}
<div className="col-span-12 md:col-span-4 glass-card p-6 rounded-xl flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="sports_tennis">sports_tennis</span>
</div>
<div>
<span className="font-label-md text-label-md text-text-secondary block">Serviços Ativos</span>
<span className="font-stat-display text-stat-display text-text-primary">12 Unidades</span>
</div>
</div>
<div className="col-span-12 md:col-span-4 glass-card p-6 rounded-xl flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-trust-gold/10 flex items-center justify-center text-trust-gold">
<span className="material-symbols-outlined" data-icon="schedule">schedule</span>
</div>
<div>
<span className="font-label-md text-label-md text-text-secondary block">Taxa de Ocupação</span>
<span className="font-stat-display text-stat-display text-text-primary">78% Médio</span>
</div>
</div>
<div className="col-span-12 md:col-span-4 glass-card p-6 rounded-xl flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined" data-icon="payments">payments</span>
</div>
<div>
<span className="font-label-md text-label-md text-text-secondary block">Receita Estimada</span>
<span className="font-stat-display text-stat-display text-text-primary">2.450 € /mês</span>
</div>
</div>
{/*  Main Services List  */}
<div className="col-span-12 lg:col-span-8 space-y-4">
<h3 className="font-headline-md text-headline-md text-text-primary px-2">Catálogo de Ofertas</h3>
{/*  Service Item 1  */}
<div className="glass-card p-6 rounded-xl group hover:shadow-xl transition-all duration-300">
<div className="flex flex-col md:flex-row gap-6">
<div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 relative">
<img className="w-full h-full object-cover" data-alt="A professional indoor padel court with bright high-performance lighting, featuring clean blue turf and glass walls. The atmosphere is energetic and clear, reflecting a premium sports facility's modern corporate aesthetic with high-definition clarity and depth." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxYdsGbGhCKB9xP9gHId9ePEEG3BMui2liFf05570G6THIHd0dPdIGt8mnymYXceIVP-U8fej2QhKGglxcEe6JsIWAf_QzysHDqXsqH6TH5wL8chk_5locjTIJCapRh9NOCQc8c1DtKCa0ZC4mzliuz9pGYOnLV-uvEIDahLCG8lguwz1F7Km7tXRSYXpQ-2CM6-A8uDyaMFCydkQDDLxw_pbwVqznIZfIySnKpnDu7wKLN5bEjQiDNJG6qLWmzuSv-ILWQ2mG" />
<span className="absolute top-2 left-2 bg-success-mint text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">ATIVO</span>
</div>
<div className="flex-grow">
<div className="flex justify-between items-start mb-2">
<div>
<h4 className="font-headline-md text-[18px] text-text-primary">Aluguer de Campo Padel - Premium</h4>
<p className="font-body-md text-body-md text-text-secondary">Padel • 60-90 min • Indoor</p>
</div>
<div className="text-right">
<span className="block font-stat-display text-stat-display text-primary">Desde 20,00€</span>
<span className="text-label-md text-text-secondary">Preço Variável</span>
</div>
</div>
<div className="flex flex-wrap gap-2 mt-4">
<span className="bg-surface-container text-on-surface-variant font-label-md text-label-md px-3 py-1 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]" data-icon="light_mode">light_mode</span> Diurno: 20€
                                </span>
<span className="bg-surface-container text-on-surface-variant font-label-md text-label-md px-3 py-1 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]" data-icon="dark_mode">dark_mode</span> Noturno: 28€
                                </span>
<span className="bg-surface-container text-on-surface-variant font-label-md text-label-md px-3 py-1 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]" data-icon="weekend">weekend</span> Fim de Semana: 25€
                                </span>
</div>
</div>
</div>
<div className="mt-6 pt-4 border-t border-border-subtle flex justify-end gap-3">
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined" data-icon="edit">edit</span></button>
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined" data-icon="visibility_off">visibility_off</span></button>
<button className="p-2 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined" data-icon="delete">delete</span></button>
</div>
</div>
{/*  Service Item 2  */}
<div className="glass-card p-6 rounded-xl group hover:shadow-xl transition-all duration-300">
<div className="flex flex-col md:flex-row gap-6">
<div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 relative">
<img className="w-full h-full object-cover" data-alt="A bright, modern fitness studio with floor-to-ceiling windows letting in soft natural light. High-end gym equipment is arranged neatly in a minimalist environment. The scene feels professional and motivating, with a clean emerald green and white color palette characteristic of a performance sports ecosystem." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtHcLp9iA-vV3HTTvkmj86FAwtCoVTgyPsxXC5dDvFeRonBE8J4bH9hpA8vjuljExYJF_GdJZ2LV3rFY8_fSpQgm1dvQt93MWndHozINPEcL-LZCZ9koXrvWEPXdJ44ID-P-tsGOg93vyYt9hgDttYvrdlODsfC37gAXp3by_kvI4AYemVSa2UFk5vXwLMuVRJgBNnQgxsmOPHktxuaY86_qJ7-zERoLl04Q-sr79ctjHzgqtIqITa29TiThKkmRrqXqu_VZ_z" />
<span className="absolute top-2 left-2 bg-surface-container-high text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">RASCUNHO</span>
</div>
<div className="flex-grow">
<div className="flex justify-between items-start mb-2">
<div>
<h4 className="font-headline-md text-[18px] text-text-primary">Aula de Grupo: Cross Training</h4>
<p className="font-body-md text-body-md text-text-secondary">Fitness • 50 min • Máx 12 pessoas</p>
</div>
<div className="text-right">
<span className="block font-stat-display text-stat-display text-primary">12,50€</span>
<span className="text-label-md text-text-secondary">Preço Fixo</span>
</div>
</div>
<div className="flex flex-wrap gap-2 mt-4">
<span className="bg-surface-container text-on-surface-variant font-label-md text-label-md px-3 py-1 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]" data-icon="event">event</span> Semanal (Seg-Sex)
                                </span>
</div>
</div>
</div>
<div className="mt-6 pt-4 border-t border-border-subtle flex justify-end gap-3">
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined" data-icon="edit">edit</span></button>
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined" data-icon="publish">publish</span></button>
<button className="p-2 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined" data-icon="delete">delete</span></button>
</div>
</div>
</div>
{/*  Configuration Sidebar  */}
<div className="col-span-12 lg:col-span-4 space-y-6">
<div className="glass-card p-6 rounded-xl border-l-4 border-primary">
<h3 className="font-headline-md text-[20px] text-text-primary mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary" data-icon="settings_input_component">settings_input_component</span>
                        Regras de Preçário
                    </h3>
<div className="space-y-4">
<div className="p-3 bg-background rounded-lg border border-border-subtle">
<p className="font-label-md text-label-md text-primary uppercase mb-1">Horário Diurno</p>
<p className="font-body-md text-body-md text-text-secondary">08:00 - 18:00</p>
<p className="font-body-md text-body-md font-bold mt-1">Preço Base (Sem ajustes)</p>
</div>
<div className="p-3 bg-background rounded-lg border border-border-subtle">
<p className="font-label-md text-label-md text-tertiary uppercase mb-1">Horário Noturno</p>
<p className="font-body-md text-body-md text-text-secondary">18:00 - 00:00</p>
<p className="font-body-md text-body-md font-bold mt-1 text-tertiary">+25% Taxa Energética</p>
</div>
<div className="p-3 bg-background rounded-lg border border-border-subtle">
<p className="font-label-md text-label-md text-trust-gold uppercase mb-1">Pico (Fim de Semana)</p>
<p className="font-body-md text-body-md text-text-secondary">Sáb & Dom - Todo o dia</p>
<p className="font-body-md text-body-md font-bold mt-1 text-trust-gold">Preço Premium (+5€)</p>
</div>
</div>
<button className="w-full mt-6 py-3 border border-primary text-primary rounded-xl font-label-md text-label-md hover:bg-primary/5 transition-colors">
                        Editar Regras Globais
                    </button>
</div>
{/*  Quick Actions / Tips  */}
<div className="bg-primary text-on-primary p-6 rounded-xl relative overflow-hidden">
<div className="relative z-10">
<h4 className="font-headline-md text-[18px] mb-2">Dica de Gestor</h4>
<p className="font-body-md text-body-md text-on-primary/80">Os campos com iluminação noturna geram 40% mais reservas entre as 19h e as 21h. Considere ajustar o preço noturno para estas faixas.</p>
<button className="mt-4 flex items-center gap-2 text-on-primary font-bold hover:underline">
                            Ver Analytics <span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
<span className="material-symbols-outlined absolute -bottom-4 -right-4 text-white/10 text-[120px]" data-icon="lightbulb">lightbulb</span>
</div>
</div>
</div>
</main>


{/*  BottomNavBar (Mobile Only)  */}
      </main>
      <Footer />
    </div>
  )
}
