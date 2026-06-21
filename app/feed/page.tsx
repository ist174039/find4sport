'use client'

import { PageShell } from '@/components/page-shell'

export default function Page() {
  return (
    <PageShell>
      {/*  Main Content Grid  */}
<div className="pt-24 pb-20 md:pb-12 max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/*  Left Sidebar / Info Section  */}
<aside className="hidden lg:block lg:col-span-3 space-y-gutter">
{/*  Security & Info Banner  */}
<div className="bg-primary-container text-on-primary-container p-6 rounded-xl shadow-sm border border-primary/20">
<div className="flex items-start gap-3 mb-4">
<span className="material-symbols-outlined text-[28px]">verified_user</span>
<h3 className="font-headline-md text-[18px] leading-tight">Publicações Seguras</h3>
</div>
<p className="text-body-md opacity-90 mb-4">
                    Apenas profissionais e espaços verificados podem publicar conteúdo oficial no feed principal.
                </p>
<div className="flex items-center gap-2 bg-black/10 p-3 rounded-lg">
<span className="material-symbols-outlined text-[18px]">security</span>
<span className="text-label-md">2FA Ativado para Criadores</span>
</div>
</div>
{/*  Suggestion Card  */}
<div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
<h4 className="font-headline-md text-[16px] mb-4">Sugestões para seguir</h4>
<div className="space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Close-up portrait of a professional athletic trainer with a focused and friendly expression, wearing modern sportswear in a bright, high-performance gym environment. The lighting is crisp and professional, emphasizing a clean and motivating atmosphere consistent with a premium sports community." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfsRJTzHsMEnl6auCDqFxdePud44AQQ0VLWnlJJR5T8G_mnTxfM8yhKlyfvp5IuLxuuLUV7-iVLCeIkAyoNtBWH_Or5qa2FQHo_pUFmHRRsDTAwuVhqEn5FM6yt1Dlo1wL-MwccW6hgOsuKOYDEOmb48CuqHHOx43OPyk-HCP4VzKlsEV55K-1FzZnybyZLSy3cUW3cuiA6zCfIA_gOtEZZIHRHDbrI2vpAyiKxK_LuBjhvrWYsrtRZHG7s-cGHNylpWvY0sCF" />
</div>
<div>
<p className="text-label-md text-primary">Ricardo Santos</p>
<p className="text-[10px] text-on-surface-variant">Personal Trainer</p>
</div>
</div>
<button className="text-primary font-bold text-label-md">Seguir</button>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Modern fitness studio interior with polished concrete floors and minimalist equipment, featuring a soft natural light coming from large windows. The aesthetic is clean and professional, representing a premium sports facility with a contemporary and inviting vibe." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvaSVVfWV2DKTGUuvichahjnhhTNSn1eHGubrr1DSnn37fXhSfFLK-sFIRxQnjnVTDAwc2y01N_ieBbrbW23kOSlifSg9nUJ2N1JXjgd_v5eaUkTlLqqjZOGanXGrVBiDcm98XYZ7fCrx-S_r1Qsy9kJuPgxcC6SRMi-VpO1GK5Rfn5G7zOOHVPbF9VyVcMfcMjeq5czCYA-mmbE6QvdUMd2LqRJBEyAGzpydv_xu3GIiQhFibvNT6r7TElP-3u9XXt13YCW49" />
</div>
<div>
<p className="text-label-md text-primary">The Box Fitness</p>
<p className="text-[10px] text-on-surface-variant">Espaço</p>
</div>
</div>
<button className="text-primary font-bold text-label-md">Seguir</button>
</div>
</div>
</div>
{/*  Trending Topics  */}
<div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
<h4 className="font-headline-md text-[16px] mb-4">Tópicos Populares</h4>
<div className="space-y-4">
<a className="block group" href="#">
<p className="text-label-md text-primary group-hover:underline">#Desafio10K</p>
<p className="text-[11px] text-on-surface-variant">1.2k publicações esta semana</p>
</a>
<a className="block group" href="#">
<p className="text-label-md text-primary group-hover:underline">#YogaChallenge</p>
<p className="text-[11px] text-on-surface-variant">850 publicações</p>
</a>
<a className="block group" href="#">
<p className="text-label-md text-primary group-hover:underline">#NovosEspaços</p>
<p className="text-[11px] text-on-surface-variant">Publicações recentes</p>
</a>
</div>
</div>
</aside>
{/*  Feed Center Column  */}
<div className="lg:col-span-6 space-y-6">
{/*  Stories/Momentos Section  */}
<section className="relative">
<div className="flex items-center justify-between mb-4">
<h2 className="font-headline-md text-headline-md text-text-primary">Destaques</h2>
<button className="text-primary font-bold text-label-md flex items-center gap-1">Ver todos <span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
</div>
<div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
{/*  Story Item (Pro)  */}
<div className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
<div className="w-16 h-16 rounded-full p-[2px] border-2 border-primary group-hover:scale-105 transition-transform">
<div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Close-up profile of an active woman outdoors during a sunny day, capturing a moment of athletic intensity and focus. The lighting is warm and golden, with high-definition clarity that highlights a professional and energetic sports lifestyle aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiSjs4JmIBfPW2BgLENl3IaK3X4cqJD0EWG8r6pM1L9T8DS0csTzdy4zmEEholYFfEHu3mTFRdnQAubL3aNJfCIrb-8nj2qjpA9Aye4bmOFPFkhxZEWACzzkIi5Qc792icmPf3Aar49uTyAwMuU5nEoZlMcKmM9us2vPU8CZeZiwEzn6mw7TiHu-qZ0i5obfDBsg6fkZP0HEwpptFboWGKw0LFgo1Rgzt-czwG1h4hclBXz-wYD5PMuXSQ4KkVZMmnb7FL3DJ7" />
</div>
</div>
<span className="text-label-md text-on-surface-variant truncate w-16 text-center">Ana M.</span>
</div>
{/*  Story Item (Espaço)  */}
<div className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
<div className="w-16 h-16 rounded-full p-[2px] border-2 border-primary group-hover:scale-105 transition-transform">
<div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A brightly lit, modern CrossFit gym interior showcasing a row of rowing machines and kettlebells. The space is clean, organized, and professionally shot to convey a sense of high-performance energy and athletic reliability." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkRj77QDu6fEl9VNX_YeN1SVJYXHj0LHplIjF9ipM33uhlSLFOgEIvxbfJTuZ-bSpypKvZ4eel9diYn7p_q6oD2aXQb5BvbjYyL2pEe2KemEROwF-ndWWscn1Pvk7cBAv-WWQyFTlj6V7zOU_QVb1BEerr8-8sflCloDKG_NpRxhlJpE-W4gnXM0UqkXZsFXpPWSP0WpOP20pndLwOiuzlqDj02zDw7e5CtFRY4qs6hl2y6xXvaYnsMXKloeb4WucNW7fmXFGJ" />
</div>
</div>
<span className="text-label-md text-on-surface-variant truncate w-16 text-center">CrossFitLx</span>
</div>
{/*  More placeholders for scrolling  */}
<div className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer opacity-80 hover:opacity-100">
<div className="w-16 h-16 rounded-full p-[2px] border-2 border-outline-variant">
<div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Portrait of a male professional athlete in a modern urban environment, featuring high-contrast lighting and a sophisticated aesthetic. The mood is determined and professional, highlighting a clean-cut performance look." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz9Lou68p44yYUBXjXIV_huRnxaCnpzuNVLHYQ0zJWfQ4qKYDONva0RaZKOZyCFpkx0rncFiYIjbGxtjTlrmXbMNJtcv8qyp9F__YX_NCwQeD3aWtnh4wGAiCTJNzOza4rRxgcs6CEcyRZkHl-lzooiAwuvikQzcQUMSMKmOcGkzvVD588PxXBRYPlXUSQpmwRrEyYd4ANn-yEd2LYclLQ0jNC-eXS_jYCMiMzWy05yNnjlEXKG4KfFUyHzkzdatvM_30W0EZS" />
</div>
</div>
<span className="text-label-md text-on-surface-variant truncate w-16 text-center">Pedro G.</span>
</div>
</div>
</section>
{/*  Post Card 1 (Video/Reel)  */}
<article className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
<div className="p-4 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="relative">
<img className="w-10 h-10 rounded-full object-cover" data-alt="Professional sports trainer portrait for a social media profile, set in a clean gym with emerald accents and soft professional lighting. The aesthetic is modern and corporate, emphasizing trust and athletic performance." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkYcylXAQXqESSflX_fSlnKrjIo60V9C2ULrZdLjYRGX3XghQWSDD1GVW-OrjW4XL5f99fSt1qVdE0cGXAtdYOzjqhOR8ReQjc5C0jMasnR9falorUG7Kw-nMSrZEI7Tz4mrXlywyCbiJGSUnWVMdggHn-gq-3xoVM_SK43_CjOGhQ8-23vlGZRjjArQ4mZkVUcjxrJTNVmzGFKNeQSdvOvsgrUOXJEg6aVupRUdF9c_AGIpzREC0axxh-0LkP_AqXD02Tmhvd" />
<span className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] rounded-full p-0.5 border-2 border-white material-symbols-outlined" style={{   fontVariationSettings: '\'FILL\' 1' }}>verified</span>
</div>
<div>
<div className="flex items-center gap-2">
<h3 className="font-label-md text-label-md text-text-primary">Ricardo Santos</h3>
<span className="bg-success-mint text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">PRO</span>
</div>
<p className="text-on-surface-variant text-[11px] flex items-center gap-1">
                                2h atrás • <span className="material-symbols-outlined text-[12px]">public</span> Público
                            </p>
</div>
</div>
<div className="flex gap-2">
<button className="text-on-surface-variant hover:text-error transition-colors" title="Denunciar">
<span className="material-symbols-outlined">flag</span>
</button>
<button className="text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">more_vert</span>
</button>
</div>
</div>
<div className="px-4 pb-3">
<p className="text-body-md text-on-surface">
                        Novo recorde pessoal atingido hoje! Foram 10km em menos de 40 minutos. Quem se junta ao próximo <span className="text-primary font-bold">#Desafio10K</span>? 🏃‍♂️💨
                    </p>
</div>
{/*  Media Content (Simulated Video/Image)  */}
<div className="relative group cursor-pointer aspect-video bg-surface-container-highest overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A cinematic wide shot of a runner on a scenic coastal path during a vibrant sunset. The lighting is golden and dramatic, highlighting the athlete's movement and the surrounding nature. The high-definition image evokes a sense of freedom, performance, and vibrant energy." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBR3rJ0Er77omibtjnrgrE6RFi-dXy9NIH5xG_FK82_vbrikg9hwctoWAu5VSxFboUk0BC28oJBo4U9hGPdO4fWc-_A0mLI54yYLtNUYm4KFR6d5igNgihKDioHeuuLIBmdK0QMuJMUOEh5xrsUq7L7Ygiqq3iinsk1z_DmCb5qgi-wR8m5n6yf3z6jKzhAiDua2M2F_laHQvfM_fSK10q7zqF2SnltA1Nv3udeXkJFg5OFa4Rvdsuq5tIF1aY4_hZvVJnpspnj" />
<div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
<span className="material-symbols-outlined text-white text-[64px] drop-shadow-lg" style={{   fontVariationSettings: '\'FILL\' 1' }}>play_circle</span>
</div>
<div className="absolute bottom-4 right-4 glass-card px-3 py-1 rounded-full text-[12px] font-bold text-text-primary">
                        0:45
                    </div>
</div>
<div className="p-4 flex items-center justify-between border-t border-border-subtle/50">
<div className="flex items-center gap-6">
<button className="flex items-center gap-2 text-on-surface-variant hover:text-primary active:scale-90 transition-all">
<span className="material-symbols-outlined">favorite</span>
<span className="text-label-md">124</span>
</button>
<button className="flex items-center gap-2 text-on-surface-variant hover:text-primary active:scale-90 transition-all">
<span className="material-symbols-outlined">comment</span>
<span className="text-label-md">18</span>
</button>
<button className="flex items-center gap-2 text-on-surface-variant hover:text-primary active:scale-90 transition-all">
<span className="material-symbols-outlined">share</span>
</button>
</div>
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full border-2 border-white bg-blue-100"></div>
<div className="w-6 h-6 rounded-full border-2 border-white bg-green-100"></div>
<div className="w-6 h-6 rounded-full border-2 border-white bg-yellow-100 flex items-center justify-center text-[10px] font-bold">+5</div>
</div>
</div>
</article>
{/*  Post Card 2 (Espaço/Local)  */}
<article className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden shadow-sm">
<div className="p-4 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="relative">
<img className="w-10 h-10 rounded-full object-cover" data-alt="A logo or profile image representing a premium sports facility, featuring a clean and minimalist graphic design that conveys stability and high-quality service. The background is a neutral professional tone, fitting a modern corporate sport ecosystem." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3nOtAo-Fs2S4lGckxsKpuF34KIubHuMDzLotfLzZOgUK7bBGKl6VxUsaY4yM-_GKnbxx2vDocMhbLxlNgxVYbfAf9g8Uhkvxa_KfWBKRIlKEHuDofgmhSffsEWwCS29VI9OyAkZCa5U3WiV9Pq0-dfQATg7IzhqGErbvS-gLQ1l5WGegG46TbYEasMzeO1pa20ybnivDyvJiuwd-GaxLFzFoTYRPuIGfzhpvHfO0FeTqRD7y1zwtJVdSpiVYmsYb0pYstqqct" />
</div>
<div>
<div className="flex items-center gap-2">
<h3 className="font-label-md text-label-md text-text-primary">The Box Fitness</h3>
<span className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">ESPAÇO</span>
</div>
<p className="text-on-surface-variant text-[11px] flex items-center gap-1">
                                5h atrás • <span className="material-symbols-outlined text-[12px]">location_on</span> Lisboa
                            </p>
</div>
</div>
<button className="text-on-surface-variant hover:text-error transition-colors">
<span className="material-symbols-outlined">flag</span>
</button>
</div>
<div className="px-4 pb-4">
<h4 className="font-headline-md text-[18px] text-text-primary mb-2">Novos horários de Yoga 🧘‍♀️</h4>
<p className="text-body-md text-on-surface mb-4">
                        A pedido de muitos, adicionamos aulas matinais às 07:30 todas as terças e quintas. Reserva já a tua vaga através da app!
                    </p>
<div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
<img className="w-full h-48 object-cover" data-alt="A peaceful yoga studio scene with sunlight streaming through large windows onto a group of wooden mats. The atmosphere is serene and professional, featuring clean lines and a minimalist aesthetic that promotes wellness and athletic focus." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAl_CYeAfdhOaAWVjtMC17uR78Of60mVbRfhRySODyUiWMIaJhEtHZwQ5X6sX6VWS0gq7Y2W4NfHka--4GPejYztq52j9hOCbY8zFcBdXDfgsaJvuV18meVhJrr34q5sSST1IpP6wCUAfrQ6e3mK5P4aj2Dywdpk-NTD2uctk0unGA5AXaFT7ITv3IxOWKFR_Zgqo3ovWZOwupD1tTUeeabfaAahitODRsof0_FeTBs4_gUPbkuIVxyzOBFwRs3FDsc7S0xyT-g" />
<img className="w-full h-48 object-cover" data-alt="A close-up shot of a person practicing yoga with high-precision technique in a bright, modern studio. The lighting is soft and flattering, highlighting the physical discipline and professional quality of the sports training session." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZfsgtp6XVsBsAZsqEj3Eb44dkxiT0ORyIPjQ9eZIhVzktWyCjYI5BohD3-k88l4sUQluqi3iUjCfM1f-AuXz-A1u6gFtt0A9MRA5NJ86moHeosivFheyroCfz_ZJAq-EsW4ajgdPI5CDeVYuCQMDVsm9Wp25r4al7WdoDSyPv4g8llG1F8TVRogqF1dP2p-r_Qao7iP5-iNAADqhLbVw33w-q-qJXOPZfM3d0clBM9gx18WlRANDOhFNNXET2-txOZU9QHOqd" />
</div>
</div>
<div className="p-4 flex items-center justify-between border-t border-border-subtle/50">
<div className="flex items-center gap-6">
<button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all">
<span className="material-symbols-outlined">favorite</span>
<span className="text-label-md">82</span>
</button>
<button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all">
<span className="material-symbols-outlined">comment</span>
<span className="text-label-md">4</span>
</button>
</div>
<button className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-lg text-label-md font-bold hover:shadow-md transition-shadow active:scale-95">
                        Reservar Agora
                    </button>
</div>
</article>
</div>
{/*  Right Sidebar (Desktop only)  */}
<aside className="hidden lg:block lg:col-span-3 space-y-gutter">
{/*  Community Badge  */}
<div className="bg-white border border-border-subtle rounded-xl p-6 relative overflow-hidden group">
<div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
<h4 className="font-headline-md text-[16px] mb-2">A tua Comunidade</h4>
<div className="flex items-center gap-3 mb-4">
<div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-[28px]">groups</span>
</div>
<div>
<p className="text-label-md font-bold">Corredores de Lisboa</p>
<p className="text-[11px] text-on-surface-variant">2.4k membros ativos</p>
</div>
</div>
<button className="w-full py-2 border-2 border-primary text-primary font-bold rounded-lg text-label-md hover:bg-primary hover:text-on-primary transition-all">
                    Ver Tópicos
                </button>
</div>
{/*  Promotion / Ad Space  */}
<div className="rounded-xl overflow-hidden relative h-64 shadow-sm group">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A dynamic action shot of athletes training in a state-of-the-art gym, with high-definition details and vibrant energy. The lighting emphasizes sweat and effort within a professional, clean environment, aligning with a premium high-performance sports brand." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqbD4gWyCJLWHwRv9LGVm04qf8sxVVgOrgvcE89LAu5eQ1Nb-x6eMaJYsW6W95zHuYV-nQtQ65BD_JN1Pmi61mSuPWB81PwisLDG-heD6PxIMgiO_0QBRttTIdE_DsIeFRsHnMkpGiOMykfc7wDx_IOwjFmq4snzA5HgiClgBp3R0Gqn1RO-Jg-tisFU7JoHSu6chMmpclSJH_5pIBIIWRiy68237xWL0ZRKQ1iRVnEdd69z1b-BzC3syyIHTmh8cDvXNRwBLN" />
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
<span className="bg-trust-gold text-white text-[10px] px-2 py-0.5 rounded font-bold self-start mb-2">PROMO</span>
<h5 className="text-white font-headline-md text-[18px] leading-tight mb-2">Treino Personalizado: 20% OFF esta semana</h5>
<button className="bg-white text-text-primary px-4 py-2 rounded-lg text-label-md font-bold w-max">Saiba Mais</button>
</div>
</div>
{/*  Footer Links (Simplified for Sidebar)  */}
<div className="pt-4 flex flex-wrap gap-x-4 gap-y-2">
<a className="text-on-surface-variant text-[11px] hover:text-primary transition-colors" href="#">Privacidade</a>
<a className="text-on-surface-variant text-[11px] hover:text-primary transition-colors" href="#">Termos</a>
<a className="text-on-surface-variant text-[11px] hover:text-primary transition-colors" href="#">Ajuda</a>
<p className="text-on-surface-variant text-[11px] w-full mt-2 opacity-50">© 2024 FIND4SPORT</p>
</div>
</aside>
</div>
{/*  Success Feedback Overlay  */}
<div className="fixed bottom-24 right-8 bg-on-background text-white px-6 py-3 rounded-xl shadow-2xl translate-y-32 opacity-0 transition-all duration-300 z-[100] flex items-center gap-3" id="toast">
<span className="material-symbols-outlined text-green-400">check_circle</span>
<span className="font-label-md">Denúncia enviada com sucesso.</span>
</div>
    </PageShell>
  )
}
