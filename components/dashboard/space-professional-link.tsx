'use client'

import { useEffect, useState, useTransition } from 'react'
import { Building2, CheckCircle, Clock, Search, User, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useModal } from '@/components/providers/modal-provider'
import {
  decideSpaceProfessionalLinkAction,
  listSpaceProfessionalLinksAction,
  removeSpaceProfessionalLinkAction,
  requestSpaceProfessionalLinkAction,
  searchSpaceProfessionalTargetsAction,
} from '@/app/actions/space-professionals'

type Mode = 'professional' | 'space'
type SearchResult = { id: string; name: string; subtitle?: string }

export function SpaceProfessionalLink({ mode, targetId }: { mode: Mode; targetId: string }) {
  const { showAlert, showConfirm } = useModal()
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [searching, startSearch] = useTransition()

  async function loadLinks() { setLoading(true); try { setLinks(await listSpaceProfessionalLinksAction(mode, targetId)) } catch (error: any) { showAlert('Erro', error?.message || 'Não foi possível carregar associações.', 'error') } finally { setLoading(false) } }
  useEffect(() => { void loadLinks() }, [mode, targetId])
  function handleSearch() { const query=searchQuery.trim(); if(query.length<2)return; startSearch(async()=>{try{setSearchResults(await searchSpaceProfessionalTargetsAction(mode,targetId,query))}catch(error:any){showAlert('Erro',error?.message||'Pesquisa indisponível.','error')}}) }
  async function requestLink(result: SearchResult) { setBusyId(result.id); try { await requestSpaceProfessionalLinkAction(mode,targetId,result.id); setSearchResults([]); setSearchQuery(''); showAlert('Pedido enviado',mode==='professional'?'O espaço terá de aprovar a associação.':'O profissional terá de aceitar o convite.','success'); await loadLinks() } catch(error:any){showAlert('Não foi possível associar',error?.message||'Tenta novamente.','error')} finally{setBusyId(null)} }
  async function decide(linkId:string,decision:'active'|'rejected'){setBusyId(linkId);try{await decideSpaceProfessionalLinkAction(mode,targetId,linkId,decision);await loadLinks()}catch(error:any){showAlert('Erro',error?.message||'Não foi possível processar o pedido.','error')}finally{setBusyId(null)}}
  async function remove(linkId:string){const confirmed=await showConfirm('Remover associação?','A ligação entre o profissional e o espaço deixará de estar ativa.',{confirmLabel:'Remover',destructive:true});if(!confirmed)return;setBusyId(linkId);try{await removeSpaceProfessionalLinkAction(mode,targetId,linkId);await loadLinks()}catch(error:any){showAlert('Erro',error?.message||'Não foi possível remover a associação.','error')}finally{setBusyId(null)}}

  return <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
    <div className="flex items-start gap-3">{mode==='professional'?<Building2 className="mt-0.5 h-5 w-5 text-primary"/>:<User className="mt-0.5 h-5 w-5 text-primary"/>}<div><h2 className="font-semibold">{mode==='professional'?'Espaços associados':'Profissionais associados'}</h2><p className="mt-1 text-sm text-muted-foreground">{mode==='professional'?'Pede associação a um espaço. O gestor terá de aprovar.':'Convida um profissional. O profissional terá de aceitar.'}</p></div></div>
    <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><Input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder={mode==='professional'?'Pesquisar espaço…':'Pesquisar profissional…'} className="min-h-11"/><Button type="button" variant="outline" onClick={handleSearch} disabled={searching||searchQuery.trim().length<2} className="min-h-11"><Search className="mr-2 h-4 w-4"/>{searching?'A pesquisar…':'Pesquisar'}</Button></div>
    {searchResults.length>0&&<div className="mt-3 grid gap-2">{searchResults.map(result=><div key={result.id} className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold">{result.name}</p>{result.subtitle&&<p className="truncate text-xs text-muted-foreground">{result.subtitle}</p>}</div><Button type="button" size="sm" onClick={()=>requestLink(result)} disabled={busyId===result.id} className="min-h-10">{mode==='professional'?'Pedir associação':'Convidar'}</Button></div>)}</div>}
    <div className="mt-5 space-y-2">{loading?<p className="py-4 text-sm text-muted-foreground">A carregar associações…</p>:links.length===0?<div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">Ainda não existem associações.</div>:links.map(link=>{const target=mode==='professional'?link.space:link.professional;const targetName=mode==='professional'?target?.name:target?.professional_name||target?.full_name;const initiatedByMe=link.initiated_by===mode;const needsDecision=link.status==='pending'&&!initiatedByMe;return <div key={link.id} className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-semibold">{targetName||'Entidade'}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">{link.status==='active'?<CheckCircle className="h-3.5 w-3.5 text-emerald-600"/>:link.status==='rejected'?<XCircle className="h-3.5 w-3.5 text-destructive"/>:<Clock className="h-3.5 w-3.5 text-amber-600"/>}{link.status==='active'?'Ativa':link.status==='rejected'?'Recusada':initiatedByMe?'A aguardar resposta':'A aguardar a sua decisão'}</p></div><div className="grid grid-cols-2 gap-2 sm:flex">{needsDecision&&<><Button type="button" size="sm" onClick={()=>decide(link.id,'active')} disabled={busyId===link.id}>Aceitar</Button><Button type="button" size="sm" variant="outline" onClick={()=>decide(link.id,'rejected')} disabled={busyId===link.id}>Recusar</Button></>}{!needsDecision&&<Button type="button" size="sm" variant="outline" className="col-span-2 text-destructive" onClick={()=>remove(link.id)} disabled={busyId===link.id}>Remover</Button>}</div></div>})}</div>
  </section>
}
