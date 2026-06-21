'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  SideNavBar  */}
<aside className="h-screen w-64 fixed left-0 top-0 bg-surface dark:bg-inverse-surface border-r border-outline-variant dark:border-outline flex flex-col py-8 px-4 z-50"><div className="mb-10 px-2">
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
</div></aside>
{/*  TopAppBar  */}
<header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant h-16 flex justify-between items-center px-12 transition-all duration-200">
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
<img alt="Avatar do Profissional" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBA68r10W2gkwU0Wa9RMEeuXchkdVLeCKmioYLMcflukZt_NdPxHCp6HPPDbRv_PS3lq-H8PxeW-VTFa0cRbY2EHqawLxH1IP9bicwwxcIcVlw-dyFSRQJq8_gMbLN0pyxGJnTDyFoKfzW6OBajloQsTvhFqlconiRVy_D6f7x5gp-SiD5AsB3tZZ9qKMrJFzcLG9TfKpVaF2hPhENUrXRteOtArKZzcAf8C1UAYH5nSHxfGhGsg06LLWvDRRAZCyS7TF9jWgKb" />
</div>
</div>
</div>
</header>
{/*  Main Content  */}
<main className="pl-64 min-h-screen p-12 max-w-[1400px] mx-auto space-y-gutter">
<div className="max-w-[1280px] mx-auto">
<header className="mb-10">
<h2 className="font-headline-lg text-headline-lg text-text-primary">Dashboard Global</h2>
<p className="font-body-lg text-text-secondary">Bem-vindo de volta ao centro de operações da FIND4SPORT.</p>
</header>
{/*  KPI Cards Grid  */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-10">
{/*  Total Professionals  */}
<div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle hover:shadow-lg transition-all duration-300">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-primary-fixed rounded-lg">
<span className="material-symbols-outlined text-on-primary-fixed" data-icon="groups">groups</span>
</div>
<span className="text-xs font-label-md text-primary font-bold">+12% vs mês ant.</span>
</div>
<p className="text-on-surface-variant font-label-md">Total Professionals</p>
<h3 className="font-display-lg text-display-lg text-on-surface mt-1">523</h3>
</div>
{/*  Total Spaces  */}
<div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle hover:shadow-lg transition-all duration-300">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-secondary-fixed rounded-lg">
<span className="material-symbols-outlined text-on-secondary-fixed" data-icon="stadium">stadium</span>
</div>
<span className="text-xs font-label-md text-secondary font-bold">+5% vs mês ant.</span>
</div>
<p className="text-on-surface-variant font-label-md">Total Spaces</p>
<h3 className="font-display-lg text-display-lg text-on-surface mt-1">217</h3>
</div>
{/*  Active Events  */}
<div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle hover:shadow-lg transition-all duration-300">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-tertiary-fixed rounded-lg">
<span className="material-symbols-outlined text-on-tertiary-fixed" data-icon="exercise">exercise</span>
</div>
<div className="flex items-center gap-1 text-tertiary">
<span className="material-symbols-outlined text-[16px]" data-icon="trending_up">trending_up</span>
<span className="text-xs font-label-md font-bold">Ativo</span>
</div>
</div>
<p className="text-on-surface-variant font-label-md">Active Events</p>
<h3 className="font-display-lg text-display-lg text-on-surface mt-1">84</h3>
</div>
{/*  Pending Reviews (Alert State)  */}
<div className="bg-error-container/20 p-6 rounded-xl border border-error/20 hover:shadow-lg transition-all duration-300">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-error-container rounded-lg">
<span className="material-symbols-outlined text-error" data-icon="notification_important">notification_important</span>
</div>
<span className="text-xs font-label-md text-error font-bold italic">Ação Necessária</span>
</div>
<p className="text-on-surface-variant font-label-md">Pending Reviews</p>
<h3 className="font-display-lg text-display-lg text-error mt-1">7</h3>
</div>
</div>
{/*  Main Dashboard Layout  */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
{/*  Chart Section  */}
<div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl border border-border-subtle">
<div className="flex justify-between items-center mb-8">
<div>
<h4 className="font-headline-md text-headline-md text-on-surface">Crescimento de Usuários</h4>
<p className="font-body-md text-on-surface-variant">Análise de novos perfis e visualizações nos últimos 30 dias.</p>
</div>
<div className="flex gap-2">
<button className="px-3 py-1 bg-surface-container-low rounded-lg text-label-md border border-outline-variant">Mensal</button>
<button className="px-3 py-1 bg-primary text-on-primary rounded-lg text-label-md">Semanal</button>
</div>
</div>
{/*  Asymmetric Visual Bar Chart Representation  */}
<div className="h-64 flex items-end justify-between gap-2 px-4 mb-4">
<div className="w-full bg-primary/20 rounded-t-lg chart-bar hover:bg-primary transition-all cursor-pointer" style={{   height: '40%' }} title="Dia 1: 120"></div>
<div className="w-full bg-primary/20 rounded-t-lg chart-bar hover:bg-primary transition-all cursor-pointer" style={{   height: '55%' }} title="Dia 2: 165"></div>
<div className="w-full bg-primary/20 rounded-t-lg chart-bar hover:bg-primary transition-all cursor-pointer" style={{   height: '35%' }} title="Dia 3: 105"></div>
<div className="w-full bg-primary/20 rounded-t-lg chart-bar hover:bg-primary transition-all cursor-pointer" style={{   height: '60%' }} title="Dia 4: 180"></div>
<div className="w-full bg-primary/20 rounded-t-lg chart-bar hover:bg-primary transition-all cursor-pointer" style={{   height: '80%' }} title="Dia 5: 240"></div>
<div className="w-full bg-primary/20 rounded-t-lg chart-bar hover:bg-primary transition-all cursor-pointer" style={{   height: '65%' }} title="Dia 6: 195"></div>
<div className="w-full bg-primary/20 rounded-t-lg chart-bar hover:bg-primary transition-all cursor-pointer" style={{   height: '90%' }} title="Dia 7: 270"></div>
<div className="w-full bg-primary/20 rounded-t-lg chart-bar hover:bg-primary transition-all cursor-pointer" style={{   height: '75%' }} title="Dia 8: 225"></div>
<div className="w-full bg-primary/20 rounded-t-lg chart-bar hover:bg-primary transition-all cursor-pointer" style={{   height: '45%' }} title="Dia 9: 135"></div>
<div className="w-full bg-primary/20 rounded-t-lg chart-bar hover:bg-primary transition-all cursor-pointer" style={{   height: '50%' }} title="Dia 10: 150"></div>
<div className="w-full bg-primary/20 rounded-t-lg chart-bar hover:bg-primary transition-all cursor-pointer" style={{   height: '95%' }} title="Dia 11: 285"></div>
<div className="w-full bg-primary/20 rounded-t-lg chart-bar hover:bg-primary transition-all cursor-pointer" style={{   height: '70%' }} title="Dia 12: 210"></div>
</div>
<div className="flex justify-between px-2 text-label-md text-on-surface-variant font-bold border-t border-outline-variant pt-4">
<span className="">Semana 01</span>
<span className="">Semana 02</span>
<span className="">Semana 03</span>
<span className="">Semana 04</span>
</div>
</div>
{/*  Alerts Panel  */}
<div className="bg-surface-container-lowest p-8 rounded-xl border border-border-subtle flex flex-col">
<div className="flex items-center gap-2 mb-6">
<span className="material-symbols-outlined text-error" data-icon="warning">warning</span>
<h4 className="font-headline-md text-headline-md text-on-surface">Alertas Críticos</h4>
</div>
<div className="space-y-4 flex-grow">
{/*  Alert Item  */}
<div className="p-4 bg-error-container/10 border-l-4 border-error rounded-r-lg flex gap-4 items-start">
<span className="material-symbols-outlined text-error mt-1" data-icon="history">history</span>
<div>
<p className="font-label-md text-on-error-container font-bold">Prazos de Moderação</p>
<p className="text-body-md text-on-surface-variant">3 perfis pendentes por mais de 48h. Risco de churn aumentado.</p>
</div>
</div>
{/*  Alert Item  */}
<div className="p-4 bg-error-container/10 border-l-4 border-error rounded-r-lg flex gap-4 items-start">
<span className="material-symbols-outlined text-error mt-1" data-icon="database">database</span>
<div>
<p className="font-label-md text-on-error-container font-bold">Cota de API</p>
<p className="text-body-md text-on-surface-variant">Limite de chamadas atingiu 90%. Possível interrupção em breve.</p>
</div>
</div>
{/*  Info Item  */}
<div className="p-4 bg-primary-container/10 border-l-4 border-primary rounded-r-lg flex gap-4 items-start">
<span className="material-symbols-outlined text-primary mt-1" data-icon="info">info</span>
<div>
<p className="font-label-md text-on-primary-fixed-variant font-bold">Atualização do Sistema</p>
<p className="text-body-md text-on-surface-variant">Manutenção programada para o próximo domingo às 02:00 AM.</p>
</div>
</div>
</div>
<button className="mt-8 w-full py-3 border border-error text-error font-label-md rounded-lg hover:bg-error hover:text-on-error transition-all">
                        Resolver Todos os Alertas
                    </button>
</div>
{/*  Recent Activity Section (Wide layout below)  */}
<div className="lg:col-span-3 mt-4">
<div className="bg-surface-container-lowest p-8 rounded-xl border border-border-subtle">
<div className="flex justify-between items-center mb-8">
<h4 className="font-headline-md text-headline-md text-on-surface">Atividade Recente</h4>
<button className="text-primary font-label-md flex items-center gap-1 hover:underline">
                                Ver todo o log <span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="border-b border-outline-variant">
<tr className="text-on-surface-variant font-label-md">
<th className="pb-4 px-2">Ação</th>
<th className="pb-4 px-2">Usuário / Entidade</th>
<th className="pb-4 px-2">Data / Hora</th>
<th className="pb-4 px-2">Status</th>
<th className="pb-4 px-2 text-right">Ações</th>
</tr>
</thead>
<tbody className="text-body-md">
<tr className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-all">
<td className="py-4 px-2 flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-[18px]" data-icon="person_add">person_add</span>
</div>
                                            Novo Registro
                                        </td>
<td className="py-4 px-2 font-bold">Ana M. (Profissional)</td>
<td className="py-4 px-2 text-on-surface-variant">Hoje, 10:45 AM</td>
<td className="py-4 px-2">
<span className="px-2 py-1 bg-success-mint text-primary rounded-full text-[10px] font-bold uppercase">Verificado</span>
</td>
<td className="py-4 px-2 text-right">
<button className="material-symbols-outlined text-on-surface-variant hover:text-primary" data-icon="more_vert">more_vert</button>
</td>
</tr>
<tr className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-all">
<td className="py-4 px-2 flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
<span className="material-symbols-outlined text-secondary text-[18px]" data-icon="cloud_download">cloud_download</span>
</div>
                                            Importação em Massa
                                        </td>
<td className="py-4 px-2 font-bold">Gym Plus Sintra (Espaço)</td>
<td className="py-4 px-2 text-on-surface-variant">Hoje, 09:12 AM</td>
<td className="py-4 px-2">
<span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase">Processando</span>
</td>
<td className="py-4 px-2 text-right">
<button className="material-symbols-outlined text-on-surface-variant hover:text-primary" data-icon="more_vert">more_vert</button>
</td>
</tr>
<tr className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-all">
<td className="py-4 px-2 flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center">
<span className="material-symbols-outlined text-error text-[18px]" data-icon="report">report</span>
</div>
                                            Denúncia de Evento
                                        </td>
<td className="py-4 px-2 font-bold">Torneio Crossfit Cascais</td>
<td className="py-4 px-2 text-on-surface-variant">Ontem, 06:30 PM</td>
<td className="py-4 px-2">
<span className="px-2 py-1 bg-error-container text-on-error-container rounded-full text-[10px] font-bold uppercase">Pendente</span>
</td>
<td className="py-4 px-2 text-right">
<button className="material-symbols-outlined text-on-surface-variant hover:text-primary" data-icon="more_vert">more_vert</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-all">
<td className="py-4 px-2 flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center">
<span className="material-symbols-outlined text-tertiary text-[18px]" data-icon="edit">edit</span>
</div>
                                            Edição de Perfil
                                        </td>
<td className="py-4 px-2 font-bold">Roberto S. (Treinador)</td>
<td className="py-4 px-2 text-on-surface-variant">Ontem, 02:15 PM</td>
<td className="py-4 px-2">
<span className="px-2 py-1 bg-success-mint text-primary rounded-full text-[10px] font-bold uppercase">Sucesso</span>
</td>
<td className="py-4 px-2 text-right">
<button className="material-symbols-outlined text-on-surface-variant hover:text-primary" data-icon="more_vert">more_vert</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</div>
</main>
      </main>
      <Footer />
    </div>
  )
}
