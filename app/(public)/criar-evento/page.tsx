'use client';
import { Bell, CheckCircle, Clock, FileText, HelpCircle, Image, Info, LogOut, MapPin, Navigation, PlusCircle, Search, Settings, Trash2, Upload, X } from 'lucide-react'

export default function Page() {
  return (
        <>

        {/*  SideNavBar  */}
<aside className="h-screen w-64 fixed left-0 top-0 bg-background dark:bg-foreground border-r border-border dark:border-border flex flex-col h-full py-8 px-4 z-50">
<div className="mb-10 px-2">
<h1 className="font-semibold text-xl text-xl font-bold text-primary dark:text-primary-fixed-dim tracking-tight">FIND4SPORT</h1>
<p className="font-medium text-sm text-sm text-muted-foreground opacity-70">Painel do Profissional</p>
</div>

<button className="mt-4 mb-8 w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium text-sm text-sm hover:bg-primary/10 transition-all flex items-center justify-center gap-2 shadow-sm">
<PlusCircle className="text-[18px]" />
            Criar Novo Evento
        </button>
<div className="pt-6 border-t border-border space-y-1">
<a className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out text-muted-foreground hover:bg-secondary" href="#">
<Settings className="h-5 w-5" />
<span className="font-medium text-sm text-sm">Configurações</span>
</a>
<a className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out text-muted-foreground hover:bg-destructive/10/20 hover:text-destructive" href="#">
<LogOut className="h-5 w-5" />
<span className="font-medium text-sm text-sm">Sair</span>
</a>
</div>
</aside>
{/*  Main Content Area  */}
<main className="ml-64 flex flex-col min-h-screen">
{/*  TopAppBar  */}
<header className="sticky top-0 z-40 bg-card border-b border-border h-16 flex justify-between items-center px-12 transition-all duration-200">
<div className="flex items-center gap-8">

</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4 border-r border-border pr-6">
<button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
<Bell className="h-5 w-5" />
<span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
</button>
<button className="p-2 text-muted-foreground hover:text-primary transition-colors">
<HelpCircle className="h-5 w-5" />
</button>
</div>
<div className="flex items-center gap-3">
<button className="font-medium text-sm text-sm text-primary font-bold hover:underline">Ver Perfil Público</button>
<div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed ring-2 ring-surface">
<img alt="Avatar do Profissional" className="w-full h-full object-cover" data-alt="A professional close-up portrait of a fitness specialist in high-performance athletic wear. The lighting is bright and clean, emphasizing a professional corporate sports aesthetic with soft emerald green backlighting. The subject is smiling confidently against a minimalist, high-key studio background that reflects clarity and energy." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlC9LdaJcj-4CJv6n9bUc2XkccKBuZAcqHx-qw5u-CA347htb6LlBNtuWbG_Qswmp8OnqOzY0Kxs24Ws0JG5LzR2_BclR7Xpaxy0YTCT3aw3H2wn7V6e1fLiKfgS-H9fxO2ZpQQS1G-MdpHBgfUX04IPv-tlJg-9_o0O9FX4G-rvRoG4KBm-OF24LfCGfGPR9F1iNB3YqjG6PGTI1SeuFBcqsLpt5y_ySSWD4XTnaGj5pipzYRd-SsFf18NV2uxRd74QowuRJd" />
</div>
</div>
</div>
</header>
{/*  Form Canvas  */}
<section className="p-12 max-w-[1400px] mx-auto space-y-gutter">
<div className="mb-8">
<h2 className="font-bold text-2xl text-2xl text-primary mb-2">Criar Novo Evento Desportivo</h2>
<p className="text-muted-foreground text-base text-base">Preencha os detalhes abaixo para submeter o seu evento para aprovação.</p>
</div>
{/*  Warning Banner  */}
<div className="bg-tertiary-container/10 border-l-4 border-tertiary p-6 rounded-r-xl mb-10 flex items-start gap-4">
<Info className="text-tertiary h-5 w-5" />
<div>
<h4 className="font-semibold text-xl text-xl text-tertiary leading-none mb-1">Informação Importante</h4>
<p className="text-sm text-sm text-on-tertiary-fixed-variant">Para garantir a qualidade e segurança da nossa comunidade, todos os novos eventos passam por uma revisão manual da nossa equipa de administração. A aprovação ocorre normalmente num prazo de 24 a 48 horas úteis.</p>
</div>
</div>
<form className="space-y-10" id="eventForm">
{/*  Section 1: Basic Info  */}
<div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
<div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
<FileText className="text-primary h-5 w-5" />
<h3 className="font-semibold text-xl text-xl">Informações Gerais</h3>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="md:col-span-2">
<label className="block font-medium text-sm text-sm text-muted-foreground mb-2" htmlFor="eventTitle">Título do Evento</label>
<input className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground" id="eventTitle" placeholder="Ex: Maratona da Primavera 2024" type="text" />
</div>
<div>
<label className="block font-medium text-sm text-sm text-muted-foreground mb-2" htmlFor="eventCategory">Categoria</label>
<select className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer" id="eventCategory" defaultValue="">
<option disabled value="">Selecionar Categoria</option>
<option value="corrida">Corrida</option>
<option value="yoga">Yoga</option>
<option value="padel">Padel</option>
<option value="crossfit">Crossfit</option>
<option value="natacao">Natação</option>
</select>
</div>
<div>
<label className="block font-medium text-sm text-sm text-muted-foreground mb-2" htmlFor="eventCapacity">Capacidade Máxima</label>
<input className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" id="eventCapacity" placeholder="Número de participantes" type="number" />
</div>
<div className="md:col-span-2">
<label className="block font-medium text-sm text-sm text-muted-foreground mb-2" htmlFor="eventDescription">Descrição Detalhada</label>
<textarea className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all custom-scrollbar" id="eventDescription" placeholder="Descreva os objetivos, percurso, requisitos e o que está incluído..." rows={5}></textarea>
</div>
</div>
</div>
{/*  Section 2: Image Upload  */}
<div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
<div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
<Image className="text-primary h-5 w-5" />
<h3 className="font-semibold text-xl text-xl">Imagem de Capa</h3>
</div>
<div className="relative border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center bg-background hover:bg-emerald-500/10 transition-colors group cursor-pointer overflow-hidden">
<input accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" id="coverUpload" type="file" />
<div className="text-center group-hover:scale-105 transition-transform" id="uploadPlaceholder">
<Upload className="text-4xl text-muted-foreground group-hover:text-primary mb-3 h-5 w-5" />
<p className="font-medium text-sm text-sm text-muted-foreground">Arraste uma imagem ou clique para carregar</p>
<p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">PNG, JPG até 5MB (Recomendado 1920x1080)</p>
</div>
<img alt="Preview" className="hidden absolute inset-0 w-full h-full object-cover" data-alt="A clean, professional preview of an uploaded sports event image. The photo depicts runners on a scenic trail during sunrise, with soft golden light and long shadows. The image is crisp, high-definition, and evokes a sense of movement and athletic vitality, perfectly matching the emerald velocity brand aesthetic." id="imagePreview" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0gbbccnF1UBvaRlEQRjikLwrucQfAJz5FG5xpgeTg-2czv5doTGO2nbtF_GnSLCFQ0DOU8-9dVrCPKKRQ7EBdkE-wfI0aQfmDxN4u1ac_qr02qSYltQ9950L_dPyEihkiYkMptuhkB_nHcCsXGlpmcwJzN4S2gX16DyOkfnYt-b6ihKtCFaiZmZ6xTa8P6l-JDfMzxDQ4tx-1Y7-mYkG1V8ghVXVIxHHek_8AQPTroG0E4GlDi4AIQ1YmtJKkdBKAMGP2_I51" />
<button className="hidden absolute top-4 right-4 bg-white/80 hover:bg-destructive hover:text-white p-2 rounded-full shadow-lg transition-all" id="removeImage" type="button">
<Trash2 className="h-5 w-5" />
</button>
</div>
</div>
{/*  Section 3: Time & Location  */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
<div className="bg-card p-8 rounded-2xl border border-border shadow-sm flex flex-col">
<div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
<Clock className="text-primary h-5 w-5" />
<h3 className="font-semibold text-xl text-xl">Data e Hora</h3>
</div>
<div className="space-y-6">
<div>
<label className="block font-medium text-sm text-sm text-muted-foreground mb-2" htmlFor="eventDate">Data do Evento</label>
<input className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none" id="eventDate" type="date" />
</div>
<div className="grid grid-cols-2 gap-4">
<div>
<label className="block font-medium text-sm text-sm text-muted-foreground mb-2" htmlFor="startTime">Hora de Início</label>
<input className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none" id="startTime" type="time" />
</div>
<div>
<label className="block font-medium text-sm text-sm text-muted-foreground mb-2" htmlFor="endTime">Hora de Fim (Opcional)</label>
<input className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none" id="endTime" type="time" />
</div>
</div>
<div className="pt-4 mt-auto">
<label className="block font-medium text-sm text-sm text-muted-foreground mb-2" htmlFor="eventPrice">Preço de Inscrição (€)</label>
<div className="relative">
<span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">€</span>
<input className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none" id="eventPrice" placeholder="0.00" step="0.01" type="number" />
</div>
<p className="text-[10px] text-muted-foreground mt-2 italic">Deixe em branco ou zero para eventos gratuitos.</p>
</div>
</div>
</div>
<div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
<div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
<MapPin className="text-primary h-5 w-5" />
<h3 className="font-semibold text-xl text-xl">Localização</h3>
</div>
<div className="space-y-4">
<div>
<label className="block font-medium text-sm text-sm text-muted-foreground mb-2" htmlFor="eventLocation">Local do Evento</label>
<div className="relative">
<input className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none" id="eventLocation" placeholder="Rua, Parque, Estádio ou Cidade" type="text" />
<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
</div>
</div>
{/*  Map Suggestion UI  */}
<div className="w-full h-48 rounded-xl overflow-hidden border border-border relative group">
<img alt="Mapa de localização" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500" data-alt="A stylized digital map background with emerald green markers indicating a sports event location in Lisbon. The map features a modern, high-contrast dark and light mode aesthetic with clean lines and geometric structures. The lighting is soft and ambient, creating a professional and high-tech corporate visualization." data-location="Lisboa" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvRG13QQ8kUHrgz4a-TO639X3RDFuZCz8VYkx6sRk5TN-aV4E_0dFCXdaQBQbiWRZ9_8AUusXFFmW5QhGEPzMtfl34eVRgsMPO2tDV6KdYj_iCPrvhMotdrrjWypXSd8JAFxymyEKsJ6-bDm1fjwIkH57IjHdF3mCgZjvzTPpf-56ObGkJ_gErB4L425KXzVPFOi7yOiXvs0d-3QtvH_c8petOSS2vx-4FR6TOaDs26OdAZ8Mj_gd-trfCnAfDNiWi3O-ezf7t" />
<div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none group-hover:bg-transparent transition-all">
<div className="bg-white/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
<Navigation className="text-primary h-5 w-5" />
<span className="text-xs font-semibold text-foreground">Confirmar Localização</span>
</div>
</div>
</div>
</div>
</div>
</div>
<div className="flex flex-col md:flex-row items-center justify-between gap-6 py-10 border-t border-border">
<button className="text-muted-foreground hover:text-destructive transition-colors font-medium text-sm text-sm flex items-center gap-2" type="button">
<X className="h-5 w-5" />
                        Cancelar e Descartar
                    </button>
<div className="flex gap-4 w-full md:w-auto">
<button className="flex-1 md:flex-none border border-primary text-primary px-8 py-3 rounded-xl font-medium text-sm text-sm hover:bg-emerald-500/10 transition-colors" type="button">
                            Guardar Rascunho
                        </button>
<button className="flex-1 md:flex-none bg-primary text-primary-foreground px-10 py-3 rounded-xl font-semibold text-xl text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md hover:shadow-lg" type="submit">
                            Submeter para Revisão
                        </button>
</div>
</div>
</form>
</section>
</main>
{/*  Floating Toast for UI Feedback (Hidden by default)  */}
<div className="fixed bottom-8 right-8 bg-foreground text-inverse-on-surface px-6 py-4 rounded-xl shadow-2xl translate-y-24 opacity-0 transition-all duration-300 flex items-center gap-3 z-[60]" id="toast">
<CheckCircle className="text-primary-fixed h-5 w-5" />
<span className="text-sm text-sm" id="toastMessage">Evento submetido com sucesso!</span>
</div>

  
        </>
)
}
