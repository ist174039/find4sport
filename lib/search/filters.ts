export type SearchEntityType = 'todos' | 'espacos' | 'profissionais' | 'eventos' | 'comunidades'
export type SearchSort = 'relevance' | 'rating' | 'newest'
export type EventPeriod = 'all' | 'upcoming' | 'past'
export type SearchFilters = { query:string; category:string; location:string; type:SearchEntityType; rating:number|null; sort:SearchSort; radius:number|null; dateFrom:string; dateTo:string; eventPeriod:EventPeriod }
const TYPE_ALIASES:Record<string,SearchEntityType>={all:'todos',todos:'todos',spaces:'espacos',espacos:'espacos',professionals:'profissionais',profissionais:'profissionais',events:'eventos',eventos:'eventos',communities:'comunidades',comunidades:'comunidades'}
function first(value:string|string[]|undefined){return Array.isArray(value)?value[0]:value}
function clean(value:string|undefined,maxLength:number){return String(value||'').trim().replace(/[,%()]/g,' ').replace(/\s+/g,' ').slice(0,maxLength)}
function cleanDate(value:string|undefined){const v=String(value||'').trim();return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:''}
export function parseSearchFilters(searchParams:Record<string,string|string[]|undefined>):SearchFilters{
  const query=clean(first(searchParams.q),100);const category=clean(first(searchParams.category),100);const location=clean(first(searchParams.location),100)
  const rawType=clean(first(searchParams.type)||first(searchParams.tipo)||'todos',30).toLowerCase();const type=TYPE_ALIASES[rawType]||'todos'
  const parsedRating=Number(first(searchParams.rating));const rating=Number.isFinite(parsedRating)&&parsedRating>0&&parsedRating<=5?parsedRating:null
  const rawSort=clean(first(searchParams.sort)||'relevance',20);const sort:SearchSort=rawSort==='rating'||rawSort==='newest'?rawSort:'relevance'
  const rawRadius=Number(first(searchParams.radius));const radius=Number.isFinite(rawRadius)&&rawRadius>0&&rawRadius<=250?rawRadius:null
  const dateFrom=cleanDate(first(searchParams.dateFrom));const dateTo=cleanDate(first(searchParams.dateTo))
  const rawEventPeriod=clean(first(searchParams.eventPeriod)||'all',20).toLowerCase();const eventPeriod:EventPeriod=rawEventPeriod==='upcoming'||rawEventPeriod==='past'?rawEventPeriod:'all'
  return{query,category,location,type,rating,sort,radius,dateFrom,dateTo,eventPeriod}
}
export function hasActiveSearchFilters(filters:SearchFilters){return Boolean(filters.query||filters.category||filters.location||filters.type!=='todos'||filters.rating||filters.radius||filters.dateFrom||filters.dateTo||filters.eventPeriod!=='all')}
