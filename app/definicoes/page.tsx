'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  SideNavBar  */}
<aside className="h-screen w-64 fixed left-0 top-0 bg-surface border-r border-outline-variant flex flex-col h-full py-8 px-4 z-50">
<div className="mb-10">
<h1 className="font-headline-md text-headline-md font-bold text-primary">FIND4SPORT</h1>
<p className="font-label-md text-label-md text-on-surface-variant opacity-70">Painel do Profissional</p>
</div>

<div className="mt-auto pt-6 border-t border-outline-variant space-y-1">
<a className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold border-r-4 border-primary bg-secondary-container/30" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="font-label-md text-label-md">Configurações</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container transition-colors duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span className="font-label-md text-label-md">Sair</span>
</a>
</div>
</aside>
{/*  Main Canvas  */}
<main className="pl-64 min-h-screen">
{/*  TopAppBar  */}
<header className="flex justify-between items-center w-full px-12 h-16 sticky top-0 bg-surface-container-lowest border-b border-outline-variant z-40">
<div className="flex items-center gap-8">

</div>
<div className="flex items-center gap-4">
<button className="p-2 text-on-surface-variant hover:text-primary transition-all">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button className="p-2 text-on-surface-variant hover:text-primary transition-all">
<span className="material-symbols-outlined" data-icon="help">help</span>
</button>
<div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
<button className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-primary text-primary font-label-md text-label-md hover:bg-primary-container/10 transition-all">
                    Ver Perfil Público
                </button>
<img alt="Avatar do Profissional" className="w-10 h-10 rounded-full object-cover border-2 border-primary-fixed" data-alt="Close-up professional portrait of a fitness trainer or sports coach with a confident smile. The background is a blurred high-end athletic facility with emerald green accents. The lighting is soft and professional, capturing a modern corporate athletic aesthetic with clean lines and sharp focus." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYtg7fNl5sg4PCj2Yvjdt1EqR4XuH5sCQWwLfUqm0LEmYQDGZDOCOoicwPvEtrOKd4R30zq8xuruIfth20WsLCID9qALiZV9JDVEGHojpABdfXtszIqqdCe35aF7gZeITqz6qKNEJ_RwUliiVxqv_Z_zcs7sleOIEowF4iTS3SMcsRZ-IRTeqHr-UFQrn7wWxe-vsuvwZ8O4vDCOfx6QfsSV85m4JgVFf62u1ks8a1PwcZnPZFEzMeHcGmld8z4DozfK87cwdN" />
</div>
</header>
{/*  Content Area  */}
<div className="max-w-[1280px] mx-auto p-12">
<header className="mb-10">
<h2 className="font-headline-lg text-headline-lg text-text-primary mb-2">Configurações da Conta</h2>
<p className="font-body-lg text-body-lg text-text-secondary">Gerencie suas informações pessoais, segurança e preferências do sistema.</p>
</header>
<div className="grid grid-cols-12 gap-8">
{/*  Account & Notification (Left Column)  */}
<div className="col-span-12 lg:col-span-7 space-y-8">
{/*  Account Settings  */}
<section className="bg-surface-container-lowest p-8 rounded-xl border border-border-subtle shadow-sm">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-primary" data-icon="manage_accounts">manage_accounts</span>
<h3 className="font-headline-md text-headline-md text-text-primary">Configurações Gerais</h3>
</div>
<div className="space-y-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant">E-mail Principal</label>
<input className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" type="email" value="contato@silva.fit" />
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant">Idioma do Sistema</label>
<select className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-3 text-body-md focus:ring-2 focus:ring-primary outline-none appearance-none">
<option>Português (Brasil)</option>
<option>English (US)</option>
<option>Español</option>
</select>
</div>
</div>
<div className="pt-4 border-t border-border-subtle">
<button className="flex items-center gap-2 text-primary font-label-md text-label-md hover:underline">
<span className="material-symbols-outlined text-[18px]" data-icon="lock_reset">lock_reset</span>
                                    Alterar Senha de Acesso
                                </button>
