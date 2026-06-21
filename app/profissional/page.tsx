'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <main className="pt-24 pb-32 px-4 md:px-margin-desktop max-w-[1280px] mx-auto">
{/*  Header Section  */}
<header className="mb-12 flex flex-col md:flex-row gap-8 items-start md:items-center">
<div className="relative">
<img className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover border-4 border-white shadow-lg" data-alt="A professional portrait of a athletic personal trainer with a friendly and confident expression. The lighting is soft and natural, emphasizing a high-performance fitness environment. The background is slightly blurred showing a modern, clean boutique gym with emerald accents, perfectly aligning with a corporate sport aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKYF5_rMJNWyg1Q5mUlldeXrX0QK_JlrVPxJFbcFr8tr1uPeqOpRMoDQCFMFT2fDiBa5NGTh8Vlt0RGsAwxkIEoUYYtZD70MWGgoiT6RUcJHL-20PB1xr6qk3vSN3Hn0D5k5H5ysKHGGKn4T2njCEUHI8Y38JDKvbiQIEkBG9zDhn7U76nWohyZiqmD6gr3Rvo4syd-w-lF4-drKbCiUus1CInTP6xwBDQZg3M2rqIXJvx8RoTE89RJMt-1IejOzpt1xPQvase" />
<div className="absolute -bottom-2 -right-2 bg-success-mint text-primary p-1.5 rounded-full shadow-sm">
<span className="material-symbols-outlined text-[20px]" style={{   fontVariationSettings: '\'FILL\' 1' }}>verified</span>
</div>
</div>
<div className="flex-1">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div>
<h1 className="font-headline-lg text-headline-lg text-text-primary mb-1">Ricardo Valente</h1>
<p className="font-body-lg text-body-lg text-text-secondary flex items-center gap-2">
                            Performance Coach & Nutricionista Desportivo
                        </p>
<div className="flex items-center gap-2 mt-2 text-outline">
<span className="material-symbols-outlined text-[18px]">location_on</span>
<span className="font-label-md text-label-md">Lisboa, Portugal</span>
</div>
</div>
<button className="bg-primary text-on-primary font-label-md text-label-md px-10 py-3 rounded-lg shadow-md hover:bg-primary-container transition-all flex items-center gap-2 active:scale-95">
<span className="material-symbols-outlined text-[20px]">chat</span>
                        Contactar
                    </button>
