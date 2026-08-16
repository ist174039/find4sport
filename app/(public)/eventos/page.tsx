import { createAdminClient } from '@/lib/supabase/admin'
import { SearchBar } from '@/components/search-bar'
import { EventGrid } from '@/components/event-card'
import { DiscoveryEmptyState, DiscoveryPage } from '@/components/patterns/discovery-page'
import { DiscoveryTaxonomyFilter } from '@/components/discovery-taxonomy-filter'
import { DiscoveryPagination } from '@/components/patterns/discovery-pagination'
import type { Category, Event } from '@/lib/types'
import { cookies } from 'next/headers'
import { parseGeoCookie } from '@/lib/geo'

interface PageProps{searchParams:Promise<{category?:string;q?:string;location?:string;sort?:string;radius?:string;dateFrom?:string;dateTo?:string;priceMin?:string;priceMax?:string;page?:string}>}
const PAGE_SIZE=24
function branchIds(categories:Category[],selectedId:string){const ids=new Set<string>([selectedId]);let changed=true;while(changed){changed=false;for(const c of categories)if(c.parent_id&&ids.has(c.parent_id)&&!ids.has(c.id)){ids.add(c.id);changed=true}}return[...ids]}
function buildHref(base:string,filters:Record<string,string|undefined>,updates:Record<string,string|undefined|null>){const p=new URLSearchParams();Object.entries({...filters,...updates}).forEach(([k,v])=>{if(!v||(k==='sort'&&v==='upcoming')||(k==='page'&&v==='1'))return;p.set(k,v)});return p.size?`${base}?${p}`:base}

export default async function EventosPage({searchParams}:PageProps){
  const filters=await searchParams;const admin=createAdminClient();const cookieStore=await cookies();const loc=parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const{data:categoryRows,error}=await admin.from('categories').select('*').order('name');if(error)throw new Error('Não foi possível carregar as modalidades.')
  const categories=(categoryRows||[]) as Category[];const selected=filters.category?categories.find(c=>c.slug===filters.category||c.id===filters.category):undefined;const page=Math.max(1,Number.parseInt(filters.page||'1',10)||1);const sort=filters.sort||'upcoming';const categoryIds=selected?branchIds(categories,selected.id):null
  const num=(value?:string)=>{const n=Number(value);return Number.isFinite(n)&&n>0?n:null};const from=filters.dateFrom?`${filters.dateFrom}T00:00:00+00:00`:null;const to=filters.dateTo?`${filters.dateTo}T23:59:59+00:00`:null
  const{data,error:rpcError}=await (admin as any).rpc('discover_events',{p_lat:loc?.lat??null,p_lng:loc?.lng??null,p_radius:num(filters.radius),p_category_ids:categoryIds,p_q:filters.q||null,p_location:filters.location||null,p_date_from:from,p_date_to:to,p_price_min:num(filters.priceMin),p_price_max:num(filters.priceMax),p_sort:sort,p_offset:(page-1)*PAGE_SIZE,p_limit:PAGE_SIZE});if(rpcError)throw new Error(`Não foi possível carregar eventos: ${rpcError.message}`)
  const rows=(data||[]) as Array<{item:any;total_count:number|string}>;const events=rows.map(r=>r.item) as (Event&{category:Category|null;distanceKm?:number|null})[];const total=Number(rows[0]?.total_count||0);const record=filters as Record<string,string|undefined>
  const sorts=[{label:'Próximos',href:buildHref('/eventos',record,{sort:'upcoming',page:null}),active:sort==='upcoming'},...(loc?[{label:'Perto de mim',href:buildHref('/eventos',record,{sort:'distance',page:null}),active:sort==='distance'}]:[]),{label:'Preço mais baixo',href:buildHref('/eventos',record,{sort:'price_asc',page:null}),active:sort==='price_asc'},{label:'Mais vistos',href:buildHref('/eventos',record,{sort:'popular',page:null}),active:sort==='popular'}]
  return <DiscoveryPage title={selected?`Eventos de ${selected.name}`:'Eventos Desportivos'} description="Descobre apenas eventos futuros por modalidade, proximidade, preço e intervalo de datas." countLabel={`${total} ${total===1?'evento encontrado':'eventos encontrados'}`} search={<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]"><SearchBar defaultQuery={filters.q} defaultLocation={filters.location} defaultType="eventos" showType={false} basePath="/eventos" showFilters filterType="eventos" currentFilters={filters as Record<string,string>} placeholder="Pesquisar eventos…"/><DiscoveryTaxonomyFilter basePath="/eventos" categories={categories} currentCategory={filters.category} query={filters.q} location={filters.location} sort={filters.sort}/></div>} sorts={sorts} clearHref={filters.q||filters.location||filters.category||filters.radius||filters.dateFrom||filters.dateTo||filters.priceMin||filters.priceMax||sort!=='upcoming'?'/eventos':undefined}>{events.length?<><EventGrid events={events} columns={4}/><DiscoveryPagination page={page} pageSize={PAGE_SIZE} total={total} href={n=>buildHref('/eventos',record,{page:String(n)})}/></>:<DiscoveryEmptyState title="Nenhum evento futuro encontrado" description="Experimenta outro intervalo de datas, modalidade, localização ou raio." clearHref="/eventos"/>}</DiscoveryPage>
}
export const metadata={title:'Eventos Desportivos',description:'Descubra os melhores eventos desportivos em Portugal.'}
