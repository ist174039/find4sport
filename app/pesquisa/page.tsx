'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  Main Viewport (Split Layout)  */}
<main className="flex-1 mt-16 flex flex-col md:flex-row overflow-hidden">
{/*  Results Pane  */}
<section className="w-full md:w-[600px] lg:w-[640px] flex flex-col bg-surface-container-lowest border-r border-border-subtle">
{/*  Filters Header  */}
<div className="p-4 border-b border-border-subtle bg-white z-10">
<div className="flex items-center justify-between mb-4">
<h1 className="font-headline-md text-headline-md">Resultados em Lisboa</h1>
<span className="text-text-secondary font-label-md text-label-md">124 profissionais encontrados</span>
</div>
<div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
<button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-lg font-label-md text-label-md border border-border-subtle hover:border-primary transition-colors"><span className="material-symbols-outlined text-[18px]">distance</span>Raio (10km)</button>
<button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-lg font-label-md text-label-md border border-border-subtle hover:border-primary transition-colors"><span className="material-symbols-outlined text-[18px]">payments</span>Preço</button>
<button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md transition-colors shadow-sm"><span className="material-symbols-outlined text-[18px]">event_available</span>Disponível Hoje</button>
<button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-lg font-label-md text-label-md border border-border-subtle hover:border-primary transition-colors"><span className="material-symbols-outlined text-[18px]">star</span>4.5+</button>
<button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-lg font-label-md text-label-md border border-border-subtle hover:border-primary transition-colors"><span className="material-symbols-outlined text-[18px]">tune</span>Mais Filtros</button>
</div>
</div>
{/*  Scrollable Results List  */}
<div className="flex-1 overflow-y-auto p-4 space-y-4">
{/*  Professional Card 1  */}
<div className="group flex bg-white border border-border-subtle p-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-primary/20 transition-all cursor-pointer rounded-lg">
<div className="relative">
<img className="w-24 h-24 rounded-lg object-cover" data-alt="A professional fitness trainer smiling confidently in a high-tech gym setting. The lighting is crisp and cool-toned, with bright green LED accents in the background that align with the brand's aesthetic. He is wearing high-performance athletic wear, and the overall atmosphere is energetic, professional, and trustworthy." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP0AZ9l7ZJH9ocmf_tBmljVdmhlFU2bxMJhkkvIiv7hqN7Kj-klPnbtOIievBQuda-GI61Rb9H1xHtphAgYv9lNLQycuqSBtoSJpMvzSv7vzGCnm5RaHWH03aPj7c93vMtAXAnPRJkoLwqxSHGGG4c9XVkZwa4QxbSwSkgX_gwQuy53OkHoxHHg1Hjg92zHnbaC0LkVmxHhe98ayrK0_t8q7IuMeTT5iJeBT0UHxjUmwAn2gOQvWF3trUnlmtMOXLDeE6iefjr" />
<span className="absolute -top-2 -right-2 bg-success-mint text-primary font-bold text-[10px] px-2 py-0.5 rounded-full border border-primary/20">VERIFICADO</span>
</div>
<div className="ml-4 flex-1">
<div className="flex justify-between items-start">
<div>
<h3 className="font-headline-md text-[18px] leading-tight">Igor Sanchez</h3>
<p className="text-text-secondary font-label-md text-label-md mt-1">Personal Trainer & Crossfit Coach</p>
</div>
<div className="flex items-center bg-surface-container-low px-2 py-1 rounded-lg">
<span className="material-symbols-outlined text-trust-gold text-[16px]" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="ml-1 font-bold text-label-md">4.9</span>
</div>
</div>
<div className="mt-2 flex flex-wrap gap-2">
<span className="text-text-secondary font-label-md text-[10px] uppercase tracking-wider flex items-center">
<span className="material-symbols-outlined text-[14px] mr-1">location_on</span> Lisboa, Belém
                            </span>
<span className="text-text-secondary font-label-md text-[10px] uppercase tracking-wider flex items-center">
<span className="material-symbols-outlined text-[14px] mr-1">schedule</span> Disponível 08:00 - 20:00
                            </span>
