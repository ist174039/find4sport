'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  SideNavBar Shell  */}
<aside className="h-screen w-64 fixed left-0 top-0 bg-surface dark:bg-inverse-surface border-r border-outline-variant dark:border-outline flex flex-col py-8 px-4 z-50"><div className="mb-10 px-2">
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
</div></aside>
{/*  TopAppBar Shell  */}
<header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant h-16 flex justify-between items-center px-12 transition-all duration-200 ml-64">
<div className="flex items-center gap-8">

</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4 border-r border-outline-variant pr-6">
<button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
<span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="help">help</span>
</button>
</div>
<div className="flex items-center gap-3">
<button className="font-label-md text-label-md text-primary font-bold hover:underline">Ver Perfil Público</button>
<div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed ring-2 ring-surface">
<img alt="Avatar do Profissional" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCB0e00OM2bkbykGHWh5yVMQLtlOLxXwQjc4sa30r3aw_BhHyBFw3DLs-8RJ7AIls7QpZ1nrqdb5TDmpXGFGJfD-h_3hG12PjLUOtyBRyUrb8GsfoKBGkFBUF0xWrpcVDwmjB04EZb7NU7npOf8hiIM0jHTIWCVgXZW6kQmrJz4YZ4J1OZe95a4wrLfjOoroI7y2VCohAQPY5mx53odDhtbrhMLBSbnAsOzXkbfe1_Q_iNZMApS1qlG41UbF88XXMJ_Gf2l_KmC" />
</div>
</div>
</div>
</header>
{/*  Main Canvas  */}
<main className="ml-64 p-12 max-w-[1400px] mx-auto space-y-gutter">
{/*  Welcome & Actions  */}
<section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
<div>
<h2 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">Gestão de Espaços Esportivos</h2>
<p className="text-text-secondary mt-1 font-body-md">Administre, valide e importe novos locais para o ecossistema.</p>
</div>
<div className="flex gap-3">
<button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high border border-outline-variant rounded-lg font-label-md hover:bg-surface-variant transition-all">
<img alt="Google Logo" className="w-4 h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwFewsTcDPucJ8u_tKlx0Hxt5G2r2qQU4BKY62WYYKr3dmMBs8t8lJDc2-Uj6wWWDzGC_LD9O7eAtMpeCDTf8LsTQK6wKwzCq8lOFy_KQ7VMKPsNPYwJIbCbePvLVhPiOaRhTl1KJZcjjFQwXA5llJxwlEKH_ET50WYouIF76JV_Y3WHms3SZjWjobwekhV2L2KDo3AQ53Qhw9oxRa7aVcAUmnGPDONzM0REp6u0Yb0LtdkV7ysBV6UwmHOQxffYhls1lwgY6A" />
                    Importar do Google Places
                </button>
<button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md hover:shadow-lg hover:shadow-primary/20 transition-all">
<span className="material-symbols-outlined text-[20px]">add</span>
                    Cadastrar Espaço
                </button>
