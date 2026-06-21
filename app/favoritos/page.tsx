'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <main className="pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto min-h-screen">
{/*  Header & Tabs  */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
<div>
<h1 className="text-headline-lg font-headline-lg text-text-primary mb-2">Os Meus Favoritos</h1>
<p className="text-text-secondary text-body-lg">Gere as suas preferências e itens guardados em todo o ecossistema FIND4SPORT.</p>
</div>
</div>
{/*  Filter Tabs  */}
<div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
<button className="tab-btn px-6 py-2.5 rounded-full font-label-md text-label-md bg-primary text-on-primary transition-all shadow-sm" onclick="filterType('all')">Todos</button>
<button className="tab-btn px-6 py-2.5 rounded-full font-label-md text-label-md bg-white text-on-surface-variant border border-border-subtle hover:border-primary transition-all" onclick="filterType('pro')">Profissionais</button>
<button className="tab-btn px-6 py-2.5 rounded-full font-label-md text-label-md bg-white text-on-surface-variant border border-border-subtle hover:border-primary transition-all" onclick="filterType('space')">Espaços</button>
<button className="tab-btn px-6 py-2.5 rounded-full font-label-md text-label-md bg-white text-on-surface-variant border border-border-subtle hover:border-primary transition-all" onclick="filterType('event')">Eventos</button>
</div>
{/*  Favorites Grid  */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter" id="favorites-grid">
{/*  Professional Card  */}
<div className="group relative bg-white rounded-xl overflow-hidden border border-border-subtle hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-type="pro">
<div className="relative h-48 overflow-hidden">
<img alt="Personal Trainer" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="A professional male personal trainer in a high-end modern gym setting, wearing sleek emerald green athletic gear. The lighting is bright and energetic with clean white walls and professional fitness equipment in the background. The visual style is crisp and corporate with high-definition clarity and a focus on movement and vitality." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvkvLkvyKIXZca6MQ1fg5BZBVdNbVVO-Wp3rekio-e-Sxkn81p0cWkLN6Sx3YrO1-hGOG2tTaLaSJG4exmJD7WTEaxjt2qirFYTrhuNkoj8tEXpFwm-QEIXJIml3ryWGSIx2upSxIaoGLUIh5gMXbMveofd-ROtZ-GAyj9giEjEQX5UF7hXvnJeVARgqIfSJ5JIcCPDn0Gt3-kdqLhFKjF7k3rmM8zoYY7eXs76dkf9COUopUvv6fP_BI56ovQEdSVRt_DwsNS"/>
<button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-primary hover:scale-110 transition-transform shadow-md" onclick="unfavorite(this)">
<span className="material-symbols-outlined filled-heart" style={{   fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
</button>
<div className="absolute bottom-3 left-3 px-2 py-1 bg-success-mint text-primary font-label-md text-label-md rounded flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Disponível
                    </div>
</div>
<div className="p-4">
<div className="flex justify-between items-start mb-1">
<span className="text-label-md font-label-md text-primary uppercase tracking-wider">Personal Trainer</span>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-trust-gold text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-label-md">4.9</span>
</div>
</div>
<h3 className="text-headline-md font-headline-md text-text-primary mb-1">Ricardo Pereira</h3>
<p className="text-body-md text-text-secondary flex items-center gap-1 mb-4">
<span className="material-symbols-outlined text-sm">location_on</span> Lisboa, Portugal
                    </p>
<button className="w-full py-2 border border-primary text-primary rounded-lg font-semibold text-body-md hover:bg-primary hover:text-white transition-colors">Marcar Sessão</button>
</div>
</div>
{/*  Space Card  */}
<div className="group relative bg-white rounded-xl overflow-hidden border border-border-subtle hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-type="space">
<div className="relative h-48 overflow-hidden">
<img alt="Crossfit Box" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="An expansive, modern crossfit box with high industrial ceilings and natural light streaming through large windows. The floor is covered in premium dark rubber matting with vibrant emerald green accents on the equipment racks. The atmosphere is professional and clean, embodying high performance and luxury athletic training environments." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPQYaH3fXJKIyTaYupcTA94O5Q0coob1HDLpnJ71Sh4Nc-41WvqWQlPZqcAA9yC57dqT2P99_Zm3WVH9pyCK-d-BKOqa4sc3UgT4VZfKQXkzmilIBjUzCMEX9DV8zlr7GDOuXc6CpJbAVj_kwS55yrmcW5M_wvpjR4lG-wt9nFtcYC1VgZvJf0tU6iE6Sj3NCo9X-e5FqPwd7GtU8PF_ZgBJUOshQ4TBNOtaF66wBnAmeprRrkkLJBjyhazXRUJqkbFoTOT-fZ"/>
<button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-primary hover:scale-110 transition-transform shadow-md" onclick="unfavorite(this)">
<span className="material-symbols-outlined filled-heart" style={{   fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
</button>
</div>
<div className="p-4">
<div className="flex justify-between items-start mb-1">
<span className="text-label-md font-label-md text-primary uppercase tracking-wider">Ginásio & Box</span>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-trust-gold text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-label-md">4.8</span>
</div>
</div>
<h3 className="text-headline-md font-headline-md text-text-primary mb-1">The Iron Warehouse</h3>
<p className="text-body-md text-text-secondary flex items-center gap-1 mb-4">
<span className="material-symbols-outlined text-sm">location_on</span> Porto, Portugal
                    </p>
<button className="w-full py-2 border border-primary text-primary rounded-lg font-semibold text-body-md hover:bg-primary hover:text-white transition-colors">Ver Espaço</button>
</div>
</div>
{/*  Event Card  */}
<div className="group relative bg-white rounded-xl overflow-hidden border border-border-subtle hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-type="event">
<div className="relative h-48 overflow-hidden">
<img alt="Paddle Tournament" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="An action-packed paddle tennis tournament taking place on a bright outdoor court with intense sunlight and deep shadows. The court surface is a vibrant blue, while players wear contemporary emerald green and white uniforms. The scene is filled with energy, motion, and a professional sporting spirit, captured in a clean, modern photographic style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMT_YZzTghAOf3i2LWa3bta3xTh_eGuptA4J33eIEd8sFN3vp9MZ5HMVunV_AQ-t2XZv1zhybdtlRYLjWVNUFe-9OJ_QhsLrQVw2wUpZ5S_aZJGFW4syndEZVg47McBd9Xa0aVMbYRabkSY0tyskF4kdRbo5_4hdCQRQtAQEUx67MkjuFuszquPnPuamFzxdi2rY5Ti0IYtnXYowdle_vHYfIsLwf3giKXgviwMhFtrohrztGwAUxx_gl-pBA_lG5O6naimzn_"/>
<button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-primary hover:scale-110 transition-transform shadow-md" onclick="unfavorite(this)">
<span className="material-symbols-outlined filled-heart" style={{   fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
</button>
<div className="absolute top-3 left-3 px-3 py-1 bg-primary text-on-primary font-bold text-label-md rounded shadow-sm">
                        15 OUT
                    </div>
</div>
<div className="p-4">
<div className="flex justify-between items-start mb-1">
<span className="text-label-md font-label-md text-primary uppercase tracking-wider">Torneio</span>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-trust-gold text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-label-md">5.0</span>
</div>
</div>
<h3 className="text-headline-md font-headline-md text-text-primary mb-1">Open Padel Cascais</h3>
<p className="text-body-md text-text-secondary flex items-center gap-1 mb-4">
<span className="material-symbols-outlined text-sm">schedule</span> 09:00 — 18:00
                    </p>
<button className="w-full py-2 border border-primary text-primary rounded-lg font-semibold text-body-md hover:bg-primary hover:text-white transition-colors">Inscrição</button>
</div>
</div>
{/*  More Cards to fill the grid  */}
{/*  Professional Card 2  */}
<div className="group relative bg-white rounded-xl overflow-hidden border border-border-subtle hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" data-type="pro">
<div className="relative h-48 overflow-hidden">
<img alt="Yoga Instructor" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="A serene yoga instructor in a bright, minimalist studio with warm wooden floors and large windows. She is wearing elegant dark green activewear and performing a balanced pose. The lighting is soft and natural, creating a peaceful yet focused professional atmosphere that reflects luxury wellness and athletic precision." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDI2AsD7V982Wje0lfv9zXFVpW4TkZ8ZFzR7P0dVYQGOFY_KN8-Qh_2Y32aTPWCEtxG6qPzH3-PljmZ-MO_QMIvwrji9TcAZfVMoVMGtt685krL8zqMYkplsoHyXp0-l4WbZdmQT-5VDYOuAmQpUIoop2rAXJZ3BwVFYrDohAw3QzNN2XGaFSmCF5rFib0Ua39mqtVL3pLUQwWuFYb331BJxPW-dVeTmdmJ-Cwj_p2Zj0hwR9qB2sOP8r4r1ku_9QIY4o0lz3hv"/>
<button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full text-primary hover:scale-110 transition-transform shadow-md" onclick="unfavorite(this)">
<span className="material-symbols-outlined filled-heart" style={{   fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
</button>
</div>
<div className="p-4">
<div className="flex justify-between items-start mb-1">
<span className="text-label-md font-label-md text-primary uppercase tracking-wider">Instrutora Yoga</span>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-trust-gold text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-label-md">4.7</span>
</div>
</div>
<h3 className="text-headline-md font-headline-md text-text-primary mb-1">Sofia Almeida</h3>
<p className="text-body-md text-text-secondary flex items-center gap-1 mb-4">
<span className="material-symbols-outlined text-sm">location_on</span> Braga, Portugal
                    </p>
<button className="w-full py-2 border border-primary text-primary rounded-lg font-semibold text-body-md hover:bg-primary hover:text-white transition-colors">Ver Perfil</button>
</div>
</div>
</div>
{/*  Empty State (Hidden by default)  */}
<div className="hidden flex-col items-center justify-center py-20 text-center" id="empty-state">
<span className="material-symbols-outlined text-6xl text-outline-variant mb-4">favorite_border</span>
<h2 className="text-headline-md font-headline-md text-text-primary">Ainda não tem favoritos</h2>
<p className="text-text-secondary mb-8">Comece a explorar profissionais e espaços para os guardar aqui.</p>
<button className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all">Explorar Agora</button>
</div>
</main>


{/*  Side Navigation (Web)  */}
<aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 p-4 w-64 bg-surface-container-low border-r border-border-subtle z-40 pt-20">
<div className="px-2 mb-8">
<div className="flex items-center gap-3 p-2 bg-white rounded-xl shadow-sm border border-border-subtle">
<div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">IS</div>
<div>
<p className="text-label-md font-bold text-on-surface leading-none">Igor Sanchez</p>
<p className="text-xs text-text-secondary">Personal Trainer</p>
</div>
</div>
</div>
<div className="flex-1 flex flex-col gap-1">
<a className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-high transition-all rounded-lg" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span className="text-label-md font-label-md">Dashboard</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-high transition-all rounded-lg" href="#">
<span className="material-symbols-outlined">calendar_today</span>
<span className="text-label-md font-label-md">Reservas</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container font-semibold rounded-lg scale-[0.98]" href="#">
<span className="material-symbols-outlined filled-heart" style={{   fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
<span className="text-label-md font-label-md">Favoritos</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-high transition-all rounded-lg" href="#">
<span className="material-symbols-outlined">groups</span>
<span className="text-label-md font-label-md">Clientes</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-high transition-all rounded-lg" href="#">
<span className="material-symbols-outlined">payments</span>
<span className="text-label-md font-label-md">Finanças</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-high transition-all rounded-lg" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="text-label-md font-label-md">Configurações</span>
</a>
</div>
<div className="flex flex-col gap-1 pt-4 border-t border-border-subtle">
<a className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-high transition-all rounded-lg" href="#">
<span className="material-symbols-outlined">help</span>
<span className="text-label-md font-label-md">Suporte</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 transition-all rounded-lg" href="#">
<span className="material-symbols-outlined">logout</span>
<span className="text-label-md font-label-md">Sair</span>
</a>
</div>
</aside>
      </main>
      <Footer />
    </div>
  )
}