</div>
<div className="mt-4 flex justify-between items-center">
<span className="font-stat-display text-primary">35€<span className="text-text-secondary text-label-md">/hora</span></span>
<button className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-all px-4 py-1.5 rounded-lg font-label-md text-label-md">Reservar</button>
</div>
</div>
</div>
{/*  Professional Card 2  */}
<div className="group flex bg-white border border-border-subtle p-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all cursor-pointer rounded-lg">
<div className="relative">
<img className="w-24 h-24 rounded-lg object-cover" data-alt="A focused female wellness coach in a serene, bright studio with warm natural lighting and soft shadows. The environment is minimalist and clean, reflecting a high-end health and recovery ecosystem. She has a welcoming expression, dressed in premium activewear. The color palette is composed of soft whites and brand-consistent emerald accents." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsYFfZUiVtWRYm6nyVlpS_GelqILpuo4HMy9VBRMQtzrnf4_2WNrEhAGmLS-ivynU9b6Fa-CVBCH8_Soog6hbmaBqNAI_fwaQfEvg-0zZqLzoSsZqdCxEdQdp5vrrkRLxcWdnwnyShE-5jIFfgJLuah20vM1cpUlj95-6dRhSF3xGIXWLi_Bs0yZyn2slMrQhKzQpk9fcS413Tx_x_D8eCBIWd_HXUKjg7LxoXw3zKom6NUrs76jFkOt4VX69LZKE_Nf7yeWfM" />
</div>
<div className="ml-4 flex-1">
<div className="flex justify-between items-start">
<div>
<h3 className="font-headline-md text-[18px] leading-tight">Laura Monteiro</h3>
<p className="text-text-secondary font-label-md text-label-md mt-1">Yoga & Recuperação Funcional</p>
</div>
<div className="flex items-center bg-surface-container-low px-2 py-1 rounded-lg">
<span className="material-symbols-outlined text-trust-gold text-[16px]" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="ml-1 font-bold text-label-md">4.8</span>
</div>
</div>
<div className="mt-2 flex flex-wrap gap-2">
<span className="text-text-secondary font-label-md text-[10px] uppercase tracking-wider flex items-center">
<span className="material-symbols-outlined text-[14px] mr-1">location_on</span> Lisboa, Areeiro
                            </span>
</div>
<div className="mt-4 flex justify-between items-center">
<span className="font-stat-display text-primary">25€<span className="text-text-secondary text-label-md">/hora</span></span>
<button className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-all px-4 py-1.5 rounded-lg font-label-md text-label-md">Reservar</button>
</div>
</div>
</div>
{/*  Professional Card 3  */}
<div className="group flex bg-white border border-border-subtle p-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all cursor-pointer rounded-lg">
<div className="relative">
<img className="w-24 h-24 rounded-lg object-cover" data-alt="A specialized sports performance coach demonstrating technique in an outdoor athletics track. The scene is bright with high noon sunlight, creating high-contrast and sharp clarity. He is wearing high-performance gear with visible branding. The background shows a modern stadium structure, emphasizing professional excellence and athletic rigor in a corporate sports context." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRuIu-jn8mR_n0_NQHVlxl0akFQUBTg9i1ZSbmMN4DtZ8o0nuIlVCNZaz73OtE_fhEkpcYaAneVSDPCaIebORjW1l2dfrShOoOKOk1Zs1kS7EfuK7oTDSypYrRfOq4rC1YqWxBilAqHXnmrb8hpprqTwx9hhgeytOcKS0UXpuIEZ0N9hrLLS4Lb-lpBq5_aVqIRRWwMpyEbrrJy7A2y1QYdPLETI5l8RRCQ8nDIcq8q73MHqQXQLQPrrhqEXw-jVyGA0h-8U0s" />
</div>
<div className="ml-4 flex-1">
<div className="flex justify-between items-start">
<div>
<h3 className="font-headline-md text-[18px] leading-tight">César Martins</h3>
<p className="text-text-secondary font-label-md text-label-md mt-1">Treinador de Futebol Alta Performance</p>
</div>
<div className="flex items-center bg-surface-container-low px-2 py-1 rounded-lg">
<span className="material-symbols-outlined text-trust-gold text-[16px]" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="ml-1 font-bold text-label-md">4.7</span>
</div>
</div>
<div className="mt-2 flex flex-wrap gap-2">
<span className="text-text-secondary font-label-md text-[10px] uppercase tracking-wider flex items-center">
<span className="material-symbols-outlined text-[14px] mr-1">location_on</span> Amadora
                            </span>
