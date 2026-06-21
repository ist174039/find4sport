'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  TopNavBar (Backoffice Context - No search, Admin focused)  */}
<aside className="h-screen w-64 fixed left-0 top-0 bg-surface dark:bg-inverse-surface border-r border-outline-variant dark:border-outline flex flex-col h-full py-8 px-4 z-50">
<div className="mb-10 px-2">
<h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim tracking-tight">FIND4SPORT</h1>
<p className="font-label-md text-label-md text-on-surface-variant opacity-70">Painel do Administrador</p>
</div>

<div className="pt-6 border-t border-outline-variant space-y-1">
<div className="flex items-center gap-3 px-4 py-2 mb-2">
<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[12px]">AD</div>
<div className="flex flex-col">
<span className="text-label-md font-bold">Admin #0042</span>
<span className="text-[10px] text-on-surface-variant">Online</span>
</div>
</div>
<a className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out text-on-surface-variant hover:bg-secondary-container" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-label-md text-label-md">Configurações</span>
</a>
<a className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out text-on-surface-variant hover:bg-error-container/20 hover:text-error" href="#">
<span className="material-symbols-outlined">logout</span>
<span className="font-label-md text-label-md">Sair</span>
</a>
</div>
</aside>
{/*  Main Content Grid  */}
<main className="pl-64 pt-8 pb-8 px-4 md:px-margin-desktop max-w-[1440px] mx-auto h-screen overflow-hidden flex gap-6">
{/*  Left Column: Pending Claims List (Fila de Pedidos)  */}
<aside className="w-1/4 flex flex-col gap-4 overflow-hidden">
<div className="flex justify-between items-center">
<h2 className="font-headline-md text-headline-md text-text-primary">Pendentes (24)</h2>
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer" data-icon="filter_list">filter_list</span>
</div>
<div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 scroll-hide">
{/*  Priority Claim Card  */}
<div className="p-4 bg-surface-container-lowest border border-primary rounded-xl cursor-pointer hover:shadow-lg transition-shadow border-l-4">
<div className="flex justify-between items-start mb-2">
<span className="bg-error-container text-on-error-container text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Alta Prioridade</span>
<span className="text-label-md text-on-surface-variant">Há 12m</span>
</div>
<h3 className="font-bold text-text-primary truncate">Ricardo Silva</h3>
<p className="text-label-md text-on-surface-variant mb-3">Reclamação: Pagamento Duplicado</p>
<div className="flex items-center gap-2">
<span className="bg-surface-container-high px-2 py-1 rounded-full text-[10px] text-on-secondary-container">#TRX-9942</span>
<span className="material-symbols-outlined text-[14px] text-trust-gold" data-icon="warning" style={{   fontVariationSettings: '\'FILL\' 1' }}>warning</span>
</div>
</div>
{/*  Conflict Claim Card  */}
<div className="p-4 bg-surface-container-lowest border border-border-subtle rounded-xl cursor-pointer hover:shadow-lg transition-shadow">
<div className="flex justify-between items-start mb-2">
<span className="bg-trust-gold/10 text-trust-gold text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Conflito de Dados</span>
<span className="text-label-md text-on-surface-variant">Há 45m</span>
</div>
<h3 className="font-bold text-text-primary truncate">Joana Fernandes</h3>
<p className="text-label-md text-on-surface-variant mb-3">Prova de Titularidade Profissional</p>
<div className="flex items-center gap-2">
<span className="bg-surface-container-high px-2 py-1 rounded-full text-[10px] text-on-secondary-container">#USER-102</span>
</div>
</div>
{/*  Standard Claim Cards (Looped look)  */}
<div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl cursor-pointer opacity-80 hover:opacity-100 transition-all">
<div className="flex justify-between items-start mb-2">
<span className="bg-outline-variant/30 text-on-surface-variant text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Standard</span>
<span className="text-label-md text-on-surface-variant">Há 1h</span>
</div>
<h3 className="font-bold text-text-primary truncate">Nuno Gonçalves</h3>
<p className="text-label-md text-on-surface-variant mb-3">Alteração de IBAN</p>
</div>
<div className="p-4 bg-surface-container-low border border-border-subtle rounded-xl cursor-pointer opacity-80">
<h3 className="font-bold text-text-primary truncate">Cláudia Antunes</h3>
<p className="text-label-md text-on-surface-variant">Reserva Cancelada #882</p>
</div>
</div>
</aside>
{/*  Center Column: Claim Details & Audit (Painel Central)  */}
<section className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 scroll-hide">
<div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle">
<div className="flex justify-between items-start mb-6">
<div>
<div className="flex items-center gap-3 mb-1">
<h1 className="font-headline-lg text-headline-lg text-text-primary">Claim #CLM-004281</h1>
<span className="bg-success-mint text-primary text-[12px] px-3 py-1 rounded-full font-bold">EM ANÁLISE</span>
</div>
<p className="text-on-surface-variant">Submetido por <span className="text-primary font-bold">Ricardo Silva (User ID: 8821)</span> em 24 Out 2024, 14:32</p>
</div>
<div className="text-right">
<div className="text-label-md text-on-surface-variant uppercase font-bold tracking-widest">Auditoria</div>
<p className="text-body-md text-on-surface-variant">Last mod: admin_0042</p>
<p className="text-body-md text-on-surface-variant">24/10/24 14:44:12</p>
</div>
</div>
<div className="grid grid-cols-2 gap-8">
{/*  Detail Section  */}
<div className="space-y-6">
<div>
<h4 className="font-bold text-on-surface-variant uppercase text-[12px] tracking-widest mb-2">Descrição do Pedido</h4>
<p className="text-body-lg text-on-surface leading-relaxed">
                                "Solicito o reembolso do valor pago pela aula de Padel no dia 22/10. O sistema cobrou duas vezes o valor de 25.00€ devido a um erro de rede durante a confirmação do pagamento 3D Secure."
                            </p>
