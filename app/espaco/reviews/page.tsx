'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  Sidebar Navigation  */}
<aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low dark:bg-inverse-surface shadow-sm flex flex-col h-full py-base space-y-2 z-50">
<div className="px-6 py-8">
<h1 className="font-headline-sm text-headline-sm font-black text-primary dark:text-primary-fixed">Gestão Finder</h1>
<p className="text-on-surface-variant font-label-md text-[10px] uppercase tracking-wider mt-1">Plano Profissional</p>
</div>

<div className="px-4 py-4">
<button className="w-full bg-primary text-on-primary font-label-md py-3 rounded-lg shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[20px]" data-icon="add">add</span>
                Novo Evento
            </button>
</div>
<div className="mt-auto border-t border-border-subtle pt-4 pb-6">
<a className="text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-secondary-fixed-variant rounded-lg mx-2 px-4 py-3 flex items-center gap-3 transition-all" href="#">
<span className="material-symbols-outlined" data-icon="help">help</span>
<span className="font-label-md text-label-md">Suporte</span>
</a>
<a className="text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-high dark:hover:bg-secondary-fixed-variant rounded-lg mx-2 px-4 py-3 flex items-center gap-3 transition-all" href="#">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span className="font-label-md text-label-md">Sair</span>
</a>
</div>
</aside>
{/*  Main Content  */}
<main className="ml-64 min-h-screen">
{/*  Top Bar  */}
<header className="sticky top-0 bg-surface/80 backdrop-blur-md z-40 h-16 border-b border-border-subtle flex items-center justify-between px-8">
<div className="flex items-center gap-4">