</div>
<div className="mt-4 flex justify-between items-center">
<span className="font-stat-display text-primary">40€<span className="text-text-secondary text-label-md">/hora</span></span>
<button className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-all px-4 py-1.5 rounded-lg font-label-md text-label-md">Reservar</button>
</div>
</div>
</div>
{/*  Professional Card 4 (Placeholder for demo)  */}
<div className="group flex bg-white border border-border-subtle p-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all cursor-pointer rounded-lg">
<div className="relative">
<img className="w-24 h-24 rounded-lg object-cover" data-alt="An action-packed shot of a physical therapist working with an athlete in a bright, modern recovery clinic. The room has large windows letting in soft, diffused light. There is a sense of professional care and expert knowledge. The color scheme is clinical yet warm, with subtle emerald tones integrated into the room's design and equipment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAP3t1rK9rD--6cy96ijDl8iBTnflR67upOXXa4l-C60xRcfSJSH6RCg6J0UV_1D0M7IIYjNabgYPoPaweAZTcSnz77no4yll5k4AaHjpplVSynQ7CdEYxeRtgyH-3TuIU0cw43Lu2c865BarViTsw1Waftd5B-cDLWuVoUolluM0VDqY4-YQr8mww_uLiH6AopGEHSExNZuCoc2rw8xpZLT63kb-vLZi-_-5mdtcVngMEkBiimt4bLKN67HCdzT3g3sCvuMOqb" />
</div>
<div className="ml-4 flex-1">
<div className="flex justify-between items-start">
<div>
<h3 className="font-headline-md text-[18px] leading-tight">Sofia Nascimento</h3>
<p className="text-text-secondary font-label-md text-label-md mt-1">Fisioterapia Desportiva</p>
</div>
<div className="flex items-center bg-surface-container-low px-2 py-1 rounded-lg">
<span className="material-symbols-outlined text-trust-gold text-[16px]" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="ml-1 font-bold text-label-md">5.0</span>
</div>
</div>
<div className="mt-2 flex flex-wrap gap-2">
<span className="text-text-secondary font-label-md text-[10px] uppercase tracking-wider flex items-center">
<span className="material-symbols-outlined text-[14px] mr-1">location_on</span> Restelo
                            </span>
</div>
<div className="mt-4 flex justify-between items-center">
<span className="font-stat-display text-primary">45€<span className="text-text-secondary text-label-md">/sessão</span></span>
<button className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-all px-4 py-1.5 rounded-lg font-label-md text-label-md">Reservar</button>
</div>
</div>
</div>
</div>
</section>
{/*  Map Pane  */}
<section className="hidden md:flex flex-1 relative bg-surface-container-high">
{/*  Simulated Map Component  */}
<div className="absolute inset-0 bg-[#e5e7eb] overflow-hidden">
<div className="w-full h-full bg-cover bg-center opacity-80" data-location="Lisbon" style={{   backgroundImage: 'url(\'https://lh3.googleusercontent.com/aida-public/AB6AXuA9AGUS1QAgV7_-TxI8fiAck1cvJy1MFTfApOls2zXz5x7YqR4QfSrGChrUYI-hjMDYD77wAyokympomNd692uZTfc7ITerJfDYRCjhHBlgxEypLFDGIhMKci_aIPJZk-I3F_D3eu2d6F6NPdvFwQf-APtKeHm0gGTcxzeVrcSgOlchAAOLPlKgzJS5E1NQztwB3DxEwatf6C1vhl_q6t6Ylqd1_pr9qCawsiMYPOQiBL445jLlmGJWdSYi_5TZIqhGeqqwwJk_\')' }}>
</div>
{/*  Map Interaction Overlays  */}
<div className="absolute top-4 left-4 flex flex-col gap-2">
<button className="bg-white p-2 rounded-lg shadow-lg hover:bg-surface-container-lowest transition-all"><span className="material-symbols-outlined">add</span></button>
<button className="bg-white p-2 rounded-lg shadow-lg hover:bg-surface-container-lowest transition-all"><span className="material-symbols-outlined">remove</span></button>
</div>
{/*  Professional Markers  */}
{/*  Marker 1 (Igor)  */}
<div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 group">
<div className="bg-primary text-on-primary px-3 py-1.5 font-bold shadow-xl border-2 border-white flex items-center gap-2 cursor-pointer transition-transform group-hover:scale-110 active:scale-95 rounded-lg">
<span className="font-label-md text-label-md">35€</span>
<div className="w-2 h-2 bg-success-mint rounded-full"></div>
</div>
<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary"></div>
</div>
{/*  Marker 2 (Laura)  */}
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
<div className="bg-white text-primary px-3 py-1.5 font-bold shadow-xl border-2 border-primary flex items-center gap-2 cursor-pointer transition-transform group-hover:scale-110 active:scale-95 rounded-lg">
<span className="font-label-md text-label-md">25€</span>
</div>
<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
</div>
{/*  Marker 3 (César)  */}
<div className="absolute bottom-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2 group">
<div className="bg-white text-primary px-3 py-1.5 font-bold shadow-xl border-2 border-primary flex items-center gap-2 cursor-pointer transition-transform group-hover:scale-110 active:scale-95 rounded-lg">
<span className="font-label-md text-label-md">40€</span>
</div>
<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
</div>
</div>
{/*  Redo Search in area button  */}
<div className="absolute top-4 left-1/2 -translate-x-1/2">
<button className="bg-white border border-border-subtle px-6 py-2 shadow-md flex items-center gap-2 font-label-md text-label-md hover:bg-surface-container-low transition-all rounded-lg">
<span className="material-symbols-outlined text-[18px]">refresh</span>
                    Pesquisar nesta zona
                </button>
</div>
</section>
</main>
{/*  BottomNavBar (Mobile Only)  */}
      </main>
      <Footer />
    </div>
  )
}