</div>
</div>
</section>
{/*  Notification Preferences  */}
<section className="bg-surface-container-lowest p-8 rounded-xl border border-border-subtle shadow-sm">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-primary" data-icon="notifications_active">notifications_active</span>
<h3 className="font-headline-md text-headline-md text-text-primary">Preferências de Notificação</h3>
</div>
<div className="space-y-6">
{/*  Toggle Item  */}
<div className="flex justify-between items-center py-2">
<div>
<p className="font-label-md text-label-md text-text-primary">Novas Mensagens e Contatos</p>
<p className="text-[12px] text-text-secondary">Receba alertas quando atletas entrarem em contato.</p>
</div>
<div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
<input checked="" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-surface-container-high appearance-none cursor-pointer z-10" id="toggle-contacts" name="toggle" type="checkbox" />
<label className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-container-high cursor-pointer" htmlFor="toggle-contacts"></label>
</div>
</div>
{/*  Toggle Item  */}
<div className="flex justify-between items-center py-2 border-t border-border-subtle">
<div>
<p className="font-label-md text-label-md text-text-primary">Avaliações e Reviews</p>
<p className="text-[12px] text-text-secondary">Seja notificado sobre novos feedbacks recebidos.</p>
</div>
<div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
<input checked="" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-surface-container-high appearance-none cursor-pointer z-10" id="toggle-reviews" name="toggle" type="checkbox" />
<label className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-container-high cursor-pointer" htmlFor="toggle-reviews"></label>
</div>
</div>
{/*  Toggle Item  */}
<div className="flex justify-between items-center py-2 border-t border-border-subtle">
<div>
<p className="font-label-md text-label-md text-text-primary">Alertas do Sistema</p>
<p className="text-[12px] text-text-secondary">Novidades da plataforma e atualizações técnicas.</p>
</div>
<div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
<input className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-surface-container-high appearance-none cursor-pointer z-10" id="toggle-system" name="toggle" type="checkbox" />
<label className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-container-high cursor-pointer" htmlFor="toggle-system"></label>
</div>
</div>
</div>
</section>
</div>
{/*  Security & Danger Zone (Right Column)  */}
<div className="col-span-12 lg:col-span-5 space-y-8">
{/*  Security Section  */}
<section className="bg-surface-container-lowest p-8 rounded-xl border border-border-subtle shadow-sm">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-primary" data-icon="security">security</span>
<h3 className="font-headline-md text-headline-md text-text-primary">Segurança</h3>
</div>
<div className="mb-8">
<div className="flex items-center justify-between mb-4">
<span className="font-label-md text-label-md text-on-surface-variant">Autenticação 2FA (FR-45)</span>
<span className="bg-success-mint text-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">ATIVADO</span>
</div>
<p className="text-body-md text-text-secondary mb-4">Sua conta está protegida por verificação em duas etapas via aplicativo autenticador.</p>
<button className="w-full py-2.5 rounded-lg border border-border-subtle font-label-md text-label-md text-text-primary hover:bg-surface-container-low transition-all">Configurar Dispositivo</button>
</div>
<div className="space-y-4 pt-6 border-t border-border-subtle">
<h4 className="font-label-md text-label-md text-text-primary">Sessões Ativas</h4>
<div className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg">
<span className="material-symbols-outlined text-on-surface-variant mt-1" data-icon="laptop_mac">laptop_mac</span>
<div>
<p className="font-label-md text-label-md text-text-primary">Chrome no MacOS (Esta sessão)</p>
<p className="text-[11px] text-text-secondary">IP: 187.64.202.11 • São Paulo, BR</p>
</div>
</div>
<div className="flex items-start gap-3 p-3 opacity-60">
<span className="material-symbols-outlined text-on-surface-variant mt-1" data-icon="smartphone">smartphone</span>
<div>
<p className="font-label-md text-label-md text-text-primary">iPhone 14 Pro</p>
<p className="text-[11px] text-text-secondary">IP: 177.10.45.203 • Rio de Janeiro, BR</p>
</div>
</div>
<button className="text-primary font-label-md text-label-md hover:underline w-full text-center mt-2">Encerrar todas as outras sessões</button>
</div>
</section>
{/*  Danger Zone  */}
<section className="bg-error-container/10 p-8 rounded-xl border border-error/20">
<div className="flex items-center gap-3 mb-4 text-error">
<span className="material-symbols-outlined" data-icon="warning">warning</span>
<h3 className="font-headline-md text-headline-md font-bold">Zona de Perigo</h3>
</div>
<p className="text-body-md text-text-secondary mb-6">Ao deletar sua conta, todos os seus dados, eventos e contatos serão removidos permanentemente. Esta ação não pode ser desfeita.</p>
<button className="w-full py-3 rounded-lg bg-error text-on-error font-label-md text-label-md hover:opacity-90 transition-all shadow-sm">Excluir Minha Conta FIND4SPORT</button>
</section>
</div>
</div>
{/*  Floating Save Bar (Task-focused context suppression logic handled by simple UI pattern)  */}
<div className="mt-12 flex justify-end gap-4 items-center p-6 bg-surface-container-highest/30 rounded-xl border border-outline-variant">
<span className="text-body-md text-text-secondary">Alterações não salvas</span>
<button className="px-8 py-3 rounded-lg bg-primary text-on-primary font-headline-md text-headline-md hover:shadow-lg transition-all">Salvar Configurações</button>
</div>
</div>
</main>
      </main>
      <Footer />
    </div>
  )
}
