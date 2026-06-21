'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  SideNavBar Shell  */}
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
{/*  TopAppBar Shell  */}
<header className="fixed top-0 right-0 left-64 h-16 bg-surface-container-lowest dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm z-40 flex justify-between items-center px-12 transition-all duration-200">
<div className="flex items-center gap-8">
<span className="font-headline-md text-headline-md font-black text-primary dark:text-primary-fixed-dim">FIND4SPORT</span>

</div>
<div className="flex items-center gap-6">
<div className="relative hidden lg:block">
<input className="bg-surface-container-low border-none rounded-full px-4 py-1.5 text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Pesquisar..." type="text" />
<span className="material-symbols-outlined absolute right-3 top-1.5 text-on-surface-variant text-sm">search</span>
</div>
<div className="flex items-center gap-3 border-l border-outline-variant pl-6">
<button className="text-on-surface-variant hover:text-primary transition-colors relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
</button>
<button className="text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">help</span>
</button>
<button className="ml-2 px-4 py-1.5 bg-outline-variant/20 hover:bg-outline-variant/40 rounded-full font-label-md text-label-md text-primary transition-all">
                    Ver Perfil Público
                </button>
<div className="w-8 h-8 rounded-full overflow-hidden bg-secondary-container">
<img alt="Avatar do Profissional" className="w-full h-full object-cover" data-alt="A professional headshot of a athletic trainer in his early 30s with a confident smile. He is wearing high-quality emerald green performance sportswear. The lighting is crisp and bright, characteristic of a high-end commercial photo shoot. The background is a blurred modern gym with clean white walls and professional fitness equipment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs-NFHUDOkHcBZ_UlOBRDufOYeNCPeSKq765l7YV7bRl2F_T73Tac5r7HsqVYNKbaNRscYqfVbcQ14MX86315w-jdj3QqXfTZn8OkAxIQI52TZ6uFz8Etq9wMZz65XNY3maakGk0QAbihIVRCY4d8BYahW0yFJwdInZ2U8zeT2W9_HA9h50CfXtmqocsHKnl7LXtBNxAQdjuNDza3dRV0CwYvCFLgpz9F-2dhlBeVTGRtSHs3LelOg1hwpl45qrhk7vBgZb9FB" />
</div>
</div>
</div>
</header>
{/*  Main Content Canvas  */}
<div className="pl-64 min-h-screen">
<main className="p-12 max-w-[1400px] mx-auto space-y-gutter"><div className="max-w-[1280px] mx-auto">
{/*  User Header Section  */}
<section className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
<div className="relative group">
<div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
<img alt="Foto de Perfil do Profissional" className="w-full h-full object-cover" data-alt="Close-up portrait of a fit professional sports coach with short dark hair and a warm, approachable expression. He is dressed in an emerald green athletic jacket. The image is bright and airy with high-key lighting, emphasizing a clean and high-performance lifestyle. The aesthetic is polished and professional, suitable for a premier sports platform." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK3wwwErGZVUSA_NuzMAsMKTeCIRlGT5da_IGovx6l3LUH3rdT16TxomeZV9grdVGz134EnUJJaZO-WdMndn5b7CSKoOOS83UAF5xXOSbziN6puyvL4GR1CJXzpIRATf4ufegL4Ymqf9705AhTQVMSVDL7KQv6oK9_Kv4ExtJaPDUtF1NO7x9T52pw87EDL09P3gSo-7Hug6ErHoBaTgTyJosYNhaH24YD_dLZTA2QIwqU9RXMaJJs_kuU9aEeE7g-tG76S6bV" />
</div>
<button className="absolute -bottom-2 -right-2 bg-primary text-on-primary p-2 rounded-xl shadow-lg hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-sm">edit</span>
</button>
</div>
<div className="text-center md:text-left">
<div className="flex items-center gap-3 mb-1">
<h2 className="font-headline-lg text-headline-lg text-text-primary">Ricardo Fernandes</h2>
<span className="bg-success-mint text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
<span className="material-symbols-outlined text-[14px]" style={{   fontVariationSettings: '\'FILL\' 1' }}>verified</span>
                            Verificado
                        </span>
</div>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-4">Personal Trainer & Coach de Alta Performance</p>
<div className="flex flex-wrap justify-center md:justify-start gap-4">
<span className="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md">
<span className="material-symbols-outlined text-sm">location_on</span>
                            Lisboa, Portugal
                        </span>
<span className="flex items-center gap-1 text-on-surface-variant font-label-md text-label-md">
<span className="material-symbols-outlined text-sm">calendar_today</span>
                            Membro desde Maio 2023
                        </span>
