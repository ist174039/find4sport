'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
<div className="flex items-center gap-8">
<span className="text-headline-md font-headline-md font-bold text-primary">FIND4SPORT</span>

</div>
<div className="flex items-center gap-4">
<div className="hidden lg:flex items-center gap-2">
<span className="material-symbols-outlined text-on-surface-variant">search</span>
<span className="material-symbols-outlined text-on-surface-variant">favorite</span>
<div className="relative">
<span className="material-symbols-outlined text-on-surface-variant">notifications</span>
<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] text-white font-bold">2</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant">person</span>
</div>
<button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all">Sou Profissional</button>
</div>
</header>
{/*  SideNavBar (Desktop Only)  */}
<aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 p-4 pt-20 w-64 bg-surface-container-low border-r border-border-subtle z-40">
<div className="flex items-center gap-3 px-4 py-6 mb-4">
<div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant">
<img alt="Igor Sanchez" className="w-full h-full object-cover" data-alt="A professional headshot of Igor Sanchez, a male personal trainer in his late 30s with a confident and friendly smile. He is wearing a minimalist dark green athletic polo shirt. The background is a clean, softly blurred modern gym environment with natural bright lighting, reflecting a professional and high-performance corporate sports aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIzMn5_382mMeDiUwGFJHMW27ihOZpxrkGYS78Gk1DlVztk2yfMy0lvQMi_Z0UPsr3wsRWu8j2lwF14phvXDGW1fTucbg76G8Tc4jLcWM7UWAmQRAA0vbJExwWHJocw1h-jemHDsjlyKvoGicbOoQBHPLO9ZBq3oTtfwioY92q0SrvFL0At_5dSGcFa7R-63MSCJRHcmcpAel_XLagRydd4IwJ-IVoZw2xbwpPPCbFyfkHDjp-0aoC9PSJJdF2XAJelQiyMXWD"/>
</div>
<div>
<p className="font-headline-sm text-headline-sm text-primary leading-tight">Igor Sanchez</p>
<p className="text-label-md font-label-md text-secondary">Personal Trainer</p>
</div>
</div>

