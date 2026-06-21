'use client'

import { PageShell } from '@/components/page-shell'

export default function Page() {
  return (
    <PageShell>
      <div className="pt-16 pb-24 md:pb-0">
{/*  Hero Section  */}
<section className="relative h-[600px] flex items-center justify-center overflow-hidden">
<div className="absolute inset-0 z-0">
<img className="w-full h-full object-cover" data-alt="A powerful action shot of a professional athlete training in a high-tech modern gym. The lighting is dramatic with cool blue shadows and warm emerald green highlights, creating a high-performance atmosphere. The background shows blurred exercise equipment and architectural glass panels. The overall mood is intense, focused, and premium." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsteIhTP1cG072xSyyQ_cGWxX-W-mj08igryR-l6icdnhhdVrpTTfB9HwplD9L8AsePsEfkapjpBpVLr5jHK5d3HvE9JgZ_ACyAhBNAX-T68TnZGugjfMrfL_iNBf4zc1GzQuvUfi_kVU0YFXeBYqsrQ6TcvxcO_OUtd5Hj_st_FoL-8MEunkC_3myjAc7_2FWHx78isq1kHm291A_ROwnECFBLRMRYrJ4g53sSnb_KJxhaSp6r07e2X-TmJ-Ok3F52SFp4Er_" />
<div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
</div>
<div className="relative z-10 w-full max-w-[1280px] px-margin-desktop text-center">
<h1 className="font-display-lg text-display-lg text-white mb-4">
                    Onde a Performance <br />
<span className="text-primary-fixed">Encontra a Reputação</span>
</h1>
<p className="font-body-lg text-body-lg text-white/90 mb-12 max-w-2xl mx-auto">
                    Descubra espaços, profissionais e eventos desportivos perto de si com o selo de confiança da maior rede de Portugal.
                </p>
{/*  Search Hub  */}
<div className="max-w-4xl mx-auto">
<div className="flex gap-1 mb-2">
<button className="px-6 py-3 rounded-t-xl glass-effect text-primary font-bold font-label-md text-label-md">Espaços</button>
<button className="px-6 py-3 rounded-t-xl bg-black/40 text-white font-label-md text-label-md hover:bg-black/60 transition-colors">Eventos</button>
<button className="px-6 py-3 rounded-t-xl bg-black/40 text-white font-label-md text-label-md hover:bg-black/60 transition-colors">Profissionais</button>
<button className="px-6 py-3 rounded-t-xl bg-black/40 text-white font-label-md text-label-md hover:bg-black/60 transition-colors">Saúde</button>
</div>
<div className="glass-effect rounded-xl rounded-tl-none p-4 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
<div className="flex-1 w-full flex items-center bg-surface-container-low rounded-lg px-4 border border-border-subtle">
<span className="material-symbols-outlined text-outline">search</span>
<input className="w-full bg-transparent border-none focus:ring-0 py-3 font-body-md" placeholder="Pesquisar espaços..." type="text" />
</div>
<div className="flex-1 w-full flex items-center bg-surface-container-low rounded-lg px-4 border border-border-subtle">
<span className="material-symbols-outlined text-outline">location_on</span>
<input className="w-full bg-transparent border-none focus:ring-0 py-3 font-body-md" placeholder="Localização..." type="text" />
</div>
<button className="w-full md:w-auto bg-primary text-on-primary px-10 py-3 rounded-lg font-bold font-label-md text-label-md hover:opacity-90 transition-all flex items-center justify-center gap-2" style={{   backgroundColor: 'rgb(24, 149, 110)',   borderRadius: '8px' }}>
                            Pesquisar
                        </button>
</div>
<div className="mt-6 flex flex-wrap justify-center gap-8 text-white/80 font-label-md text-label-md">
<span className="flex items-center gap-2"><strong className="text-white text-lg">500+</strong> Espaços</span>
<span className="flex items-center gap-2"><strong className="text-white text-lg">200+</strong> Profissionais</span>
<span className="flex items-center gap-2"><strong className="text-white text-lg">150+</strong> Eventos</span>
</div>
</div>
</div>
</section>
{/*  Ecosystem Section  */}
<section className="max-w-[1280px] mx-auto px-margin-desktop py-20">
<div className="text-center mb-16">
<h2 className="font-headline-lg text-headline-lg text-text-primary">Tudo num só lugar</h2>
<p className="text-text-secondary mt-2">O ecossistema desportivo mais completo de Portugal</p>
</div>
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gutter">
<div className="group flex flex-col items-center text-center p-6 rounded-xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-border-subtle cursor-pointer">
<div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-blue-600">apartment</span>
</div>
<h3 className="font-bold text-text-primary text-sm mb-1">Espaços Desportivos</h3>
<p className="text-[10px] text-text-secondary leading-tight">19 categorias · Reserva online</p>
</div>
<div className="group flex flex-col items-center text-center p-6 rounded-xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-border-subtle cursor-pointer">
<div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-purple-600">person_celebrate</span>
</div>
<h3 className="font-bold text-text-primary text-sm mb-1">Profissionais</h3>
<p className="text-[10px] text-text-secondary leading-tight">PT, fisio, nutrição e mais</p>
</div>
<div className="group flex flex-col items-center text-center p-6 rounded-xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-border-subtle cursor-pointer">
<div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-pink-600">favorite</span>
</div>
<h3 className="font-bold text-text-primary text-sm mb-1">Saúde & Recovery</h3>
<p className="text-[10px] text-text-secondary leading-tight">Clínicas, spas e recuperação</p>
</div>
<div className="group flex flex-col items-center text-center p-6 rounded-xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-border-subtle cursor-pointer">
<div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-orange-600">kayaking</span>
</div>
<h3 className="font-bold text-text-primary text-sm mb-1">Viagens Desportivas</h3>
<p className="text-[10px] text-text-secondary leading-tight">Surf, trail, yoga e mais</p>
</div>
<div className="group flex flex-col items-center text-center p-6 rounded-xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-border-subtle cursor-pointer">
<div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-teal-600">shopping_bag</span>
</div>
<h3 className="font-bold text-text-primary text-sm mb-1">Marketplace</h3>
<p className="text-[10px] text-text-secondary leading-tight">Equipamento e suplementos</p>
</div>
<div className="group flex flex-col items-center text-center p-6 rounded-xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-border-subtle cursor-pointer">
<div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-cyan-600">forum</span>
</div>
<h3 className="font-bold text-text-primary text-sm mb-1">Comunidade</h3>
<p className="text-[10px] text-text-secondary leading-tight">Partilhe e inspire-se</p>
</div>
</div>
</section>
{/*  Category Grid  */}
<section className="bg-surface-container-low py-20">
<div className="max-w-[1280px] mx-auto px-margin-desktop">
<div className="flex justify-between items-end mb-12">
<div>
<h2 className="font-headline-lg text-headline-lg text-text-primary">Explore por categoria</h2>
<p className="text-text-secondary mt-2">Encontre o que procura no ecossistema Find4Sport</p>
</div>
<a className="text-primary font-bold font-label-md text-label-md flex items-center gap-1 hover:underline" href="#">Ver todas <span className="material-symbols-outlined text-sm">arrow_forward</span></a>
</div>
<div className="grid grid-cols-2 lg:grid-cols-6 gap-gutter">
{/*  Category Cards  */}
<div className="relative group rounded-2xl overflow-hidden aspect-square cursor-pointer">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="A clean, minimalist interior of a modern high-end gym with wooden accents and sleek black workout machines. The lighting is soft and natural, pouring in from large windows. The overall aesthetic is professional and luxury-corporate, emphasizing clarity and order." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8h3JhM1AuEJh1eIgFJjDffhX08GB58s5snn7LhM2cwmWVawjLS1XfI2rEGTarB-ErW6i16pNsK4VSG1ojGGN0TCjrHUvDCEzqLhUv71ZR5LEim4hMeuvGdxuKvc9Mmw1n8o3vuSv7sLtoXXu509hIxQka9hOV6xOKyHKpEURvhZG3Y731LtsF7IGTaIIAFFc56gsp32o7edkFLEizWNtVgErd2C3DyYJHzKYGGPG3Hl6RPxMHd6JuXWvo0-MEi3x8GsEmdZxA" />
<div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center">
<span className="material-symbols-outlined mb-2 text-3xl">fitness_center</span>
<span className="font-bold text-lg">Espaços</span>
<span className="text-xs opacity-80 mt-1">Ginásios, campos e mais</span>
</div>
</div>
<div className="relative group rounded-2xl overflow-hidden aspect-square cursor-pointer">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="A wide-angle shot of a vibrant sports stadium at golden hour, focusing on the sleek green turf and architectural details of the stands. The mood is energetic and celebratory, with a warm, sun-drenched palette and sharp emerald accents." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMGWQ-6vG5RzxC6FLMKCRpSpYLV4A107wTNkcocv03pxKD-Zh7uA1M4ruYNpFBUld3kbU7T4CiOyaw1QQshLa_1fCAwjqzFi4QrAPJxnaqMroguPIkLxYo439Baym14wr7deKIkIzimsq1cWx3qMZGnY9dMH74EQdaHLAdBYbQukr3wneRUz8Gg9_QVK8NXHKBGqvtu4GyrMoOkXg7keBfHiW0pOq-VVWzsIg4wli9FAdWP46HYR1lRXcquZTKVl4_r8-c_Y_Q" />
<div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center">
<span className="material-symbols-outlined mb-2 text-3xl">event</span>
<span className="font-bold text-lg">Eventos</span>
<span className="text-xs opacity-80 mt-1">Competições e workshops</span>
</div>
</div>
<div className="relative group rounded-2xl overflow-hidden aspect-square cursor-pointer">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="A professional personal trainer in a clean, brightly lit studio environment, assisting a client with form. The lighting is crisp and even, highlighting a healthy and energetic lifestyle. The color palette is dominated by whites and soft grays with vibrant green brand highlights." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1Q5sagD82ksA1zfyfh12HWTMpe5nIKuIUPMDsgTidaWyXnzYER9WSfVzWr55qy5DPLbKb5GTws-scBzS4EQ34-CNhzQD5snP3JAUpgwTSaAqrOqf7OnhxZ8U_64WOS33qyFER3Ht9Ggt7QY47y4hesYvetc8o-jEcSwJ72YWWL-B9b1dsH3alOzjQIB75PXdkj1V7QGwzQ5jNdWBuvrG0qaWSTE-Tyx0bYFwnt_l9-xrlGEFZFf6AG0gDFd75sHaoFs7pwq90" />
<div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center">
<span className="material-symbols-outlined mb-2 text-3xl">groups</span>
<span className="font-bold text-lg">Profissionais</span>
<span className="text-xs opacity-80 mt-1">PT, fisio, nutrição</span>
</div>
</div>
<div className="relative group rounded-2xl overflow-hidden aspect-square cursor-pointer">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="A serene spa and recovery center setting with smooth stone surfaces, aromatic candles, and a clear water feature. The lighting is warm and diffused, creating a calm and professional wellness atmosphere. Colors include earthy tones and soft greens." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO1Ct6VnnJh2mkWMGXs3PrKaCLOBiA4x7DKJYgNbswvR2jmpjvJA68mQGkRvOVeU6F45Y9z9cx1BB0S1WAh9nweS4gkgQ_XH1cTr9Hs4BmG3FG6gAMGQ9xGLPCtie02OMrMP6tuan4yN6xsCi0i6z2NbBAiIs7CIYL-JUO1UEH34Gn5eUrC8D2P0POy4j72JcX2eZqnFPp1-OgVaHoqYjw2lGx5-3uRPUgIcHZR8dQMr9bqrkgV519U9ssbOO3ojDJ4x5omyfX" />
<div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center">
<span className="material-symbols-outlined mb-2 text-3xl">spa</span>
<span className="font-bold text-lg">Saúde</span>
<span className="text-xs opacity-80 mt-1">Recovery e bem-estar</span>
</div>
</div>
<div className="relative group rounded-2xl overflow-hidden aspect-square cursor-pointer">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="A hiker on a mountain ridge during a misty morning, surrounded by lush green peaks and a soft, hazy sky. The lighting is ethereal and cool-toned, evoking a sense of adventure and professional travel services for sports enthusiasts." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBozJ8P1l4gO5gA4VuRPY3HQ66944o2GRDK1WhNJlRH4YP5UD8koo1o_ztXMEG4WOMZejZbW9uPf8Ibo_M3ZNXrKxbMPMhzwiQuJZanIk0lGogRfeELzSkY9Wn9GfpUGxnvLsHDzeYT1JuurBMy42M0S2dzBC7oAZ-q1M1zhYwe2M8ees42h5REvF_vADdw2jlSc45g1Ty4VbCU_nvaSCXjHM6u1uUEVf2Cv9uclL4sb4po2QOzTvKj2S3oTak6eCRqcA0mkjS" />
<div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center">
<span className="material-symbols-outlined mb-2 text-3xl">travel_explore</span>
<span className="font-bold text-lg">Viagens</span>
<span className="text-xs opacity-80 mt-1">Surf, trail e mais</span>
</div>
</div>
<div className="relative group rounded-2xl overflow-hidden aspect-square cursor-pointer">
<img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="A sleek retail store layout featuring high-end sports equipment and apparel, organized meticulously on minimalist white shelving. The lighting is professional studio-style, emphasizing the quality and durability of the products. Touches of emerald green are used in the branding." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpJeFcBT5sbfcOdUGax3Hld8sMhkqravp54Z4JA91RCEot-qCJAsGDmx4NrHpo-ISqZYrmrqXfxMuAJ9SK09I9qpISXE1zXQ9EKvW0nUEA4TYRjb1grXK5NXDPqWqB7QTPLsZ-9dSz5JNiqdtj8T62ViOz7oGcCoTESHGdhJbf2dre0HLBdX17feV3m-nbtfhvXNglBA2vRvb2ekbN-vne_njRJ0VybJDWm7G703UBrwJeibam-8uEaVKjb6QyOrHN4jki9cIa" />
<div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4 text-center">
<span className="material-symbols-outlined mb-2 text-3xl">shopping_basket</span>
<span className="font-bold text-lg">Marketplace</span>
<span className="text-xs opacity-80 mt-1">Equipamento e suplementos</span>
</div>
</div>
</div>
</div>
</section>
{/*  Popular Spaces  */}
<section className="max-w-[1280px] mx-auto px-margin-desktop py-20">
<div className="flex justify-between items-end mb-12">
<div>
<h2 className="font-headline-lg text-headline-lg text-text-primary">Espaços Populares</h2>
<p className="text-text-secondary mt-2">Os espaços desportivos mais bem avaliados pela comunidade</p>
</div>
<a className="text-primary font-bold font-label-md text-label-md flex items-center gap-1 hover:underline" href="#">Ver todos <span className="material-symbols-outlined text-sm">arrow_forward</span></a>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
{/*  Space Card 1  */}
<div className="bg-white border border-border-subtle overflow-hidden hover:shadow-2xl transition-all cursor-pointer group rounded-lg">
<div className="relative aspect-[4/3]">
<img className="w-full h-full object-cover" data-alt="A modern industrial-style CrossFit box with high ceilings, exposed brick, and high-quality gym mats. The room is filled with professional-grade weights and rowing machines. The atmosphere is energetic yet clean and organized, illuminated by bright daylight." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbG-2QA1zVgexfHjuaFjHZJymosguWhvpjS5mCNqlxH1X3EinVjqhrTD2Kz6tZYT7oFJUkp6onOZB8SrFMRIIhAQdfaRq0KtdIglwUPldOz990oi6KFy8B_VVjVgN9gVKW57E2Gstizl7qp0aw_DPUxKBI3YjzMGlUYbOO_yHVrDIfSEjeHu9mLZvi0qst2vorF2V85rvakay9tlSp6tsJrMAZRFKUnVEHZcFvN8_o2YgblHYSjkM3298-6E17M-m_29bCwthW" />
<div className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded-lg flex items-center gap-1">
<span className="material-symbols-outlined text-trust-gold text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-xs">5.0</span>
</div>
</div>
<div className="p-4">
<h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">Lisbon Wellness</h3>
<p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-sm">location_on</span> Cais do Sodré, Lisboa
                        </p>
<div className="mt-4 flex justify-between items-center">
<span className="text-primary font-bold">€45/hora</span>
</div>
</div>
</div>
{/*  Space Card 2  */}
<div className="bg-white border border-border-subtle overflow-hidden hover:shadow-2xl transition-all cursor-pointer group rounded-lg">
<div className="relative aspect-[4/3]">
<img className="w-full h-full object-cover" data-alt="A pristine, bright white physiotherapy clinic with modern treatment tables and anatomical posters. The space is exceptionally clean, featuring soft green plant accents and high-key lighting that emphasizes a professional and clinical environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm_6is9KDqwAXwkCyp4my724sgWq-F5khll0Le87MLeQGB2_ndLRYk7OvGiixmry1lkXxEtiRbPtYTJcoNcoPvXJAKoOZDqJnV9fHc-th-wpBBhNgOOedw37qLgcec3-0WO9QaMWcWBWP2G-4yuqo82uq8s7BMCKZLvlQWR8QbPoo35cZUrOE__c-bJFCz_JDnKxIWYcs5hoMixyqjTVh3kf-LloH6OQNSVo6vfn-NhHiSFAYQ7fygXg2n6Pz6c6BnuJMFFPhX" />
<div className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded-lg flex items-center gap-1">
<span className="material-symbols-outlined text-trust-gold text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-xs">4.9</span>
</div>
</div>
<div className="p-4">
<h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">AD Fisio</h3>
<p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-sm">location_on</span> Avenida da Liberdade, Lisboa
                        </p>
<div className="mt-4 flex justify-between items-center">
<span className="text-primary font-bold">€65/hora</span>
</div>
</div>
</div>
{/*  Space Card 3  */}
<div className="bg-white border border-border-subtle overflow-hidden hover:shadow-2xl transition-all cursor-pointer group rounded-lg">
<div className="relative aspect-[4/3]">
<img className="w-full h-full object-cover" data-alt="A luxury yoga studio with polished light wood floors, large mirrors, and soft ambient lighting. Elegant plants and high-end yoga mats are positioned neatly. The aesthetic is serene and sophisticated, with a warm color palette and bright white foundation." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQbPKNB4fZTF4qEZ4olPuPULHL5Ov2XGzTFS0DYK3-t9ZiN7dD5Qm6WN2S0peTtsCanvL6PihHZ9DW8ZIQc9wCYvi6snU760otrDH4J3d6ruZQrARvPV6FHwQcMmqLsdilxg4rOqfnMeP9pt2NO9zCxD6xlrwmyx5DgydhGsCW3YFywQxRcES5YeDlwEBwbkbJUMhEt45w7-NgcqE-K_u255AzTfXoyrhONmV01yFtHDTl14PayzQQHxk_MQEpuTKRVdxy4cQg" />
<div className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded-lg flex items-center gap-1">
<span className="material-symbols-outlined text-trust-gold text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-xs">4.9</span>
</div>
</div>
<div className="p-4">
<h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">Terra Heal Temple</h3>
<p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-sm">location_on</span> Lisboa Centro
                        </p>
<div className="mt-4 flex justify-between items-center">
<span className="text-primary font-bold">€50/hora</span>
</div>
</div>
</div>
{/*  Space Card 4  */}
<div className="bg-white border border-border-subtle overflow-hidden hover:shadow-2xl transition-all cursor-pointer group rounded-lg">
<div className="relative aspect-[4/3]">
<img className="w-full h-full object-cover" data-alt="A professional athletic training facility with high-clarity lighting and a structured grid layout. Focused on strength training, the room features heavy-duty racks and weight platforms. The design is modern corporate-meets-athletic with sharp lines and high-contrast visuals." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjj59m6zkkMqq9zEAjaVzLRw0MnzpMcHB1t2Nj5YB7PHClm6kKsreNYA1ImLmU9yrvgQ30uXusTI8zQbSMNw5-mgfjAwYcfWLXem_JVPQUKbqcQkCLfqFS5gDPnNdOSO7xT14gNVR16mGucHqRIkH_KYcVS5PaQOBKuQzfVBmqigmsIdiLNf1kuTZ_hPJKd5QxZ-6N1O9p9kztQ0KwoMy2PQrQKBFMZInS946SuID4yXB2_9Rz5TJoAUn6dNGBUsnW0fwWTh8P" />
<div className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded-lg flex items-center gap-1">
<span className="material-symbols-outlined text-trust-gold text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-xs">4.9</span>
</div>
</div>
<div className="p-4">
<h3 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">Lisboa Physio</h3>
<p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-sm">location_on</span> Alvalade, Lisboa
                        </p>
<div className="mt-4 flex justify-between items-center">
<span className="text-primary font-bold">€60/hora</span>
</div>
</div>
</div>
</div>
</section>
      </div>
    </PageShell>
  )
}
