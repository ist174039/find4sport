'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
<div className="flex items-center gap-8">
<span className="text-headline-md font-headline-md font-bold text-primary">FIND4SPORT</span>

</div>
<div className="flex items-center gap-4">
<button className="hidden lg:block bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-all">Sou Profissional</button>
<div className="flex items-center gap-3 text-on-surface-variant">
<span className="material-symbols-outlined cursor-pointer hover:text-primary">search</span>
<span className="material-symbols-outlined cursor-pointer hover:text-primary">favorite</span>
<span className="material-symbols-outlined cursor-pointer hover:text-primary">notifications</span>
<span className="material-symbols-outlined cursor-pointer hover:text-primary">person</span>
</div>
</div>
</header>
<main className="pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto">
<div className="mb-12">
<h1 className="font-display-lg text-display-lg text-primary mb-2">Contactos — FIND4SPORT</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Estamos aqui para ajudar a impulsionar a sua performance desportiva. Entre em contacto connosco para dúvidas, parcerias ou suporte.</p>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
{/*  Left Side: Enviar Mensagem Form  */}
<section className="lg:col-span-7 bg-white p-8 rounded-xl border border-border-subtle shadow-sm">
<h2 className="font-headline-md text-headline-md text-primary mb-8">Enviar Mensagem</h2>
<form className="space-y-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="flex flex-col gap-2">
<label className="font-label-md text-label-md text-on-surface-variant">Nome Completo</label>
<input className="bg-surface border border-border-subtle rounded-lg p-3 font-body-md text-body-md input-focus-ring" placeholder="Ex: João Silva" type="text"/>
</div>
<div className="flex flex-col gap-2">
<label className="font-label-md text-label-md text-on-surface-variant">E-mail</label>
<input className="bg-surface border border-border-subtle rounded-lg p-3 font-body-md text-body-md input-focus-ring" placeholder="joao@exemplo.pt" type="email"/>
</div>
</div>
<div className="flex flex-col gap-2">
<label className="font-label-md text-label-md text-on-surface-variant">Assunto</label>
<select className="bg-surface border border-border-subtle rounded-lg p-3 font-body-md text-body-md input-focus-ring">
<option>Suporte Técnico</option>
<option>Dúvidas sobre Subscrição</option>
<option>Parcerias Comerciais</option>
<option>Feedback e Sugestões</option>
<option>Outro</option>
</select>
</div>
<div className="flex flex-col gap-2">
<label className="font-label-md text-label-md text-on-surface-variant">Mensagem</label>
<textarea className="bg-surface border border-border-subtle rounded-lg p-3 font-body-md text-body-md input-focus-ring resize-none" placeholder="Como podemos ajudar?" rows="5"></textarea>
</div>
<button className="emerald-gradient text-on-primary w-full md:w-auto px-10 py-4 rounded-lg font-headline-md text-headline-md hover:opacity-90 transition-all shadow-lg shadow-primary/20" type="submit">
                        Enviar Mensagem
                    </button>
</form>
</section>
{/*  Right Side: Suporte Direto Card  */}
<aside className="lg:col-span-5 space-y-gutter">
<div className="bg-primary text-on-primary p-8 rounded-xl shadow-xl overflow-hidden relative">
{/*  Decorative element  */}
<div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-container/20 rounded-full blur-3xl"></div>
<h2 className="font-headline-md text-headline-md mb-8 relative z-10">Suporte Direto</h2>
<div className="space-y-6 relative z-10">
<div className="flex items-start gap-4">
<span className="material-symbols-outlined bg-on-primary/10 p-2 rounded-lg">mail</span>
<div>
<p className="font-label-md text-label-md opacity-80 uppercase tracking-wider">Email</p>
<p className="font-body-lg text-body-lg">ajuda@find4sport.pt</p>
</div>
</div>
<div className="flex items-start gap-4">
<span className="material-symbols-outlined bg-on-primary/10 p-2 rounded-lg">location_on</span>
<div>
<p className="font-label-md text-label-md opacity-80 uppercase tracking-wider">Morada</p>
<p className="font-body-lg text-body-lg">Avenida da Liberdade, 110<br/>1269-046 Lisboa, Portugal</p>
</div>
</div>
<div className="flex items-start gap-4">
<span className="material-symbols-outlined bg-on-primary/10 p-2 rounded-lg">schedule</span>
<div>
<p className="font-label-md text-label-md opacity-80 uppercase tracking-wider">Horário</p>
<p className="font-body-lg text-body-lg">Segunda – Sexta: 09:00 – 19:00<br/>Sábado: 10:00 – 14:00</p>
</div>
</div>
</div>
<div className="mt-12 pt-8 border-t border-on-primary/20 flex gap-4">
<a className="bg-on-primary text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-fixed transition-colors" href="#">
<span className="material-symbols-outlined text-[20px]">share</span>
</a>
<a className="bg-on-primary text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-fixed transition-colors" href="#">
<span className="material-symbols-outlined text-[20px]">group</span>
</a>
<a className="bg-on-primary text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-fixed transition-colors" href="#">
<span className="material-symbols-outlined text-[20px]">public</span>
</a>
</div>
</div>
{/*  Small Map Graphic  */}
<div className="rounded-xl overflow-hidden border border-border-subtle h-[240px] relative group">
<img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="A stylized minimalist map of a modern European city center showing clean streets and green park areas. The map is designed with a professional high-tech aesthetic, using a light mode color palette of soft greys, whites, and emerald green accents for key landmarks. The lighting is bright and even, conveying a sense of clarity and accessibility consistent with a premium sports platform brand." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKr8say9l5KTQjCH5GslFD29dZn7OHuo3U-c34gDISFo6EFMZyKcfsprGp26h9hLju9yW21Bx0bsm5KgFVQE7v9rSnkoHaGN39cN9JJuG0ddkutW7s4ipisB1BG4OkkZjXIpExdIKiNAPWcyOaXMngpo89jjAVl3swQYkcK2YA4EifMicF5uJOTUgxNemYWLj2-zy2c78on6_u-0rq-u0KZWvpOQT8Eq2t4WUP2Oh56zOJedSSDpsR1Arzeh1MFRpErcoc2Y2w"/>
<div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors"></div>
<div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
<span className="material-symbols-outlined text-primary" style={{   fontVariationSettings: '\'FILL\' 1' }}>location_on</span>
<span className="font-label-md text-label-md text-on-surface">Lisboa, Portugal</span>
</div>
</div>
</aside>
</div>
</main>
      </main>
      <Footer />
    </div>
  )
}
