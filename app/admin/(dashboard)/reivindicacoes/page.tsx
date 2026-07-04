'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Page() {
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null)
  const [decisionReason, setDecisionReason] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: claimsData } = await supabase
        .from('space_claims')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (claimsData) {
        const mapped = await Promise.all(claimsData.map(async (c) => {
          const { data: space } = await supabase.from('sport_spaces').select('name').eq('id', c.space_id).single()
          const { data: profile } = await supabase.from('user_profiles').select('full_name').eq('id', c.user_id).single()
          return {
            ...c,
            space_name: space?.name || 'Espaço Desconhecido',
            user_name: profile?.full_name || 'Utilizador Desconhecido'
          }
        }))
        setClaims(mapped)
        if (mapped.length > 0) {
          setSelectedClaim(mapped[0])
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleApprove = async () => {
    if (!selectedClaim) return
    const supabase = createClient()
    
    // 1. Update claim status
    const { error: claimErr } = await supabase
      .from('space_claims')
      .update({ status: 'approved' })
      .eq('id', selectedClaim.id)
    
    if (claimErr) return

    // 2. Update sport space owner and status
    await supabase
      .from('sport_spaces')
      .update({ 
        is_verified: true,
        owner_user_id: selectedClaim.user_id
      })
      .eq('id', selectedClaim.space_id)

    setClaims((prev: any[]) => prev.map(c => c.id === selectedClaim.id ? { ...c, status: 'approved' } : c))
    setSelectedClaim((prev: any) => prev ? { ...prev, status: 'approved' } : null)
    setDecisionReason('')
  }

  const handleReject = async () => {
    if (!selectedClaim) return
    const supabase = createClient()
    
    const { error } = await supabase
      .from('space_claims')
      .update({ status: 'rejected' })
      .eq('id', selectedClaim.id)
    
    if (!error) {
      setClaims((prev: any[]) => prev.map(c => c.id === selectedClaim.id ? { ...c, status: 'rejected' } : c))
      setSelectedClaim((prev: any) => prev ? { ...prev, status: 'rejected' } : null)
      setDecisionReason('')
    }
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-80px)] overflow-hidden">
{/*  Left Column: Pending Claims List (Fila de Pedidos)  */}
<aside className="w-1/4 flex flex-col gap-4 overflow-hidden">
<div className="flex justify-between items-center">
<h2 className="font-headline-md text-headline-md text-text-primary">Pendentes ({claims.filter(c => c.status === 'pending').length})</h2>
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer">filter_list</span>
</div>
<div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 scroll-hide">
  {loading ? (
    <p className="text-xs text-muted-foreground text-center py-4">A carregar claims...</p>
  ) : claims.length === 0 ? (
    <p className="text-xs text-muted-foreground text-center py-4">Nenhum claim pendente</p>
  ) : (
    claims.map((c) => {
      const isSelected = selectedClaim?.id === c.id
      return (
        <div 
          key={c.id} 
          onClick={() => setSelectedClaim(c)}
          className={`p-4 rounded-xl cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${
            isSelected 
              ? 'bg-surface-container-lowest border-primary shadow-md' 
              : 'bg-surface-container-low border-border-subtle opacity-80'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
              c.status === 'pending' ? 'bg-amber-100 text-amber-800' :
              c.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {c.status}
            </span>
            <span className="text-[10px] text-on-surface-variant">Reivindicação</span>
          </div>
          <h3 className="font-bold text-text-primary truncate">{c.user_name}</h3>
          <p className="text-label-md text-on-surface-variant mb-2 truncate">Espaço: {c.space_name}</p>
        </div>
      )
    })
  )}
</div>
</aside>
{!selectedClaim ? (
  <section className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-container-lowest border border-border-subtle rounded-xl text-center">
    <span className="material-symbols-outlined text-4xl text-muted-foreground mb-4">info</span>
    <h3 className="font-bold text-foreground">Nenhuma Reivindicação Selecionada</h3>
    <p className="text-sm text-muted-foreground mt-1">Selecione um pedido na lista à esquerda para analisar.</p>
  </section>
) : (
  <>
    <section className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 scroll-hide">
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-headline-lg text-headline-lg text-text-primary">Claim de Espaço</h1>
              <span className={`text-[12px] px-3 py-1 rounded-full font-bold ${
                selectedClaim.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                selectedClaim.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedClaim.status.toUpperCase()}
              </span>
            </div>
            <p className="text-on-surface-variant">Submetido por <span className="text-primary font-bold">{selectedClaim.user_name}</span></p>
          </div>
          <div className="text-right">
            <div className="text-label-md text-on-surface-variant uppercase font-bold tracking-widest">Espaço Alvo</div>
            <p className="text-body-md font-bold text-primary">{selectedClaim.space_name}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8">
          {/*  Detail Section  */}
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-on-surface-variant uppercase text-[12px] tracking-widest mb-2">Justificação do Pedido</h4>
              <p className="text-body-lg text-on-surface leading-relaxed">
                "{selectedClaim.justification || 'Nenhuma justificação fornecida.'}"
              </p>
            </div>
          </div>
          {/*  Documents Section  */}
          <div className="space-y-4">
            <h4 className="font-bold text-on-surface-variant uppercase text-[12px] tracking-widest">Documento de Comprovativo</h4>
            {selectedClaim.proof_document ? (
              <div className="p-4 bg-muted border border-border rounded-xl">
                <a 
                  href={selectedClaim.proof_document} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-primary font-bold hover:underline inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">description</span>
                  Visualizar Documento de Prova
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum documento anexado.</p>
            )}
          </div>
        </div>
      </div>
      {/*  Decision Area  */}
      {selectedClaim.status === 'pending' && (
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-border-subtle shadow-sm">
          <h3 className="font-headline-md text-headline-md text-text-primary mb-4">Decisão do Administrador</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-on-surface-variant uppercase text-[11px] mb-2 tracking-widest" htmlFor="reason">Motivo da Decisão (Obrigatório)</label>
              <textarea 
                className="w-full bg-background border border-border-subtle rounded-lg p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-sm" 
                id="reason" 
                placeholder="Indique os motivos detalhados para a aprovação ou rejeição deste claim..." 
                rows={4}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
              ></textarea>
            </div>
            <div className="flex items-center gap-4 justify-end pt-2">
              <button 
                onClick={handleReject}
                className="px-8 py-3 rounded-lg border-2 border-error text-error font-bold hover:bg-error/5 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
                Rejeitar Claim
              </button>
              <button 
                onClick={handleApprove}
                className="px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-container transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined">check</span>
                Aprovar Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
    {/*  Right Column: Context & Metadata  */}
    <aside className="w-1/5 flex flex-col gap-6">
      {/*  Professional Badge Stats  */}
      <div className="bg-surface-container-highest p-4 rounded-xl">
        <h4 className="font-bold text-[12px] uppercase tracking-widest text-on-surface-variant mb-4">Métricas Globais</h4>
        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="text-display-lg text-primary font-display-lg">94%</span>
            <span className="text-label-md text-on-surface-variant">SLA de Resposta</span>
          </div>
          <div className="h-1 bg-outline-variant w-full rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[94%]"></div>
          </div>
        </div>
      </div>
    </aside>
  </>
)}
    </div>
  )
}
