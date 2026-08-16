import { createAdminClient } from '@/lib/supabase/admin'
import { SearchBar } from '@/components/search-bar'
import { EventGrid } from '@/components/event-card'
import { DiscoveryEmptyState, DiscoveryPage } from '@/components/patterns/discovery-page'
import { DiscoveryTaxonomyFilter } from '@/components/discovery-taxonomy-filter'
import type { Category, Event } from '@/lib/types'
import { cookies } from 'next/headers'
import { distanceFrom, parseGeoCookie } from '@/lib/geo'

interface PageProps { searchParams: Promise<{ category?: string; q?: string; location?: string; sort?: string; radius?: string; dateFrom?: string; dateTo?: string; priceMin?: string; priceMax?: string }> }
function branchIds(categories: Category[], selectedId: string){const ids=new Set<string>([selectedId]);let changed=true;while(changed){changed=false;for(const c of categories)if(c.parent_id&&ids.has(c.parent_id)&&!ids.has(c.id)){ids.add(c.id);changed=true}}return[...ids]}

async function getEventsData(filters: Awaited<PageProps['searchParams']>) {
  const admin=createAdminClient(); const cookieStore=await cookies(); const userLocation=parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const {data:categoryRows,error:categoryError}=await admin.from('categories').select('*').order('name');if(categoryError)throw new Error('Não foi possível carregar as modalidades.')
  const categories=(categoryRows||[]) as Category[];const selectedCategory=filters.category?categories.find(item=>item.slug===filters.category||item.id===filters.category):undefined
  let query=admin.from('events').select('*').eq('status','published')
  if(filters.q)query=query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%,address.ilike.%${filters.q}%`)
  if(filters.location)query=query.ilike('address',`%${filters.location}%`)
  if(selectedCategory)query=query.in('category_id',branchIds(categories,selectedCategory.id))
  if(filters.dateFrom)query=query.gte('start_date',`${filters.dateFrom}T00:00:00`)
  if(filters.dateTo)query=query.lte('start_date',`${filters.dateTo}T23:59:59`)
  const min=Number(filters.priceMin),max=Number(filters.priceMax);if(Number.isFinite(min)&&min>0)query=query.gte('price_min',min);if(Number.isFinite(max)&&max>0)query=query.lte('price_min',max)
  const {data:eventRows,error:eventsError}=await query.limit(150);if(eventsError)throw new Error(`Não foi possível carregar eventos: ${eventsError.message}`)
  let transformed=(eventRows||[]).map(event=>({...event,category:event.category_id?categories.find(c=>c.id===event.category_id)||null:null,distanceKm:distanceFrom(userLocation,event.latitude,event.longitude)}))
  const radius=Number(filters.radius);if(userLocation&&Number.isFinite(radius)&&radius>0)transformed=transformed.filter(item=>item.distanceKm!=null&&item.distanceKm<=radius)
  const sortBy=filters.sort||'upcoming';transformed.sort((a,b)=>{if(sortBy==='newest'||sortBy==='recent')return new Date(b.created_at).getTime()-new Date(a.created_at).getTime();if(sortBy==='popular')return Number(b.views_count||0)-Number(a.views_count||0);if(sortBy==='price_asc')return Number(a.price_min||0)-Number(b.price_min||0);if(sortBy==='price_desc')return Number(b.price_min||0)-Number(a.price_min||0);if(userLocation){const d=(a.distanceKm??Infinity)-(b.distanceKm??Infinity);if(d)return d}return new Date(a.start_date).getTime()-new Date(b.start_date).getTime()})
  return{categories,events:transformed as (Event&{category:Category|null;distanceKm?:number|null})[],filters}
}
function href(base:string,filters:Record<string,string|undefined>,updates:Record<string,string|undefined|null>,defaultSort='upcoming'){const params=new URLSearchParams();Object.entries({...filters,...updates}).forEach(([key,value])=>{if(!value||(key==='sort'&&value===defaultSort))return;params.set(key,value)});return params.size?`${base}?${params}`:base}

export default async function EventosPage({searchParams}:PageProps){const resolved=await searchParams;const{categories,events,filters}=await getEventsData(resolved);const selectedCategory=categories.find(c=>c.slug===filters.category||c.id===filters.category);const currentSort=filters.sort||'upcoming';const filterRecord=filters as Record<string,string|undefined>;return <DiscoveryPage title={selectedCategory?`Eventos de ${selectedCategory.name}`:'Eventos Desportivos'} description="Descobre eventos por modalidade, proximidade, localização e intervalo de datas." countLabel={`${events.length} ${events.length===1?'evento encontrado':'eventos encontrados'}`} search={<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]"><SearchBar defaultQuery={filters.q} defaultLocation={filters.location} defaultType="eventos" showType={false} basePath="/eventos" showFilters filterType="eventos" currentFilters={filters as Record<string,string>} placeholder="Pesquisar eventos…"/><DiscoveryTaxonomyFilter basePath="/eventos" categories={categories} currentCategory={filters.category} query={filters.q} location={filters.location} sort={filters.sort}/></div>} sorts={[{label:'Próximos',href:href('/eventos',filterRecord,{sort:'upcoming'}),active:currentSort==='upcoming'},{label:'Mais recentes',href:href('/eventos',filterRecord,{sort:'newest'}),active:currentSort==='newest'},{label:'Mais vistos',href:href('/eventos',filterRecord,{sort:'popular'}),active:currentSort==='popular'}]} clearHref={filters.q||filters.location||filters.category||filters.radius||filters.dateFrom||filters.dateTo||currentSort!=='upcoming'?'/eventos':undefined}>{events.length?<EventGrid events={events} columns={3}/>:<DiscoveryEmptyState title="Nenhum evento encontrado" description="Experimenta outro intervalo de datas, modalidade, localização ou raio." clearHref="/eventos"/>}</DiscoveryPage>}
export const metadata={title:'Eventos Desportivos',description:'Descubra os melhores eventos desportivos em Portugal.'}