</div>
</section>
{/*  Stats Overview - Bento Grid Style  */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-12">
<div className="bg-white p-6 rounded-xl border border-border-subtle hover:border-primary transition-colors cursor-default group">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-primary-fixed rounded-lg text-primary">
<span className="material-symbols-outlined">home_work</span>
</div>
<span className="text-success-mint bg-primary px-2 py-1 rounded text-[10px] font-bold">+12% mês</span>
</div>
<p className="text-outline font-label-md">Total de Espaços</p>
<h3 className="font-stat-display text-stat-display text-text-primary">1,284</h3>
</div>
<div className="bg-white p-6 rounded-xl border border-border-subtle hover:border-primary transition-colors cursor-default group">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-secondary-fixed rounded-lg text-secondary">
<span className="material-symbols-outlined">pending_actions</span>
</div>
</div>
<p className="text-outline font-label-md">Aguardando Validação</p>
<h3 className="font-stat-display text-stat-display text-text-primary">42</h3>
</div>
<div className="bg-white p-6 rounded-xl border border-border-subtle hover:border-primary transition-colors cursor-default group">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-tertiary-fixed rounded-lg text-tertiary">
<span className="material-symbols-outlined">verified</span>
</div>
</div>
<p className="text-outline font-label-md">Selos de Qualidade</p>
<h3 className="font-stat-display text-stat-display text-text-primary">315</h3>
</div>
<div className="bg-white p-6 rounded-xl border border-border-subtle hover:border-primary transition-colors cursor-default group">
<div className="flex justify-between items-start mb-4">
<div className="p-2 bg-error-container rounded-lg text-error">
<span className="material-symbols-outlined">report</span>
</div>
</div>
<p className="text-outline font-label-md">Reclamações Ativas</p>
<h3 className="font-stat-display text-stat-display text-text-primary">08</h3>
</div>
</div>
{/*  Ownership Claims Section - Attention Required  */}
<section className="mb-12">
<div className="flex items-center gap-3 mb-6">
<h3 className="font-headline-md text-headline-md text-text-primary">Solicitações de Propriedade</h3>
<span className="px-2 py-0.5 bg-error text-on-error rounded-full text-[10px] font-bold">5 NOVAS</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
{/*  Claim Card 1  */}
<div className="glass-panel p-6 rounded-2xl border-l-4 border-error shadow-sm flex flex-col md:flex-row gap-6 items-start">
<div className="w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-outline text-3xl">domain_verification</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start">
<div>
<h4 className="font-headline-md text-[18px] text-text-primary">Ginasio Poliesportivo "Olimpo"</h4>
<p className="text-body-md text-outline">Reclamado por: <strong>Marcos Oliveira</strong></p>
</div>
<span className="text-[10px] font-bold text-error uppercase bg-error-container px-2 py-1 rounded">Urgente</span>
</div>
<div className="mt-4 flex gap-2">
<button className="text-primary border border-primary px-4 py-1.5 rounded-lg font-label-md hover:bg-primary hover:text-white transition-all">Ver Documentos</button>
<button className="bg-primary text-white px-4 py-1.5 rounded-lg font-label-md">Aprovar</button>
<button className="text-on-surface-variant hover:text-error px-4 py-1.5 rounded-lg font-label-md">Negar</button>
</div>
</div>
</div>
{/*  Claim Card 2  */}
<div className="glass-panel p-6 rounded-2xl border-l-4 border-trust-gold shadow-sm flex flex-col md:flex-row gap-6 items-start opacity-90 hover:opacity-100 transition-opacity">
<div className="w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-outline text-3xl">storefront</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start">
<div>
<h4 className="font-headline-md text-[18px] text-text-primary">CrossFit High Intensity</h4>
<p className="text-body-md text-outline">Reclamado por: <strong>Ana K. Fitness Ltd.</strong></p>
</div>
<span className="text-[10px] font-bold text-trust-gold uppercase bg-trust-gold/10 px-2 py-1 rounded">Pendente</span>
</div>
<div className="mt-4 flex gap-2">
<button className="text-primary border border-primary px-4 py-1.5 rounded-lg font-label-md hover:bg-primary hover:text-white transition-all">Ver Documentos</button>
<button className="bg-primary text-white px-4 py-1.5 rounded-lg font-label-md">Aprovar</button>
<button className="text-on-surface-variant hover:text-error px-4 py-1.5 rounded-lg font-label-md">Negar</button>
</div>
</div>
</div>
</div>
</section>
{/*  Filters & Main Table  */}
<section className="bg-white rounded-3xl border border-border-subtle shadow-sm overflow-hidden">
<div className="p-6 border-b border-border-subtle flex flex-wrap items-center justify-between gap-4">
<div className="flex gap-4">
<button className="px-4 py-2 bg-primary-container text-on-primary-container rounded-full font-label-md">Todos</button>
<button className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-full font-label-md transition-colors">Ativos</button>
<button className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-full font-label-md transition-colors">Rascunhos</button>
<button className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-full font-label-md transition-colors">Pendentes</button>
</div>
<div className="flex items-center gap-2">
<span className="font-label-md text-outline">Ordenar por:</span>
<select className="border-none bg-transparent font-label-md text-primary focus:ring-0 cursor-pointer">
<option>Mais recentes</option>
<option>Nome (A-Z)</option>
<option>Capacidade</option>
</select>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full border-collapse">
<thead className="bg-surface-container-low">
<tr>
<th className="text-left px-6 py-4 font-label-md text-outline uppercase tracking-wider">Espaço</th>
<th className="text-left px-6 py-4 font-label-md text-outline uppercase tracking-wider">Localização</th>
<th className="text-left px-6 py-4 font-label-md text-outline uppercase tracking-wider">Capacidade</th>
<th className="text-left px-6 py-4 font-label-md text-outline uppercase tracking-wider">Status</th>
<th className="text-left px-6 py-4 font-label-md text-outline uppercase tracking-wider">Reputação</th>
<th className="px-6 py-4"></th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle">
{/*  Row 1  */}
<tr className="hover:bg-surface-container-lowest transition-colors group">
<td className="px-6 py-5">
<div className="flex items-center gap-4">
<img className="w-12 h-12 rounded-lg object-cover" data-alt="A modern, high-tech gym interior featuring rows of weightlifting racks and cardiovascular machines. The lighting is dramatic and cool-toned, reflecting off polished floors and chrome equipment. The space looks premium, clean, and professional, perfectly suited for an elite sports club UI." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0-NSDE9QgUqsLYhaVZe0YdKXCkrQ30gxDbO4mRg8TvuRHTacsY7RVthBKbwXVqYR04TPm29Xefdo4LOY_3YRULLVAAgqmpsbngFjrQPzBXoMUxXRTthOYIIlOSE6rrOhmGTHFJqXqj7ioU5OCbi_2bwWHFuf4uZh3E_st4y4YrJZQUBgde20Q5hvtE4J7Qelyw8rVHhotWD3O3hzl0eHD1yQe18ckRsPAilOG3zU9l9vHnv5o0Yex8LpgEn93Wt7nyo5vvxWP" />
<div>
<h5 className="font-bold text-text-primary">Iron Haven Gym</h5>
<p className="text-body-md text-outline">Musculação • Funcional</p>
</div>
</div>
</td>
<td className="px-6 py-5">
<p className="text-body-md text-text-primary">São Paulo, SP</p>
<p className="text-label-md text-outline">Jardins</p>
</td>
<td className="px-6 py-5">
<span className="font-label-md px-3 py-1 bg-surface-container-high rounded-full">250 pax</span>
</td>
<td className="px-6 py-5">
<span className="flex items-center gap-2 text-[10px] font-bold text-primary bg-success-mint px-2.5 py-1 rounded-full uppercase">
<span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                                    Ativo
                                </span>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-trust-gold text-lg" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-text-primary">4.9</span>
</div>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 hover:bg-surface-container rounded-full transition-colors">
<span className="material-symbols-outlined text-outline">more_vert</span>
</button>
</td>
</tr>
{/*  Row 2  */}
<tr className="hover:bg-surface-container-lowest transition-colors group">
<td className="px-6 py-5">
<div className="flex items-center gap-4">
<img className="w-12 h-12 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" data-alt="A bright, airy yoga and pilates studio with large floor-to-ceiling windows letting in natural sunlight. The floor is made of light wood, and several yoga mats are neatly arranged. The overall atmosphere is peaceful, minimalist, and focuses on wellness and clarity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfdjwG03lmAp7asKpJP88-ri9KeTaKp4cZkH0PKxmAuDOxD6kYXdAUecWXGhPSzH7K9d8-qPR38t990EPu8ShyZr3B79wloj-DmomhYnu3kiBHYn5DiwuPUfUz1DU8AAORJrK0LDVz9EBXzkRDz-AbOVajqYiRYNbirimZMhAuzgBGu9JXQUJgXLso9u1PPgmFvprNlPhIFQa8JUWTx_VicwPU7e0QwIz2yVfgMwjfIfIVWp0veksrGZetATW85uiu4k7NV6XW" />
<div>
<h5 className="font-bold text-text-primary">Zenith Yoga Studio</h5>
<p className="text-body-md text-outline">Yoga • Meditação</p>
</div>
</div>
</td>
<td className="px-6 py-5">
<p className="text-body-md text-text-primary">Curitiba, PR</p>
<p className="text-label-md text-outline">Batel</p>
</td>
<td className="px-6 py-5">
<span className="font-label-md px-3 py-1 bg-surface-container-high rounded-full">45 pax</span>
</td>
<td className="px-6 py-5">
<span className="flex items-center gap-2 text-[10px] font-bold text-outline bg-surface-container-high px-2.5 py-1 rounded-full uppercase">
                                    Rascunho
                                </span>
</td>
<td className="px-6 py-5">
<span className="text-label-md text-outline italic">S/ Avaliações</span>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 hover:bg-surface-container rounded-full transition-colors">
<span className="material-symbols-outlined text-outline">more_vert</span>
</button>
</td>
</tr>
{/*  Row 3  */}
<tr className="hover:bg-surface-container-lowest transition-colors group">
<td className="px-6 py-5">
<div className="flex items-center gap-4">
<img className="w-12 h-12 rounded-lg object-cover" data-alt="An energetic indoor sports court featuring bright markings on a professional blue floor. Basketball hoops and volleyball nets are visible in the distance. The lighting is bright and even, highlighting the clean, modern architecture of the multi-sport arena." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuy_6Vei8W52psrYKTMLVtxiy-AXXaZAJD3h8Vk2u3pNhSd_SKNzjUI8E11BVA2LvWwUz0ni6LpwKItOkqceDnftA9KPluuhHijVxoDMsFiyLqNllxs_yNhNIotbNCYsaTdbXIbZg8st3c5H3dSPnlbOLSHbWQJvNU3j8ZnWBu8Dkrf3hmnJbWE3ln5aIuj7dBpqdVSBr6ICaQjDjWEcuRdMQHNr5ihPzYNBOs_UHwkrSbwG-wweRRvo3lDsVmPr2fwji_E5W-" />
<div>
<h5 className="font-bold text-text-primary">Arena Multi-Esporte</h5>
<p className="text-body-md text-outline">Vôlei • Basquete</p>
</div>
</div>
</td>
<td className="px-6 py-5">
<p className="text-body-md text-text-primary">Belo Horizonte, MG</p>
<p className="text-label-md text-outline">Pampulha</p>
</td>
<td className="px-6 py-5">
<span className="font-label-md px-3 py-1 bg-surface-container-high rounded-full">120 pax</span>
</td>
<td className="px-6 py-5">
<span className="flex items-center gap-2 text-[10px] font-bold text-trust-gold bg-trust-gold/10 px-2.5 py-1 rounded-full uppercase">
                                    Pendente
                                </span>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-trust-gold text-lg" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-text-primary">4.2</span>
</div>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 hover:bg-surface-container rounded-full transition-colors">
<span className="material-symbols-outlined text-outline">more_vert</span>
</button>
</td>
</tr>
{/*  Row 4  */}
<tr className="hover:bg-surface-container-lowest transition-colors group">
<td className="px-6 py-5">
<div className="flex items-center gap-4">
<img className="w-12 h-12 rounded-lg object-cover" data-alt="A luxurious hotel rooftop swimming pool with crystal-clear turquoise water. The poolside features elegant lounge chairs and minimalist umbrellas. The scene is shot during the golden hour, casting a warm, premium glow over the high-end aquatic facility." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTJpyBSOW6eVkUFmZd6N5lDOltIVMMAmVfiGq6qqf_NykFb9xoj3-t6qtUgIj3EBmK79F_Ir6g5x56m_LZFQ02hs5bv2d9FZDPhkz0nXnNNg4rFHF1xNC8MRCHA6Otv70rm7yPKCIP1aMn8rBkCiC9RmDfyBXfvCYLsye020Iq3eespWoQF35r1rrqJ4C15k3l-as1Jl9wkHbGoXNnZFv6z9UIsoopD_4m9wdHVLvdlqP3E5IaOLBTvkEQaW2jWTRNRmpPOh2p" />
<div>
<h5 className="font-bold text-text-primary">Blue Waters Aquatic Center</h5>
<p className="text-body-md text-outline">Natação • Hidro</p>
</div>
</div>
</td>
<td className="px-6 py-5">
<p className="text-body-md text-text-primary">Rio de Janeiro, RJ</p>
<p className="text-label-md text-outline">Barra</p>
</td>
<td className="px-6 py-5">
<span className="font-label-md px-3 py-1 bg-surface-container-high rounded-full">80 pax</span>
</td>
<td className="px-6 py-5">
<span className="flex items-center gap-2 text-[10px] font-bold text-primary bg-success-mint px-2.5 py-1 rounded-full uppercase">
<span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                                    Ativo
                                </span>
</td>
<td className="px-6 py-5">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-trust-gold text-lg" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-bold text-text-primary">4.7</span>
</div>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 hover:bg-surface-container rounded-full transition-colors">
<span className="material-symbols-outlined text-outline">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
{/*  Pagination  */}
<div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
<span className="text-body-md text-outline">Mostrando 1-10 de 1,284 espaços</span>
<div className="flex gap-2">
<button className="p-2 rounded-lg hover:bg-surface-variant transition-all disabled:opacity-30" disabled="">
<span className="material-symbols-outlined">chevron_left</span>
</button>
<button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg font-bold">1</button>
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant rounded-lg transition-all">2</button>
<button className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant rounded-lg transition-all">3</button>
<button className="p-2 rounded-lg hover:bg-surface-variant transition-all">
<span className="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
</section>
</main>
{/*  Contextual FAB (Only on Dashboard/Management)  */}
<button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
<span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">add</span>
<div className="absolute right-full mr-4 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Rápido: Novo Espaço
        </div>
</button>
      </main>
      <Footer />
    </div>
  )
}
