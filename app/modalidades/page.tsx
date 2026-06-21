'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-border-subtle h-16"><div className="max-w-[1280px] mx-auto flex justify-between items-center h-full px-margin-desktop"><div className="flex items-center gap-8"><span className="text-headline-md font-headline-md font-extrabold text-primary">FIND4SPORT</span><div className="hidden md:flex gap-6"><a className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md" href="#">Descobrir</a><a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#">Mais</a></div></div><div className="flex items-center gap-6"><div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-border-subtle"><span className="material-symbols-outlined text-outline text-[20px] mr-2">search</span><input className="bg-transparent border-none focus:ring-0 text-body-md w-48" placeholder="Pesquisar..." type="text" /></div><div className="flex items-center gap-4"><button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-transform active:scale-95">favorite</button><button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-transform active:scale-95">notifications</button><button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-transform active:scale-95">person</button><button className="hidden md:block bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md text-label-md hover:shadow-lg transition-all active:scale-95">Sou Profissional</button></div></div></div></header>
<main className="pt-24 pb-32">
<div className="max-w-[1280px] mx-auto px-margin-desktop">
{/*  Hero Search & Filter Section  */}
<section className="mb-12">
<div className="flex flex-col gap-6">
<div className="max-w-2xl">
<h1 className="font-display-lg text-display-lg text-primary mb-4">Explore novas fronteiras do seu desempenho</h1>
<p className="font-body-lg text-body-lg text-text-secondary">Encontre a modalidade perfeita para os seus objetivos, desde biohacking avançado a performance de elite.</p>
</div>
{/*  Search Bar  */}
<div className="relative group max-w-xl">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
<input className="w-full pl-12 pr-4 py-4 rounded-xl border border-border-subtle bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md text-body-md shadow-sm" placeholder="Pesquisar modalidades (ex: Padel, Yoga, Crioterapia...)" type="text" />
</div>
{/*  Faceted Filtering  */}
<div className="flex flex-wrap items-center gap-4">
<div className="flex items-center gap-2 py-1 px-2 overflow-x-auto hide-scrollbar">
<button className="whitespace-nowrap px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md">Todos</button>
<button className="whitespace-nowrap px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md border border-border-subtle">Wellness</button>
<button className="whitespace-nowrap px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md border border-border-subtle">Recovery</button>
<button className="whitespace-nowrap px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md border border-border-subtle">Performance</button>
<button className="whitespace-nowrap px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md border border-border-subtle">Biohacking</button>
</div>
<div className="h-6 w-px bg-border-subtle mx-2 hidden sm:block"></div>
<div className="flex items-center gap-3">
<select className="bg-transparent border-none font-label-md text-label-md text-on-surface-variant focus:ring-0 cursor-pointer">
<option>Contexto: Todos</option>
<option>Indoor</option>
<option>Outdoor</option>
</select>
<select className="bg-transparent border-none font-label-md text-label-md text-on-surface-variant focus:ring-0 cursor-pointer">
<option>Nível: Qualquer</option>
<option>Iniciante</option>
<option>Intermédio</option>
<option>Avançado</option>
</select>
</div>
</div>
</div>
</section>
{/*  Results Grid & Selection Panel Layout  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/*  Main Grid  */}
<div className="lg:col-span-8 flex flex-col gap-8">
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
{/*  Card 1  */}
<div className="group cursor-pointer bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300" onclick="openSelection('Padel', 'Aumente a sua agilidade e rede social com o desporto que mais cresce na Europa. Ideal para todos os níveis.', 'Esporte de Raquete', 'Moderado', '60-90 min', 'image-padel-card')" style={{   opacity: '1',   transform: 'translateY(0px)',   transition: '0.5s ease-out' }}>
<div className="h-40 overflow-hidden relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A professional padel match taking place on a modern blue artificial turf court with glass walls. The lighting is crisp and natural, highlighting the dynamic action of the players. The aesthetic is clean and high-performance, consistent with a professional sports directory. A sense of energy and competition is captured in a high-definition sports photograph." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnzmV6stDnWmjCciVwXxBGPsn9X7o2r2GGVLFvJazS8Ty8nN7pjRcz8JAcUA3SCDW9BJyg5zR71oFuE8LvYq7sOOoGqd9lurxWoK_yKo0njCU4mbqyZvHhkUj7kvSfin1WJLP5ZzGaF9PZa4LtvvNIueAKoIV3fDZt8y-ISfZEL2QvU5rwYL_7zysAxP-FQlhOY9ROwJRZEjCzZqE7i9xEz-1r3zcuEUoCrXv5b_xpNEKPvgpCO3Shbn9CDhiLlNNwNEhPmGH0" />
<div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded flex items-center gap-1 shadow-sm">
<span className="material-symbols-outlined text-trust-gold text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-label-md text-label-md">4.9</span>
</div>
</div>
<div className="p-4">
<div className="flex justify-between items-start mb-2">
<h3 className="font-headline-md text-headline-md text-text-primary">Padel</h3>
<span className="material-symbols-outlined text-primary">sports_tennis</span>
</div>
<div className="flex flex-col gap-1 text-on-surface-variant">
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">groups</span> <span className="text-body-md font-body-md">124 Profissionais</span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">location_on</span> <span className="text-body-md font-body-md">42 Espaços</span></div>
</div>
</div>
</div>
{/*  Card 2  */}
<div className="group cursor-pointer bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300" onclick="openSelection('Yoga Vinyasa', 'Sincronize respiração e movimento para flexibilidade mental e física. Foco em fluidez e presença.', 'Wellness', 'Baixo', '45-75 min', 'image-yoga-card')" style={{   opacity: '1',   transform: 'translateY(0px)',   transition: '0.5s ease-out' }}>
<div className="h-40 overflow-hidden relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A serene yoga studio with minimalist decor, featuring large windows that allow soft, warm sunlight to flood the space. A practitioner is in a fluid Vinyasa pose, emphasizing peace and clarity. The color palette consists of neutral tones and soft greens, creating a professional yet calming wellness atmosphere for an elite discovery app." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFkHJuxqMjOkEp6zHHzBHdLjU4fqHSzh8J2c_Q9Y6fY3ZekvPsMBtxCcJpl2di_DWKpYJyGI9-bZAPWMGo2gaT8WB-LWgtearvrudEiLyjSSX8pQFsyPzsMI632mLuzvOEQqUYttXqmg8WVummPKubsIbTuawv8HZUf8Xp46KIs4nZajW0121rEfULJdyoYP8d1Lt1U-k7pPJ4ESSXoe9ygLbZOThkgr1Xowm9VJVnXjZbXNNtM-VnzwKBphhHG1gI5Z6TXCHK" />
<div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded flex items-center gap-1 shadow-sm">
<span className="material-symbols-outlined text-trust-gold text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-label-md text-label-md">4.8</span>
</div>
</div>
<div className="p-4">
<div className="flex justify-between items-start mb-2">
<h3 className="font-headline-md text-headline-md text-text-primary">Yoga Vinyasa</h3>
<span className="material-symbols-outlined text-primary">self_improvement</span>
</div>
<div className="flex flex-col gap-1 text-on-surface-variant">
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">groups</span> <span className="text-body-md font-body-md">86 Profissionais</span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">location_on</span> <span className="text-body-md font-body-md">19 Espaços</span></div>
</div>
</div>
</div>
{/*  Card 3  */}
<div className="group cursor-pointer bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300" onclick="openSelection('Crioterapia', 'Recuperação sistémica avançada através da exposição ao frio. Reduz inflamação e otimiza o metabolismo.', 'Recovery / Biohacking', 'Elevado', '3-5 min', 'image-cryo-card')" style={{   opacity: '1',   transform: 'translateY(0px)',   transition: '0.5s ease-out' }}>
<div className="h-40 overflow-hidden relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A sleek, high-tech cryotherapy chamber in a modern medical wellness facility. The lighting is cool blue and sterile white, emphasizing advanced biohacking technology and professional clinical standards. The setting is clean, futuristic, and evokes a sense of high-performance recovery. The visual style is premium and technologically driven." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA63dJRqg1srBchIKVr27uzveXp3kudjtTh4NfTDUket-SjnQxiGR3F7HF0ACZGUB8NiLlYIVgPf9ENbRyPcpBCxJyK38GyViH7qWWlJ6GNui1xOBVunUQvgYHlP3Han2Bw5PCPQ6Ya1FKGkivvJnyA2CesMlwogttgkHP6ji2H6gz8hlvo376qongN7uC05Jlw9iiSYsFkEgmETIjRALOrYW2OBb4wsSmuNBbz-kyCP77MKv781qcugK0tqUlwkUnhiOu4qkTV" />
<div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded flex items-center gap-1 shadow-sm">
<span className="material-symbols-outlined text-trust-gold text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>verified</span>
<span className="font-label-md text-label-md">Top</span>
</div>
</div>
<div className="p-4">
<div className="flex justify-between items-start mb-2">
<h3 className="font-headline-md text-headline-md text-text-primary">Crioterapia</h3>
<span className="material-symbols-outlined text-primary">ac_unit</span>
</div>
<div className="flex flex-col gap-1 text-on-surface-variant">
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">groups</span> <span className="text-body-md font-body-md">12 Especialistas</span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">location_on</span> <span className="text-body-md font-body-md">8 Centros</span></div>
</div>
</div>
</div>
{/*  Card 4  */}
<div className="group cursor-pointer bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300" onclick="openSelection('Crossfit', 'Treino funcional de alta intensidade que combina força, ginástica e endurance.', 'Performance', 'Elevado', '60 min', 'image-crossfit-card')" style={{   opacity: '1',   transform: 'translateY(0px)',   transition: '0.5s ease-out' }}>
<div className="h-40 overflow-hidden relative">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A rugged yet modern crossfit box with high-quality equipment like barbells and rowers. The lighting is moody with spotlighting on the workout area, creating a gritty but professional atmosphere. The aesthetic is focused on power and functional performance, with a clean industrial design consistent with elite fitness centers." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7-Chdl6jEQalyLpxtOqdCskJUdys47rUZPWb7g693vO__jOl3SAfxcoU_yxM1iW6wrSmOMjxoDalUYohvvnAJMJRWHOVEjVkee-GyMWAd1bq2KE_CEiAlq7SlBcHLkjwheL3zRMWvBtl09frV-A-7-cSAnC40N0_X5ARRbV9awvfbxnIAM8vi1VX6YqNzjzxEzaffjBsxXVWLrE4vsLFwe1hSuyAx8xgYScPKohXdtJB-PEnIKNxRhTloFRlLHOlBL8qN7jKT" />
<div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded flex items-center gap-1 shadow-sm">
<span className="material-symbols-outlined text-trust-gold text-sm" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-label-md text-label-md">4.7</span>
</div>
</div>
<div className="p-4">
<div className="flex justify-between items-start mb-2">
<h3 className="font-headline-md text-headline-md text-text-primary">Crossfit</h3>
<span className="material-symbols-outlined text-primary">fitness_center</span>
</div>
<div className="flex flex-col gap-1 text-on-surface-variant">
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">groups</span> <span className="text-body-md font-body-md">210 Coaches</span></div>
<div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">location_on</span> <span className="text-body-md font-body-md">55 Boxes</span></div>
</div>
</div>
</div>
</div>
</div>
{/*  Selection Panel (Sticky Sidebar)  */}
<aside className="lg:col-span-4 hidden lg:block" id="selectionPanel">
<div className="sticky top-24 bg-surface-container-lowest border border-border-subtle rounded-2xl overflow-hidden shadow-lg p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-500">
<div className="flex flex-col items-center justify-center py-20 text-center gap-4" id="initialState">
<div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-outline-variant">
<span className="material-symbols-outlined text-4xl">touch_app</span>
</div>
<p className="font-headline-md text-headline-md text-on-surface-variant">Selecione uma modalidade para ver detalhes</p>
</div>
<div className="hidden flex-col gap-6" id="detailState">
<div className="flex justify-between items-center">
<span className="bg-success-mint text-primary font-label-md text-label-md px-3 py-1 rounded-full" id="detailCat">Wellness</span>
<button className="p-1 hover:bg-surface-container rounded-full" onclick="closeSelection()"><span className="material-symbols-outlined">close</span></button>
</div>
<div>
<h2 className="font-headline-lg text-headline-lg text-primary mb-2" id="detailTitle">Padel</h2>
<p className="font-body-md text-body-md text-text-secondary leading-relaxed" id="detailDesc">
                                    Aumente a sua agilidade e rede social com o desporto que mais cresce na Europa.
                                </p>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="bg-surface-container-low p-3 rounded-xl">
