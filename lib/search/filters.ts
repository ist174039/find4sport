export type SearchEntityType = 'todos' | 'espacos' | 'profissionais' | 'eventos' | 'comunidades'
export type SearchSort = 'relevance' | 'rating' | 'newest'
export type SearchFilters = { query:string; category:string; location:string; type:SearchEntityType; rating:number|null; sort:SearchSort; radius:number|null; dateFrom:string; dateTo:string }
const TYPE_ALIASES:Record<string,SearchEntityType>={all:'todos',todos:'todos',spaces:'espacos',espacos:'espacos',professionals:'profissionais',profissionais:'profissionais',events:'eventos',eventos:'eventos',communities:'comunidades',comunidades:'comunidades'}
function first(value:string|string[]|undefined){return Array.isArray(value)?value[0]:value}
function clean(value:string|undefined,maxLength:number){return String(value||'').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/[,%()]/g,' ').replace(/\s+/g,' ').slice(0,maxLength)}
function boundedNumber(value:string|string[]|undefined,min:number,max:number){
  const raw=first(value)?.trim()||''
  if(!/^(?:\d+\.?\d*|\.\d+)$/.test(raw))return null
  const parsed=Number(raw)
  return Number.isFinite(parsed)&&parsed>=min&&parsed<=max?parsed:null
}
function cleanDate(value:string|undefined){
  const v=String(value||'').trim()
  if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return ''
  const [year,month,day]=v.split('-').map(Number)
  const date=new Date(0)
  date.setUTCFullYear(year,month-1,day)
  date.setUTCHours(0,0,0,0)
  return date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day?v:''
}
export function parseSearchFilters(searchParams:Record<string,string|string[]|undefined>):SearchFilters{
  const query=clean(first(searchParams.q),100);const category=clean(first(searchParams.category),100);const location=clean(first(searchParams.location),100)
  const rawType=clean(first(searchParams.type)||first(searchParams.tipo)||'todos',30).toLowerCase();const type=TYPE_ALIASES[rawType]||'todos'
  const rating=boundedNumber(searchParams.rating,0.01,5)
  const rawSort=clean(first(searchParams.sort)||'relevance',20);const sort:SearchSort=rawSort==='rating'||rawSort==='newest'?rawSort:'relevance'
  const radius=boundedNumber(searchParams.radius,0.01,250)
  const dateFrom=cleanDate(first(searchParams.dateFrom));let dateTo=cleanDate(first(searchParams.dateTo))
  if(dateFrom&&dateTo&&dateTo<dateFrom)dateTo=''
  return{query,category,location,type,rating,sort,radius,dateFrom,dateTo}
}
export function hasActiveSearchFilters(filters:SearchFilters){return Boolean(filters.query||filters.category||filters.location||filters.type!=='todos'||filters.rating||filters.radius||filters.dateFrom||filters.dateTo)}
