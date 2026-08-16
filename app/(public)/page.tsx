import { Activity, ArrowRight, BadgeCheck, Building2, CalendarDays, MapPin, Rss, Star, Users } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { HeroCarousel } from '@/components/hero-carousel'
import { PageContainer } from '@/components/patterns/page-shell'
import { distanceFrom, parseGeoCookie } from '@/lib/geo'

const ecosystem=[
  {name:'Profissionais',description:'Treino, recuperação e acompanhamento',href:'/profissionais',icon:Users},
  {name:'Espaços',description:'Instalações e campos desportivos',href:'/espacos',icon:Building2},
  {name:'Eventos',description:'Provas, aulas e encontros',href:'/eventos',icon:CalendarDays},
  {name:'Comunidades',description:'Grupos e interesses desportivos',href:'/comunidades',icon:Users},
  {name:'Feed',description:'Conteúdo da comunidade profissional',href:'/feed',icon:Rss},
  {name:'Pesquisa',description:'Encontra tudo num só lugar',href:'/pesquisa',icon:Activity},
]
function ImageOrFallback({src,alt,icon:Icon}:{src?:string|null;alt:string;icon:typeof Users}){return <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/15 via-muted to-secondary/20">{src?<img src={src} alt={alt} className="h-full w-full object-cover"/>:<div className="flex h-full items-center justify-center"><Icon className="h-10 w-10 text-primary/35"/></div>}</div>}
function bump(map:Map<string,number>,key:unknown){if(typeof key==='string'&&key)map.set(key,(map.get(key)||0)+1)}
function nearBonus(distance:number|null){return distance==null?0:Math.max(0,15-distance/3)}

export default async function Page(){
  const admin=createAdminClient();const now=new Date().toISOString();const cookieStore=await cookies();const userLocation=parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const [spacesCount,profsCount,eventsCount,spacesResult,prosResult,eventsResult,carouselRes]=await Promise.all([
    admin.from('sport_spaces').select('id',{count:'exact',head:true}).or('status.eq.active,is_verified.eq.true'),
    admin.from('professionals').select('id',{count:'exact',head:true}).eq('status','active'),
    admin.from('events').select('id',{count:'exact',head:true}).eq('status','published').gte('start_date',now),
    admin.from('sport_spaces').select('id,name,slug,address,rating_avg,review_count,gallery_urls,cover_url,is_verified,latitude,longitude,status').or('status.eq.active,is_verified.eq.true').limit(40),
    admin.from('professionals').select('id,user_id,full_name,professional_name,public_slug,address,rating_avg,review_count,avatar_url,is_verified,status,views_count,latitude,longitude').eq('status','active').limit(100),
    admin.from('events').select('id,title,start_date,address,image_url,status,latitude,longitude').eq('status','published').gte('start_date',now).order('start_date',{ascending:true}).limit(40),
    admin.from('carousel_slides').select('*').eq('is_active',true).order('display_order',{ascending:true}),
  ])
  const candidates=prosResult.data||[];const proIds=candidates.map(p=>p.id);const userIds=candidates.map(p=>p.user_id)
  const [follows,completed,services,posts,subs]=proIds.length?await Promise.all([
    admin.from('user_follows').select('following_id').in('following_id',userIds),
    admin.from('reservations').select('professional_id').in('professional_id',proIds).eq('status','completed'),
    admin.from('services').select('professional_id').in('professional_id',proIds).eq('is_active',true),
    admin.from('posts').select('id,professional_id').in('professional_id',proIds),
    admin.from('user_subscriptions').select('user_id,tier,status').in('user_id',userIds),
  ]):[{data:[]},{data:[]},{data:[]},{data:[]},{data:[]}] as any
  const postIds=(posts.data||[]).map((p:any)=>p.id);const comments=postIds.length?await admin.from('post_comments').select('post_id').in('post_id',postIds):{data:[]}
  const followers=new Map<string,number>(),done=new Map<string,number>(),activeServices=new Map<string,number>(),commentScore=new Map<string,number>()
  for(const r of follows.data||[])bump(followers,r.following_id);for(const r of completed.data||[])bump(done,r.professional_id);for(const r of services.data||[])bump(activeServices,r.professional_id)
  const postOwner=new Map((posts.data||[]).map((p:any)=>[p.id,p.professional_id]));for(const c of comments.data||[])bump(commentScore,postOwner.get(c.post_id))
  const plans=new Map((subs.data||[]).map((s:any)=>[s.user_id,['active','trialing'].includes(s.status)?s.tier:'free']))
  const professionals=candidates.map((p:any)=>{const d=distanceFrom(userLocation,p.latitude,p.longitude);const plan=String(plans.get(p.user_id)||'free');const score=Number(p.rating_avg||0)*10+Math.min(Number(p.review_count||0),20)*1.5+Math.min(followers.get(p.user_id)||0,50)*.5+Math.log10(Number(p.views_count||0)+1)*4+Math.min(done.get(p.id)||0,20)*2+Math.min(commentScore.get(p.id)||0,20)*.5+Math.min(activeServices.get(p.id)||0,10)+(p.is_verified?3:0)+(plan==='premium'?5:plan==='pro'?2:0)+nearBonus(d);return{...p,distanceKm:d,score}}).sort((a,b)=>b.score-a.score).slice(0,4)
  const spaces=(spacesResult.data||[]).map((s:any)=>({...s,distanceKm:distanceFrom(userLocation,s.latitude,s.longitude)})).sort((a,b)=>{if(userLocation){const d=(a.distanceKm??Infinity)-(b.distanceKm??Infinity);if(d)return d}return Number(b.rating_avg||0)-Number(a.rating_avg||0)}).slice(0,4)
  const events=(eventsResult.data||[]).map((e:any)=>({...e,distanceKm:distanceFrom(userLocation,e.latitude,e.longitude)})).sort((a,b)=>{if(userLocation){const d=(a.distanceKm??Infinity)-(b.distanceKm??Infinity);if(d)return d}return new Date(a.start_date).getTime()-new Date(b.start_date).getTime()}).slice(0,4)
  const distance=(d:number|null|undefined)=>d==null?null:d<1?`${Math.round(d*1000)} m de ti`:`${d.toFixed(1)} km de ti`
  return <div className="flex min-h-screen flex-col bg-background">
    <HeroCarousel slides={carouselRes.data||[]} spacesCount={spacesCount.count||0} profsCount={profsCount.count||0} eventsCount={eventsCount.count||0}/>
    <section className="border-b py-10 sm:py-16"><PageContainer><h2 className="text-2xl font-bold sm:text-3xl">Explore a plataforma</h2><p className="mt-2 text-sm text-muted-foreground">Acede diretamente ao que procuras.</p><div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{ecosystem.map(i=><Link key={i.href} href={i.href} className="flex min-h-32 flex-col justify-between rounded-2xl border bg-card p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><i.icon className="h-5 w-5"/></div><div><h3 className="font-semibold">{i.name}</h3><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{i.description}</p></div></Link>)}</div></PageContainer></section>
    <section className="border-b py-10 sm:py-16"><PageContainer><div className="mb-6 flex items-end justify-between"><div><h2 className="text-2xl font-bold sm:text-3xl">Profissionais em destaque</h2><p className="mt-2 text-sm text-muted-foreground">Reputação, atividade, serviços realizados, seguidores, conteúdo, plano e proximidade.</p></div><Link href="/profissionais" className="hidden text-sm font-medium text-primary sm:flex">Ver todos <ArrowRight className="ml-1 h-4 w-4"/></Link></div>{professionals.length?<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{professionals.map((p:any)=><Link href={`/profissionais/${p.public_slug||p.id}`} key={p.id} className="overflow-hidden rounded-2xl border bg-card"><ImageOrFallback src={p.avatar_url} alt={p.professional_name||p.full_name||'Profissional'} icon={Users}/><div className="p-3"><div className="flex gap-1"><h3 className="line-clamp-2 flex-1 text-sm font-semibold">{p.professional_name||p.full_name}</h3>{p.is_verified&&<BadgeCheck className="h-4 w-4 text-emerald-500"/>}</div>{p.address&&<p className="mt-2 flex items-center gap-1 truncate text-[11px] text-muted-foreground"><MapPin className="h-3 w-3"/>{p.address}</p>}{distance(p.distanceKm)&&<p className="mt-1 text-[11px] font-medium text-primary">{distance(p.distanceKm)}</p>}{Number(p.review_count||0)>0&&<p className="mt-2 flex items-center gap-1 text-[11px]"><Star className="h-3 w-3 fill-amber-500 text-amber-500"/>{Number(p.rating_avg||0).toFixed(1)} ({p.review_count})</p>}</div></Link>)}</div>:<p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Ainda não existem profissionais ativos.</p>}</PageContainer></section>
    <section className="border-b bg-muted/20 py-10 sm:py-16"><PageContainer><h2 className="mb-6 text-2xl font-bold sm:text-3xl">Espaços em destaque</h2>{spaces.length?<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{spaces.map((s:any)=><Link href={`/espacos/${s.slug||s.id}`} key={s.id} className="overflow-hidden rounded-2xl border bg-card"><ImageOrFallback src={s.cover_url||s.gallery_urls?.[0]} alt={s.name} icon={Building2}/><div className="p-3"><h3 className="line-clamp-2 text-sm font-semibold">{s.name}</h3>{s.address&&<p className="mt-2 truncate text-[11px] text-muted-foreground">{s.address}</p>}{distance(s.distanceKm)&&<p className="mt-1 text-[11px] font-medium text-primary">{distance(s.distanceKm)}</p>}</div></Link>)}</div>:null}</PageContainer></section>
    <section className="py-10 sm:py-16"><PageContainer><h2 className="mb-6 text-2xl font-bold sm:text-3xl">Próximos eventos</h2>{events.length?<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{events.map((e:any)=><Link href={`/eventos/${e.id}`} key={e.id} className="rounded-2xl border bg-card p-3"><CalendarDays className="h-5 w-5 text-primary"/><h3 className="mt-3 line-clamp-2 text-sm font-semibold">{e.title}</h3><p className="mt-2 text-[11px] text-muted-foreground">{new Date(e.start_date).toLocaleDateString('pt-PT')}</p>{distance(e.distanceKm)&&<p className="mt-1 text-[11px] font-medium text-primary">{distance(e.distanceKm)}</p>}</Link>)}</div>:null}</PageContainer></section>
  </div>
}
