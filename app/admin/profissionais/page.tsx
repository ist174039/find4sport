'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  SideNavBar  */}
<aside className="h-screen w-[260px] fixed left-0 top-0 bg-surface dark:bg-inverse-surface border-r border-outline-variant dark:border-outline flex flex-col py-8 px-4 z-50">
<div className="mb-10 px-2">
<h1 className="font-headline-md text-headline-md font-[800] text-brand-emerald tracking-tight">FIND4SPORT</h1>
<p className="font-body-md text-body-md text-on-surface-variant">Painel do Profissional</p>
</div>

<div className="mt-auto border-t border-outline-variant pt-6 space-y-1">
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:bg-secondary-container dark:hover:bg-on-secondary-fixed-variant hover:text-on-secondary-container transition-colors duration-200 ease-in-out font-label-md text-label-md rounded-lg" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span>Configurações</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 transition-colors duration-200 ease-in-out font-label-md text-label-md rounded-lg" href="#">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span>Sair</span>
</a>
</div>
</aside>
{/*  Main Content Wrapper  */}
<main className="pl-[260px] min-h-screen">
{/*  TopAppBar  */}
<header className="sticky top-0 z-40 bg-surface-container-lowest dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none h-16 flex justify-between items-center w-full pl-8 pr-margin-desktop">
<div className="flex items-center gap-8">
<h2 className="font-headline-md text-headline-md font-[800] text-brand-emerald">FIND4SPORT</h2>

</div>
<div className="flex items-center gap-6">
{/*  Search Bar  */}
<div className="relative hidden lg:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" data-icon="search">search</span>
<input className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-md font-body-md w-64 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Buscar profissionais..." type="text"/>
</div>
<div className="flex items-center gap-4">
<button className="text-on-surface-variant hover:text-brand-emerald relative transition-all">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
<span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
</button>
<button className="text-on-surface-variant hover:text-brand-emerald transition-all">
<span className="material-symbols-outlined" data-icon="help">help</span>
</button>
<div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
<button className="flex items-center gap-3 group">
<img alt="Avatar do Profissional" className="w-10 h-10 rounded-full border-2 border-primary-fixed group-hover:border-brand-emerald transition-all object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFa_w_dOQPDGpyFnP5L8yhUQBtxPi1Wib1EANydyCgW8lsodyRHlXyM3O_B9a8AwSId0vby7WROwfiST51Nfz9Fjzhfs087_N6lWgMMptWjjCuRzUYZumxpVDZTMlBOCcYYoQLWf5_xOZcTzPhczmUnty_mc5Wg2-P73KOo9JwNrKn6xzy0wtdkHRwJ6_qHJ0XsRFb77wez6GzMl94SIEN4wf_3q6fhaADh1sOyCsu1whXW_6a1s2NVc0kW9aXKYjC2Ulxgn67"/>
<span className="font-label-md text-label-md text-brand-emerald hidden xl:inline">Ver Perfil Público</span>
</button>
</div>
</div>
</header>
{/*  Main Canvas Content  */}
<div className="p-8 max-w-[1400px]">
{/*  Page Header Area  */}
<div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
<div>
<h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Gestão de Profissionais</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant">Aprovação, moderação e monitoramento da base de dados.</p>
</div>
<div className="flex gap-3">
<button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container transition-all">
<span className="material-symbols-outlined" data-icon="filter_list">filter_list</span>
                        Filtros Avançados
                    </button>
<button className="flex items-center gap-2 px-6 py-2.5 bg-brand-emerald text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 shadow-sm transition-all">
<span className="material-symbols-outlined" data-icon="person_add">person_add</span>
                        Convidar Profissional
                    </button>
