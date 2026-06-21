'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col h-full py-base space-y-2 shadow-sm z-50">
<div className="px-6 py-8">
<h1 className="font-headline-sm text-headline-md font-black text-primary">FIND4SPORT</h1>
<div className="mt-6 flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
<span className="material-symbols-outlined">person</span>
</div>
<div>
<p className="font-headline-sm text-[16px] font-bold text-on-surface">Gestão Finder</p>
<p className="font-label-md text-text-secondary">Plano Profissional</p>
</div>
</div>
</div>

<div className="p-4 border-t border-border-subtle">
<button className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity mb-4">
                Novo Evento
            </button>
<ul className="space-y-1">
<li>
<a className="text-on-surface-variant hover:bg-surface-container-high rounded-lg px-4 py-2 flex items-center gap-3 transition-all" href="#">
<span className="material-symbols-outlined">help</span>
<span className="font-label-md">Suporte</span>
</a>
</li>
<li>
<a className="text-on-surface-variant hover:bg-surface-container-high rounded-lg px-4 py-2 flex items-center gap-3 transition-all" href="#">
<span className="material-symbols-outlined">logout</span>
<span className="font-label-md">Sair</span>
</a>
</li>
</ul>
</div>
</aside>
<main className="ml-64 min-h-screen p-margin-desktop">
<header className="flex justify-between items-end mb-8">
<div>

<h2 className="font-headline-lg text-headline-lg text-text-primary">Configuração de Áreas</h2>
</div>
<button className="bg-primary text-on-primary flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-sm hover:shadow-md transition-all">
<span className="material-symbols-outlined">add</span>
                Novo Subespaço
            </button>
</header>
<div className="grid grid-cols-12 gap-gutter">
{/*  Subspaces List (Bento-style items)  */}
<section className="col-span-4 flex flex-col gap-4">
<div className="bg-surface-container-lowest border border-primary p-5 rounded-xl shadow-sm cursor-pointer relative overflow-hidden ring-2 ring-primary">
<div className="absolute top-0 right-0 p-2">
<span className="bg-success-mint text-primary font-label-md px-2 py-1 rounded">Ativo</span>
</div>
<div className="flex items-center gap-4">
<div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[32px]">sports_tennis</span>
</div>
<div>
<h3 className="font-headline-md text-[18px] text-text-primary">Campo de Ténis A</h3>
<p className="text-text-secondary font-label-md">Ténis • Piso Rápido</p>
</div>
</div>
</div>
<div className="bg-surface-container-lowest border border-border-subtle p-5 rounded-xl hover:border-primary transition-all cursor-pointer">
<div className="flex items-center gap-4">
<div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined text-[32px]">sports_tennis</span>
</div>
<div>
<h3 className="font-headline-md text-[18px] text-text-primary">Campo de Ténis B</h3>
<p className="text-text-secondary font-label-md">Ténis • Terra Batida</p>
</div>
</div>
</div>
<div className="bg-surface-container-lowest border border-border-subtle p-5 rounded-xl hover:border-primary transition-all cursor-pointer">
<div className="flex items-center gap-4">
<div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined text-[32px]">self_improvement</span>
</div>
<div>
<h3 className="font-headline-md text-[18px] text-text-primary">Sala de Yoga Zen</h3>
<p className="text-text-secondary font-label-md">Bem-estar • Interior</p>
</div>
</div>
</div>
<div className="bg-surface-container-lowest border border-border-subtle p-5 rounded-xl hover:border-primary transition-all cursor-pointer">
<div className="flex items-center gap-4">
<div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined text-[32px]">fitness_center</span>
</div>
<div>
<h3 className="font-headline-md text-[18px] text-text-primary">Estúdio CrossFit</h3>
<p className="text-text-secondary font-label-md">Treino • Funcional</p>
</div>
</div>
</div>
</section>
{/*  Configuration Canvas  */}
<section className="col-span-8 space-y-gutter">
{/*  Header of Selected Space  */}
<div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-xl flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-variant">
<img className="w-full h-full object-cover" data-alt="A professional high-performance tennis court with a vivid blue hardcourt surface and crisp white lines. The lighting is bright and afternoon sun-like, creating sharp shadows. The surrounding fencing is dark green, maintaining a clean and elite athletic club atmosphere, following a modern sports marketplace aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwAcAqkdhX05dcCqGTi5k6bRDjVpEmRgJRpb7F5_-Tj3_9zDl4RubjFjajev-MQQ1d2mBnCccCrBkbaS9HIWFVO8fcXdEAvjpJHxfEz5P9wDzg-m9YhEkpfXHqdJ4xFdXNQFTeQ3fa0KiLjSHwRC8ew9hN7aLsMv-hxitWKfFlSK4aoVM_pYsMOg76NFjOI-zoAfY7VHcy_EbJKQOTlVejYNqgGX9lDfoe30ne4HcdT8IlJ71w4_MXayxHdLgy6SoRT6Yrs72z" />
</div>
<div>
<h3 className="font-headline-md text-text-primary">Campo de Ténis A</h3>
<p className="text-text-secondary">Definições de agendamento e preçário</p>
</div>
</div>
<div className="flex gap-2">
<button className="p-2 text-text-secondary hover:bg-surface-container rounded-full transition-all">
<span className="material-symbols-outlined">edit</span>
</button>
<button className="p-2 text-error hover:bg-error-container rounded-full transition-all">
<span className="material-symbols-outlined">delete</span>
</button>
</div>
</div>
<div className="grid grid-cols-2 gap-gutter">
{/*  Weekly Schedule  */}
<div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-xl">
<div className="flex items-center justify-between mb-6">
<h4 className="font-headline-sm text-[16px] font-bold text-text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-primary">schedule</span>
                                Horário Semanal
                            </h4>
