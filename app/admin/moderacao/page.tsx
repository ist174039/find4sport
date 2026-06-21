'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  SideNavBar Anchor  */}
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
{/*  Main Content Wrapper  */}
<main className="ml-64 min-h-screen flex flex-col">
{/*  TopAppBar Anchor  */}
<header className="flex justify-between items-center w-full pl-8 pr-margin-desktop h-16 sticky top-0 z-40 bg-surface-container-lowest dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none transition-all duration-200">
<div className="flex items-center gap-8">

</div>
<div className="flex items-center gap-4">
<div className="relative group">
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer p-2 hover:bg-surface-container rounded-full" data-icon="notifications">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
</div>
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer p-2 hover:bg-surface-container rounded-full" data-icon="help">help</span>
<div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
<button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:opacity-90 transition-all">
                    Ver Perfil Público
                </button>
<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border border-outline-variant">
<img alt="Avatar do Profissional" className="w-full h-full object-cover" data-alt="A professional headshot of a sports administrator in a bright, modern corporate office environment. The lighting is crisp and high-key, emphasizing a clean and efficient professional atmosphere. The person has a friendly but authoritative expression, aligned with the modern corporate aesthetic of the sports ecosystem." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-GwPKzRQdjDqOk6MJz5iYl6tBhT8580UTsKZ97y0ETYwQsDUnRWQgaYTGYA_dwhjuc3wsb3HCnzz16SkBXxt3JD0CwpIus1re83AKLRMHAhfIesWe4tISj-5hGsmLf6bBWy5ukLqUKy0aNS65dbwooXw1bSHWWYRxXZKN6vg2pvsiijqhscljqLDJ9hppiKBDsh58n4s2NnouG4tn0FlVt6pZhiRCnPlHJdtPWzU9fZpUYgss_dKtXTXaISR4R_AsrB1JkqOA" />
</div>
</div>
</header>
{/*  Page Content Canvas  */}
<section className="p-8 max-w-[1280px] mx-auto w-full">
{/*  Header & Filters  */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Fila de Moderação</h2>
<p className="font-body-md text-on-surface-variant">Analise denúncias de usuários e mantenha a integridade da comunidade FIND4SPORT.</p>
</div>
<div className="flex bg-surface-container p-1 rounded-xl">
<button className="px-6 py-2 rounded-lg font-label-md transition-all bg-surface-container-lowest text-primary shadow-sm flex items-center gap-2">
                        Avaliações
                        <span className="w-5 h-5 bg-error text-on-error text-[10px] rounded-full flex items-center justify-center font-bold">12</span>
</button>
<button className="px-6 py-2 rounded-lg font-label-md transition-all text-on-surface-variant hover:text-on-surface flex items-center gap-2">
                        Perfis
                        <span className="w-5 h-5 bg-outline text-on-surface-variant text-[10px] rounded-full flex items-center justify-center font-bold bg-opacity-20">5</span>
</button>
</div>
</div>
{/*  Moderation Queue  */}
<div className="grid grid-cols-1 gap-6">
{/*  Item 1: Reported Review  */}
<article className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg group">
<div className="flex flex-col md:flex-row">
<div className="p-6 flex-grow">
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-3">
<span className="px-3 py-1 bg-error-container text-on-error-container text-[10px] font-bold rounded-full uppercase tracking-wider">Denúncia: Linguagem Ofensiva</span>
<span className="text-on-surface-variant text-[12px]">Há 2 horas</span>
</div>
<div className="flex gap-1 text-trust-gold">
<span className="material-symbols-outlined" data-icon="star" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined" data-icon="star" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined" data-icon="star" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="material-symbols-outlined" data-icon="star" style={{   fontVariationSettings: '\'FILL\' 0' }}>star</span>
<span className="material-symbols-outlined" data-icon="star" style={{   fontVariationSettings: '\'FILL\' 0' }}>star</span>
</div>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-2">Avaliação de @pedro_surf</h3>
<p className="font-body-md text-on-surface bg-surface p-4 rounded-lg italic mb-4 border-l-4 border-primary">
                                "O instrutor foi extremamente mal educado e usou termos inadmissíveis [CONTEÚDO REMOVIDO] durante a aula de tênis. Não recomendo a ninguém!"
                            </p>
<div className="flex items-center gap-6 text-on-surface-variant text-sm">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]" data-icon="person">person</span>
<span className="">Alvo: <strong>Carlos Silva (Instrutor)</strong></span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]" data-icon="flag">flag</span>
<span className="">Reportado por: <strong>André M.</strong></span>
</div>
</div>
</div>
{/*  Actions Sidebar  */}
<div className="w-full md:w-64 bg-surface-container-low p-6 flex flex-col gap-3 justify-center border-l border-border-subtle">
<button className="w-full py-2 bg-primary-container text-on-primary-container font-label-md rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined" data-icon="check_circle">check_circle</span>
                                Manter
                            </button>
