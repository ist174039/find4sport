'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <header className="w-full sticky top-0 bg-surface z-50 border-b border-border-subtle">

</header>
<main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-10 min-h-screen">
{/*  Header Section  */}
<div className="mb-10">
<h1 className="font-headline-lg text-headline-lg text-text-primary mb-2">As Minhas Reservas</h1>
<p className="text-text-secondary font-body-lg">Gira as tuas marcações de atividades desportivas e espaços.</p>
</div>
{/*  Layout Wrapper  */}
<div className="flex flex-col lg:flex-row gap-gutter">
{/*  Left Sidebar Navigation (User Profile Context)  */}
<aside className="w-full lg:w-64 flex-shrink-0">
<div className="bg-surface-container-lowest rounded-xl p-4 border border-border-subtle">
<div className="flex items-center gap-3 mb-6 p-2">
<img alt="Profile" className="w-12 h-12 rounded-full object-cover" data-alt="A professional close-up portrait of a cheerful young man with a friendly smile, set against a soft, blurred studio background. The lighting is bright and airy, typical of a high-end clean corporate profile photo, emphasizing healthy skin tones and a modern, minimalist aesthetic that aligns with the athletic and professional brand." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT7-yLkJhSvsxKf5u2BL1Lx0CRvOjELdM299IUa-JpWODWUvD4jruo49LnzPPm4_6zkSyeQfx-i94aElwCcykE6AvH41gNhnCr8WSRqfLw-3IcByCRXe8SsBQ0AFNEsW_Wgd_3lk0kMarbreFw8x2J5Fh7wWohCK7AXzRaQyClC0XcvAhwZ_lWpxEcJs-nJHiX21KjckNbhNSuMExRNFkKOOEcRwNnW989M7uKgvpey8oVNpgM9nBtRiCZEoZZXDogfU_YFvy_" />
<div>
<p className="font-headline-md text-label-md text-text-primary">João Silva</p>
<p className="text-label-md text-text-secondary">Membro desde 2023</p>
</div>
</div>

</div>
</aside>
{/*  Main Content Area: Reservations  */}
<div className="flex-grow">
{/*  Filter Tabs  */}
<div className="flex gap-8 border-b border-border-subtle mb-8">
<button className="active-tab pb-4 font-label-md transition-all" id="tab-proximas" onclick="switchTab('proximas')">Próximas</button>
<button className="text-text-secondary hover:text-primary pb-4 font-label-md transition-all" id="tab-passadas" onclick="switchTab('passadas')">Passadas</button>
<button className="text-text-secondary hover:text-primary pb-4 font-label-md transition-all" id="tab-canceladas" onclick="switchTab('canceladas')">Canceladas</button>
</div>
{/*  Reservations List  */}
<div className="space-y-gutter" id="reservas-container">
{/*  Reservation Card 1 (Upcoming)  */}
<div className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
<div className="flex flex-col md:flex-row">
<div className="md:w-48 h-40 md:h-auto overflow-hidden">
<img alt="Campo de Padel" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A modern, high-tech indoor gym facility with industrial ceilings, featuring advanced cardio machines and weightlifting racks. The scene is illuminated by crisp natural light pouring through large glass windows, creating a professional and energetic atmosphere. The color palette is dominated by clean greys, whites, and subtle metallic accents." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9HttCa-8PtOa2iqWBVD97LpsAHvypzWJ2KZLsX6Gxhu6nhtUmJD0otb6Mr4rb7tavTfUpXtQ6qkfp8AqvXGmbE5C8AXvXOqFAEKaHen9dCGkqeQ9EphbDR3I8a4pymlfzXm7OHBV00ePkPuBLIILKZ8Napqw6a6wSHx5uqa35Bvl-LTmEPzSS0X0hMb2PRVmhpxQEmky6d9j1IzwWTrGKBJTex96L-nxn4QofAJGj0hzo_rDyLpcfvbx7ExEUcT568aYcUCBA" />
</div>
<div className="p-6 flex-grow flex flex-col justify-between">
<div className="flex flex-col md:flex-row justify-between items-start mb-4">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider">Espaço</span>
<span className="flex items-center gap-1 text-trust-gold">
<span className="material-symbols-outlined text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-label-md">4.9</span>
</span>
</div>
<h3 className="font-headline-md text-headline-md text-text-primary">Clube de Padel Quinta da Marinha</h3>
<p className="text-text-secondary text-body-md flex items-center gap-1">
<span className="material-symbols-outlined text-base">location_on</span> Cascais, Portugal
                                        </p>