</div>
</div>
</section>
{/*  KPI Cards Grid (Bento Style)  */}
<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-section-gap">
<div className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all border-l-4 border-l-primary group">
<div className="flex justify-between items-start mb-4">
<span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">favorite</span>
<span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">+12% este mês</span>
</div>
<div>
<p className="font-stat-display text-stat-display text-text-primary">128</p>
<p className="font-label-md text-label-md text-on-surface-variant">Favoritos</p>
</div>
</div>
<div className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all border-l-4 border-l-trust-gold">
<div className="flex justify-between items-start mb-4">
<span className="material-symbols-outlined text-trust-gold bg-trust-gold/10 p-2 rounded-lg" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">4.9 Média</span>
</div>
<div>
<p className="font-stat-display text-stat-display text-text-primary">42</p>
<p className="font-label-md text-label-md text-on-surface-variant">Reviews</p>
</div>
</div>
<div className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all border-l-4 border-l-secondary">
<div className="flex justify-between items-start mb-4">
<span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">contacts</span>
<span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Ativos</span>
</div>
<div>
<p className="font-stat-display text-stat-display text-text-primary">2.4k</p>
<p className="font-label-md text-label-md text-on-surface-variant">Contactos</p>
</div>
</div>
<div className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all border-l-4 border-l-tertiary">
<div className="flex justify-between items-start mb-4">
<span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-lg">visibility</span>
<span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Total</span>
</div>
<div>
<p className="font-stat-display text-stat-display text-text-primary">15.8k</p>
<p className="font-label-md text-label-md text-on-surface-variant">Eventos Vistos</p>
</div>
</div>
</section>
{/*  Main Content Grid  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/*  Personal Data Section  */}
<div className="lg:col-span-8 space-y-gutter">
<section className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant shadow-sm">
<div className="flex items-center justify-between mb-8">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary">person_outline</span>
<h3 className="font-headline-md text-headline-md text-text-primary">Dados Pessoais</h3>
</div>
<button className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline">
<span className="material-symbols-outlined text-sm">edit</span>
                                Editar Tudo
                            </button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="space-y-1.5">
<label className="font-label-md text-label-md text-on-surface-variant">Nome Completo</label>
<input className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" type="text" value="Ricardo Fernandes" />
</div>
<div className="space-y-1.5">
<label className="font-label-md text-label-md text-on-surface-variant">Email Profissional</label>
<input className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" type="email" value="ricardo.pro@find4sport.com" />
</div>
<div className="space-y-1.5">
<label className="font-label-md text-label-md text-on-surface-variant">Telemóvel</label>
<input className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" type="tel" value="+351 912 345 678" />
</div>
<div className="space-y-1.5">
<label className="font-label-md text-label-md text-on-surface-variant">NIF / Identificação Fiscal</label>
<input className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" type="text" value="PT 298 345 120" />
</div>
<div className="md:col-span-2 space-y-1.5">
<label className="font-label-md text-label-md text-on-surface-variant">Bio / Descrição Profissional</label>
<textarea className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" rows="4">Especialista em treino funcional e reabilitação desportiva com mais de 10 anos de experiência. Focado em resultados sustentáveis e motivação de equipas.</textarea>
</div>
</div>
<div className="mt-8 flex justify-end">
<button className="bg-primary text-on-primary px-8 py-3 rounded-xl font-label-md text-label-md shadow-md hover:bg-surface-tint transition-colors">Salvar Alterações</button>
</div>
</section>
</div>
{/*  Preferences & Side Actions  */}
<div className="lg:col-span-4 space-y-gutter">
{/*  Notifications/Preferences  */}
<section className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant shadow-sm">
<div className="flex items-center gap-3 mb-8">
<span className="material-symbols-outlined text-primary">settings_suggest</span>
<h3 className="font-headline-md text-headline-md text-text-primary">Preferências</h3>
</div>
<div className="space-y-6">
<div className="flex items-center justify-between">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">Notificações por Email</span>
<span className="text-[11px] text-on-surface-variant">Receba sumários semanais</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only custom-toggle" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest rounded-full toggle-bg transition-colors duration-200">
<div className="toggle-dot absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 shadow-sm"></div>
</div>
</label>
</div>
<div className="flex items-center justify-between">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">Alertas Push</span>
<span className="text-[11px] text-on-surface-variant">Mensagens em tempo real</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only custom-toggle" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest rounded-full toggle-bg transition-colors duration-200">
<div className="toggle-dot absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 shadow-sm"></div>
</div>
</label>
</div>
<div className="flex items-center justify-between">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">Newsletter FIND4SPORT</span>
<span className="text-[11px] text-on-surface-variant">Dicas e novidades do mercado</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only custom-toggle" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest rounded-full toggle-bg transition-colors duration-200">
<div className="toggle-dot absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 shadow-sm"></div>
</div>
</label>
</div>
<div className="flex items-center justify-between">
<div className="flex flex-col">
<span className="font-label-md text-label-md text-text-primary">Perfil Público Visível</span>
<span className="text-[11px] text-on-surface-variant">Mostrar aos usuários externos</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only custom-toggle" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest rounded-full toggle-bg transition-colors duration-200">
<div className="toggle-dot absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 shadow-sm"></div>
</div>
</label>
</div>
</div>
</section>
{/*  Danger Zone  */}
<section className="bg-error-container/20 p-8 rounded-3xl border border-error/20">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-error">warning</span>
<h3 className="font-headline-md text-headline-md text-error">Zona de Perigo</h3>
</div>
<p className="font-body-md text-body-md text-on-surface-variant mb-6">Ao eliminar a sua conta, todos os seus dados, eventos e histórico de mensagens serão permanentemente removidos.</p>
<button className="w-full border border-error text-error py-3 rounded-xl font-label-md text-label-md hover:bg-error hover:text-on-error transition-all flex items-center justify-center gap-2 group">
<span className="material-symbols-outlined text-sm group-hover:animate-pulse">delete_forever</span>
                            Eliminar Conta
                        </button>
</section>
</div>
</div>
</div></main>
</div>
      </main>
      <Footer />
    </div>
  )
}
