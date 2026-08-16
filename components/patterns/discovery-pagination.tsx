import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function DiscoveryPagination({page,pageSize,total,href}:{page:number;pageSize:number;total:number;href:(page:number)=>string}){
  const pages=Math.max(1,Math.ceil(total/pageSize));if(pages<=1)return null
  const visible=[...new Set([1,page-1,page,page+1,pages].filter(n=>n>=1&&n<=pages))]
  return <nav aria-label="Paginação" className="mt-8 flex flex-wrap items-center justify-center gap-2"><Link aria-disabled={page<=1} href={href(Math.max(1,page-1))} className={`inline-flex min-h-11 items-center gap-1 rounded-xl border px-3 text-sm font-medium ${page<=1?'pointer-events-none opacity-40':'hover:border-primary/50'}`}><ChevronLeft className="h-4 w-4"/>Anterior</Link>{visible.map((n,i)=><span key={n} className="contents">{i>0&&visible[i-1]!==n-1?<span className="px-1 text-muted-foreground">…</span>:null}<Link href={href(n)} aria-current={n===page?'page':undefined} className={`inline-flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold ${n===page?'border-primary bg-primary text-primary-foreground':'hover:border-primary/50'}`}>{n}</Link></span>)}<Link aria-disabled={page>=pages} href={href(Math.min(pages,page+1))} className={`inline-flex min-h-11 items-center gap-1 rounded-xl border px-3 text-sm font-medium ${page>=pages?'pointer-events-none opacity-40':'hover:border-primary/50'}`}>Seguinte<ChevronRight className="h-4 w-4"/></Link></nav>
}