</div>
<div className="flex items-center gap-6">
<button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors relative">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
</button>
<div className="flex items-center gap-3">
<div className="text-right">
<p className="font-label-md text-on-surface leading-tight">Ricardo Santos</p>
<p className="text-[10px] text-text-secondary uppercase">Gestor de Espaço</p>
</div>
<img alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-primary-fixed" data-alt="A professional headshot of a middle-aged male sports facility manager with a friendly expression. He is wearing a modern polo shirt and is captured against a blurred background of a brightly lit, high-end athletic complex. The lighting is soft and natural, emphasizing a professional and approachable corporate aesthetic that aligns with the premium service-oriented brand." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtIlx8FkrpPztUG659799arNOoyo7Y7gdpkG75D82gAHW2LSbEVNhjZZWYI91iFivB6G3_ES3HN3ZnNa13vDhZvvKAsi4hXXBxrED8hksjcd_pumMvmFicLl989QE84a13W-Qz_3UcH9_T_dJaLhqqvGFAV39HplpDyqHIv_85fxa2fIXpJGQVr0Ug7vyJ3n7-VUhqYIVQHPVkymgpdiLaMIvCF4LJ90efDi_w_0OYekqGIWh6BZ_Vct3xzmHmanKCAqxkrTNk" />
</div>
</div>
</header>
<div className="p-8 max-w-7xl mx-auto space-y-8">
{/*  Summary Row  */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
<div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-2">
<span className="text-text-secondary font-label-md">Rating Médio</span>
<div className="flex items-end gap-2">
<span className="text-stat-display font-stat-display text-4xl">4.8</span>
<div className="flex mb-1 text-trust-gold">
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star_half</span>
</div>
</div>
<span className="text-success-mint bg-primary/10 text-[11px] px-2 py-0.5 rounded-full w-fit">+0.2 este mês</span>
</div>
<div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-2">
<span className="text-text-secondary font-label-md">Total de Reviews</span>
<span className="text-stat-display font-stat-display text-4xl">1,284</span>
<span className="text-text-secondary text-[11px]">98% verificadas</span>
</div>
<div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-2">
<span className="text-text-secondary font-label-md">Taxa de Resposta</span>
<span className="text-stat-display font-stat-display text-4xl">92%</span>
<div className="w-full bg-surface-container h-1.5 rounded-full mt-2">
<div className="bg-primary h-full rounded-full" style={{   width: '92%' }}></div>
</div>
</div>
<div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-2">
<span className="text-text-secondary font-label-md">Tempo de Resposta</span>
<span className="text-stat-display font-stat-display text-4xl">4.5h</span>
<span className="text-text-secondary text-[11px]">Média global: 12h</span>
</div>
</div>
{/*  Filters and Search  */}
<section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-border-subtle">
<div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
<button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-sm whitespace-nowrap">Todas as Reviews</button>
<button className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg font-label-md text-sm whitespace-nowrap hover:bg-primary/5 transition-colors">5 Estrelas</button>
<button className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg font-label-md text-sm whitespace-nowrap hover:bg-primary/5 transition-colors">4 Estrelas</button>
<button className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg font-label-md text-sm whitespace-nowrap hover:bg-primary/5 transition-colors">Críticas (1-3)</button>
<button className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg font-label-md text-sm whitespace-nowrap hover:bg-primary/5 transition-colors">Sem Resposta</button>
</div>
<div className="relative w-full md:w-72">
<span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary" data-icon="search">search</span>
<input className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-shadow" placeholder="Procurar por nome ou conteúdo..." type="text" />
</div>
</section>
{/*  Reviews List (Bento-ish Stack)  */}
<section className="space-y-4">
{/*  Review Card 1 (Needs Action)  */}
<article className="bg-surface-container-lowest rounded-xl border-l-4 border-l-error border border-border-subtle shadow-sm overflow-hidden hover:shadow-md transition-shadow">
<div className="p-6">
<div className="flex justify-between items-start mb-4">
<div className="flex items-center gap-4">
<img alt="Tiago Lima" className="w-12 h-12 rounded-full object-cover" data-alt="A candid profile photo of a young male athlete in his 20s with short hair, wearing a high-performance training jersey. The background is a vibrant, sunlit outdoor tennis court, emphasizing movement and sportiness. The image is crisp and clear, following a modern corporate sport aesthetic with natural lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6MNMBB3HgmUHoVWAsMXi4TNXfo-vmexeyXR7ymrnwOPiHjllVWRSuO5spWuyMOyC1sw6fu-HRqlrir65csOkJqd_H_a8IMxufv2a4VM1qo77fLRY0v7nW_p5BLnXKVcHdcrJb0qY7yfucDo7orCKl8blXPb23U1jYpWkCVo39thBhZPzTTQx6sKUxgf7ZHGIw7T2rksYi378BRGYiDKmvuKByhdIn5qHWjY65INNbhZqTtLQ6IfiTQKsyVw3ohNbdNcdas0G8" />
<div>
<h3 className="font-headline-md text-lg text-on-surface">Tiago Lima</h3>
<p className="text-text-secondary text-xs">Padel Center Alvalade • há 2 horas</p>
</div>
</div>
<div className="flex flex-col items-end gap-1">
<div className="flex text-trust-gold">
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined" data-icon="star">star</span>
<span className="material-symbols-outlined" data-icon="star">star</span>
<span className="material-symbols-outlined" data-icon="star">star</span>
</div>
<span className="bg-error-container text-on-error-container font-label-md text-[10px] px-2 py-0.5 rounded-full uppercase">Resposta Urgente</span>
</div>
</div>
<p className="text-on-surface-variant font-body-lg mb-4">
                            "A iluminação no campo 4 estava intermitente durante todo o jogo. Difícil de jogar assim, pagamos o preço total e o balneário também estava sem água quente."
                        </p>
<div className="flex items-center gap-2 mb-6">
<div className="flex items-center gap-1 bg-surface-container rounded-lg px-2 py-1 text-[11px] text-text-secondary">
<span className="material-symbols-outlined text-[14px]" data-icon="sports_tennis">sports_tennis</span>
                                Campo 4 (Padel)
                            </div>
<div className="flex items-center gap-1 bg-surface-container rounded-lg px-2 py-1 text-[11px] text-text-secondary">
<span className="material-symbols-outlined text-[14px]" data-icon="receipt_long">receipt_long</span>
                                Reserva #48291
                            </div>
</div>
{/*  Response Field  */}
<div className="bg-surface-container-low p-4 rounded-lg">
<label className="font-label-md text-xs text-text-secondary block mb-2">RESPOSTA OFICIAL DO ESPAÇO</label>
<textarea className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary min-h-[100px] mb-3" placeholder="Escreva aqui a sua resposta para o cliente..."></textarea>
<div className="flex justify-end gap-3">
<button className="text-text-secondary font-label-md text-sm hover:underline">Guardar Rascunho</button>
<button className="bg-primary text-on-primary font-label-md text-sm px-6 py-2 rounded-lg hover:bg-primary-container transition-all">Enviar Resposta</button>
</div>
</div>
</div>
</article>
{/*  Review Card 2 (Responded)  */}
<article className="bg-surface-container-lowest rounded-xl border border-border-subtle shadow-sm overflow-hidden opacity-90 hover:opacity-100 transition-all">
<div className="p-6">
<div className="flex justify-between items-start mb-4">
<div className="flex items-center gap-4">
<img alt="Marta Fernandes" className="w-12 h-12 rounded-full object-cover" data-alt="A portrait of a smiling woman in her early 30s with long dark hair, wearing casual athletic wear. She is positioned in a bright indoor yoga studio with floor-to-ceiling windows and lush green plants in the background. The aesthetic is clean, vibrant, and professional, reflecting a high-quality fitness community." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiQy6VqKNbxGgdXe6Mr7QR_CLwpONqkZApM3uqabjvFWQa1FYSV2NP7SJhNiGFr8DW1oRCJ09qkz4fmq-GefEDYiqzJGl1lZOClTGhS0VOOolJ09WVLMaN-pA0nX7Xkvzw0SdVshKXwwfvBRPzxWKnYXVBXaFnD4ccd4CZ-rN60lGfNkMfAG8OAYaylWhPrGLRnqH4TSgOP_a86McHDdgu8PImj0hKYdNOIZlAco2-_5Wv464SqN5714igDfS3dVsh0vBwiagq" />
<div>
<h3 className="font-headline-md text-lg text-on-surface">Marta Fernandes</h3>
<p className="text-text-secondary text-xs">Padel Center Alvalade • há 1 dia</p>
</div>
</div>
<div className="flex text-trust-gold">
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
</div>
</div>
<p className="text-on-surface-variant font-body-lg mb-4 italic">
                            "Excelente ambiente e campos impecáveis. O staff foi super atencioso na recepção."
                        </p>
{/*  Previous Response  */}
<div className="ml-8 border-l-2 border-primary/20 pl-6 mt-6">
<div className="flex items-center gap-2 mb-2">
<span className="material-symbols-outlined text-primary text-sm" data-icon="reply">reply</span>
<span className="font-label-md text-xs text-primary font-bold">RESPOSTA DO GESTOR</span>
<span className="text-[10px] text-text-secondary">• ontem às 15:30</span>
</div>
<p className="text-text-secondary text-sm">
                                "Olá Marta! Muito obrigado pelo feedback. É um prazer saber que desfrutou da sua experiência no nosso centro. Esperamos vê-la novamente em breve!"
                            </p>
<button className="mt-2 text-primary font-label-md text-[11px] hover:underline">Editar Resposta</button>
</div>
</div>
</article>
{/*  Review Card 3  */}
<article className="bg-surface-container-lowest rounded-xl border border-border-subtle shadow-sm overflow-hidden hover:shadow-md transition-shadow">
<div className="p-6">
<div className="flex justify-between items-start mb-4">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-lg">
                                    JS
                                </div>
<div>
<h3 className="font-headline-md text-lg text-on-surface">João Silva</h3>
<p className="text-text-secondary text-xs">Padel Center Alvalade • há 3 dias</p>
</div>
</div>
<div className="flex text-trust-gold">
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined fill-icon" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined" data-icon="star">star</span>
</div>
</div>
<p className="text-on-surface-variant font-body-lg mb-4">
                            "Bom espaço, mas o café podia abrir mais cedo nos fins de semana."
                        </p>
<div className="flex justify-end">
<button className="text-primary border border-primary font-label-md text-sm px-6 py-2 rounded-lg hover:bg-primary/5 transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]" data-icon="chat_bubble_outline">chat_bubble_outline</span>
                                Responder agora
                            </button>
</div>
</div>
</article>
</section>
{/*  Pagination  */}

</div>
</main>
      </main>
      <Footer />
    </div>
  )
}
