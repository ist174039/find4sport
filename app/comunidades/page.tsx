'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
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
{/*  TopAppBar  */}

<main className="pt-24 pb-20 md:pb-12 max-w-[1280px] mx-auto px-4 md:px-12 md:pl-64">
{/*  Hero & Filters  */}
<section className="mb-12">
<div className="mb-8">
<h1 className="font-headline-lg text-headline-lg mb-2">Explorar Comunidades</h1>
<p className="text-text-secondary font-body-lg text-body-lg">Encontra e junta-te a grupos de desporto perto de ti.</p>
</div>
{/*  Search & Filter Bento  */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface-container-lowest p-4 rounded-xl border border-border-subtle shadow-sm">
<div className="md:col-span-2 flex items-center bg-surface-container-low px-4 py-3 rounded-lg border border-border-subtle">
<span className="material-symbols-outlined text-primary mr-3" data-icon="groups">groups</span>
<input className="bg-transparent border-none focus:ring-0 w-full text-body-md" placeholder="Nome da comunidade ou palavra-chave..." type="text" />
</div>
<div className="flex items-center bg-surface-container-low px-4 py-3 rounded-lg border border-border-subtle relative group">
<span className="material-symbols-outlined text-primary mr-3" data-icon="location_on">location_on</span>
<select className="bg-transparent border-none focus:ring-0 w-full text-body-md appearance-none cursor-pointer">
<option>Lisboa</option>
<option>Porto</option>
<option>Braga</option>
<option>Faro</option>
</select>
</div>
<div className="flex items-center bg-surface-container-low px-4 py-3 rounded-lg border border-border-subtle relative group">
<span className="material-symbols-outlined text-primary mr-3" data-icon="sports_tennis">sports_tennis</span>
<select className="bg-transparent border-none focus:ring-0 w-full text-body-md appearance-none cursor-pointer">
<option>Todas as Modalidades</option>
<option>Padel</option>
<option>Running</option>
<option>Yoga</option>
<option>Crossfit</option>
</select>
</div>
</div>
{/*  Quick Filter Chips  */}
<div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
<button className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-label-md font-label-md whitespace-nowrap">Tudo</button>
<button className="bg-surface-container-high text-on-surface-variant px-4 py-1.5 rounded-full text-label-md font-label-md whitespace-nowrap hover:bg-secondary-container transition-colors">Mais Populares</button>
<button className="bg-surface-container-high text-on-surface-variant px-4 py-1.5 rounded-full text-label-md font-label-md whitespace-nowrap hover:bg-secondary-container transition-colors">Novos Grupos</button>
<button className="bg-surface-container-high text-on-surface-variant px-4 py-1.5 rounded-full text-label-md font-label-md whitespace-nowrap hover:bg-secondary-container transition-colors">Eventos Próximos</button>
</div>
</section>
{/*  Grid of Communities  */}
<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-section-gap">
{/*  Card 1  */}
<article className="group bg-surface-container-lowest rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-all duration-300">
<div className="relative h-48 overflow-hidden">
<img alt="Running Lisboa" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="A dynamic action shot of a diverse group of runners sprinting through a sun-drenched urban park in Lisbon during the golden hour. The sunlight creates a warm, high-performance atmosphere with long shadows on the paved path. Vibrant emerald greenery surrounds the path, reflecting the clean and energetic brand identity. The focus is sharp on the athletes' movement and determination." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKBoIE-YCGi_DN78x6mMsuIvXIWK5UF5b1UjAj3gD7u2NfUhMkFC1vNzo_vSyyoKeFrxhm9aQzVmiHN68ScwKNNHIlfkzkRzzCggw_ynSK2J5bwekfYxrPwh8GvXXnsiz88Tlb5fjV8-VNqn8tpOK7GhPUaol6FDnI4PHYG-P8wdQTxnX2ow6d0a0w88n1GwAbZVvTrO2tY-6QCXIS6quKd_4J9A-I_iCn8MZZCQ5tBh8ugx694ONhbyngEqQQb8m520GNPhSf" />
<div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
<span className="material-symbols-outlined text-trust-gold text-[16px]" data-icon="star" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-label-md">4.9</span>
</div>
<div className="absolute bottom-4 left-4">
<span className="bg-success-mint text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Público</span>
</div>
</div>
<div className="p-6">
<div className="flex justify-between items-start mb-2">
<h3 className="font-headline-md text-headline-md text-primary">Running Lisboa</h3>
<span className="text-text-secondary flex items-center gap-1 font-label-md">
<span className="material-symbols-outlined text-[18px]" data-icon="person">person</span>
                            1.2k
                        </span>
</div>
<p className="text-on-surface-variant font-body-md mb-6 line-clamp-2">Comunidade dedicada a treinos de corrida semanais pelo centro da cidade e zona ribeirinha.</p>
<div className="flex items-center justify-between mt-auto pt-4 border-t border-border-subtle">
<div className="flex items-center gap-2 text-on-surface-variant font-label-md">
<span className="material-symbols-outlined text-[18px]" data-icon="location_on">location_on</span>
                            Lisboa
                        </div>
<button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90 active:scale-95 transition-all">Join</button>
</div>
</div>
</article>
{/*  Card 2  */}
<article className="group bg-surface-container-lowest rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-all duration-300">
<div className="relative h-48 overflow-hidden">
<img alt="Padel Lovers Porto" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="A crisp, high-definition overhead shot of professional blue padel courts under bright daytime lighting. The scene is pristine and orderly, embodying a modern corporate sports aesthetic. Players are visible in action, blurred slightly to suggest movement. The overall color palette is dominated by the blue of the court and the clean white of the perimeter lines, punctuated by subtle brand-green accents in the players' attire." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMroiDkfxYaF2MrPNz_HDAZ1c5G0lAbzaqx76gRISoBP9TkCMj7wylgfzds7YtQVrLRV_WQelMHRa69OMeI4ruUT__KrY18pCVgWibjwgbAO8MQcU2PiGMLzgNQFWRpt_TP1Isza6ZaoALVFhMZ6iG6j5ElzKZaw79iYeXTNUW_EJkuHJJ8U7UAkfNc9PJhtrQPIBqVksmhYru6wQ2gIhNZRVmOX_JEDJz4zY9QTRvAKFMaEB41lInDZU0XIgt_AqH_PWJVQu5" />
<div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
<span className="material-symbols-outlined text-trust-gold text-[16px]" data-icon="star" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-label-md">4.7</span>
</div>
<div className="absolute bottom-4 left-4">
<span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Privado</span>
</div>
</div>
<div className="p-6">
<div className="flex justify-between items-start mb-2">
<h3 className="font-headline-md text-headline-md text-primary">Padel Porto</h3>
<span className="text-text-secondary flex items-center gap-1 font-label-md">
<span className="material-symbols-outlined text-[18px]" data-icon="person">person</span>
                            450
                        </span>
</div>
<p className="text-on-surface-variant font-body-md mb-6 line-clamp-2">Grupo para organização de jogos e torneios amigáveis de Padel na zona norte.</p>
<div className="flex items-center justify-between mt-auto pt-4 border-t border-border-subtle">
<div className="flex items-center gap-2 text-on-surface-variant font-label-md">
<span className="material-symbols-outlined text-[18px]" data-icon="location_on">location_on</span>
                            Porto
                        </div>
<button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90 active:scale-95 transition-all">Join</button>
</div>
</div>
</article>
{/*  Card 3  */}
<article className="group bg-surface-container-lowest rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-all duration-300">
<div className="relative h-48 overflow-hidden">
<img alt="Yoga Zen Cascais" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="A serene yoga session on a wooden deck overlooking the Atlantic ocean at sunrise in Cascais. The lighting is soft and ethereal, featuring pastel oranges and pinks reflecting off the water. The practitioners are in various poses, conveying calmness and focus. The aesthetic is airy and minimalist, using vast negative space to create a professional yet vitality-infused mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiPMblWHdV2Yz3cRxscNhGnwuA0iXKEGHEl2kvrZYDDtSctixxyzSy-A96La-vl5yjjtD9kcjFo6KrBzt7ZOlb0c4Vo0vUitjzky7zmsAOgLP3xnoR-5798XexIUiW2Bj9Wxy_JHaxeeI_Xt9_rwvSAglDKFtDaaAIM7Ar2_jbNaCq1pWDnBUY4ya0c5uM3M4h5bXaqjn1IGxyBZ13BFTlDsF90gsSeRllBBkZmd12lCYKAtXsWYPrV808fvJbDSlPMBCr9FIm" />
<div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
<span className="material-symbols-outlined text-trust-gold text-[16px]" data-icon="star" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-label-md">5.0</span>
</div>
<div className="absolute bottom-4 left-4">
<span className="bg-success-mint text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Público</span>
</div>
</div>
<div className="p-6">
<div className="flex justify-between items-start mb-2">
<h3 className="font-headline-md text-headline-md text-primary">Yoga Cascais</h3>
<span className="text-text-secondary flex items-center gap-1 font-label-md">
<span className="material-symbols-outlined text-[18px]" data-icon="person">person</span>
                            890
                        </span>
</div>
<p className="text-on-surface-variant font-body-md mb-6 line-clamp-2">Sessões matinais de Hatha e Vinyasa ao ar livre. Todos os níveis são bem-vindos.</p>
<div className="flex items-center justify-between mt-auto pt-4 border-t border-border-subtle">
<div className="flex items-center gap-2 text-on-surface-variant font-label-md">
<span className="material-symbols-outlined text-[18px]" data-icon="location_on">location_on</span>
                            Cascais
                        </div>
<button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90 active:scale-95 transition-all">Join</button>
</div>
</div>
</article>
{/*  Card 4  */}
<article className="group bg-surface-container-lowest rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-all duration-300">
<div className="relative h-48 overflow-hidden">
<img alt="Crossfit Elite" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="A gritty yet high-end Crossfit box interior featuring industrial lighting and top-tier equipment. The mood is high-energy and professional, with focus on a kettlebell workout. Sharp contrast and subtle emerald lighting accents emphasize movement and power. The structured environment establishes trust and reliability within a performance-driven community setting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoPWVo1oQF0BHL8M4evxYTO91Q41Ctc-E7MKZ49MdecrJWD3hVzpNRXrSVepHC11rIUoF3zxVWkR91pKwu_ryBiq4GeJaqZas-Wwp42wSK5PkaBFm1cRhJr22f-6X0Z89JjbgEPD9iDEhSkTFWhkmdJBjKUUKTmNFRSVqGdkIbt3o1Beb0kL_A_jgGWAD0adTlnMa5z4yhasy7V8aViwFtBgb7vVcOultoaYLdMIxdTcbjI_oWZPXflk-rsGsk5mhk5rqrhJE5" />
<div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
<span className="material-symbols-outlined text-trust-gold text-[16px]" data-icon="star" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-label-md">4.8</span>
</div>
<div className="absolute bottom-4 left-4">
<span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Privado</span>
</div>
</div>
<div className="p-6">
<div className="flex justify-between items-start mb-2">
<h3 className="font-headline-md text-headline-md text-primary">Crossfit Elite</h3>
<span className="text-text-secondary flex items-center gap-1 font-label-md">
<span className="material-symbols-outlined text-[18px]" data-icon="person">person</span>
                            210
                        </span>
</div>
<p className="text-on-surface-variant font-body-md mb-6 line-clamp-2">Para quem procura superar limites com treinos intensos de Crossfit e mobilidade.</p>
<div className="flex items-center justify-between mt-auto pt-4 border-t border-border-subtle">
<div className="flex items-center gap-2 text-on-surface-variant font-label-md">
<span className="material-symbols-outlined text-[18px]" data-icon="location_on">location_on</span>
                            Lisboa
                        </div>
<button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90 active:scale-95 transition-all">Join</button>
</div>
</div>
</article>
{/*  Card 5  */}
<article className="group bg-surface-container-lowest rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-all duration-300">
<div className="relative h-48 overflow-hidden">
<img alt="Cycling Algarve" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="A professional cycling group riding in a peloton along a scenic coastal road in the Algarve. The midday sun provides high-key lighting that emphasizes the vibrant colors of their cycling kits. The composition uses the winding road as a leading line, suggesting movement and vitality. The overall feel is one of performance clarity and outdoor energy." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBk9CxN6sG2YflXg0CuHt6zao1YX3ikZMzEAKM9B9fRjGGTMUqXj_reoQg0GDoozW9tiosb_IPT48FdBD8MidRNErO_3wuNrBKiTei3Z_zuonksyTdkt8gbcQf1aPs2yM8EvfX86WesTe8dRUuomO1popqd6cHT5QCL7eaZZmRkxPCGoc-RJIqA9UQzO9F_Emqx6VorOEQXvzE7PYFQPhfvu1TNKihMaKWH6ZP3tJogH6630apidmNGa-TW20-DM_R_PKBjHdx" />
<div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
<span className="material-symbols-outlined text-trust-gold text-[16px]" data-icon="star" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-label-md">4.6</span>
</div>
<div className="absolute bottom-4 left-4">
<span className="bg-success-mint text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Público</span>
</div>
</div>
<div className="p-6">
<div className="flex justify-between items-start mb-2">
<h3 className="font-headline-md text-headline-md text-primary">Ciclistas Algarve</h3>
<span className="text-text-secondary flex items-center gap-1 font-label-md">
<span className="material-symbols-outlined text-[18px]" data-icon="person">person</span>
                            540
                        </span>
</div>
<p className="text-on-surface-variant font-body-md mb-6 line-clamp-2">Explora as melhores rotas do Algarve com o nosso grupo de ciclismo de estrada.</p>
<div className="flex items-center justify-between mt-auto pt-4 border-t border-border-subtle">
<div className="flex items-center gap-2 text-on-surface-variant font-label-md">
<span className="material-symbols-outlined text-[18px]" data-icon="location_on">location_on</span>
                            Faro
                        </div>
<button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90 active:scale-95 transition-all">Join</button>
</div>
</div>
</article>
{/*  Card 6  */}
<article className="group bg-surface-container-lowest rounded-xl border border-border-subtle overflow-hidden hover:shadow-lg transition-all duration-300">
<div className="relative h-48 overflow-hidden">
<img alt="Beach Volleyball" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="An action-packed beach volleyball game at sunset on a pristine white sand beach. A player is jumping to spike the ball, silhouetted against a vibrant orange and purple sky. The lighting is dramatic and warm, evoking a sense of athletic movement and social energy. The scene is clean and focused, reflecting a premium lifestyle sports brand aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4N5YaOvYb1F1WPuLHeCPtoe-xxzsHhKt1vW3RG8olxHzqC1nbp4Qbe3AEf_vSZ4SMzR-weXqj5H5UlQmjQ4tT13kj6u3woyiaNBh8m_L4sCBNtblWyhBa4sEAybLUCKrUxmKqhKWlGXJBqVP7BCCriEEhJlpLqvbekZbZGKc9sD8mjXje0-zBoDffBl-QChCV2fZ-5NkvglePgihowQIIo5CkpBhKlL3HDSOLArnO5J0clbX85M8C09bo-cu4mWpJQ5bOiksp" />
<div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
<span className="material-symbols-outlined text-trust-gold text-[16px]" data-icon="star" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-label-md">4.9</span>
</div>
<div className="absolute bottom-4 left-4">
<span className="bg-success-mint text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Público</span>
</div>
</div>
<div className="p-6">
<div className="flex justify-between items-start mb-2">
<h3 className="font-headline-md text-headline-md text-primary">Vólei Praia LX</h3>
<span className="text-text-secondary flex items-center gap-1 font-label-md">
<span className="material-symbols-outlined text-[18px]" data-icon="person">person</span>
                            1.1k
                        </span>
</div>
<p className="text-on-surface-variant font-body-md mb-6 line-clamp-2">Jogos diários em Carcavelos. Vem treinar e divertir-te na areia com a melhor vibe.</p>
<div className="flex items-center justify-between mt-auto pt-4 border-t border-border-subtle">
<div className="flex items-center gap-2 text-on-surface-variant font-label-md">
<span className="material-symbols-outlined text-[18px]" data-icon="location_on">location_on</span>
                            Lisboa
                        </div>
<button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90 active:scale-95 transition-all">Join</button>
</div>
</div>
</article>
</section>
{/*  Load More  */}
<div className="flex justify-center pb-12">
<button className="border border-primary text-primary px-8 py-3 rounded-lg font-label-md hover:bg-success-mint transition-colors">Carregar mais comunidades</button>
</div>
</main>
{/*  BottomNavBar (Mobile Only)  */}
      </main>
      <Footer />
    </div>
  )
}
