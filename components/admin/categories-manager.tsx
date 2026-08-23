'use client'

import { useMemo, useState } from 'react'
import { Edit3, Plus, Search, Tag, Trash2, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useModal } from '@/components/providers/modal-provider'
import { createCategoryAction, deleteCategoryAction, setCategoryActiveAction, updateCategoryAction } from '@/app/admin/(dashboard)/categorias/actions'
import type { Category, TaxonomyType } from '@/lib/types'

type FormState={name:string;slug:string;emoji:string;color:string;code:string;taxonomy_type:TaxonomyType;is_active:boolean;parent_id:string}
const labels:Record<TaxonomyType,string>={modality:'Modalidades',profession:'Profissões',specialty:'Especialidades',service:'Serviços'}
const emptyForm:FormState={name:'',slug:'',emoji:'⚽',color:'#14b8a6',code:'',taxonomy_type:'modality',is_active:true,parent_id:''}

export function CategoriesManager({initialCategories}:{initialCategories:Category[]}){
 const {showAlert,showConfirm}=useModal(); const [categories,setCategories]=useState(initialCategories); const [type,setType]=useState<TaxonomyType>('modality'); const [query,setQuery]=useState(''); const [dialogOpen,setDialogOpen]=useState(false); const [editingId,setEditingId]=useState<string|null>(null); const [form,setForm]=useState<FormState>(emptyForm); const [saving,setSaving]=useState(false)
 const counts=useMemo(()=>Object.fromEntries((Object.keys(labels) as TaxonomyType[]).map(t=>[t,categories.filter(c=>c.taxonomy_type===t).length])) as Record<TaxonomyType,number>,[categories])
 const filtered=useMemo(()=>{const q=query.trim().toLowerCase();return categories.filter(c=>c.taxonomy_type===type&&(!q||`${c.name} ${c.slug} ${c.code||''}`.toLowerCase().includes(q)))},[categories,type,query])
 const parents=categories.filter(c=>c.taxonomy_type===form.taxonomy_type&&c.id!==editingId)
 function openCreate(){setEditingId(null);setForm({...emptyForm,taxonomy_type:type});setDialogOpen(true)}
 function openEdit(c:Category){setEditingId(c.id);setForm({name:c.name,slug:c.slug,emoji:c.emoji||'',color:c.color||'#14b8a6',code:c.code||'',taxonomy_type:c.taxonomy_type as TaxonomyType,is_active:c.is_active,parent_id:c.parent_id||''});setDialogOpen(true)}
 function changeName(name:string){const slug=name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');setForm(p=>({...p,name,slug:editingId?p.slug:slug}))}
 async function save(){if(!form.name.trim())return;setSaving(true);try{const payload={...form,parent_id:form.parent_id||null};if(editingId){const u=await updateCategoryAction(editingId,payload);setCategories(p=>p.map(c=>c.id===editingId?u as Category:c))}else{const c=await createCategoryAction(payload);setCategories(p=>[...p,c as Category])}setDialogOpen(false);showAlert('Taxonomia guardada','A configuração foi atualizada.','success')}catch(e){showAlert('Erro',e instanceof Error?e.message:'Não foi possível guardar.','error')}finally{setSaving(false)}}
 async function toggle(c:Category){try{const u=await setCategoryActiveAction(c.id,!c.is_active);setCategories(p=>p.map(x=>x.id===c.id?u as Category:x))}catch(e){showAlert('Erro',e instanceof Error?e.message:'Não foi possível alterar o estado.','error')}}
 async function remove(c:Category){if(!await showConfirm('Eliminar entrada',`Eliminar “${c.name}”? Prefere desativar quando existirem relações.`,{confirmLabel:'Eliminar',destructive:true}))return;try{await deleteCategoryAction(c.id);setCategories(p=>p.filter(x=>x.id!==c.id))}catch(e){showAlert('Não foi possível eliminar',e instanceof Error?e.message:'Erro inesperado.','error')}}
 return <div className="space-y-5">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold sm:text-3xl">Gestor de Taxonomia</h1><p className="mt-1 text-sm text-muted-foreground">Configura modalidades, profissões, especialidades e serviços sem misturar conceitos.</p></div><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4"/>Nova entrada</Button></div>
  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">{(Object.keys(labels) as TaxonomyType[]).map(t=><button key={t} onClick={()=>setType(t)} className={`rounded-xl border p-4 text-left ${type===t?'border-primary bg-primary/5':'bg-card'}`}><p className="text-sm font-semibold">{labels[t]}</p><p className="mt-1 text-2xl font-bold">{counts[t]}</p></button>)}</div>
  <label className="relative block max-w-xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><input value={query} onChange={e=>setQuery(e.target.value)} type="search" placeholder={`Pesquisar ${labels[type].toLowerCase()}...`} className="h-11 w-full rounded-xl border bg-background pl-10 pr-3 outline-none"/></label>
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(c=><article key={c.id} className={`flex items-center gap-3 rounded-2xl border bg-card p-4 ${!c.is_active?'opacity-55':''}`}><div className="flex h-12 w-12 items-center justify-center rounded-xl text-xl" style={{backgroundColor:`${c.color||'#14b8a6'}20`}}>{c.emoji||<Tag className="h-5 w-5"/>}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate font-semibold">{c.name}</h2>{!c.is_active&&<span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Inativo</span>}</div><p className="truncate font-mono text-xs text-muted-foreground">{c.code||'sem código'} · {c.slug}</p></div><div className="flex"><Button variant="ghost" size="icon" onClick={()=>void toggle(c)} title={c.is_active?'Desativar':'Ativar'}><Power className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={()=>openEdit(c)}><Edit3 className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={()=>void remove(c)} className="hover:text-destructive"><Trash2 className="h-4 w-4"/></Button></div></article>)}</div>
  {filtered.length===0&&<div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhuma entrada encontrada.</div>}
  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{editingId?'Editar taxonomia':'Nova entrada'}</DialogTitle></DialogHeader><div className="space-y-4 pt-2">
   <div className="grid grid-cols-[1fr_88px] gap-3"><div><Label>Nome</Label><Input value={form.name} onChange={e=>changeName(e.target.value)}/></div><div><Label>Emoji</Label><Input value={form.emoji} onChange={e=>setForm(p=>({...p,emoji:e.target.value}))} className="text-center"/></div></div>
   <div className="grid gap-3 sm:grid-cols-2"><div><Label>Tipo</Label><select value={form.taxonomy_type} onChange={e=>setForm(p=>({...p,taxonomy_type:e.target.value as TaxonomyType,parent_id:''}))} className="h-10 w-full rounded-md border bg-background px-3">{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div><div><Label>Código</Label><Input value={form.code} onChange={e=>setForm(p=>({...p,code:e.target.value}))} placeholder="MOD-0001"/></div></div>
   <div><Label>Slug</Label><Input value={form.slug} onChange={e=>setForm(p=>({...p,slug:e.target.value}))}/></div>
   <div><Label>Pai / família</Label><select value={form.parent_id} onChange={e=>setForm(p=>({...p,parent_id:e.target.value}))} className="h-10 w-full rounded-md border bg-background px-3"><option value="">Sem pai</option>{parents.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
   <div className="flex items-center gap-3"><input id="active" type="checkbox" checked={form.is_active} onChange={e=>setForm(p=>({...p,is_active:e.target.checked}))}/><Label htmlFor="active">Ativo e disponível na plataforma</Label></div>
   <div><Label>Cor</Label><div className="flex gap-2"><input type="color" value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))} className="h-10 w-14 rounded border p-1"/><Input value={form.color} onChange={e=>setForm(p=>({...p,color:e.target.value}))}/></div></div>
   <Button onClick={()=>void save()} disabled={saving||!form.name.trim()} className="w-full">{saving?'A guardar…':'Guardar'}</Button>
  </div></DialogContent></Dialog>
 </div>
}
