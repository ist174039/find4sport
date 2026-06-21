'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  Main Content: Split-Pane Inbox  */}
<main className="pt-16 h-screen flex flex-col md:flex-row max-w-[1280px] mx-auto overflow-hidden">
{/*  Left Pane: Conversations List  */}
<aside className="w-full md:w-[380px] flex flex-col border-r border-border-subtle bg-surface-container-lowest">
<div className="p-6 border-b border-border-subtle">
<h1 className="font-headline-md text-headline-md text-text-primary mb-4">Mensagens</h1>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-border-subtle rounded-xl focus:outline-none focus:border-primary transition-colors font-body-md text-body-md" placeholder="Procurar conversas..." type="text" />
</div>
</div>
<div className="flex-1 overflow-y-auto custom-scrollbar">
{/*  Conversation Item: Active  */}
<div className="flex items-center gap-4 p-4 cursor-pointer bg-primary-container/10 border-l-4 border-primary transition-all">
<div className="relative">
<img alt="João Silva" className="w-12 h-12 rounded-full object-cover" data-alt="A professional male personal trainer in his 30s with a friendly smile, short athletic hair, and wearing high-performance athletic gear. He is standing in a brightly lit, modern commercial gym with soft natural light streaming in, creating a clean and professional atmosphere with a subtle emerald color palette and pristine white accents." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-jqAkOPb5mjzHcgQlO3p8O1zWU_btdbkSRNorAWUfPLQohUTxYY-GU3wxcwzTTkM9_E0Vw68cU91sAZ0NBR5TydGk4blu9lSq9ik5_LUYaau8pmxLvgU3DPwZc3hdGnj1qEVdXnubZhUCGnonj0LPhxbvlyR90Zt5IgkzUXlciEG3cdWkqIEj5XD1dO5xs1DfwTdK5RzvthMjWdQMi-Xs6UxLqNV7gTwBmCYyWp-4vND8fjgn6Iyfvwly0X3Udp8A6AaENp2W" />
<span className="absolute bottom-0 right-0 w-3 h-3 bg-tertiary-container rounded-full border-2 border-white"></span>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h3 className="font-bold text-text-primary truncate">João Silva</h3>
<span className="text-[10px] text-text-secondary">10:45</span>
</div>
<p className="text-xs text-primary font-semibold mb-1">Personal Trainer</p>
<p className="text-sm text-text-secondary truncate">Olá! O plano de treino para segunda-feira já está...</p>
</div>
</div>
{/*  Conversation Item: Unread  */}
<div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-container-low transition-all">
<div className="relative">
<img alt="Ana Martins" className="w-12 h-12 rounded-full object-cover" data-alt="A female yoga instructor with a serene expression, focused gaze, and tied-back hair, wearing high-quality dark green leggings and a white sports top. She is positioned in a minimalist, sun-drenched studio with blonde wood floors and large windows, reflecting a peaceful and high-performance lifestyle mood with clean lines and soft lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8sLiFixNHABMwQ7ps0FoKt78PB2NbCue3OsDng6zxxTECwAoBRqI2J8rk9iQvsKR__WNa0-IcrZGTYvm0WLsQBPozPowvLKCb4yJ7Ffsb_1FkUfJF-LZHIquZg9IjM7rH5d4ma1toPCO38f7cWW5354W_UZ1LXdyqoMcW2lnEJIXEPA8n-feYauCQywVBNzfPyZ4ZnVlQpZkbdzI0Ls6D4z2IDRZwGzUp2I5S93mZ1egJvNwEQEEpG80V37-_LYbMnIlVpwbA" />
<span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full"></span>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h3 className="font-bold text-text-primary truncate">Ana Martins</h3>
<span className="text-[10px] text-text-secondary">Ontem</span>
</div>
<p className="text-xs text-text-secondary mb-1">Yoga & Pilates</p>
<p className="text-sm text-text-primary font-bold truncate">Conseguimos confirmar a aula das 18h?</p>
</div>
</div>
{/*  More items  */}
<div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-container-low transition-all">
<img alt="Ricardo Costa" className="w-12 h-12 rounded-full object-cover" data-alt="A male professional tennis coach in athletic attire, holding a racket and looking energetic against a high-contrast outdoor court background during the golden hour. The lighting is warm yet sharp, emphasizing the high-performance sport ecosystem and corporate athletic aesthetic of the platform." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9vg_pkx5UX4K4pc8STh1eALMNwgCxvjDz079okFawXx1kjSoqu-A0B-gJGrlOGr71C2d3BWQnDWEXX-Jc4ZqXzRIUN5MX-MvhC5bdEUrIcOkxwhgoZp0rHZ2hYrQS8CWGh8Jzhj0oiK6wATx1bBqnP4XdQG8bvjGAi3pl9pT7ZugfuI7hb3OjFpf7NgO6HJVGaG7SZWUZTIjgc2L_05iQNjMDcVvxw111GsC8mQRNLczidA0djQDb1S4PV3G4iAAPYepr6MmG" />
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h3 className="font-bold text-text-primary truncate">Ricardo Costa</h3>
<span className="text-[10px] text-text-secondary">Ter</span>
</div>
<p className="text-xs text-text-secondary mb-1">Ténis</p>
<p className="text-sm text-text-secondary truncate">Obrigado pela sessão de hoje!</p>
</div>
</div>
<div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-container-low transition-all opacity-70">
<img alt="Sofia Bento" className="w-12 h-12 rounded-full object-cover" data-alt="A focused female swimming coach with a professional look, wearing a branded black polo shirt. The setting is an indoor Olympic-sized swimming pool with clear turquoise water and bright, diffused light from overhead fixtures, creating a high-energy and professional service-oriented feel." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2fe4PvmbOBTf1_o8HKa9PpopN_CiodTpFFSn9Uvy4aC-jqrkjQlZy35p1tbMb5JDTePceyG74qLzQsSj5Lbmlekb9xQUuNGJcOm8kwgYvgu22SEEPvtr-c9DcOOnP9clK5TA551mMRwx2bnN8dyYWswQvKSATBxuL2MeH2sC3L-rM1zxHL2lnfzsAdSO8kD0ybOijRHDJclr1DsI7IoOxtNdLQ-oS4ulwKuwIHABhaHgxJSX7ikdgU3MZ50p9n2jc_7sj7QsS" />
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h3 className="font-bold text-text-primary truncate">Sofia Bento</h3>
<span className="text-[10px] text-text-secondary">22 Jan</span>
</div>
<p className="text-xs text-text-secondary mb-1">Natação</p>
<p className="text-sm text-text-secondary truncate">Pode enviar o comprovativo?</p>
</div>
</div>
</div>
</aside>
{/*  Right Pane: Active Chat Thread  */}
<section className="flex-1 flex flex-col bg-surface relative">
{/*  Chat Header  */}
<header className="h-16 px-6 flex items-center justify-between border-b border-border-subtle bg-surface-container-lowest z-10">
<div className="flex items-center gap-3">
<div className="relative">
<img alt="João Silva" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdpKQBSCwpzwUBzxoNKRCWfwviLdqZSVRNDjxBq40TbPRQtR7LQzRV1x-x-zlt8_7oCSGQhYFrZjQDZFPVv-9CcadlJpaF9ADHaFr99_59Bvrkc0NP8ukKy3eOf-ZnplE7YsmauSUIOV1jcUn3rPJLYBbqu0ZzUPoCytPPFIPTJMB1Jcb8u88bnNFcwzyK8JpnfaC3lE3MsyK3PtuSJpT6-rKxWRWZn2LtJ6XT-1UUkMnDP8-pKt_FN_GLqOO65j61coA81miT" />
<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-tertiary-container rounded-full border-2 border-white"></span>
</div>
<div>
<h2 className="font-bold text-text-primary text-body-lg">João Silva</h2>
<span className="text-xs text-tertiary font-semibold flex items-center gap-1">
<span className="w-1.5 h-1.5 bg-tertiary-container rounded-full animate-pulse"></span>
                            Online agora
                        </span>