<div className="mt-auto pt-4 space-y-1 border-t border-outline-variant/30">
<a className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-high rounded-lg transition-all" href="#">
<span className="material-symbols-outlined">help</span>
<span className="text-label-md">Suporte</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-lg transition-all" href="#">
<span className="material-symbols-outlined">logout</span>
<span className="text-label-md">Sair</span>
</a>
</div>
</aside>
{/*  Main Content Canvas  */}
<main className="lg:ml-64 pt-24 pb-16 px-margin-mobile md:px-margin-desktop min-h-screen">
<div className="max-w-[1280px] mx-auto">
{/*  Header Section  */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
<div>
<h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">Olá, Igor! 👋</h1>
<p className="text-body-lg font-body-lg text-on-surface-variant">Gerencie o seu perfil, reservas e eventos ativos.</p>
</div>
<div className="flex items-center gap-3">
<div className="flex items-center gap-2 px-3 py-1.5 bg-success-mint text-primary rounded-full border border-primary/20">
<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
<span className="text-label-md font-label-md">Perfil Ativo</span>
</div>
<button className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:shadow-lg transition-all">
<span className="material-symbols-outlined text-[20px]">add</span>
                        Criar Evento
                    </button>
</div>
</div>
{/*  KPI Cards Bento Grid  */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter mb-section-gap">
<div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle hover:shadow-md transition-shadow group">
<div className="flex items-center justify-between mb-4">
<div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
<span className="material-symbols-outlined">visibility</span>
</div>
<span className="text-label-md font-label-md text-primary">+12% este mês</span>
</div>
<p className="text-label-md font-label-md text-secondary uppercase tracking-wider">Visualizações</p>
<h3 className="text-display-lg font-display-lg text-on-surface">1.2K</h3>
</div>
<div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle hover:shadow-md transition-shadow group">
<div className="flex items-center justify-between mb-4">
<div className="p-2 bg-secondary-container/50 rounded-lg text-on-secondary-container group-hover:bg-secondary group-hover:text-white transition-colors">
<span className="material-symbols-outlined">chat_bubble</span>
</div>
<span className="text-label-md font-label-md text-primary">+5 hoje</span>
</div>
<p className="text-label-md font-label-md text-secondary uppercase tracking-wider">Contactos</p>
<h3 className="text-display-lg font-display-lg text-on-surface">340</h3>
</div>
<div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle hover:shadow-md transition-shadow group">
<div className="flex items-center justify-between mb-4">
<div className="p-2 bg-tertiary-container/10 rounded-lg text-tertiary group-hover:bg-tertiary group-hover:text-white transition-colors">
<span className="material-symbols-outlined" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
</div>
<span className="text-label-md font-label-md text-trust-gold">Excelência</span>
</div>
<p className="text-label-md font-label-md text-secondary uppercase tracking-wider">Rating Médio</p>
<h3 className="text-display-lg font-display-lg text-on-surface">4.8</h3>
</div>
<div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle hover:shadow-md transition-shadow group">
<div className="flex items-center justify-between mb-4">
<div className="p-2 bg-primary-container/10 rounded-lg text-primary-container group-hover:bg-primary-container group-hover:text-white transition-colors">
<span className="material-symbols-outlined">bookmark</span>
</div>
<span className="text-label-md font-label-md text-on-surface-variant">24 novos</span>
</div>
<p className="text-label-md font-label-md text-secondary uppercase tracking-wider">Guardados</p>
<h3 className="text-display-lg font-display-lg text-on-surface">86</h3>
</div>
</div>
{/*  Main Dashboard Layout (Asymmetric)  */}
<div className="flex flex-col xl:flex-row gap-gutter">
{/*  Left Column: Tasks & Status  */}
<div className="xl:w-2/3 space-y-gutter">
{/*  Event Validation Section  */}
<section className="glass-card p-8 rounded-2xl">
<div className="flex items-center justify-between mb-6">
<h2 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
<span className="material-symbols-outlined text-primary">verified_user</span>
                                Validação de Presenças
                            </h2>
<button className="text-primary font-label-md text-label-md hover:underline">Ver Histórico</button>
</div>
<div className="bg-primary/5 rounded-xl border border-primary/10 p-6 flex flex-col md:flex-row items-center gap-6">
<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-inner shrink-0">
<span className="material-symbols-outlined text-primary text-[32px]">qr_code_scanner</span>
</div>
<div className="flex-1 text-center md:text-left">
<p className="text-body-lg font-body-lg text-on-surface font-semibold mb-1">Aula de HIIT - Parque das Nações</p>
<p className="text-body-md font-body-md text-secondary mb-3">Há 4 participantes aguardando validação de check-in.</p>
<div className="flex flex-wrap justify-center md:justify-start gap-2">
<button className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-label-md font-label-md">Validar Agora</button>
<button className="px-4 py-1.5 bg-white border border-outline-variant text-on-surface rounded-lg text-label-md font-label-md">Enviar Lembrete</button>
</div>
</div>
</div>
</section>
{/*  Quick Actions Grid  */}
<section>
<h2 className="text-headline-md font-headline-md text-on-surface mb-6">Atalhos de Gestão</h2>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
<button className="flex flex-col items-center justify-center gap-3 p-6 bg-surface-container-lowest border border-border-subtle rounded-xl hover:bg-primary/5 hover:border-primary transition-all group">
<span className="material-symbols-outlined text-secondary group-hover:text-primary transition-colors text-[28px]">edit_square</span>
<span className="text-label-md font-label-md">Editar Perfil</span>
</button>
<button className="flex flex-col items-center justify-center gap-3 p-6 bg-surface-container-lowest border border-border-subtle rounded-xl hover:bg-primary/5 hover:border-primary transition-all group">
<span className="material-symbols-outlined text-secondary group-hover:text-primary transition-colors text-[28px]">photo_library</span>
<span className="text-label-md font-label-md">Galeria</span>
</button>
<button className="flex flex-col items-center justify-center gap-3 p-6 bg-surface-container-lowest border border-border-subtle rounded-xl hover:bg-primary/5 hover:border-primary transition-all group">
<span className="material-symbols-outlined text-secondary group-hover:text-primary transition-colors text-[28px]">sports_kabaddi</span>
<span className="text-label-md font-label-md">Serviços</span>
</button>
<button className="flex flex-col items-center justify-center gap-3 p-6 bg-primary-container text-white rounded-xl hover:shadow-lg transition-all group">
<span className="material-symbols-outlined text-[28px]">event_available</span>
<span className="text-label-md font-label-md">Novo Evento</span>
</button>
</div>
</section>
</div>
{/*  Right Column: Recent Messages  */}
<div className="xl:w-1/3">
<section className="bg-surface-container-lowest p-8 rounded-2xl border border-border-subtle h-full">
<div className="flex items-center justify-between mb-6">
<h2 className="text-headline-md font-headline-md text-on-surface">Mensagens</h2>
<span className="text-label-md font-label-md px-2 py-0.5 bg-error/10 text-error rounded">3 Novas</span>
</div>
<div className="space-y-6">
{/*  Message Item  */}
<div className="flex gap-4 p-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors relative">
<div className="w-12 h-12 rounded-full bg-secondary-container overflow-hidden shrink-0">
<img alt="Ana Silva" className="w-full h-full object-cover" data-alt="A close-up portrait of a female athlete, Ana Silva, with a bright and energetic expression. She has athletic gear on and is in a modern, naturally lit sports facility. The image style is clean, professional, and follows the Emerald Velocity color palette with subtle hints of corporate green and pristine white." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0bmB7j4SHRYuk853j9jjATWcfB2wDip4vvsHFdXlTYsvHZj_83WEhsVlOWP0OxnZMInplmNd6qszL--aipnoIqDg4qyQtfhQ31PeQkEx5xVCSYJ1qCS6axGuQRKpSLYC4bvDNHAEaGfcOOPjLj8Tx1GKkIcRNp8ZXf5tXwfU1yykjk1sXQzbQUm3oZKMotv7f5NcM4lGUf20ooW290PhhmRqobPCF-pEAS2d8ksBCzigrHAOBCX609dKajfUyqMYyA_gdIzhL"/>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-start mb-0.5">
<p className="font-semibold text-on-surface truncate">Ana Silva</p>
<span className="text-[10px] text-secondary">14:20</span>
</div>
<p className="text-body-md text-on-surface-variant truncate font-medium">Ainda tem vaga para amanhã?</p>
</div>
<div className="w-2 h-2 bg-primary rounded-full absolute right-3 top-10"></div>
</div>
<div className="flex gap-4 p-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors">
<div className="w-12 h-12 rounded-full bg-surface-container-high overflow-hidden shrink-0">
<img alt="Marco Dias" className="w-full h-full object-cover" data-alt="A portrait of a male fitness enthusiast, Marco Dias, looking focused and determined. He is in a high-end, minimalist gym setting with soft lighting and a clean aesthetic. The visual tone is professional and energetic, emphasizing clarity and sports performance." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV1GuGFfM9PPSqWhcBuddV2uTAgBsc4BAGLKqEaoOxF64O2mzrtUAawNPxkojk8KKtm2Eh330Pe3EkUvbMFmR20bT-CdriYDEqx4Fn_V8KD6OY9Cy0J24j8IgBLjMtVXt5-GLRWZaO-2A8x6rt8G3ompRJbJSkmVVanoaXmwFanfNJD2aTp87IoSOyMgOOTsvLzSFEVpCHbgJMoVVVudKwsc3NdTvCENVq-QeLKyW_1T-VSS4dTCTl7Y9gZ-7R14rUoN9zemZK"/>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-start mb-0.5">
<p className="font-semibold text-on-surface truncate">Marco Dias</p>
<span className="text-[10px] text-secondary">12:05</span>
</div>
<p className="text-body-md text-on-surface-variant truncate">Obrigado pela aula de hoje!</p>
</div>
</div>
<div className="flex gap-4 p-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors relative">
<div className="w-12 h-12 rounded-full bg-secondary-container overflow-hidden shrink-0">
<img alt="Clara Santos" className="w-full h-full object-cover" data-alt="A professional portrait of Clara Santos, a female yoga enthusiast, in a bright and airy studio. The lighting is soft and flattering, creating a serene and professional mood. The overall style is modern and clean, aligned with the corporate athletic aesthetic of the dashboard." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5HXgf1JasDLwNrBSEOtuxRpMsLkBdYOUP2qQFB5UmSt64dIO9Aphgnw0vkbKNRfquoN2wBbyEVoWabLIJsZsoEJ_TQ__Qldxe24fZmIUNwAKoPFChDwHEEont4hM0maLQEVs_-qh5EuEJAEnqznysaM4MxxladFbr0yhf3IrnUXdi0gaMDU7jAk4P7u4NmD_vI7OmJHn-saic3hrnHANyB9tg4ALFoPaWDP2DyQUT8DmeBBpQk4in_sWywGJp6vHG_q-xJJXf"/>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-start mb-0.5">
<p className="font-semibold text-on-surface truncate">Clara Santos</p>
<span className="text-[10px] text-secondary">Ontem</span>
</div>
<p className="text-body-md text-on-surface-variant truncate font-medium">Gostaria de agendar uma sessão...</p>
</div>
<div className="w-2 h-2 bg-primary rounded-full absolute right-3 top-10"></div>
</div>
</div>
<button className="w-full mt-8 py-3 bg-surface-container border border-outline-variant text-on-surface rounded-xl font-label-md text-label-md hover:bg-surface-container-high transition-all">
                            Ver Todas as Mensagens
                        </button>
</section>
</div>
</div>
</div>
</main>


{/*  FAB for quick action on mobile  */}
<button className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center z-50">
<span className="material-symbols-outlined text-[32px]">add</span>
</button>
      </main>
      <Footer />
    </div>
  )
}
