'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/*  Top Navigation Header (Suppressed active links for focus on Policy)  */}
<header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
<div className="flex items-center gap-8">
<span className="text-headline-md font-headline-md font-bold text-primary">FIND4SPORT</span>

</div>
<div className="flex items-center gap-4">
<button className="hidden lg:block bg-primary text-on-primary px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-all">Sou Profissional</button>
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">search</span>
<span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">favorite</span>
<span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">notifications</span>
<span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">person</span>
</div>
</div>
</header>
<main className="pt-32 pb-section-gap px-margin-desktop max-w-[1280px] mx-auto min-h-screen">
<div className="flex flex-col lg:flex-row gap-gutter">
{/*  Lateral Navigation (Sticky Menu)  */}
<aside className="w-full lg:w-64 flex-shrink-0">
<div className="sticky top-24 space-y-2">
<h2 className="font-headline-md text-headline-md mb-6 text-primary">Navegação</h2>

<div className="mt-8 p-6 bg-surface-container-low rounded-xl border border-border-subtle">
<span className="material-symbols-outlined text-primary mb-2">support_agent</span>
<p className="font-label-md text-label-md text-on-surface-variant leading-tight">Dúvidas sobre os seus dados?</p>
<a className="text-primary font-semibold text-body-md block mt-2 hover:underline" href="#">Contactar DPO</a>
</div>
</div>
</aside>
{/*  Document Content Canvas  */}
<div className="flex-1 max-w-4xl">
<header className="mb-12">
<span className="font-label-md text-label-md text-primary tracking-widest uppercase mb-2 block">Atualizado em 24 de Maio, 2024</span>
<h1 className="font-display-lg text-display-lg text-text-primary leading-tight">Política de Privacidade — FIND4SPORT</h1>
<p className="mt-6 font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                        Na FIND4SPORT, a sua privacidade é a nossa prioridade. Este documento detalha como gerimos a sua informação com a transparência e segurança que o desporto profissional exige.
                    </p>
