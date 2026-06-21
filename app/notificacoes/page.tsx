'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  SideNavBar  */}
<aside className="h-screen w-64 fixed left-0 top-0 bg-surface border-r border-outline-variant flex flex-col py-8 px-4 z-50"><div className="mb-10 px-2">
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
<header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant h-16 flex justify-between items-center px-12 transition-all duration-200"><div className="flex items-center gap-8">

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
<img alt="Avatar do Profissional" className="w-full h-full object-cover" data-alt="A professional headshot of a fit and energetic male fitness instructor in his late 20s, smiling confidently into the camera. He is wearing a minimalist dark green athletic shirt. The background is a clean, bright, high-end gym environment with soft bokeh lighting. The overall mood is professional, trustworthy, and full of vitality, aligning with an emerald and white corporate palette." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrmuT8mCttdpNEaic729nePrv9F1f2N-Nea7STfxYycU77pcZzvtJsAptwrM3WHa_plvaS0nfXdtktY2gFo3QkGkUDjypHRQm2EGLlTTP1PhgwKXO3awqsqMIkGRBS3FaLskEE4iuNx18wMZJ5CVoj0L0VbFMHZNKIJPLVmj4fnQatv_A8XGdiROOVMStOHJ-Hjm7nJYcMmK4ms55uN5dD4sqCotbIu0kQmyL4vNlP2P6i4spzXp1EqM4_qPuJMngDJZrltt_D" />
</div>
</div>
</div></header>
{/*  Main Content  */}
<div className="pl-64 min-h-screen" id="main-wrapper"><main className="pl-64 min-h-screen"><div className="p-12 max-w-[1400px] mx-auto space-y-gutter">
{/*  Page Header  */}
<div className="flex justify-between items-end mb-10">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Notificações</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">Mantenha-se atualizado com suas atividades e interações na plataforma.</p>
</div>
<button className="flex items-center gap-2 text-primary font-bold px-4 py-2 rounded-lg hover:bg-success-mint transition-all" onclick="markAllAsRead()">
<span className="material-symbols-outlined">done_all</span>
<span className="font-label-md text-label-md">Marcar todas como lidas</span>
</button>
</div>
{/*  Tabs / Filter (Simple Style)  */}
<div className="flex gap-4 mb-8">
<button className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md text-label-md shadow-sm">Todas</button>
<button className="bg-surface-container-high text-on-surface-variant px-6 py-2 rounded-full font-label-md text-label-md hover:bg-primary-fixed-dim hover:text-primary transition-colors">Não Lidas (3)</button>
</div>
{/*  Notifications List  */}
<div className="space-y-4">
{/*  Unread: Novo Evento  */}
<div className="notification-item bg-white p-6 rounded-xl border border-border-subtle flex items-start gap-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all cursor-pointer relative group">
<div className="unread-dot mt-2 absolute left-3 top-6"></div>
<div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-primary-container" style={{   fontVariationSettings: '\'FILL\' 1' }}>event_available</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start mb-1">
<h3 className="font-headline-md text-body-lg font-bold text-on-surface">Novo Evento: Torneio de Verão Padel</h3>
<span className="text-on-surface-variant text-xs font-label-md">Há 10 minutos</span>
</div>
<p className="text-on-surface-variant font-body-md mb-3">Um novo torneio de Padel foi criado na sua zona de preferência. Inscrições abertas agora!</p>
<div className="flex gap-2">
<span className="bg-success-mint text-primary px-2 py-1 rounded text-[10px] font-bold">NOVO EVENTO</span>
<span className="text-primary text-[10px] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">Ver Detalhes <span className="material-symbols-outlined text-[14px]">chevron_right</span></span>
</div>
</div>
</div>
{/*  Unread: Resposta de Profissional  */}
<div className="notification-item bg-white p-6 rounded-xl border border-border-subtle flex items-start gap-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all cursor-pointer relative group">
<div className="unread-dot mt-2 absolute left-3 top-6"></div>
<img alt="Carlos Silva" className="w-12 h-12 rounded-full object-cover shrink-0" data-alt="A close-up portrait of a male tennis coach in his late 30s with a warm and professional expression. He is outdoors on a tennis court, with a clear blue sky background. He wears a branded white polo shirt. The lighting is bright and natural, reflecting a high-performance sports aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVYuIajA0WL0ukS2x3DDWrBW0fEPJ7UDYmrHAWT4FjDVFq9v_LPEa_NwtM02v6JJkJT29uFZRjlp4kRLeadAgE6vjiYjBWK5yC0URUW_JdqoniJuMWVAHibUbLPxgBhP1TqAmVxgg_trV03ChjgPAB2tj-q7DzjYJR-r7WT9QCORRRdRfVO5t_8GCj92SH67vWjDsmpLuPs8r2uy8dE83GWE57cXfokat41nwFenz0K4B3zWP_Z0ciA23pvTy_nqALubInCtNZ" />
<div className="flex-1">
<div className="flex justify-between items-start mb-1">
<h3 className="font-headline-md text-body-lg font-bold text-on-surface">Carlos Silva respondeu à sua mensagem</h3>
<span className="text-on-surface-variant text-xs font-label-md">Há 1 hora</span>
</div>
<p className="text-on-surface-variant font-body-md mb-3">"Olá! Tenho disponibilidade para a aula de amanhã às 10:00. Podemos confirmar?"</p>
<div className="flex gap-2">
<span className="bg-secondary-container text-secondary px-2 py-1 rounded text-[10px] font-bold">RESPOSTA</span>
<span className="text-primary text-[10px] font-bold flex items-center gap-1">Responder Agora <span className="material-symbols-outlined text-[14px]">chat</span></span>
</div>
</div>
</div>
{/*  Unread: Espaço Perto de Ti  */}
<div className="notification-item bg-white p-6 rounded-xl border border-border-subtle flex items-start gap-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all cursor-pointer relative group">
<div className="unread-dot mt-2 absolute left-3 top-6"></div>
<div className="w-12 h-12 bg-tertiary-container rounded-lg flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-tertiary-container">map</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start mb-1">
<h3 className="font-headline-md text-body-lg font-bold text-on-surface">Novo Espaço: Arena Beach Tennis</h3>
<span className="text-on-surface-variant text-xs font-label-md">Há 3 horas</span>
</div>
<p className="text-on-surface-variant font-body-md mb-3">Uma nova arena de Beach Tennis acaba de abrir a 2km da sua localização. Aproveite o desconto de inauguração.</p>
<div className="flex gap-2">
<span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-1 rounded text-[10px] font-bold">ESPAÇO PERTO DE TI</span>
</div>
</div>
</div>
{/*  Read: Review Publicada  */}
<div className="notification-item bg-surface-container-low opacity-80 p-6 rounded-xl border border-border-subtle flex items-start gap-5 hover:opacity-100 transition-all cursor-pointer group">
<div className="w-12 h-12 bg-surface-variant rounded-lg flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-surface-variant" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start mb-1">
<h3 className="font-headline-md text-body-lg font-bold text-on-surface">Review Publicada</h3>
<span className="text-on-surface-variant text-xs font-label-md">Ontem</span>
</div>
<p className="text-on-surface-variant font-body-md mb-3">Sua avaliação sobre "CrossFit Elite Hub" foi aprovada e já está visível para a comunidade.</p>
<div className="flex gap-2 items-center">
<span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold">REVIEW</span>
<div className="flex text-trust-gold">
<span className="material-symbols-outlined text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
</div>
</div>
</div>
</div>
{/*  Read: Outra Notificação Antiga  */}
<div className="notification-item bg-surface-container-low opacity-80 p-6 rounded-xl border border-border-subtle flex items-start gap-5 hover:opacity-100 transition-all cursor-pointer group">
<div className="w-12 h-12 bg-surface-variant rounded-lg flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-surface-variant">check_circle</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start mb-1">
<h3 className="font-headline-md text-body-lg font-bold text-on-surface">Pagamento Confirmado</h3>
<span className="text-on-surface-variant text-xs font-label-md">2 dias atrás</span>
</div>
<p className="text-on-surface-variant font-body-md mb-3">Recebemos o pagamento para a sua reserva no Estádio Municipal para o dia 15/10.</p>
<div className="flex gap-2">
<span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold">SISTEMA</span>
</div>
</div>
</div>
</div>
{/*  Empty State Loader (Hidden)  */}
<div className="hidden flex-col items-center justify-center py-20 text-center" id="empty-state">
<span className="material-symbols-outlined text-6xl text-outline-variant mb-4">notifications_off</span>
<h4 className="font-headline-md text-headline-md text-on-surface">Tudo limpo por aqui!</h4>
<p className="text-on-surface-variant font-body-lg mt-2">Você não tem novas notificações no momento.</p>
</div>
</div></main></div>
      </main>
      <Footer />
    </div>
  )
}