<span className="font-label-md text-label-md text-outline block mb-1">Risco Físico</span>
<div className="flex items-center gap-2 text-primary font-bold">
<span className="material-symbols-outlined text-sm">warning</span>
<span id="detailRisk" className="">Moderado</span>
</div>
</div>
<div className="bg-surface-container-low p-3 rounded-xl">
<span className="font-label-md text-label-md text-outline block mb-1">Duração Média</span>
<div className="flex items-center gap-2 text-primary font-bold">
<span className="material-symbols-outlined text-sm">schedule</span>
<span id="detailDur" className="">90 min</span>
</div>
</div>
</div>
<div className="flex flex-col gap-3">
<button className="w-full py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:opacity-95 transition-opacity">
<span className="material-symbols-outlined">search</span> Ver Profissionais
                                </button>
<button className="w-full py-3 border border-primary text-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors">
<span className="material-symbols-outlined">map</span> Ver Espaços Próximos
                                </button>
</div>
<hr className="border-border-subtle" />
<div className="flex items-center gap-4">
<div className="flex -space-x-2">
<img alt="" className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7Ne5DtmnarMYPtpAwpiBTQLniuP6wVgYUR9BV47R-eiokuaqvmXjiXiz18vMTP0ohRIj6EutA8hRPLppBnoRr3KIdcpPq916G7fqQ_RdY7K1831lomu4FvPFInKk2ED7CQE8YJz5-1YV29dGpRxV3030lLLk7oUyL0T_Tc830Z4CQquqiuXnoVFXdNu8U9abdn27yBukraxTM0Lp1-w3DyHRi4Ohjis6Zttw-HnywW1WqTsR6TOZbDtmEU8TKmqonxACg2awv" />
<img alt="" className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApVuEyF-8q8dJai6-V8BBVvYRvVIs-MrzftWKDLIYZyXFipFbT8Empi3GGAsLxh9Oop5FwA7Q2bSAiKJLRdejT5RhRT7mih5Ld79bJr0Ml1L6Vtof03NxVhghpCP6NcOxPZb7slXQ1fvVGahagmS_ZlUHs6vHYEmXNfbnekPW5kDN-RL2ZKLB4dvRx2EVgIe7Gv_JF9pzLXoCiU7fzxji6ahiCjC--9d7hFoengL7TZeGsu2aI51LkmN1EK7LPJ57T8z-AVI6B" />
<img alt="" className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjSP3ZnXLZqKGFJd8YRuG5vJIVB_guYcmHsIK7bUL0guckYhymCd0wayM_Tadm2qZdaXSDhIAzUYwP2RdGa4lQQidHWs5Xep5-GmW_y868C3_RhlRteLYPzSkwlfTx7NwrxcpV00GTF2ytj9RLr8YNdq8HloAAXe1uNYLWgNDftFwcmrOL4RY_ehOolT7a-ZsD4XOnWc2ZYSSig5vSV9GMoD4NDkOwCAGQfuTafFslQPwRnK0vkoTPWfKUOJMR6qdi34XEYUUk" />
</div>
<span className="font-label-md text-label-md text-text-secondary">+15 peritos disponíveis agora</span>
</div>
</div>
</div>
</aside>
</div>
</div>
</main>
{/*  BottomNavBar (Mobile Only)  */}
      </main>
      <Footer />
    </div>
  )
}