</header>
{/*  Section: Introdução  */}
<section className="mb-section-gap scroll-mt-24" id="introducao">
<div className="flex items-center gap-3 mb-6">
<div className="w-10 h-10 rounded-full bg-success-mint flex items-center justify-center">
<span className="material-symbols-outlined text-primary">waving_hand</span>
</div>
<h2 className="font-headline-lg text-headline-lg">1. Introdução</h2>
</div>
<div className="prose prose-slate max-w-none text-on-surface-variant font-body-md leading-relaxed space-y-4">
<p>Bem-vindo à FIND4SPORT. Operamos uma plataforma de marketplace que liga atletas a profissionais do desporto. Ao utilizar os nossos serviços, confia-nos a sua informação.</p>
<p>Este compromisso de "Emerald Velocity" reflete o nosso dinamismo: protegemos os seus dados com agilidade e rigor, garantindo que o seu foco permaneça apenas na performance desportiva.</p>
</div>
</section>
{/*  Highlight Cards Section  */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-section-gap">
{/*  Data Point Card 1  */}
<div className="p-8 bg-surface-container-lowest border border-border-subtle rounded-xl hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all">
<div className="flex justify-between items-start mb-4">
<span className="material-symbols-outlined text-primary text-3xl">account_circle</span>
<span className="px-3 py-1 bg-success-mint text-primary font-label-md text-label-md rounded-full">Essencial</span>
</div>
<h3 className="font-headline-md text-headline-md mb-2">Dados de Conta</h3>
<p className="text-on-surface-variant font-body-md">Nome, e-mail e perfil desportivo. São utilizados para personalizar a sua experiência de treino e facilitar a comunicação com profissionais.</p>
</div>
{/*  Data Point Card 2  */}
<div className="p-8 bg-surface-container-lowest border border-border-subtle rounded-xl hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all">
<div className="flex justify-between items-start mb-4">
<span className="material-symbols-outlined text-primary text-3xl">payments</span>
<span className="px-3 py-1 bg-success-mint text-primary font-label-md text-label-md rounded-full">Protegido</span>
</div>
<h3 className="font-headline-md text-headline-md mb-2">Transações</h3>
<p className="text-on-surface-variant font-body-md">Histórico de reservas e pagamentos. Processamos através de gateways encriptados de nível bancário para garantir segurança absoluta.</p>
</div>
</div>
{/*  Section: Recolha de Dados  */}
<section className="mb-section-gap scroll-mt-24" id="recolha">
<div className="flex items-center gap-3 mb-6">
<div className="w-10 h-10 rounded-full bg-success-mint flex items-center justify-center">
<span className="material-symbols-outlined text-primary">database</span>
</div>
<h2 className="font-headline-lg text-headline-lg">2. Recolha de Dados</h2>
</div>
<div className="bg-surface-container-low p-8 rounded-2xl border border-border-subtle mb-6">
<ul className="space-y-6">
<li className="flex gap-4">
<span className="material-symbols-outlined text-primary mt-1">check_circle</span>
<div>
<span className="font-semibold text-text-primary block">Fornecidos pelo Utilizador</span>
<span className="text-on-surface-variant">Informações de registo, biografia de treinador, certificações e preferências de modalidades.</span>
</div>
</li>
<li className="flex gap-4">
<span className="material-symbols-outlined text-primary mt-1">check_circle</span>
<div>
<span className="font-semibold text-text-primary block">Recolhidos Automaticamente</span>
<span className="text-on-surface-variant">Endereço IP, tipo de dispositivo, cookies de sessão e dados de geolocalização para busca de treinos próximos.</span>
</div>
</li>
</ul>
</div>
</section>
{/*  Visual Accent Image  */}
<div className="relative w-full h-[300px] rounded-3xl overflow-hidden mb-section-gap">
<img alt="Fitness Training" className="w-full h-full object-cover" data-alt="A cinematic, wide-angle shot of a high-end, minimalist fitness studio with floor-to-ceiling glass windows overlooking a modern cityscape at sunrise. The lighting is soft and golden, reflecting off professional gym equipment. The aesthetic is clean and high-performance, dominated by shades of white and metallic silver, with subtle emerald green highlights in the brand's training gear. The atmosphere is professional, serene, and energized for the start of a productive day." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLcnhrWqPNgO5FBU7Jpygb2anM6uzYE4fnEhULAla1oCctNhAm-V_DFefRH8qxKrWiDvdMmASD7gCDtGQxEVDUqKf6rJliMvERmu3hr2pIR9OhL6J2Wij1YZ4bps9FVqIMXh8NeI57nvBs0bPyDKR3no5EAAqLGAAFUnbUZP_gk5INHt2G0INoeFFll1M16Psk8U7sMtRWFSBOHTOHntCz7UU4heeUd19bO2chDExRrYkr9qRkOeshIFtKD5JCJ21fYkFrO6i7"/>
<div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent flex items-center px-12">
<h4 className="text-white font-display-lg text-headline-lg max-w-md">Segurança em cada movimento.</h4>
</div>
</div>
{/*  Section: Uso de Cookies  */}
<section className="mb-section-gap scroll-mt-24" id="cookies">
<div className="flex items-center gap-3 mb-6">
<div className="w-10 h-10 rounded-full bg-success-mint flex items-center justify-center">
<span className="material-symbols-outlined text-primary">cookie</span>
</div>
<h2 className="font-headline-lg text-headline-lg">3. Uso de Cookies</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="p-6 border border-border-subtle rounded-xl text-center">
<h4 className="font-bold text-text-primary mb-2">Funcionais</h4>
<p className="text-label-md text-on-surface-variant">Permitem login e carrinho.</p>
</div>
<div className="p-6 border border-border-subtle rounded-xl text-center">
<h4 className="font-bold text-text-primary mb-2">Analíticos</h4>
<p className="text-label-md text-on-surface-variant">Para melhorar a plataforma.</p>
</div>
<div className="p-6 border border-border-subtle rounded-xl text-center">
<h4 className="font-bold text-text-primary mb-2">Marketing</h4>
<p className="text-label-md text-on-surface-variant">Apenas com seu consentimento.</p>
</div>
</div>
</section>
{/*  Section: Seus Direitos  */}
<section className="mb-section-gap scroll-mt-24" id="direitos">
<div className="flex items-center gap-3 mb-6">
<div className="w-10 h-10 rounded-full bg-success-mint flex items-center justify-center">
<span className="material-symbols-outlined text-primary">gavel</span>
</div>
<h2 className="font-headline-lg text-headline-lg">4. Seus Direitos</h2>
</div>
<div className="prose prose-slate max-w-none text-on-surface-variant font-body-md leading-relaxed">
<p>Como utilizador, possui o controlo total sobre os seus dados. Pode a qualquer momento solicitar:</p>
<ul className="list-disc pl-6 space-y-2 mt-4">
<li>Acesso integral aos seus dados armazenados;</li>
<li>Retificação de informações incompletas ou incorretas;</li>
<li>Eliminação definitiva da sua conta e dados associados ("Direito ao Esquecimento");</li>
<li>Portabilidade dos dados para outra plataforma.</li>
</ul>
</div>
</section>
{/*  Section: Conformidade RGPD  */}
<section className="mb-section-gap scroll-mt-24 p-10 bg-on-tertiary-container rounded-3xl border border-tertiary/20" id="rgpd">
<div className="flex flex-col md:flex-row gap-8 items-center">
<div className="flex-1">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-tertiary text-4xl">verified_user</span>
<h2 className="font-headline-lg text-headline-lg text-tertiary">5. Conformidade RGPD</h2>
</div>
<p className="text-on-surface-variant font-body-md">
                                A FIND4SPORT opera em estrita conformidade com o Regulamento Geral sobre a Proteção de Dados (Regulamento UE 2016/679). Implementamos medidas técnicas e organizativas para garantir um nível de segurança adequado ao risco.
                            </p>
<button className="mt-8 px-6 py-3 bg-tertiary text-on-tertiary rounded-lg font-bold hover:scale-[1.02] transition-transform">Download Versão PDF</button>
</div>
<div className="w-48 h-48 bg-tertiary/10 rounded-full flex items-center justify-center border-4 border-dashed border-tertiary/30">
<span className="material-symbols-outlined text-tertiary text-6xl">security</span>
</div>
</div>
</section>
</div>
</div>
</main>
      </main>
      <Footer />
    </div>
  )
}