</div>
<div>
<h4 className="font-bold text-on-surface-variant uppercase text-[12px] tracking-widest mb-2">Histórico Relacionado</h4>
<div className="bg-background p-3 rounded-lg space-y-2">
<div className="flex justify-between text-body-md">
<span className="text-on-surface">Transação ID #TX-9942A</span>
<span className="font-bold">25.00€</span>
</div>
<div className="flex justify-between text-body-md">
<span className="text-on-surface">Transação ID #TX-9942B</span>
<span className="font-bold text-error">25.00€ (Duplicado?)</span>
</div>
</div>
</div>
</div>
{/*  Documents Section  */}
<div className="space-y-4">
<h4 className="font-bold text-on-surface-variant uppercase text-[12px] tracking-widest">Documentos Anexados (2)</h4>
<div className="grid grid-cols-2 gap-4">
<div className="group relative aspect-square bg-surface-container rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-all">
<img className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" data-alt="A detailed, close-up photograph of a professional digital bank receipt displayed on a high-resolution smartphone screen. The image features clean, sharp typography and a minimalist interface with professional green and grey tones. The lighting is bright and modern, creating a professional backoffice atmosphere for a financial validation interface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzuGVEyfUGrtKPOHforEVA-IBVh8i29--6j5p8WEaa2oxzvZfm0KE7B2xkQnqv_2HkBgFcoHraXXDjdEOwFJJxe7SS6AELMAQDbtCXS5VxUxTiCP3BPRrCyGbzeTIm8gh03dYXjZY-84pL3kCJHJxGdO4IMd4nLXbjrBQilWiamaowfvM9VQrygN7Swy6Mt050SUDq-TSW07x6WNJylv1oKHQ9ZgVCcZACBDLiVC9z-_BZoykdpr7WPuVO8eec04YQ27MO7alL" />
<div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center">
<span className="material-symbols-outlined text-white" data-icon="zoom_in">zoom_in</span>
</div>
</div>
<div className="group relative aspect-square bg-surface-container rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-all">
<img className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" data-alt="A clean, top-down view of a professional legal identification document or official certification laid on a minimalist white office desk. The lighting is soft and even, highlighting the document's structured layout and official seals. The aesthetic is clean and corporate, utilizing a high-contrast palette of white and dark grey to symbolize trust and authority." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtcCaRKE-e9l0i5srZ8BMVxcVB2gXAR0T5EjFtUtAYKyXZoL6itZgoJtTMuDezECBnTuAZrf6KNpdLA_nK9iX0r6PYzSbS06X3HNBq0fb7wygTMbh7mGXb4M4jRcEZUu2bBy8C8y5OEVEzX4ighYIMuXHeeghtD7AnJcCi-6M2e7H8QCa5RxCG93At0fZmqzDH0vtJxiVEwAVmJZdYBlCVwr_imaELTpbKbv5gcFrxXDbcYdN8FSywRiQ9mpCLD5M7UtWCXD3z" />
<div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center">
<span className="material-symbols-outlined text-white" data-icon="zoom_in">zoom_in</span>
</div>
</div>
</div>
<p className="text-label-md text-on-surface-variant text-center">Clique para expandir documentos</p>
</div>
</div>
</div>
{/*  Decision Area  */}
<div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-sm">
<h3 className="font-headline-md text-headline-md text-text-primary mb-4">Decisão do Administrador</h3>
<div className="space-y-4">
<div>
<label className="block font-bold text-on-surface-variant uppercase text-[11px] mb-2 tracking-widest" htmlFor="reason">Motivo da Decisão (Obrigatório)</label>
<textarea className="w-full bg-background border border-border-subtle rounded-lg p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none" id="reason" placeholder="Indique os motivos detalhados para a aprovação ou rejeição deste claim..." rows="4"></textarea>
</div>
<div className="flex items-center gap-4 justify-end pt-2">
<button className="px-8 py-3 rounded-lg border-2 border-error text-error font-bold hover:bg-error/5 transition-colors flex items-center gap-2">
<span className="material-symbols-outlined" data-icon="close">close</span>
                            Rejeitar Claim
                        </button>