</div>
</div>
{/*  Stats Overview  */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-section-gap">
<div className="bg-surface-container-lowest p-6 rounded-lg border border-border-subtle hover:shadow-md transition-all">
<div className="flex justify-between items-start mb-4">
<span className="p-2 bg-primary-fixed text-on-primary-fixed-variant rounded-lg material-symbols-outlined" data-icon="group">group</span>
<span className="text-brand-emerald font-label-md text-label-md flex items-center gap-1">+12% <span className="material-symbols-outlined text-[14px]" data-icon="trending_up">trending_up</span></span>
</div>
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total de Profissionais</p>
<p className="font-display-lg text-display-lg text-on-surface mt-1">1.284</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-lg border border-border-subtle hover:shadow-md transition-all">
<div className="flex justify-between items-start mb-4">
<span className="p-2 bg-secondary-fixed text-on-secondary-fixed-variant rounded-lg material-symbols-outlined" data-icon="pending_actions">pending_actions</span>
<span className="bg-error-container text-on-error-container font-label-md text-label-md px-2 py-0.5 rounded-full">Urgente</span>
</div>
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Aguardando Aprovação</p>
<p className="font-display-lg text-display-lg text-on-surface mt-1">42</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-lg border border-border-subtle hover:shadow-md transition-all">
<div className="flex justify-between items-start mb-4">
<span className="p-2 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-lg material-symbols-outlined" data-icon="star">star</span>
<span className="text-trust-gold font-label-md text-label-md">Top 5%</span>
</div>
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Média de Avaliação</p>
<p className="font-display-lg text-display-lg text-on-surface mt-1">4.8</p>
</div>
<div className="bg-surface-container-lowest p-6 rounded-lg border border-border-subtle hover:shadow-md transition-all">
<div className="flex justify-between items-start mb-4">
<span className="p-2 bg-surface-container-highest text-on-surface rounded-lg material-symbols-outlined" data-icon="report">report</span>
</div>
<p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Denúncias Ativas</p>
<p className="font-display-lg text-display-lg text-on-surface mt-1">07</p>
</div>
</div>
{/*  Professional Management Table Container  */}
<div className="bg-surface-container-lowest rounded-lg border border-border-subtle shadow-sm overflow-hidden">
<div className="p-6 border-b border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
<h3 className="font-headline-md text-headline-md text-on-surface">Base de Profissionais</h3>
<div className="flex gap-2">
<div className="bg-surface-container-low p-1 rounded-lg flex">
<button className="px-4 py-1.5 bg-white text-brand-emerald font-label-md text-label-md rounded shadow-sm">Todos</button>
<button className="px-4 py-1.5 text-on-surface-variant font-label-md text-label-md hover:text-on-surface">Ativos</button>
<button className="px-4 py-1.5 text-on-surface-variant font-label-md text-label-md hover:text-on-surface">Pendentes</button>
</div>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low/50">
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase">Profissional</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase">Categoria</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase">Localização</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase">Status</th>
<th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase text-right">Ações</th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle">
{/*  Row 1  */}
<tr className="hover:bg-surface-container-lowest/50 transition-colors group">
<td className="px-6 py-5">
<div className="flex items-center gap-4">
<div className="relative">
<img alt="Foto de Ricardo Silva" className="w-12 h-12 rounded-full object-cover border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCweWvG-SSrkN1y_ECqhqurTfNs_Hjvj92DIGagBzw1tFeoGuhPm1tQxFOVAf-F_qCRyDPwjQsPbQ_YcDjfdejE3wQLZDC-Hi02xGbUCOPFmbryQRyAoNge9Mhg4N5ZEHcmeVAcF-5ONooSGgmNcNocDHT1dW6-MEOC5SHZ1TTVbds3R9kLgL67F-KkyqLHA0P_LaRVv13ZRk1nM6Qisv4rNNRO-Z4akDSoOF_Kpgfwy5G1yh8otCGALxLxbBSx9G8h-wAgkjGJ"/>
<span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-emerald border-2 border-white rounded-full"></span>
</div>
<div>
<p className="font-body-lg text-body-lg font-semibold text-on-surface">Ricardo Silva</p>
<p className="font-body-md text-body-md text-on-surface-variant">ricardo.personal@email.com</p>
</div>
</div>
</td>
<td className="px-6 py-5">
<span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md">Personal Trainer</span>
</td>
<td className="px-6 py-5">
<p className="font-body-md text-body-md text-on-surface-variant">São Paulo, SP</p>
</td>
<td className="px-6 py-5">
<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-mint text-brand-emerald rounded-full font-label-md text-label-md">
<span className="w-1.5 h-1.5 bg-brand-emerald rounded-full"></span>
                                        Ativo
                                    </span>
</td>
<td className="px-6 py-5 text-right">
<div className="flex justify-end gap-2">
<button className="p-2 text-on-surface-variant hover:text-brand-emerald hover:bg-primary-container/20 rounded-lg transition-all" title="Ver Detalhes">
<span className="material-symbols-outlined" data-icon="visibility">visibility</span>
</button>
<button className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-all" title="Bloquear">
<span className="material-symbols-outlined" data-icon="block">block</span>
</button>
</div>
</td>
</tr>
{/*  Row 2  */}
<tr className="hover:bg-surface-container-lowest/50 transition-colors group">
<td className="px-6 py-5">
<div className="flex items-center gap-4">
<img alt="Foto de Amanda Costa" className="w-12 h-12 rounded-full object-cover border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBygGJxbRRqZE4PbuCIhpsvtcmmyZaUyq_MfJ63oz2ZhyhsBD216k-aGGKA-HcmsNGx5IuOoJF0lZISQ5caF9JjKDXJka6twwZBRbZw7k8FXKVUH2-dJhc44inifsy5J6KB-A6x9gTrt2uGQjJcpTRycYQPl91QoiNMDGLKXU74ODltSd77n97EsH9cwooCdyOGwDOIJYh3_gLrULb6FPVxi0Z1AMKxxnq0gs08D_2P802VWcuYVJ_P8xTs95bOmsR3BCjauK07"/>
<div>
<p className="font-body-lg text-body-lg font-semibold text-on-surface">Amanda Costa</p>
<p className="font-body-md text-body-md text-on-surface-variant">amanda.yoga@email.com</p>
</div>
</div>
</td>
<td className="px-6 py-5">
<span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md">Instrutora Yoga</span>
</td>
<td className="px-6 py-5">
<p className="font-body-md text-body-md text-on-surface-variant">Rio de Janeiro, RJ</p>
</td>
<td className="px-6 py-5">
<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-label-md text-label-md">
<span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                                        Pendente
                                    </span>
</td>
<td className="px-6 py-5 text-right">
<div className="flex justify-end gap-2">
<button className="px-4 py-1.5 bg-brand-emerald text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 shadow-sm transition-all">Aprovar</button>
<button className="px-4 py-1.5 border border-error text-error font-label-md text-label-md rounded-lg hover:bg-error-container/10 transition-all">Recusar</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/*  Pagination Footer  */}
<div className="p-6 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-low/30">
<p className="font-body-md text-body-md text-on-surface-variant">Mostrando 1 a 10 de 1.284 profissionais</p>
<div className="flex gap-2">
<button className="p-2 border border-border-subtle rounded-lg text-on-surface-variant hover:bg-white transition-all disabled:opacity-50" disabled="">
<span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
</button>
<button className="w-10 h-10 bg-brand-emerald text-on-primary rounded-lg font-label-md text-label-md shadow-sm">1</button>
<button className="w-10 h-10 border border-border-subtle text-on-surface rounded-lg font-label-md text-label-md hover:bg-white">2</button>
<button className="w-10 h-10 border border-border-subtle text-on-surface rounded-lg font-label-md text-label-md hover:bg-white">3</button>
<span className="flex items-center px-2 text-on-surface-variant">...</span>
<button className="w-10 h-10 border border-border-subtle text-on-surface rounded-lg font-label-md text-label-md hover:bg-white">129</button>
<button className="p-2 border border-border-subtle rounded-lg text-on-surface-variant hover:bg-white transition-all">
<span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>
{/*  Activity Logs & Report Card  */}
<div className="mt-section-gap grid grid-cols-1 lg:grid-cols-3 gap-gutter">
<div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-lg border border-border-subtle shadow-sm">
<h3 className="font-headline-md text-headline-md text-on-surface mb-6">Logs de Atividade</h3>
<div className="space-y-6">
<div className="flex gap-4">
<div className="mt-1 w-8 h-8 rounded-full bg-success-mint flex items-center justify-center text-brand-emerald">
<span className="material-symbols-outlined text-[18px]" data-icon="check_circle">check_circle</span>
</div>
<div>
<p className="font-body-md text-body-md text-on-surface"><span className="font-bold">Administrador Pedro</span> aprovou o cadastro de <span className="font-bold">Ricardo Silva</span>.</p>
<p className="font-label-md text-label-md text-on-surface-variant mt-1">Hoje, às 14:23</p>
</div>
</div>
<div className="flex gap-4">
<div className="mt-1 w-8 h-8 rounded-full bg-error-container/20 flex items-center justify-center text-error">
<span className="material-symbols-outlined text-[18px]" data-icon="cancel">cancel</span>
</div>
<div>
<p className="font-body-md text-body-md text-on-surface"><span className="font-bold">Administrador Pedro</span> recusou o cadastro de <span className="font-bold">Matheus Oliveira</span> por documentação incompleta.</p>
<p className="font-label-md text-label-md text-on-surface-variant mt-1">Hoje, às 11:45</p>
</div>
</div>
</div>
</div>
<div className="bg-brand-emerald p-8 rounded-lg text-on-primary-container relative overflow-hidden">
<div className="relative z-10">
<h4 className="font-headline-md text-headline-md font-bold mb-4">Relatório Semanal</h4>
<p className="font-body-md text-body-md mb-6 text-white/90">O crescimento da rede superou a meta em 8.2% esta semana. Revise os novos profissionais pendentes para manter o tempo de resposta baixo.</p>
<button className="w-full py-3 bg-white text-brand-emerald font-bold rounded-lg hover:bg-surface-container transition-all">Exportar PDF</button>
</div>
<span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[160px] opacity-10 pointer-events-none" data-icon="monitoring">monitoring</span>
</div>
</div>
</div>


</main>
      </main>
      <Footer />
    </div>
  )
}