</div>
</div>
<div className="flex items-center gap-4 text-on-surface-variant">
<button className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
<span className="material-symbols-outlined" data-icon="videocam">videocam</span>
</button>
<button className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
<span className="material-symbols-outlined" data-icon="call">call</span>
</button>
<button className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
<span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</div>
</header>
{/*  Chat Messages Area  */}
<div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
{/*  Date Separator  */}
<div className="flex justify-center">
<span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-bold text-text-secondary uppercase tracking-wider">Hoje</span>
</div>
{/*  Incoming Message  */}
<div className="flex flex-col items-start max-w-[80%]">
<div className="bg-surface-container-lowest p-4 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl border border-border-subtle shadow-sm">
<p className="text-body-md text-text-primary">Olá Carlos! Espero que tenhas tido um excelente fim de semana. Já preparei o teu plano de alta performance para esta semana.</p>
</div>
<span className="text-[10px] text-text-secondary mt-1 ml-1">10:42</span>
</div>
{/*  Incoming Message (Image Attachment)  */}
<div className="flex flex-col items-start max-w-[80%]">
<div className="bg-surface-container-lowest p-2 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl border border-border-subtle shadow-sm">
<img alt="Workout Plan" className="rounded-xl w-full max-h-60 object-cover" data-alt="A detailed digital workout routine displayed on a sleek tablet screen. The screen shows charts, timers, and list of exercises like lunges and deadlifts. The setting is a clean, modern gym environment with soft lighting and a focus on high-performance clarity and structured athletic data." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWzqt3blPldqFtLlfrMGu4rKiRXLYZE9d3WGqVTzHbjd-EgD09QzsdZoiakrw99P0bHIYFVyztC1W74sZQATQhTEh-phjmvQYCl8dCrrUO9XU1jYMYGzkBuKjurs7YQjoOOP69MvrmmuYIEK-8-AJMXNCgVQbJp2tnr6LlIca5Zugd1e0PpxpLD2UVvDDDY523KukmqGjsCnQUiyRjWb78N7q_tb6iOqWUJahvjDPxt51p3aPxlyYAtgyDE9YdPYlxcC8enHUW" />
<div className="p-2">
<p className="text-sm font-bold text-text-primary">Plano_Treino_S2.pdf</p>
<p className="text-xs text-text-secondary">2.4 MB • PDF Document</p>
</div>
</div>
<span className="text-[10px] text-text-secondary mt-1 ml-1">10:43</span>
</div>
{/*  Outgoing Message  */}
<div className="flex flex-col items-end self-end max-w-[80%]">
<div className="bg-primary-container p-4 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl shadow-md text-on-primary-container">
<p className="text-body-md">Incrível, João! Já recebi o ficheiro. Alguma recomendação específica para o treino de pernas de hoje?</p>
</div>
<div className="flex items-center gap-1 mt-1 mr-1">
<span className="text-[10px] text-text-secondary">10:44</span>
<span className="material-symbols-outlined text-primary text-[14px]" data-icon="done_all" style={{   fontVariationSettings: '\'FILL\' 1' }}>done_all</span>
</div>
</div>
{/*  Quick Replies  */}
<div className="flex flex-wrap gap-2 mt-auto">
<button className="bg-surface-container-lowest border border-primary text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all active:scale-95">Obrigado!</button>
<button className="bg-surface-container-lowest border border-primary text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all active:scale-95">Confirmado para amanhã</button>
<button className="bg-surface-container-lowest border border-primary text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all active:scale-95">Pode ligar-me?</button>
</div>
</div>
{/*  Message Input Bar  */}

</section>
</main>
{/*  BottomNavBar (Mobile Only)  */}
      </main>
      <Footer />
    </div>
  )
}
