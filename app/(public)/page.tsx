import { Activity, ArrowRight, BadgeCheck, Building2, CalendarDays, HeartPulse, MapPin, Rss, Star, Users } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { HeroCarousel } from '@/components/hero-carousel'
import { PageContainer } from '@/components/patterns/page-shell'
import { distanceFrom, parseGeoCookie } from '@/lib/geo'
import { PUBLIC_EVENT_STATUS, PUBLIC_PROFESSIONAL_STATUS, PUBLIC_SPACE_STATUS } from '@/lib/domain/public-entities'

const ecosystem=[
  {name:'Profissionais',description:'Treino, recuperação e acompanhamento',href:'/profissionais',icon:Users},
  {name:'Espaços',description:'Instalações e campos desportivos',href:'/espacos',icon:Building2},
  {name:'Eventos',description:'Provas, aulas e encontros',href:'/eventos',icon:CalendarDays},
  {name:'Comunidades',description:'Grupos e interesses desportivos',href:'/comunidades',icon:Users},
  {name:'Saúde',description:'Fisioterapia, recuperação e bem-estar',href:'/pesquisa?q=saúde&type=profissionais',icon:HeartPulse},
  {name:'Feed',description:'Conteúdo da comunidade profissional',href:'/feed',icon:Rss},
  {name:'Pesquisa',description:'Encontra tudo num só lugar',href:'/pesquisa',icon:Activity},
]
function ImageOrFallback({src,alt,icon:Icon}:{src?:string|null;alt:string;icon:typeof Users}){return <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-secondary/20">{src?<img src={src} alt={alt} className="h-full w-full object-cover"/>:<div className="flex h-full items-center justify-center"><Icon className="h-10 w-10 text-primary/35"/></div>}</div>}
function average(values:number[]){return values.length?values.reduce((a,b)=>a+b,0)/values.length:null}
function money(value:number){return new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(value)}

export default async function Page(){
  const admin=createAdminClient();const now=new Date().toISOString();const cookieStore=await cookies();const userLocation=parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const [spacesCount,profsCount,eventsCount,spacesResult,prosResult,eventsResult,carouselRes]=await Promise.all([
    admin.from('sport_spaces').select('id',{count:'exact',head:true}).eq('status',PUBLIC_SPACE_STATUS),
    admin.from('professionals').select('id',{count:'exact',head:true}).eq('status',PUBLIC_PROFESSIONAL_STATUS),
    admin.from('events').select('id',{count:'exact',head:true}).eq('status',PUBLIC_EVENT_STATUS).gte('start_date',now),
    admin.from('sport_spaces').select('id,name,slug,address,rating_avg,review_count,gallery_urls,cover_url,is_verified,latitude,longitude,status').eq('status',PUBLIC_SPACE_STATUS).limit(80),
    admin.from('professionals').select('id,user_id,full_name,professional_name,public_slug,address,rating_avg,review_count,avatar_url,is_verified,status,views_count,latitude,longitude').eq('status',PUBLIC_PROFESSIONAL_STATUS).limit(120),
    admin.from('events').select('id,slug,title,start_date,address,image_url,status,latitude,longitude,price_min').eq('status',PUBLIC_EVENT_STATUS).gte('start_date',now).order('start_date',{ascending:true}).limit(80),
    admin.from('carousel_slides').select('*').eq('is_active',true).order('display_order',{ascending:true}),
  ])
  const pros=prosResult.data||[],spacesRows=spacesResult.data||[];const proIds=pros.map(p=>p.id),spaceIds=spacesRows.map(s=>s.id)
  const [services,roomPrices]=await Promise.all([
    proIds.length?admin.from('services').select('professional_id,price').in('professional_id',proIds).eq('is_active',true):Promise.resolve({data:[] as any[]}),
    spaceIds.length?admin.from('space_rooms').select('space_id,price_per_hour').in('space_id',spaceIds).eq('is_active',true):Promise.resolve({data:[] as any[]}),
  ])
  const servicePrices=new Map<string,number[]>(),spacePrices=new Map<string,number[]>();for(const r of services.data||[]){const p=Number(r.price);if(Number.isFinite(p)&&p>=0)servicePrices.set(r.professional_id,[...(servicePrices.get(r.professional_id)||[]),p])}for(const r of roomPrices.data||[]){const p=Number(r.price_per_hour);if(Number.isFinite(p)&&p>=0)spacePrices.set(r.space_id,[...(spacePrices.get(r.space_id)||[]),p])}
  const professionals=pros.map((p:any)=>({...p,distanceKm:distanceFrom(userLocation,p.latitude,p.longitude),averagePrice:average(servicePrices.get(p.id)||[])})).sort((a,b)=>{if(userLocation){const d=(a.distanceKm??Infinity)-(b.distanceKm??Infinity);if(d)return d}return Number(b.rating_avg||0)-Number(a.rating_avg||0)}).slice(0,6)
  const spaces=spacesRows.map((s:any)=>({...s,distanceKm:distanceFrom(userLocation,s.latitude,s.longitude),averagePrice:average(spacePrices.get(s.id)||[])})).sort((a,b)=>{if(userLocation){const d=(a.distanceKm??Infinity)-(b.distanceKm??Infinity);if(d)return d}return Number(b.rating_avg||0)-Number(a.rating_avg||0)}).slice(0,6)
  const events=(eventsResult.data||[]).map((e:any)=>({...e,distanceKm:distanceFrom(userLocation,e.latitude,e.longitude)})).sort((a,b)=>new Date(a.start_date).getTime()-new Date(b.start_date).getTime()).slice(0,6)
  const distance=(d:number|null|undefined)=>d==null?null:d<1?`${Math.round(d*1000)} m de ti`:`${d.toFixed(1)} km de ti`
  return <div className="flex min-h-screen flex-col bg-background"><HeroCarousel slides={carouselRes.data||[]} spacesCount={spacesCount.count||0} profsCount={profsCount.count||0} eventsCount={eventsCount.count||0}/>
    <section className="border-b py-10 sm:py-16"><PageContainer><h2 className="text-2xl font-bold sm:text-3xl">Explore a plataforma</h2><p className="mt-2 text-sm text-muted-foreground">Acede diretamente ao que procuras.</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">{ecosystem.map(i=><Link key={i.href} href={i.href} className="flex min-h-32 flex-col justify-between rounded-2xl border bg-card p-4 transition hover:border-primary/40"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><i.icon className="h-5 w-5"/></div><div><h3 className="font-semibold">{i.name}</h3><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{i.description}</p></div></Link>)}</div></PageContainer></section>
    <section className="border-b py-10 sm:py-16"><PageContainer><div className="mb-6 flex items-end justify-between"><div><h2 className="text-2xl font-bold sm:text-3xl">Profissionais recomendados</h2><p className="mt-2 text-sm text-muted-foreground">Proximidade e reputação, sem misturar promoção paga no ranking.</p></div><Link href="/profissionais" className="hidden text-sm font-medium text-primary sm:flex">Ver todos <ArrowRight className="ml-1 h-4 w-4"/></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{professionals.map((p:any)=><Link href={`/profissionais/${p.public_slug||p.id}`} key={p.id} className="overflow-hidden rounded-2xl border bg-card transition hover:border-primary/40"><ImageOrFallback src={p.avatar_url} alt={p.professional_name||p.full_name||'Profissional'} icon={Users}/><div className="p-3"><div className="flex gap-1"><h3 className="line-clamp-2 flex-1 text-sm font-semibold">{p.professional_name||p.full_name}</h3>{p.is_verified&&<BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500"/>}</div>{p.address&&<p className="mt-2 flex items-center gap-1 truncate text-[11px] text-muted-foreground"><MapPin className="h-3 w-3"/>{p.address}</p>}{distance(p.distanceKm)&&<p className="mt-1 text-[11px] font-medium text-primary">{distance(p.distanceKm)}</p>}{p.averagePrice!=null&&<p className="mt-1 text-[11px] font-semibold">Média {money(p.averagePrice)} / sessão</p>}{Number(p.review_count||0)>0&&<p className="mt-2 flex items-center gap-1 text-[11px]"><Star className="h-3 w-3 fill-amber-500 text-amber-500"/>{Number(p.rating_avg||0).toFixed(1)} ({p.review_count})</p>}</div></Link>)}</div></PageContainer></section>
    <section className="border-b bg-muted/20 py-10 sm:py-16"><PageContainer><h2 className="mb-6 text-2xl font-bold sm:text-3xl">Espaços próximos</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{spaces.map((s:any)=><Link href={`/espacos/${s.slug||s.id}`} key={s.id} className="overflow-hidden rounded-2xl border bg-card transition hover:border-primary/40"><ImageOrFallback src={s.cover_url||s.gallery_urls?.[0]} alt={s.name} icon={Building2}/><div className="p-3"><h3 className="line-clamp-2 text-sm font-semibold">{s.name}</h3>{s.address&&<p className="mt-2 truncate text-[11px] text-muted-foreground">{s.address}</p>}{distance(s.distanceKm)&&<p className="mt-1 text-[11px] font-medium text-primary">{distance(s.distanceKm)}</p>}{s.averagePrice!=null&&<p className="mt-1 text-[11px] font-semibold">Média {money(s.averagePrice)} / hora</p>}</div></Link>)}</div></PageContainer></section>
    <section className="py-10 sm:py-16"><PageContainer><h2 className="mb-6 text-2xl font-bold sm:text-3xl">Próximos eventos</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{events.map((e:any)=><Link href={`/eventos/${e.slug||e.id}`} key={e.id} className="rounded-2xl border bg-card p-3 transition hover:border-primary/40"><CalendarDays className="h-5 w-5 text-primary"/><h3 className="mt-3 line-clamp-2 text-sm font-semibold">{e.title}</h3><p className="mt-2 text-[11px] text-muted-foreground">{new Date(e.start_date).toLocaleDateString('pt-PT')}</p>{distance(e.distanceKm)&&<p className="mt-1 text-[11px] font-medium text-primary">{distance(e.distanceKm)}</p>}{Number(e.price_min||0)>0?<p className="mt-1 text-[11px] font-semibold">Desde {money(Number(e.price_min))}</p>:<p className="mt-1 text-[11px] font-semibold">Grátis</p>}</Link>)}</div></PageContainer></section>
  </div>
}
