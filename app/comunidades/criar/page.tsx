'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  SideNavBar Component  */}
<aside className="flex flex-col h-full py-8 px-4 h-screen w-64 fixed left-0 top-0 bg-surface dark:bg-inverse-surface border-r border-outline-variant dark:border-outline z-50 transition-colors duration-200 ease-in-out">
<div className="mb-10 px-2">
<h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">FIND4SPORT</h1>
<p className="font-label-md text-label-md text-on-surface-variant">Painel do Profissional</p>
</div>

<div className="mt-auto space-y-2 border-t border-outline-variant pt-6">
<button className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-lg font-label-md hover:brightness-110 transition-all shadow-sm">
<span className="material-symbols-outlined" data-icon="add_circle">add_circle</span>
<span>Criar Novo Evento</span>
</button>
<div className="pt-4 space-y-1">
<a className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:bg-secondary-container transition-all" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="font-label-md">Configurações</span>
</a>
<a className="flex items-center gap-3 px-4 py-2 rounded-lg text-error hover:bg-error-container transition-all" href="#">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span className="font-label-md">Sair</span>
</a>
</div>
</div>
</aside>
{/*  Main Content Area  */}
<main className="pl-64 min-h-screen">
{/*  TopAppBar Component  */}
<header className="sticky top-0 z-40 bg-surface-container-lowest dark:bg-surface-dim border-b border-outline-variant dark:border-outline flex justify-between items-center w-full px-12 h-16 transition-all duration-200">
<div className="flex items-center gap-8">

</div>
<div className="flex items-center gap-6">
<div className="flex gap-4">
<button className="text-on-surface-variant hover:text-primary transition-all">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button className="text-on-surface-variant hover:text-primary transition-all">
<span className="material-symbols-outlined" data-icon="help">help</span>
</button>
</div>
<div className="h-8 w-px bg-outline-variant"></div>
<button className="px-4 py-1.5 border border-primary text-primary rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all">
                    Ver Perfil Público
                </button>