<button className="w-full py-2 border border-error text-error font-label-md rounded-lg hover:bg-error-container transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined" data-icon="delete">delete</span>
                                Remover
                            </button>
<button className="w-full py-2 border border-outline text-on-surface-variant font-label-md rounded-lg hover:bg-surface-variant transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined" data-icon="warning">warning</span>
                                Alertar Usuário
                            </button>
</div>
</div>
</article>
{/*  Item 2: Reported Profile  */}
<article className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg group">
<div className="flex flex-col md:flex-row">
{/*  Profile Image Section  */}
<div className="w-full md:w-48 h-48 md:h-auto overflow-hidden">
<img alt="Perfil Reportado" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A profile picture of a fitness instructor in a sleek, high-end gym. The lighting is dramatic yet clean, highlighting the athletic build and professional coaching environment. The visual style is modern corporate sports, with high-definition clarity and a focus on professional reliability. The overall mood is serious and professional." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCrjfc3JkmD1re7JbMYCG1fcAq6GG3oU7a2dxlVaBhsad6_M-GbvcUX-cuaWqO_t9qeyfTDDjVAQV7XVS_gyTiY8674zHVfJhcYQwD54zRIejg6anl0_l3BKrPwThoqKm8C_r9og5s8CPG4m1dX92NBDKzjbavUeHCvnnRXcsYbCg3EjrIXtq9HgHz7fE-IQJhDAM4Omw7Q958--XqC6zmWpxoX50wkUnxsNfwJXDNg2eAMD-X29AVWvsjNguIUZLk9G74BLwE" />
</div>
<div className="p-6 flex-grow">
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-3">
<span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-wider">Denúncia: Informações Falsas</span>
<span className="text-on-surface-variant text-[12px]">Há 5 horas</span>
</div>
<div className="px-3 py-1 bg-success-mint text-primary text-[10px] font-bold rounded-full border border-primary/20 flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]" data-icon="verified" style={{   fontVariationSettings: '\'FILL\' 1' }}>verified</span>
                                    Selo em Risco
                                </div>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-1">Marcos "Iron" Strength</h3>
<p className="font-body-md text-on-surface-variant mb-4">Reivindica certificação internacional que não pôde ser verificada por múltiplos usuários.</p>
<div className="grid grid-cols-2 gap-4">
<div className="p-3 bg-surface rounded-lg">
<span className="text-[10px] text-on-surface-variant block uppercase font-bold mb-1">Denúncias Acumuladas</span>
<span className="font-stat-display text-primary">8</span>
</div>
<div className="p-3 bg-surface rounded-lg">
<span className="text-[10px] text-on-surface-variant block uppercase font-bold mb-1">Status da Conta</span>
<span className="font-stat-display text-on-surface">Ativo</span>
</div>
</div>
</div>
{/*  Actions Sidebar  */}
<div className="w-full md:w-64 bg-surface-container-low p-6 flex flex-col gap-3 justify-center border-l border-border-subtle">
<button className="w-full py-2 bg-secondary text-on-secondary font-label-md rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined" data-icon="visibility_off">visibility_off</span>
                                Ignorar
                            </button>
<button className="w-full py-2 border border-trust-gold text-trust-gold font-label-md rounded-lg hover:bg-orange-50 transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined" data-icon="pause_circle">pause_circle</span>
                                Suspender
                            </button>
<button className="w-full py-2 bg-error text-on-error font-label-md rounded-lg hover:bg-error/90 transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined" data-icon="gavel">gavel</span>
                                Banir Permanente
                            </button>
</div>
</div>
</article>
</div>
{/*  Pagination/Footer Actions  */}
<div className="mt-12 flex items-center justify-between border-t border-outline-variant pt-8">
<p className="font-body-md text-on-surface-variant">Mostrando <strong>2</strong> de 17 itens pendentes</p>
<div className="flex gap-2">
<button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-all">
<span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
</button>
<button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md active-tab-glow">1</button>
<button className="px-4 py-2 border border-outline-variant rounded-lg font-label-md hover:bg-surface-container">2</button>
<button className="px-4 py-2 border border-outline-variant rounded-lg font-label-md hover:bg-surface-container">3</button>
<button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-all">
<span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</section>
</main>
      </main>
      <Footer />
    </div>
  )
}
