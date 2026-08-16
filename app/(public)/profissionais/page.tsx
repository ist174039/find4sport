import { createAdminClient } from '@/lib/supabase/admin'
import { SearchBar } from '@/components/search-bar'
import { ProfessionalGrid } from '@/components/professional-card'
import { DiscoveryEmptyState, DiscoveryPage } from '@/components/patterns/discovery-page'
import { DiscoveryTaxonomyFilter } from '@/components/discovery-taxonomy-filter'
import { DiscoveryPagination } from '@/components/patterns/discovery-pagination'
import type { Category, Professional } from '@/lib/types'
import { cookies } from 'next/headers'
import { parseGeoCookie } from '@/lib/geo'

interface PageProps{searchParams:Promise<{category?:string;q?:string;location?:string;sort?:string;radius?:string;rating?:string;priceMin?:string;priceMax?:string;page?:string}>}
const PAGE_SIZE=24
function branchIds(categories:Category[],selectedId:string){const ids=new Set<string>([selectedId]);let changed=true;while(changed){changed=false;for(const c of categories)if(c.parent_id&&ids.has(c.parent_id)&&!ids.has(c.id)){ids.add(c.id);changed=true}}return[...ids]}
function buildHref(base:string,filters:Record<string,string|undefined>,updates:Record<string,string|undefined|null>){const p=new URLSearchParams();Object.entries({...filters,...updates}).forEach(([k,v])=>{if(!v||(k==='sort'&&v==='relevance')||(k==='page'&&v==='1'))return;p.set(k,v)});return p.size?`${base}?${p}`:base}

export default async function ProfissionaisPage({searchParams}:PageProps){
  const filters=await searchParams;const admin=createAdminClient();const cookieStore=await cookies();const loc=parseGeoCookie(cookieStore.get('f4s_geo')?.value)
  const{data:categoryRows,error}=await admin.from('categories').select('*').order('name');if(error)throw new Error('Não foi possível carregar as modalidades.')
  const categories=(categoryRows||[]) as Category[];const selected=filters.category?categories.find(c=>c.slug===filters.category||c.id===filters.category):undefined
  const page=Math.max(1,Number.parseInt(filters.page||'1',10)||1);const sort=filters.sort||'relevance';const categoryIds=selected?branchIds(categories,selected.id):null
  const num=(value?:string)=>{const n=Number(value);return Number.isFinite(n)&&n>0?n:null}
  const {data,error:rpcError}=await (admin as any).rpc('discover_professionals',{p_lat:loc?.latitude??null,p_lng:loc?.longitude??null,p_radius:num(filters.radius),p_category_ids:categoryIds,p_q:filters.q||null,p_location:filters.location||null,p_rating:num(filters.rating),p_price_min:num(filters.priceMin),p_price_max:num(filters.priceMax),p_sort:sort,p_offset:(page-1)*PAGE_SIZE,p_limit:PAGE_SIZE})
  if(rpcError)throw new Error(`Não foi possível carregar profissionais: ${rpcError.message}`)
  const rows=(data||[]) as Array<{item:any;total_count:number|string}>;const professionals=rows.map(r=>r.item) as (Professional&{categories:Category[];distanceKm?:number|null;averagePrice?:number|null})[];const total=Number(rows[0]?.total_count||0);const record=filters as Record<string,string|undefined>
  const sortChips=[...(loc?[{label:'Mais próximos',href:buildHref('/profissionais',record,{sort:'distance',page:null}),active:sort==='distance'||sort==='relevance'}]:[{label:'Relevância',href:buildHref('/profissionais',record,{sort:'relevance',page:null}),active:sort==='relevance'}]),{label:'Melhor avaliados',href:buildHref('/profissionais',record,{sort:'rating',page:null}),active:sort==='rating'},{label:'Preço mais baixo',href:buildHref('/profissionais',record,{sort:'price_asc',page:null}),active:sort==='price_asc'},{label:'Mais recentes',href:buildHref('/profissionais',record,{sort:'newest',page:null}),active:sort==='newest'}]
  return <DiscoveryPage title={selected?`Profissionais de ${selected.name}`:'Profissionais de Desporto'} description="Encontra profissionais ativos por modalidade, proximidade, preço e reputação." countLabel={`${total} ${total===1?'profissional encontrado':'profissionais encontrados'}`} search={<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]"><SearchBar defaultQuery={filters.q} defaultLocation={filters.location} defaultType="profissionais" showType={false} basePath="/profissionais" showFilters filterType="profissionais" currentFilters={filters as Record<string,string>} placeholder="Pesquisar profissionais…"/><DiscoveryTaxonomyFilter basePath="/profissionais" categories={categories} currentCategory={filters.category} query={filters.q} location={filters.location} sort={filters.sort}/></div>} sorts={sortChips} clearHref={filters.q||filters.location||filters.category||filters.radius||filters.priceMin||filters.priceMax||sort!=='relevance'?'/profissionais':undefined}>{professionals.length?<><ProfessionalGrid professionals={professionals} columns={4}/><DiscoveryPagination page={page} pageSize={PAGE_SIZE} total={total} href={n=>buildHref('/profissionais',record,{page:String(n)})}/></>:<DiscoveryEmptyState title="Nenhum profissional encontrado" description="Não existem profissionais ativos para esta combinação de filtros ou raio." clearHref="/profissionais"/>}</DiscoveryPage>
}
export const metadata={title:'Profissionais de Desporto',description:'Encontre profissionais de desporto em Portugal.'}