<div className="flex items-center gap-3">
<div className="text-right hidden lg:block">
<p className="font-label-md leading-none">Ricardo Silva</p>
<p className="text-[10px] text-on-surface-variant">Gestor Esportivo</p>
</div>
<img alt="Foto de Perfil do Profissional" className="h-9 w-9 rounded-full object-cover border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU50XUWMsZuWSaXQdtOkD-DXWfBNqwx1b3TKYZzwbJS0U4YRrNVr341Tot5-OYktRIIX-aKngyWpAI713AuTToC0jnA3z7yf3VKreoJ3QoYD9mz2dujEHDQ_PEl1vvCvte-JaLwqfUnKWdaB67Eq0R6oGRFkl8yszJ0Ee0JeOXsEWc489W_xEFlwdnqpMlQUUrjVvbW3CSFuJdtICWpetKoKQx7uN9THW-CqXsLtontGIaJA7zvlN_HNpd2AzrBcO4CVKfn4Oj" />
</div>
</div>
</header>
{/*  Creation Form Content  */}
<div className="max-w-[1000px] mx-auto py-12 px-margin-desktop">
<div className="mb-10">
<div className="flex items-center gap-2 text-primary mb-2">
<span className="material-symbols-outlined" data-icon="group_add">group_add</span>
<span className="font-label-md uppercase tracking-wider">Novo Hub Esportivo</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-text-primary">Criar Nova Comunidade</h2>
<p className="font-body-lg text-body-lg text-text-secondary mt-2">Construa seu ecossistema esportivo, conecte profissionais e gerencie membros em um só lugar.</p>
</div>
<form className="space-y-gutter">
{/*  Section 1: Basic Info  */}
<section className="glass-card p-8 rounded-lg shadow-sm">
<div className="flex gap-4 mb-6">
<div className="bg-primary-container/20 p-2 rounded-lg h-fit">
<span className="material-symbols-outlined text-primary" data-icon="info">info</span>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-text-primary">Informações Básicas</h3>
<p className="text-text-secondary">Identifique sua comunidade no diretório.</p>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="col-span-1">
<label className="block font-label-md text-on-surface-variant mb-2">Nome da Comunidade</label>
<input className="w-full bg-surface border-border-subtle rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Ex: Beach Tennis Club SP" type="text" />
</div>
<div className="col-span-1">
<label className="block font-label-md text-on-surface-variant mb-2">Slug da URL</label>
<div className="flex items-center">
<span className="bg-surface-container px-3 py-3 border border-r-0 border-border-subtle rounded-l-lg text-on-surface-variant font-label-md">find4sport.com/</span>
<input className="w-full bg-surface border-border-subtle rounded-r-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="meu-clube" type="text" />
</div>
</div>
<div className="col-span-2">
<label className="block font-label-md text-on-surface-variant mb-2">Descrição</label>
<textarea className="w-full bg-surface border-border-subtle rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Conte o propósito da comunidade, modalidades e quem pode participar..." rows="4"></textarea>
</div>
</div>
</section>
{/*  Section 2: Classification  */}
<section className="glass-card p-8 rounded-lg shadow-sm">
<div className="flex gap-4 mb-6">
<div className="bg-primary-container/20 p-2 rounded-lg h-fit">
<span className="material-symbols-outlined text-primary" data-icon="category">category</span>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-text-primary">Classificação & Eixo</h3>
<p className="text-text-secondary">Defina o foco e o modelo de gestão.</p>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div>
<label className="block font-label-md text-on-surface-variant mb-3">Modalidade Primária</label>
<select className="w-full bg-surface border-border-subtle rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary">
<option>Beach Tennis</option>
<option>Futebol</option>
<option>Yoga</option>
<option>Crossfit</option>
<option>Corrida</option>
<option>Outros</option>
</select>
</div>
<div>
<label className="block font-label-md text-on-surface-variant mb-3">Nicho de Gestão</label>
<div className="grid grid-cols-1 gap-2">
<label className="flex items-center gap-3 p-3 border border-border-subtle rounded-lg hover:bg-success-mint cursor-pointer transition-all">
<input className="text-primary focus:ring-primary h-4 w-4" name="niche" type="radio" />
<div>
<span className="font-label-md block">Pro-led</span>
<span className="text-[10px] text-text-secondary">Focado em aulas e mentorias de profissionais.</span>
</div>
</label>
<label className="flex items-center gap-3 p-3 border border-border-subtle rounded-lg hover:bg-success-mint cursor-pointer transition-all">
<input className="text-primary focus:ring-primary h-4 w-4" name="niche" type="radio" />
<div>
<span className="font-label-md block">Space-led</span>
<span className="text-[10px] text-text-secondary">Vinculado a um local físico ou arena.</span>
</div>
</label>
<label className="flex items-center gap-3 p-3 border border-border-subtle rounded-lg hover:bg-success-mint cursor-pointer transition-all">
<input className="text-primary focus:ring-primary h-4 w-4" name="niche" type="radio" />
<div>
<span className="font-label-md block">Admin-led</span>
<span className="text-[10px] text-text-secondary">Gestão corporativa ou institucional.</span>
</div>
</label>
</div>
</div>
</div>
</section>
{/*  Section 3: Location & Visibility  */}
<section className="glass-card p-8 rounded-lg shadow-sm">
<div className="flex gap-4 mb-6">
<div className="bg-primary-container/20 p-2 rounded-lg h-fit">
<span className="material-symbols-outlined text-primary" data-icon="share_location">share_location</span>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-text-primary">Localização & Visibilidade</h3>
<p className="text-text-secondary">Como os membros encontrarão você.</p>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div>
<label className="block font-label-md text-on-surface-variant mb-2">Cidade / Região</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-3.5 text-on-surface-variant text-lg" data-icon="location_on">location_on</span>
<input className="w-full bg-surface border-border-subtle rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Ex: São Paulo, SP" type="text" />
</div>
<div className="mt-4 p-4 bg-surface rounded-lg border border-dashed border-outline-variant flex items-center gap-3">
<div className="bg-primary/10 p-2 rounded-full">
<span className="material-symbols-outlined text-primary text-sm" data-icon="map">map</span>
</div>
<span className="text-[12px] text-text-secondary">A localização ajuda a destacar sua comunidade para atletas próximos.</span>
</div>
</div>
<div>
<label className="block font-label-md text-on-surface-variant mb-2">Privacidade</label>
<div className="space-y-3">
<div className="flex items-start gap-3">
<input className="mt-1 text-primary focus:ring-primary" id="pub" name="privacy" type="radio" />
<label htmlFor="pub">
<span className="font-label-md block">Pública</span>
<p className="text-[11px] text-text-secondary">Visível no diretório, qualquer um pode entrar.</p>
</label>
</div>
<div className="flex items-start gap-3">
<input className="mt-1 text-primary focus:ring-primary" id="app" name="privacy" type="radio" />
<label htmlFor="app">
<span className="font-label-md block">Requer Aprovação</span>
<p className="text-[11px] text-text-secondary">Membros pedem acesso e você aprova manualmente.</p>
</label>
</div>
<div className="flex items-start gap-3">
<input className="mt-1 text-primary focus:ring-primary" id="priv" name="privacy" type="radio" />
<label htmlFor="priv">
<span className="font-label-md block">Privada</span>
<p className="text-[11px] text-text-secondary">Apenas convidados via link direto podem ver.</p>
</label>
</div>
</div>
</div>
</div>
</section>
{/*  Section 4: Branding  */}
<section className="glass-card p-8 rounded-lg shadow-sm">
<div className="flex gap-4 mb-6">
<div className="bg-primary-container/20 p-2 rounded-lg h-fit">
<span className="material-symbols-outlined text-primary" data-icon="palette">palette</span>
</div>
<div>
<h3 className="font-headline-md text-headline-md text-text-primary">Branding</h3>
<p className="text-text-secondary">Personalize a identidade visual do seu hub.</p>
</div>
</div>
<div className="space-y-8">
<div>
<label className="block font-label-md text-on-surface-variant mb-4">Imagem de Capa</label>
<div className="relative group cursor-pointer h-48 rounded-xl overflow-hidden border-2 border-dashed border-outline-variant hover:border-primary transition-all">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75" data-alt="A professional aerial view of a modern sports complex at sunset, showing clean tennis courts and green fields. The lighting is warm and cinematic, emphasizing high-performance athleticism and high-end facilities. The aesthetic is clean and crisp, following a modern corporate sport style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAldQP7cY3MwWcLyuoViSZyuB3EFmuSXrBa1QN_v1bdyyXgKcoW9eBY8Xxl8I3ZIusTeaPSoJMVclC8XKe87gIpxtEE21DksEH5whmxJDpFIrhkudxVxDrJNX9Ar7sTHDu8MscE6aGy7FYt0Q6s5HcDp7iv244KeCZwdr7aDwoZERQNcay2T_nhe2-pzsAl3Kx8Yz9pMDpCFfOQbcNTSDgfeKiRa5rW3oviZvHfaFZ3bn1mQiDHS6rQxWAZazGobWTKy-fZEAGC" />
<div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/20 group-hover:bg-black/40 transition-all">
<span className="material-symbols-outlined text-4xl mb-2" data-icon="cloud_upload">cloud_upload</span>
<span className="font-label-md">Alterar Imagem de Capa</span>
<span className="text-[10px] opacity-75 mt-1">Recomendado: 1200x400px</span>
</div>
</div>
</div>
<div className="flex flex-col md:flex-row gap-8 items-center">
<div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-outline-variant group-hover:ring-primary transition-all">
<img className="w-full h-full object-cover" data-alt="A minimalist sports community icon showing stylized geometric shapes representing movement and synergy. The design uses a vibrant emerald green and white palette on a clean background. The visual style is modern, professional, and corporate, reflecting a premium sports brand identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYh8FnjT_tdPOD212xjG_wpZsio4DqMN2c3DJ5lFgQYKSWT3h_7zavA24KCufp00uMj8taFa9ieS68uwrLTqlGERkYurcPts8xwlhjheL6DNLXH1E_9schC6ubO36g_sD_XqweQ2l5o-oZhGqlcQk4Dy95VlNY4LY5GD4DsCLzG9jswA8Cj8oyxrrRtopXXpVXEY8oMkahzzwatCu4LmWns2oRagktw7P-L76781lYL1nZSFumDsWhrWsvtMPhqO4Zj-k5KQAM" />
<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all text-white">
<span className="material-symbols-outlined" data-icon="photo_camera">photo_camera</span>
</div>
</div>
<div className="flex-1">
<h4 className="font-headline-md text-text-primary mb-1">Ícone da Comunidade</h4>
<p className="text-text-secondary text-body-md mb-4">Este ícone aparecerá no diretório e no menu lateral dos seus membros.</p>
<div className="flex gap-3">
<button className="px-4 py-2 bg-surface border border-border-subtle rounded-lg text-on-surface-variant font-label-md hover:bg-secondary-container transition-all" type="button">Upload Novo</button>
<button className="px-4 py-2 text-error font-label-md hover:bg-error-container rounded-lg transition-all" type="button">Remover</button>
</div>
</div>
</div>
</div>
</section>
{/*  Final Actions  */}
<div className="flex flex-col md:flex-row items-center justify-end gap-4 py-8 border-t border-outline-variant mt-12">
<button className="w-full md:w-auto px-8 py-3 text-on-surface-variant font-label-md hover:bg-secondary-container rounded-lg transition-all" type="button">Descartar Rascunho</button>
<button className="w-full md:w-auto px-12 py-4 bg-primary text-on-primary font-headline-md rounded-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3" type="submit">
                        Criar Comunidade
                        <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</form>
</div>
{/*  Footer Info  */}

</main>
{/*  Micro-interaction: Form Progress Logic  */}
      </main>
      <Footer />
    </div>
  )
}
