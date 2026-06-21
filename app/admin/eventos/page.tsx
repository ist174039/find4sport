'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  Side Navigation Shell  */}
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
{/*  Top App Bar  */}
<header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant h-16 flex justify-between items-center px-12 transition-all duration-200 ml-64">
<div className="flex items-center gap-8">

</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4 border-r border-outline-variant pr-6">
<button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
<span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="help">help</span>
</button>
</div>
<div className="flex items-center gap-3">
<button className="font-label-md text-label-md text-primary font-bold hover:underline">Ver Perfil Público</button>
<div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed ring-2 ring-surface">
<img alt="Avatar do Profissional" className="w-full h-full object-cover" data-alt="A professional portrait of a sports administrator with a friendly and confident expression, wearing professional attire in a bright, modern office with soft daylight. The environment is clean and sophisticated with hints of emerald green accents in the background decor, reflecting a premium corporate identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAb3c2vQu0x9WrRrUQpLAh-d-bJ2XsY0JUZQDGY-4iH4Y1UFSTZBQ9ZhODcQYHpnD6Ps5nj9ns83FxzWz1qINjSdke7GRa8pBjeYVHgx_KndgKgudFtKEr-U-TneZuxabSxNWEj65z9gU9p6HmcwDcVLUfEyok-67GPweEraFOvIkj1r2tfehRo_OHGowBbW1xzqlhqaa7SnqzA52s4a76BJHck4jW5VahqtEKQc15nM1aFWmRU9SUQ4Zp6bcsxq6n3HKogVqE_" />
</div>
</div>
</div>
</header>
{/*  Main Content Canvas  */}
<div className="pl-64 min-h-screen">
<main className="p-12 max-w-[1400px] mx-auto space-y-gutter">
{/*  Header Section  */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
<div>
<h2 className="font-headline-lg text-headline-lg text-text-primary mb-2">Gerenciamento de Eventos</h2>
<div className="flex items-center gap-4">
<span className="flex items-center gap-1 text-on-surface-variant font-body-md">
<span className="material-symbols-outlined text-[18px]" data-icon="calendar_today">calendar_today</span>
                        24 Eventos Ativos
                    </span>
<span className="flex items-center gap-1 text-on-surface-variant font-body-md">
<span className="material-symbols-outlined text-[18px]" data-icon="pending_actions">pending_actions</span>
                        8 Aguardando Validação
                    </span>
</div>
</div>
{/*  View Toggles & Filters  */}
<div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant">
<button className="flex items-center gap-2 px-6 py-2 rounded-lg bg-surface-container-lowest text-primary shadow-sm font-label-md text-label-md transition-all" id="listViewBtn">
<span className="material-symbols-outlined text-[20px]" data-icon="list">list</span>
                    Lista
                </button>
<button className="flex items-center gap-2 px-6 py-2 rounded-lg text-on-surface-variant hover:text-primary font-label-md text-label-md transition-all" id="calendarViewBtn">
<span className="material-symbols-outlined text-[20px]" data-icon="calendar_month">calendar_month</span>
                    Calendário
                </button>
</div>
</div>
{/*  Bento Layout Grid  */}
<div className="grid grid-cols-12 gap-gutter">
{/*  Validation Queue  */}
<div className="col-span-12 lg:col-span-4 space-y-gutter">
<section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 h-fit">
<div className="flex items-center justify-between mb-6">
<h3 className="font-headline-md text-headline-md text-text-primary">Fila de Validação</h3>
<span className="bg-primary text-on-primary px-2.5 py-0.5 rounded-full text-xs font-bold">8</span>
</div>
<div className="space-y-4">
{/*  Pending Item 1  */}
<div className="p-4 rounded-lg bg-background border border-outline-variant hover:border-primary transition-colors group cursor-pointer">
<div className="flex justify-between items-start mb-2">
<span className="text-[10px] font-bold uppercase tracking-widest text-on-tertiary-fixed-variant bg-tertiary-fixed px-2 py-0.5 rounded">Futebol</span>
<span className="text-[10px] text-on-surface-variant">2h atrás</span>
</div>
<h4 className="font-label-md text-label-md text-text-primary group-hover:text-primary transition-colors">Torneio Relâmpago Inter-Clubes</h4>
<p className="text-[12px] text-on-surface-variant mt-1 mb-3">Criado por: <span className="font-bold">Prof. Carlos Lima</span></p>
<div className="flex gap-2">
<button className="flex-1 text-[12px] font-bold py-1.5 rounded bg-primary-container text-on-primary-container hover:opacity-90">Validar</button>
<button className="px-2 py-1.5 rounded border border-outline-variant text-on-surface-variant hover:bg-error-container hover:text-on-error-container hover:border-error transition-all">
<span className="material-symbols-outlined text-[18px]" data-icon="block">block</span>
</button>
</div>
</div>
{/*  Pending Item 2  */}
<div className="p-4 rounded-lg bg-background border border-outline-variant hover:border-primary transition-colors group cursor-pointer">
<div className="flex justify-between items-start mb-2">
<span className="text-[10px] font-bold uppercase tracking-widest text-on-tertiary-fixed-variant bg-tertiary-fixed px-2 py-0.5 rounded">Tênis</span>
<span className="text-[10px] text-on-surface-variant">5h atrás</span>
</div>
<h4 className="font-label-md text-label-md text-text-primary group-hover:text-primary transition-colors">Aulas em Grupo: Iniciantes</h4>
<p className="text-[12px] text-on-surface-variant mt-1 mb-3">Criado por: <span className="font-bold">Academia MatchPoint</span></p>
<div className="flex gap-2">
<button className="flex-1 text-[12px] font-bold py-1.5 rounded bg-primary-container text-on-primary-container hover:opacity-90">Validar</button>
<button className="px-2 py-1.5 rounded border border-outline-variant text-on-surface-variant hover:bg-error-container hover:text-on-error-container hover:border-error transition-all">
<span className="material-symbols-outlined text-[18px]" data-icon="block">block</span>
</button>
</div>
</div>
{/*  Pending Item 3  */}
<div className="p-4 rounded-lg bg-background border border-outline-variant hover:border-primary transition-colors group cursor-pointer">
<div className="flex justify-between items-start mb-2">
<span className="text-[10px] font-bold uppercase tracking-widest text-on-tertiary-fixed-variant bg-tertiary-fixed px-2 py-0.5 rounded">Corrida</span>
<span className="text-[10px] text-on-surface-variant">Ontem</span>
</div>
<h4 className="font-label-md text-label-md text-text-primary group-hover:text-primary transition-colors">Maratona FIND4Sport Trail</h4>
<p className="text-[12px] text-on-surface-variant mt-1 mb-3">Criado por: <span className="font-bold">Adventure Sports</span></p>
<div className="flex gap-2">
<button className="flex-1 text-[12px] font-bold py-1.5 rounded bg-primary-container text-on-primary-container hover:opacity-90">Validar</button>
<button className="px-2 py-1.5 rounded border border-outline-variant text-on-surface-variant hover:bg-error-container hover:text-on-error-container hover:border-error transition-all">
<span className="material-symbols-outlined text-[18px]" data-icon="block">block</span>
</button>
</div>
</div>
</div>
<button className="w-full mt-6 py-2 text-on-surface-variant hover:text-primary font-label-md text-label-md border-t border-outline-variant pt-4 flex items-center justify-center gap-1 transition-colors">
                        Ver todas as solicitações
                        <span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span>
</button>
</section>
{/*  Quick Stats  */}
<div className="bg-primary-container rounded-xl p-6 text-on-primary-container">
<h3 className="font-label-md text-label-md uppercase tracking-widest opacity-80 mb-4">Métricas do Mês</h3>
<div className="space-y-4">
<div className="flex justify-between items-end">
<div>
<p className="text-3xl font-black">156</p>
<p className="text-xs opacity-80">Novas Inscrições</p>
</div>
<span className="bg-success-mint text-on-tertiary-fixed-variant px-2 py-0.5 rounded text-[10px] font-bold mb-1">+12%</span>
</div>
<div className="flex justify-between items-end">
<div>
<p className="text-3xl font-black">R$ 12.4k</p>
<p className="text-xs opacity-80">Receita Gerada</p>
</div>
<span className="bg-success-mint text-on-tertiary-fixed-variant px-2 py-0.5 rounded text-[10px] font-bold mb-1">+5.4%</span>
</div>
</div>
</div>
</div>
{/*  Events List Section  */}
<div className="col-span-12 lg:col-span-8">
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
{/*  Filters Bar  */}
<div className="p-4 border-b border-outline-variant flex flex-wrap gap-4 items-center justify-between">
<div className="flex gap-2">
<button className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md">Todos</button>
<button className="px-4 py-1.5 rounded-full hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors">Próximos</button>
<button className="px-4 py-1.5 rounded-full hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors">Passados</button>
<button className="px-4 py-1.5 rounded-full hover:bg-surface-container text-on-surface-variant font-label-md text-label-md transition-colors">Rascunhos</button>
</div>
<button className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors">
<span className="material-symbols-outlined text-[20px]" data-icon="filter_list">filter_list</span>
                            Filtros Avançados
                        </button>
</div>
{/*  Events Table  */}
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low border-b border-outline-variant">
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Evento</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Data & Hora</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Status</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Vagas</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant text-right">Ações</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant">
{/*  Table Row 1  */}
<tr className="hover:bg-surface-bright transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden shrink-0">
<img alt="Evento" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDki0gNYrX72gKXnBp6yCbuyKE6s1BnDFQiJQoAeniOBdQcPz4tgmZ42jOgxpmhF9_-3ZNeoHjJkKNBTk1KUGE5u-SvHBQDBTNWaMoAVpScAbRxjhFLk8e3zHMxro4UE7D35OJXwfBEF4PZ5rqqecVLED2JJNVab2Ho48-a9xVbzDSmoQkI4nwX21QRTj-pGasL0lq_sXYd65ZSLNDTxZNbhJwHP6Gp0DqxAIHpS35lGjPxF6lEfbWSty62ACEtF_BZEQw_hEl_" />
</div>
<div>
<p className="font-label-md text-label-md text-text-primary">Campeonato de Futsal Sênior</p>
<p className="text-[12px] text-on-surface-variant">Arena Sport Hub, SP</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="text-label-md text-on-surface-variant">
<p className="font-bold text-text-primary">15 Out, 2023</p>
<p className="text-[12px]">09:00 - 18:00</p>
</div>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-mint text-primary font-label-md text-[11px] font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                            Publicado
                                        </span>
</td>
<td className="px-6 py-4">
<div className="w-full max-w-[80px]">
<div className="flex justify-between text-[10px] mb-1">
<span className="">32/40</span>
<span className="font-bold">80%</span>
</div>
<div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
<div className="bg-primary h-full w-[80%]"></div>
</div>
</div>
</td>
<td className="px-6 py-4 text-right">
<button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-all">
<span className="material-symbols-outlined text-[20px]" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
{/*  Table Row 2  */}
<tr className="hover:bg-surface-bright transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden shrink-0">
<img alt="Evento" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2jnzqe-4SWhy9RnKXCz_s8aTLRn-VHyADiBp4ZAGKDU_sgESrFY8aWKEi_viRhySITmD41XqpgaW9ElgnlV3DNL3X-QskB7yoekiCQtfZUO_WmFUeKkjL7v35Mk0mTFv6pgYAMxGg_Z97X1-rQcDofQlkvtrcxYylRqv-cQoFqKp1gFG--R2BahtHCyciS4TH6lNiRmD_qic5FBMVsoCZN6i4we-YQVyMd2yolt3tZHm7bxtGDSrSNzMp30LnnjPS0V--pn7a" />
</div>
<div>
<p className="font-label-md text-label-md text-text-primary">Clínica de Tênis Profissional</p>
<p className="text-[12px] text-on-surface-variant">Club de Campo, RJ</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="text-label-md text-on-surface-variant">
<p className="font-bold text-text-primary">20 Out, 2023</p>
<p className="text-[12px]">14:00 - 17:00</p>
</div>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-[11px] font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                                            Rascunho
                                        </span>
</td>
<td className="px-6 py-4">
<div className="w-full max-w-[80px]">
<div className="flex justify-between text-[10px] mb-1">
<span className="">0/12</span>
<span className="font-bold">0%</span>
</div>
<div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
<div className="bg-primary h-full w-[0%]"></div>
</div>
</div>
</td>
<td className="px-6 py-4 text-right">
<button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-all">
<span className="material-symbols-outlined text-[20px]" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
{/*  Table Row 3  */}
<tr className="hover:bg-surface-bright transition-colors group">
<td className="px-6 py-4">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden shrink-0">
<img alt="Evento" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl9w4VBZ_7iaAozs101QKlIY5llPrzOKL32w3kt6MwKRQkHiH62ubmsyHPd4aLoUH-yLUDikKgEtWffyQ_alQbmyv3z_HWnI3jDD88wWzmKK9StE7c8qabXxed46B6LxBSUOrv7x0_rDrrupGdzFkM01mJUB0Xn9gP8mik7SGLQq8li4CFm0Hf3gs7RZzAFckLQslgVQynftMJynHJSlSPf-MdMmpIcLgjV6NSx9XN0fAIb4x-w-Ko74ZL-IkdKkIwidFG00fc" />
</div>
<div>
<p className="font-label-md text-label-md text-text-primary">Workshop: Nutrição & Esporte</p>
<p className="text-[12px] text-on-surface-variant">Online (Webinar)</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="text-label-md text-on-surface-variant">
<p className="font-bold text-text-primary">22 Out, 2023</p>
<p className="text-[12px]">19:30 - 21:00</p>
</div>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-error font-label-md text-[11px] font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                                            Pendente Validação
                                        </span>
</td>
<td className="px-6 py-4">
<div className="w-full max-w-[80px]">
<div className="flex justify-between text-[10px] mb-1">
<span className="">--/100</span>
<span className="font-bold">--</span>
</div>
<div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
<div className="bg-primary h-full w-[0%]"></div>
</div>
</div>
</td>
<td className="px-6 py-4 text-right">
<button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-all">
<span className="material-symbols-outlined text-[20px]" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
{/*  Table Row 4  */}
<tr className="hover:bg-surface-bright transition-colors group opacity-60">
<td className="px-6 py-4">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-lg bg-surface-variant overflow-hidden shrink-0 grayscale">
<img alt="Evento" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1bsBIGezyIl74MBpgDu8Iwmpxbm7XW16yBT2N1ZQfhbH1JRXcgJGcBv1shD2IT0myuj69SJWbhjGnFC_32SfsnZzlXxkCA-re9Pt_4dUXtcRs44vLUXuE0Rpa5hm9B8AieIyuFfhf5kav_jhae1xMr7tqcswlYHTH6XFhZkcnQJN9KndEN3aLJ_E8r3YSi7_6CjUfNWXFDVLgB7Iy2ux5hrQeJGi7Re-YI4MB6ABUB7WdiJT47j6ETOGq-M76JgVUUiO1Ny9L" />
</div>
<div>
<p className="font-label-md text-label-md text-text-primary">Corrida de Rua 10k Outubro</p>
<p className="text-[12px] text-on-surface-variant">Parque Ibirapuera, SP</p>
</div>
</div>
</td>
<td className="px-6 py-4">
<div className="text-label-md text-on-surface-variant">
<p className="font-bold text-text-primary">01 Out, 2023</p>
<p className="text-[12px]">07:00 - 11:00</p>
</div>
</td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-md text-[11px] font-bold">
                                            Finalizado
                                        </span>
</td>
<td className="px-6 py-4">
<div className="w-full max-w-[80px]">
<div className="flex justify-between text-[10px] mb-1">
<span className="">500/500</span>
<span className="font-bold">100%</span>
</div>
<div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
<div className="bg-outline h-full w-[100%]"></div>
</div>
</div>
</td>
<td className="px-6 py-4 text-right">
<button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-all">
<span className="material-symbols-outlined text-[20px]" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
{/*  Pagination  */}
<div className="p-6 border-t border-outline-variant flex items-center justify-between">
<p className="text-on-surface-variant text-[12px]">Mostrando 1-10 de 124 eventos</p>
<div className="flex gap-1">
<button className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-30" disabled="">
<span className="material-symbols-outlined text-[20px]" data-icon="chevron_left">chevron_left</span>
</button>
<button className="w-10 h-10 rounded-lg bg-primary text-on-primary font-bold text-[12px]">1</button>
<button className="w-10 h-10 rounded-lg hover:bg-surface-container text-on-surface font-bold text-[12px] transition-colors">2</button>
<button className="w-10 h-10 rounded-lg hover:bg-surface-container text-on-surface font-bold text-[12px] transition-colors">3</button>
<button className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined text-[20px]" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
</div>
</main>
</div>
{/*  Success Feedback (Hidden by Default)  */}
<div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 translate-y-24 opacity-0 transition-all duration-500 z-[100]" id="toast">
<span className="material-symbols-outlined text-primary-fixed" data-icon="check_circle">check_circle</span>
<p className="font-label-md text-label-md">Evento validado com sucesso!</p>
<button className="ml-4 text-on-surface-variant hover:text-inverse-on-surface" onclick="hideToast()">
<span className="material-symbols-outlined text-[20px]" data-icon="close">close</span>
</button>
</div>
      </main>
      <Footer />
    </div>
  )
}
