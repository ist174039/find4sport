'use client';
import { ArrowRight, Bell, Camera, HelpCircle, Info, LogOut, Map, MapPin, Palette, PlusCircle, Settings, Tag, Upload, UserPlus } from 'lucide-react'

export default function Page() {
  return (
        <>

        {/*  SideNavBar Component  */}
<aside className="flex flex-col h-full py-8 px-4 h-screen w-64 fixed left-0 top-0 bg-background dark:bg-foreground border-r border-border dark:border-border z-50 transition-colors duration-200 ease-in-out">
<div className="mb-10 px-2">
<h1 className="font-semibold text-xl text-xl font-bold text-primary dark:text-primary-fixed-dim">FIND4SPORT</h1>
<p className="font-medium text-sm text-sm text-muted-foreground">Painel do Profissional</p>
</div>

<div className="mt-auto space-y-2 border-t border-border pt-6">
<button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium text-sm hover:brightness-110 transition-all shadow-sm">
<PlusCircle className="h-5 w-5" />
<span>Criar Novo Evento</span>
</button>
<div className="pt-4 space-y-1">
<a className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary transition-all" href="#">
<Settings className="h-5 w-5" />
<span className="font-medium text-sm">Configurações</span>
</a>
<a className="flex items-center gap-3 px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all" href="#">
<LogOut className="h-5 w-5" />
<span className="font-medium text-sm">Sair</span>
</a>
</div>
</div>
</aside>
{/*  Main Content Area  */}
<main className="pl-64 min-h-screen">
{/*  TopAppBar Component  */}
<header className="sticky top-0 z-40 bg-card dark:bg-background-dim border-b border-border dark:border-border flex justify-between items-center w-full px-12 h-16 transition-all duration-200">
<div className="flex items-center gap-8">

</div>
<div className="flex items-center gap-6">
<div className="flex gap-4">
<button className="text-muted-foreground hover:text-primary transition-all">
<Bell className="h-5 w-5" />
</button>
<button className="text-muted-foreground hover:text-primary transition-all">
<HelpCircle className="h-5 w-5" />
</button>
</div>
<div className="h-8 w-px bg-border"></div>
<button className="px-4 py-1.5 border border-primary text-primary rounded-lg font-medium text-sm text-sm hover:bg-primary hover:text-primary-foreground transition-all">
                    Ver Perfil Público
                </button>
<div className="flex items-center gap-3">
<div className="text-right hidden lg:block">
<p className="font-medium text-sm leading-none">Ricardo Silva</p>
<p className="text-[10px] text-muted-foreground">Gestor Esportivo</p>
</div>
<img alt="Foto de Perfil do Profissional" className="h-9 w-9 rounded-full object-cover border border-border" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU50XUWMsZuWSaXQdtOkD-DXWfBNqwx1b3TKYZzwbJS0U4YRrNVr341Tot5-OYktRIIX-aKngyWpAI713AuTToC0jnA3z7yf3VKreoJ3QoYD9mz2dujEHDQ_PEl1vvCvte-JaLwqfUnKWdaB67Eq0R6oGRFkl8yszJ0Ee0JeOXsEWc489W_xEFlwdnqpMlQUUrjVvbW3CSFuJdtICWpetKoKQx7uN9THW-CqXsLtontGIaJA7zvlN_HNpd2AzrBcO4CVKfn4Oj" />
</div>
</div>
</header>
{/*  Creation Form Content  */}
<div className="max-w-[1000px] mx-auto py-12 px-margin-desktop">
<div className="mb-10">
<div className="flex items-center gap-2 text-primary mb-2">
<UserPlus className="h-5 w-5" />
<span className="font-medium text-sm uppercase tracking-wider">Novo Hub Esportivo</span>
</div>
<h2 className="font-bold text-2xl text-2xl text-foreground">Criar Nova Comunidade</h2>
<p className="text-base text-base text-muted-foreground mt-2">Construa seu ecossistema esportivo, conecte profissionais e gerencie membros em um só lugar.</p>
</div>
<form className="space-y-gutter">
{/*  Section 1: Basic Info  */}
<section className="glass-card p-8 rounded-lg shadow-sm">
<div className="flex gap-4 mb-6">
<div className="bg-primary/10/20 p-2 rounded-lg h-fit">
<Info className="text-primary h-5 w-5" />
</div>
<div>
<h3 className="font-semibold text-xl text-xl text-foreground">Informações Básicas</h3>
<p className="text-muted-foreground">Identifique sua comunidade no diretório.</p>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="col-span-1">
<label className="block font-medium text-sm text-muted-foreground mb-2">Nome da Comunidade</label>
<input className="w-full bg-background border-border rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Ex: Beach Tennis Club SP" type="text" />
</div>
<div className="col-span-1">
<label className="block font-medium text-sm text-muted-foreground mb-2">Slug da URL</label>
<div className="flex items-center">
<span className="bg-muted px-3 py-3 border border-r-0 border-border rounded-l-lg text-muted-foreground font-medium text-sm">find4sport.com/</span>
<input className="w-full bg-background border-border rounded-r-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="meu-clube" type="text" />
</div>
</div>
<div className="col-span-2">
<label className="block font-medium text-sm text-muted-foreground mb-2">Descrição</label>
<textarea className="w-full bg-background border-border rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Conte o propósito da comunidade, modalidades e quem pode participar..." rows={4}></textarea>
</div>
</div>
</section>
{/*  Section 2: Classification  */}
<section className="glass-card p-8 rounded-lg shadow-sm">
<div className="flex gap-4 mb-6">
<div className="bg-primary/10/20 p-2 rounded-lg h-fit">
<Tag className="text-primary h-5 w-5" />
</div>
<div>
<h3 className="font-semibold text-xl text-xl text-foreground">Classificação & Eixo</h3>
<p className="text-muted-foreground">Defina o foco e o modelo de gestão.</p>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div>
<label className="block font-medium text-sm text-muted-foreground mb-3">Modalidade Primária</label>
<select className="w-full bg-background border-border rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary">
<option>Beach Tennis</option>
<option>Futebol</option>
<option>Yoga</option>
<option>Crossfit</option>
<option>Corrida</option>
<option>Outros</option>
</select>
</div>
<div>
<label className="block font-medium text-sm text-muted-foreground mb-3">Nicho de Gestão</label>
<div className="grid grid-cols-1 gap-2">
<label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-emerald-500/10 cursor-pointer transition-all">
<input className="text-primary focus:ring-primary h-4 w-4" name="niche" type="radio" />
<div>
<span className="font-medium text-sm block">Pro-led</span>
<span className="text-[10px] text-muted-foreground">Focado em aulas e mentorias de profissionais.</span>
</div>
</label>
<label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-emerald-500/10 cursor-pointer transition-all">
<input className="text-primary focus:ring-primary h-4 w-4" name="niche" type="radio" />
<div>
<span className="font-medium text-sm block">Space-led</span>
<span className="text-[10px] text-muted-foreground">Vinculado a um local físico ou arena.</span>
</div>
</label>
<label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-emerald-500/10 cursor-pointer transition-all">
<input className="text-primary focus:ring-primary h-4 w-4" name="niche" type="radio" />
<div>
<span className="font-medium text-sm block">Admin-led</span>
<span className="text-[10px] text-muted-foreground">Gestão corporativa ou institucional.</span>
</div>
</label>
</div>
</div>
</div>
</section>
{/*  Section 3: Location & Visibility  */}
<section className="glass-card p-8 rounded-lg shadow-sm">
<div className="flex gap-4 mb-6">
<div className="bg-primary/10/20 p-2 rounded-lg h-fit">
<MapPin className="text-primary h-5 w-5" />
</div>
<div>
<h3 className="font-semibold text-xl text-xl text-foreground">Localização & Visibilidade</h3>
<p className="text-muted-foreground">Como os membros encontrarão você.</p>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div>
<label className="block font-medium text-sm text-muted-foreground mb-2">Cidade / Região</label>
<div className="relative">
<MapPin className="absolute left-3 top-3.5 text-muted-foreground text-lg h-5 w-5" />
<input className="w-full bg-background border-border rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Ex: São Paulo, SP" type="text" />
</div>
<div className="mt-4 p-4 bg-background rounded-lg border border-dashed border-border flex items-center gap-3">
<div className="bg-primary/10 p-2 rounded-full">
<Map className="text-primary text-sm h-5 w-5" />
</div>
<span className="text-[12px] text-muted-foreground">A localização ajuda a destacar sua comunidade para atletas próximos.</span>
</div>
</div>
<div>
<label className="block font-medium text-sm text-muted-foreground mb-2">Privacidade</label>
<div className="space-y-3">
<div className="flex items-start gap-3">
<input className="mt-1 text-primary focus:ring-primary" id="pub" name="privacy" type="radio" />
<label htmlFor="pub">
<span className="font-medium text-sm block">Pública</span>
<p className="text-[11px] text-muted-foreground">Visível no diretório, qualquer um pode entrar.</p>
</label>
</div>
<div className="flex items-start gap-3">
<input className="mt-1 text-primary focus:ring-primary" id="app" name="privacy" type="radio" />
<label htmlFor="app">
<span className="font-medium text-sm block">Requer Aprovação</span>
<p className="text-[11px] text-muted-foreground">Membros pedem acesso e você aprova manualmente.</p>
</label>
</div>
<div className="flex items-start gap-3">
<input className="mt-1 text-primary focus:ring-primary" id="priv" name="privacy" type="radio" />
<label htmlFor="priv">
<span className="font-medium text-sm block">Privada</span>
<p className="text-[11px] text-muted-foreground">Apenas convidados via link direto podem ver.</p>
</label>
</div>
</div>
</div>
</div>
</section>
{/*  Section 4: Branding  */}
<section className="glass-card p-8 rounded-lg shadow-sm">
<div className="flex gap-4 mb-6">
<div className="bg-primary/10/20 p-2 rounded-lg h-fit">
<Palette className="text-primary h-5 w-5" />
</div>
<div>
<h3 className="font-semibold text-xl text-xl text-foreground">Branding</h3>
<p className="text-muted-foreground">Personalize a identidade visual do seu hub.</p>
</div>
</div>
<div className="space-y-8">
<div>
<label className="block font-medium text-sm text-muted-foreground mb-4">Imagem de Capa</label>
<div className="relative group cursor-pointer h-48 rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary transition-all">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75" data-alt="A professional aerial view of a modern sports complex at sunset, showing clean tennis courts and green fields. The lighting is warm and cinematic, emphasizing high-performance athleticism and high-end facilities. The aesthetic is clean and crisp, following a modern corporate sport style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAldQP7cY3MwWcLyuoViSZyuB3EFmuSXrBa1QN_v1bdyyXgKcoW9eBY8Xxl8I3ZIusTeaPSoJMVclC8XKe87gIpxtEE21DksEH5whmxJDpFIrhkudxVxDrJNX9Ar7sTHDu8MscE6aGy7FYt0Q6s5HcDp7iv244KeCZwdr7aDwoZERQNcay2T_nhe2-pzsAl3Kx8Yz9pMDpCFfOQbcNTSDgfeKiRa5rW3oviZvHfaFZ3bn1mQiDHS6rQxWAZazGobWTKy-fZEAGC" />
<div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/20 group-hover:bg-black/40 transition-all">
<Upload className="text-4xl mb-2 h-5 w-5" />
<span className="font-medium text-sm">Alterar Imagem de Capa</span>
<span className="text-[10px] opacity-75 mt-1">Recomendado: 1200x400px</span>
</div>
</div>
</div>
<div className="flex flex-col md:flex-row gap-8 items-center">
<div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-outline-variant group-hover:ring-primary transition-all">
<img className="w-full h-full object-cover" data-alt="A minimalist sports community icon showing stylized geometric shapes representing movement and synergy. The design uses a vibrant emerald green and white palette on a clean background. The visual style is modern, professional, and corporate, reflecting a premium sports brand identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYh8FnjT_tdPOD212xjG_wpZsio4DqMN2c3DJ5lFgQYKSWT3h_7zavA24KCufp00uMj8taFa9ieS68uwrLTqlGERkYurcPts8xwlhjheL6DNLXH1E_9schC6ubO36g_sD_XqweQ2l5o-oZhGqlcQk4Dy95VlNY4LY5GD4DsCLzG9jswA8Cj8oyxrrRtopXXpVXEY8oMkahzzwatCu4LmWns2oRagktw7P-L76781lYL1nZSFumDsWhrWsvtMPhqO4Zj-k5KQAM" />
<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all text-white">
<Camera className="h-5 w-5" />
</div>
</div>
<div className="flex-1">
<h4 className="font-semibold text-xl text-foreground mb-1">Ícone da Comunidade</h4>
<p className="text-muted-foreground text-sm mb-4">Este ícone aparecerá no diretório e no menu lateral dos seus membros.</p>
<div className="flex gap-3">
<button className="px-4 py-2 bg-background border border-border rounded-lg text-muted-foreground font-medium text-sm hover:bg-secondary transition-all" type="button">Upload Novo</button>
<button className="px-4 py-2 text-destructive font-medium text-sm hover:bg-destructive/10 rounded-lg transition-all" type="button">Remover</button>
</div>
</div>
</div>
</div>
</section>
{/*  Final Actions  */}
<div className="flex flex-col md:flex-row items-center justify-end gap-4 py-8 border-t border-border mt-12">
<button className="w-full md:w-auto px-8 py-3 text-muted-foreground font-medium text-sm hover:bg-secondary rounded-lg transition-all" type="button">Descartar Rascunho</button>
<button className="w-full md:w-auto px-12 py-4 bg-primary text-primary-foreground font-semibold text-xl rounded-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3" type="submit">
                        Criar Comunidade
                        <ArrowRight className="h-5 w-5" />
</button>
</div>
</form>
</div>
</main>
{/*  Micro-interaction: Form Progress Logic  */}

  
        </>
)
}