<button className="px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-container transition-all shadow-md active:scale-95 flex items-center gap-2">
<span className="material-symbols-outlined" data-icon="check" style={{   fontVariationSettings: '\'wght\' 700' }}>check</span>
                            Aprovar Claim
                        </button>
</div>
</div>
</div>
</section>
{/*  Right Column: Context & Metadata  */}
<aside className="w-1/5 flex flex-col gap-6">
{/*  Professional Badge Stats  */}
<div className="bg-surface-container-highest p-4 rounded-xl">
<h4 className="font-bold text-[12px] uppercase tracking-widest text-on-surface-variant mb-4">Métricas Globais</h4>
<div className="space-y-4">
<div className="flex flex-col">
<span className="text-display-lg text-primary font-display-lg">94%</span>
<span className="text-label-md text-on-surface-variant">SLA de Resposta</span>
</div>
<div className="h-1 bg-outline-variant w-full rounded-full overflow-hidden">
<div className="h-full bg-primary w-[94%]"></div>
</div>
<div className="grid grid-cols-2 gap-2 pt-2">
<div className="bg-surface-container-low p-2 rounded">
<span className="block text-headline-md text-text-primary">12</span>
<span className="text-[10px] text-on-surface-variant uppercase">Hoje</span>
</div>
<div className="bg-surface-container-low p-2 rounded">
<span className="block text-headline-md text-text-primary">154</span>
<span className="text-[10px] text-on-surface-variant uppercase">Mês</span>
</div>
</div>
</div>
</div>
{/*  Notes or Internal Chat  */}
<div className="flex-1 bg-surface-container-lowest border border-border-subtle rounded-xl flex flex-col p-4">
<h4 className="font-bold text-[12px] uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]" data-icon="chat_bubble">chat_bubble</span>
                    Notas Internas
                </h4>
<div className="flex-1 text-body-md text-on-surface-variant space-y-4 overflow-y-auto pr-1 scroll-hide">
<div className="bg-background p-2 rounded text-[13px]">
<span className="font-bold text-primary block">admin_0012:</span>
                        "User já teve problema similar em Setembro. Verificar se há padrão de falha no gateway."
                        <span className="text-[10px] text-outline block mt-1">14:10</span>
</div>
</div>
<div className="pt-4">
<input className="w-full bg-background border border-border-subtle rounded-md px-3 py-2 text-body-md focus:ring-1 focus:ring-primary outline-none" placeholder="Adicionar nota..." type="text" />
</div>
</div>
</aside>
</main>
{/*  Floating Action for Quick Access (Suppressed as per rules for backoffice detail screens, but shown here as it is the 'main flow' for the admin task)  */}
      </main>
      <Footer />
    </div>
  )
}
