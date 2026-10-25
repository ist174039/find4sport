import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function DiscoveryPagination({page,pageSize,total,href}:{page:number;pageSize:number;total:number;href:(page:number)=>string}){
  const pages=Math.max(1,Math.ceil(total/pageSize));if(pages<=1)return null
  const visible=[...new Set([1,page-1,page,page+1,pages].filter(n=>n>=1&&n<=pages))]
  const previousDisabled=page<=1
  const nextDisabled=page>=pages
  const controlClass='inline-flex min-h-11 items-center gap-1 rounded-xl border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
  return <nav aria-label="Paginação" className="mt-8 flex flex-wrap items-center justify-center gap-2">{previousDisabled?<span aria-disabled="true" className={`${controlClass} opacity-40`}><ChevronLeft className="h-4 w-4" aria-hidden="true"/>Anterior</span>:<Link href={href(page-1)} aria-label="Página anterior" className={`${controlClass} hover:border-primary/50`}><ChevronLeft className="h-4 w-4" aria-hidden="true"/>Anterior</Link>}{visible.map((n,i)=><span key={n} className="contents">{i>0&&visible[i-1]!==n-1?<span aria-hidden="true" className="px-1 text-muted-foreground">…</span>:null}<Link href={href(n)} aria-label={`Página ${n}`} aria-current={n===page?'page':undefined} className={`inline-flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${n===page?'border-primary bg-primary text-primary-foreground':'hover:border-primary/50'}`}>{n}</Link></span>)}{nextDisabled?<span aria-disabled="true" className={`${controlClass} opacity-40`}>Seguinte<ChevronRight className="h-4 w-4" aria-hidden="true"/></span>:<Link href={href(page+1)} aria-label="Página seguinte" className={`${controlClass} hover:border-primary/50`}>Seguinte<ChevronRight className="h-4 w-4" aria-hidden="true"/></Link>}</nav>
}