<button className="text-primary font-label-md hover:underline">Repetir para todos</button>
</div>
<div className="space-y-3">
{/*  Day row  */}
<div className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-lg transition-colors">
<span className="font-label-md w-16">SEG - SEX</span>
<div className="flex items-center gap-2">
<input className="w-20 px-2 py-1 bg-surface-container text-center rounded border-none focus:ring-2 focus:ring-primary font-body-md" type="text" value="08:00" />
<span className="text-text-secondary">-</span>
<input className="w-20 px-2 py-1 bg-surface-container text-center rounded border-none focus:ring-2 focus:ring-primary font-body-md" type="text" value="22:00" />
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox" />
<div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
{/*  Day row  */}
<div className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded-lg transition-colors">
<span className="font-label-md w-16">SÁBADO</span>
<div className="flex items-center gap-2">
<input className="w-20 px-2 py-1 bg-surface-container text-center rounded border-none focus:ring-2 focus:ring-primary font-body-md" type="text" value="09:00" />
<span className="text-text-secondary">-</span>
<input className="w-20 px-2 py-1 bg-surface-container text-center rounded border-none focus:ring-2 focus:ring-primary font-body-md" type="text" value="20:00" />
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox" />
<div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
{/*  Day row  */}
<div className="flex items-center justify-between p-2 opacity-50 bg-surface-container-low rounded-lg">
<span className="font-label-md w-16">DOMINGO</span>
<span className="font-body-md italic text-text-secondary flex-grow text-center">Encerrado</span>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox" />
<div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</div>
{/*  Price Slots  */}
<div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-xl">
<div className="flex items-center justify-between mb-6">
<h4 className="font-headline-sm text-[16px] font-bold text-text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-primary">payments</span>
                                Faixas de Preço
                            </h4>
<button className="text-primary font-label-md hover:underline">+ Adicionar</button>
</div>
<div className="space-y-4">
<div className="p-4 bg-surface-container-low rounded-lg border-l-4 border-primary">
<div className="flex justify-between items-center mb-1">
<span className="font-label-md text-text-secondary uppercase">Horário Normal</span>
<span className="font-headline-md text-primary text-[16px]">15.00€ / hora</span>
</div>
<p className="text-body-md font-bold">08:00 — 17:00</p>
</div>
<div className="p-4 bg-surface-container-low rounded-lg border-l-4 border-trust-gold">
<div className="flex justify-between items-center mb-1">
<span className="font-label-md text-text-secondary uppercase">Horário Premium</span>
<span className="font-headline-md text-primary text-[16px]">25.00€ / hora</span>
</div>
<p className="text-body-md font-bold">17:00 — 22:00</p>
</div>
<div className="p-4 bg-surface-container-low rounded-lg border-l-4 border-secondary">
<div className="flex justify-between items-center mb-1">
<span className="font-label-md text-text-secondary uppercase">Fim de Semana</span>
<span className="font-headline-md text-primary text-[16px]">20.00€ / hora</span>
</div>
<p className="text-body-md font-bold">Todo o dia</p>
</div>
</div>
</div>
</div>
{/*  Blocking Periods (Maintenance)  */}
<div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-xl">
<div className="flex items-center justify-between mb-6">
<h4 className="font-headline-sm text-[16px] font-bold text-text-primary flex items-center gap-2">
<span className="material-symbols-outlined text-primary">block</span>
                            Períodos de Bloqueio (Manutenção)
                        </h4>
<button className="bg-surface-container text-on-surface-variant px-4 py-2 rounded-lg font-label-md hover:bg-surface-container-high transition-colors">
                            Bloquear Período
                        </button>
</div>
<div className="overflow-hidden border border-border-subtle rounded-lg">
<table className="w-full text-left">
<thead className="bg-surface-container-low font-label-md text-text-secondary border-b border-border-subtle">
<tr>
<th className="px-6 py-3">Motivo</th>
<th className="px-6 py-3">Data/Hora Início</th>
<th className="px-6 py-3">Data/Hora Fim</th>
<th className="px-6 py-3 text-right">Ações</th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle">
<tr className="hover:bg-surface-container-lowest transition-colors">
<td className="px-6 py-4 font-body-md font-bold">Lavagem do Piso</td>
<td className="px-6 py-4 text-text-secondary">12 Mar, 08:00</td>
<td className="px-6 py-4 text-text-secondary">12 Mar, 12:00</td>
<td className="px-6 py-4 text-right">
<button className="text-error hover:underline font-label-md">Remover</button>
</td>
</tr>
<tr className="hover:bg-surface-container-lowest transition-colors">
<td className="px-6 py-4 font-body-md font-bold">Reparação Rede</td>
<td className="px-6 py-4 text-text-secondary">25 Mar, 14:00</td>
<td className="px-6 py-4 text-text-secondary">25 Mar, 16:00</td>
<td className="px-6 py-4 text-right">
<button className="text-error hover:underline font-label-md">Remover</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
<div className="flex justify-end gap-4 mt-8">
<button className="px-8 py-3 rounded-lg border border-border-subtle font-bold text-text-secondary hover:bg-surface-container-low transition-colors">
                        Descartar Alterações
                    </button>
<button className="px-8 py-3 rounded-lg bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                        Guardar Configuração
                    </button>
</div>
</section>
</div>
</main>
      </main>
      <Footer />
    </div>
  )
}