</div>
<div className="mt-4 md:mt-0 text-right">
<span className="bg-success-mint text-primary font-label-md px-3 py-1 rounded-full border border-primary/20">Confirmada</span>
</div>
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border-subtle/50 mb-4">
<div>
<p className="text-[10px] text-text-secondary uppercase font-bold mb-1">Data</p>
<p className="font-body-lg text-text-primary">24 Out 2024</p>
</div>
<div>
<p className="text-[10px] text-text-secondary uppercase font-bold mb-1">Hora</p>
<p className="font-body-lg text-text-primary">18:30 - 20:00</p>
</div>
<div>
<p className="text-[10px] text-text-secondary uppercase font-bold mb-1">Preço</p>
<p className="font-body-lg text-text-primary">32,00 €</p>
</div>
<div>
<p className="text-[10px] text-text-secondary uppercase font-bold mb-1">Campo</p>
<p className="font-body-lg text-text-primary">Nº 4 (Panorâmico)</p>
</div>
</div>
<div className="flex justify-end gap-3">
<button className="px-4 py-2 text-error font-label-md hover:bg-error/5 rounded-lg transition-colors">Cancelar Reserva</button>
<button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:bg-primary-container transition-all">Ver Detalhes</button>
</div>
</div>
</div>
</div>
{/*  Reservation Card 2 (Pending)  */}
<div className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
<div className="flex flex-col md:flex-row">
<div className="md:w-48 h-40 md:h-auto overflow-hidden">
<img alt="Personal Trainer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A fit male personal trainer in athletic wear guiding a client through an exercise in a bright, sun-drenched private training studio. The space is minimalist with premium wooden floors and high-end fitness equipment. The lighting is soft and natural, emphasizing a high-performance yet welcoming professional environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWRpCfc0UBvRKWIVGzsLqs10uSh8FTnQmuRhaGgk6_LnGXJWnegfG0kb1Ko4v1ynKMT6YuWWzpc_CbToYuIG1VR3rJTOK1TMGI78jxbL1N_RWnXoOzYdkWxQOvmC8N3Uao4ATjnheG8d378REDHCp62XNA0vgfd7egkHQx_wwENNArr0UiRPioPG8yFBaMQo2bVF9SCYBSTjgwX2P5-ar68f9Y-3oJTsIqODcgQXA1aot0yS5HTTazn0y2LOBQRhTeROFyfr8H" />
</div>
<div className="p-6 flex-grow flex flex-col justify-between">
<div className="flex flex-col md:flex-row justify-between items-start mb-4">
<div>
<div className="flex items-center gap-2 mb-1">
<span className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider">Profissional</span>
<span className="flex items-center gap-1 text-trust-gold">
<span className="material-symbols-outlined text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-label-md">5.0</span>
</span>
</div>
<h3 className="font-headline-md text-headline-md text-text-primary">Ricardo Mendes — PT High Performance</h3>
<p className="text-text-secondary text-body-md flex items-center gap-1">
<span className="material-symbols-outlined text-base">location_on</span> Fitness Center Colombo
                                        </p>
</div>
<div className="mt-4 md:mt-0 text-right">
<span className="bg-surface-container-high text-text-secondary font-label-md px-3 py-1 rounded-full border border-outline-variant/30">Pendente</span>
</div>
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border-subtle/50 mb-4">
<div>
<p className="text-[10px] text-text-secondary uppercase font-bold mb-1">Data</p>
<p className="font-body-lg text-text-primary">28 Out 2024</p>
</div>
<div>
<p className="text-[10px] text-text-secondary uppercase font-bold mb-1">Hora</p>
<p className="font-body-lg text-text-primary">08:00 - 09:00</p>
</div>
<div>
<p className="text-[10px] text-text-secondary uppercase font-bold mb-1">Preço</p>
<p className="font-body-lg text-text-primary">45,00 €</p>
</div>
<div>
<p className="text-[10px] text-text-secondary uppercase font-bold mb-1">Sessão</p>
<p className="font-body-lg text-text-primary">Treino Funcional</p>
</div>
</div>
<div className="flex justify-end gap-3">
<button className="px-4 py-2 text-error font-label-md hover:bg-error/5 rounded-lg transition-colors">Cancelar Pedido</button>
<button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:bg-primary-container transition-all">Ver Detalhes</button>
</div>
</div>
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
