'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

export type EntityMobileTab={id:string;label:string;content:ReactNode}
export function EntityMobileTabs({tabs}:{tabs:EntityMobileTab[]}){
 const visible=tabs.filter(t=>Boolean(t.content));const[activeId,setActiveId]=useState(visible[0]?.id||'');const active=visible.find(t=>t.id===activeId)||visible[0];if(!active)return null
 return <div className="sm:hidden"><div className="sticky top-16 z-30 border-b border-border bg-background/95 shadow-sm backdrop-blur"><div className="overflow-x-auto overscroll-x-contain px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><div className="flex min-w-max gap-2" role="tablist" aria-label="Secções da página">{visible.map(tab=>{const selected=tab.id===active.id;return <button key={tab.id} type="button" role="tab" aria-selected={selected} onClick={()=>setActiveId(tab.id)} className={`min-h-10 shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${selected?'border-primary bg-primary text-primary-foreground shadow-sm':'border-border bg-background text-muted-foreground hover:bg-muted'}`}>{tab.label}</button>})}</div></div></div><div role="tabpanel" className="space-y-4 px-4 py-5 pb-6">{active.content}</div></div>
}