</div>
</div>
</header>
{/*  Bento Grid Content  */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
{/*  Column 1: Trust & Bio  */}
<div className="md:col-span-4 flex flex-col gap-gutter">
{/*  Trust Card  */}
<div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-xl shadow-sm">
<div className="flex justify-between items-center mb-6">
<h3 className="font-headline-md text-headline-md text-text-primary">Trust Score</h3>
<span className="bg-success-mint text-primary font-label-md text-label-md px-2 py-1 rounded-md">Excelente</span>
</div>
<div className="flex items-center justify-center py-4">
<div className="relative w-40 h-40 flex items-center justify-center">
<div className="trust-gauge absolute inset-0 rounded-full"></div>
<div className="absolute inset-2 bg-surface-container-lowest rounded-full flex flex-col items-center justify-center">
<span className="font-display-lg text-display-lg text-primary">94</span>
<span className="font-label-md text-label-md text-text-secondary">Pontos</span>
</div>
</div>
</div>
<p className="text-center font-body-md text-body-md text-text-secondary mt-4">
                        Baseado em 128 reservas verificadas e 45 certificações autênticas.
                    </p>
</div>
{/*  Certifications  */}
<div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-xl shadow-sm">
<h3 className="font-headline-md text-headline-md text-text-primary mb-6">Certificações</h3>
<ul className="space-y-4">
<li className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined">workspace_premium</span>
</div>
<div>
<p className="font-label-md text-label-md text-text-primary">NSCA Certified Personal Trainer</p>
<p className="text-[11px] text-outline uppercase font-bold tracking-wider">Verificado</p>
</div>
</li>
<li className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined">school</span>
</div>
<div>
<p className="font-label-md text-label-md text-text-primary">Mestrado em Nutrição Desportiva</p>
<p className="text-[11px] text-outline uppercase font-bold tracking-wider">Verificado</p>
</div>
</li>
<li className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined">health_and_safety</span>
</div>
<div>
<p className="font-label-md text-label-md text-text-primary">Suporte Básico de Vida</p>
<p className="text-[11px] text-outline uppercase font-bold tracking-wider">Expirado em 2025</p>
</div>
</li>
</ul>
</div>
</div>
{/*  Column 2: Gallery & Services  */}
<div className="md:col-span-8 flex flex-col gap-gutter">
{/*  Biography Card  */}
<div className="bg-surface-container-lowest border border-border-subtle p-8 rounded-xl shadow-sm">
<h3 className="font-headline-md text-headline-md text-text-primary mb-4">Sobre o Profissional</h3>
<p className="font-body-lg text-body-lg text-text-secondary leading-relaxed mb-6">
                        Com mais de 10 anos de experiência na área de performance desportiva, ajudo atletas e entusiastas de fitness a alcançarem os seus objetivos através de uma abordagem holística que combina treino personalizado de alta intensidade com planos nutricionais baseados em evidência científica. O meu foco é a longevidade e a otimização metabólica.
                    </p>
<div className="flex flex-wrap gap-2">
<span className="px-4 py-2 bg-background border border-border-subtle rounded-full font-label-md text-label-md text-text-secondary">Crossfit</span>
<span className="px-4 py-2 bg-background border border-border-subtle rounded-full font-label-md text-label-md text-text-secondary">Nutrição</span>
<span className="px-4 py-2 bg-background border border-border-subtle rounded-full font-label-md text-label-md text-text-secondary">Mobilidade</span>
<span className="px-4 py-2 bg-background border border-border-subtle rounded-full font-label-md text-label-md text-text-secondary">Alta Performance</span>
</div>
</div>
{/*  Gallery Grid  */}
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
<img className="w-full aspect-square object-cover rounded-xl shadow-sm hover:scale-[1.02] transition-transform cursor-pointer" data-alt="A cinematic shot of a modern industrial-style gym floor with heavy weights and professional equipment. The lighting is low-key with sharp emerald green highlights on the metal surfaces, creating an atmosphere of intense focus and elite athletic training in a professional sport setting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJRyvvONQ1QkA_hObeEDrv6k5JvH3eSbK6-XCu3wOwEC1-WWH-3LUUR-vvHRo2F4BIXpCcgIAv2XXtpLDUB53Xijd2DeY9dzt1Q2lmjcRpUuPM5xko2DQYavy7T_VdlpLkas8V-q0_sqmbT9jXwYBUELCvl2rt-vO0q1uZ7_36pfU4P_HGPvk_T3-Msx0cMfsYWNKKR7TPN7TzOGjfu2U0kH8ivGuk_ZZDKcnxSP94eiEMD1lVIYzjESIcVUH7I3qZi72HiSEb" />
<img className="w-full aspect-square object-cover rounded-xl shadow-sm hover:scale-[1.02] transition-transform cursor-pointer" data-alt="A clean, minimalist shot of a nutritionist's workspace featuring a tablet with health data, a bowl of fresh vibrant greens, and clinical-looking tools. The lighting is bright and airy, using a white and emerald color palette to signify health and professional expertise in a corporate sport context." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAejrKiHXxZc31B1itDoyQC1wmzmsUxk9ISGONCTP3vZTY7CK8pi0hT94RDakaCEZECXkkDKVY6YtfrVlwrnHFqYSxEfIAmgDeMmz6A6S_UNEh6DebR0cWNESFZ3t4jfTvXYujOuFyUUZ7um4M31xIf9N1uqtY66oJvbWoNwUdi7H4xD9gIt_OvOYQEcIIWK7sBGwJNY-eY2Ay8KzRkRRsgAYpE-Ier6cb7C7PobNU2H6iH1cY2qTPx26L1TMhm4FehyZg4NTJk" />
<img className="w-full aspect-square object-cover rounded-xl shadow-sm hover:scale-[1.02] transition-transform cursor-pointer" data-alt="A close-up of high-tech fitness equipment including a smart rowing machine in a high-end boutique studio. The aesthetic is clean and modern, with soft gray tones and vibrant green light accents reflected on metallic surfaces, emphasizing performance and technological advancement." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzYXrxAA8j5zwunrdiWMmYx8dhrUwPMXoPEh3NzYmXYfkzuajFwmiMY6H1p8SwwjsTloIv1BWbazpw57iM4Gy5WeDld0FBSR8PunLZD5AZzigIoPg1ObjnSPYgyUxlMU91TDw9H0YMizyShh-ja3v3vb-ly26FtnyqDXLDbXE6aboPuSSeBRIfokErdxohJTYNNgNv_12e-vH0e9rNTGiD2MY5poBUOBCr768OKxabo0r4gNaFUUcO48QRS0aNViQ0-OvMI0GJ" />
<img className="w-full aspect-square object-cover rounded-xl shadow-sm hover:scale-[1.02] transition-transform cursor-pointer" data-alt="A professional coach working with a student on weightlifting technique in a bright, spacious sports facility. The scene is filled with natural daylight, highlighting the interaction and the professional, encouraging atmosphere. Colors are clean with emerald green branding visible in the background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9QRZqL_SRCoY5wStOVdape1NaTBBRt3gbplyBY116ZT4DMi6eKN7vMAe5rwBE1fPh3U3W-9eZY-wv28C-GTlwDO0lEC1bChRwJmdRhxq2q9By_mBu1orBW1UUsvGe7o3pBfKTdVjB-VkJ9F5fGdZBLv_eaPr67Bhkzv0de2Qp3FFSWmdW7o_2DhNs_lJwVu02SrkZ_DTGyMq06qJCfyT6BwNMK2MtVvBzgdabHuRqnREzKRY29qo38lDOROCfoi8wwt0xrnsh" />
<img className="w-full aspect-square object-cover rounded-xl shadow-sm hover:scale-[1.02] transition-transform cursor-pointer" data-alt="An artistic view of sports accessories like a high-quality leather skipping rope and a matte black water bottle on a white wooden surface. The mood is minimalist and high-end, utilizing a pristine white background with subtle emerald accents to create a sense of premium service quality." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcEUByC9F6bafpe9Da-4Cu3QG3eRHUXZcF98462EHh3g-DcWNbvXF2meAbQHrFcQ06_-c-FPGmV6FWg5-ttkftbX8kWX70cwbtW6kMqMPWKsTnYJ1po7_d_kN3MJCpve22smO-EC7s1MC4kXlcCNL-bAOxci4Ax3aAGoozYDX2AzfYzcKteiWYLiN4kjxuFxQHveFvEtpqGdoIBzA9AKtxbKzEKM6lnMcsGI6GN4dj-hSoCQXtObkh7Gm0c0RGr3chZFxeOoDD" />
<div className="relative w-full aspect-square bg-primary-container rounded-xl overflow-hidden cursor-pointer group">
<img className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform" data-alt="A dynamic shot of an outdoor functional training session at sunrise on a modern urban platform. The lighting is golden and warm, contrasting with the sharp shadows and the clean, modern aesthetic of the professional trainer's kit. A sense of energy and early-morning discipline prevails." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHpP7lS6ZQuq90bjA1qa6cRqj38gx-kuchBzi5wnUBWcXFvq-sRNvoWAxUH1byJJqvXtkKn3cG1Ts8Pc_UwHepTA6uyD8MWaF7sDqRPG8CxCHUhNUdUjXo5ftE3UsYg536UgCKGKBKUBojgc7g3QIJ_JFCKg19wtYW6XYQJ7a1zkFmZC5xBEuwdT-L5xijihvt7DTm3YwEvvyKahGTcjD-I3YYFGXVJAET1-qK47myOMWSGSm8rTkqhAeurjUHVyFRGSwipHy8" />
<div className="absolute inset-0 flex items-center justify-center">
<span className="text-on-primary font-headline-md text-headline-md">+12</span>
</div>
</div>
</div>
{/*  Services List  */}
<div className="bg-surface-container-lowest border border-border-subtle p-8 rounded-xl shadow-sm">
<h3 className="font-headline-md text-headline-md text-text-primary mb-6">Serviços e Preços</h3>
<div className="space-y-4">
<div className="flex items-center justify-between p-4 rounded-lg hover:bg-surface-container transition-colors border border-transparent hover:border-border-subtle">
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-primary">fitness_center</span>
<div>
<p className="font-headline-md text-[18px] text-text-primary">Treino Personalizado 1:1</p>
<p className="font-body-md text-body-md text-text-secondary">Sessão de 60min com foco em objetivos específicos.</p>
</div>
</div>
<span className="font-headline-md text-headline-md text-primary">45€<span className="text-label-md font-label-md text-text-secondary">/sessão</span></span>
</div>
<div className="flex items-center justify-between p-4 rounded-lg hover:bg-surface-container transition-colors border border-transparent hover:border-border-subtle">
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-primary">restaurant</span>
<div>
<p className="font-headline-md text-[18px] text-text-primary">Plano Nutricional Mensal</p>
<p className="font-body-md text-body-md text-text-secondary">Acompanhamento semanal e dieta personalizada.</p>
</div>
</div>
<span className="font-headline-md text-headline-md text-primary">80€<span className="text-label-md font-label-md text-text-secondary">/mês</span></span>
</div>
<div className="flex items-center justify-between p-4 rounded-lg hover:bg-surface-container transition-colors border border-transparent hover:border-border-subtle">
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-primary">group</span>
<div>
<p className="font-headline-md text-[18px] text-text-primary">Small Group Training</p>
<p className="font-body-md text-body-md text-text-secondary">Treino funcional para grupos de até 4 pessoas.</p>
</div>
</div>
<span className="font-headline-md text-headline-md text-primary">25€<span className="text-label-md font-label-md text-text-secondary">/pessoa</span></span>
</div>
</div>
</div>
</div>
</div>
</main>
{/*  BottomNavBar (Mobile Only)  */}
      </main>
      <Footer />
    </div>
  )
}
