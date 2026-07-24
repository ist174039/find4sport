'use client'

import { useState } from 'react'
import {  Activity, X, CheckCircle2  } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'
import { suggestModalityAction } from '@/app/actions/modalities'

export function SuggestModalityModal() {
  const { showAlert } = useModal()
  const [open, setOpen] = useState(false)
  const [modality, setModality] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modality.trim()) return

    setLoading(true)
    try {
      await suggestModalityAction(modality)
      setSuccess(true)
    } catch (error) {
      showAlert('Erro', 'Erro ao enviar sugestão. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium shadow-sm hover:bg-primary/90 transition-all relative z-10"
      >
        Sugerir Modalidade
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 md:p-8 shadow-xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setOpen(false); setSuccess(false); setModality(''); }}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Sugestão Recebida!</h3>
                <p className="text-muted-foreground mb-6">Obrigado por ajudar a melhorar a plataforma. Vamos analisar a inclusão da modalidade "{modality}".</p>
                <button 
                  onClick={() => { setOpen(false); setSuccess(false); setModality(''); }}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Sugerir Nova Modalidade</h3>
                <p className="text-muted-foreground text-sm mb-6">Se não encontrou o desporto que procura, deixe-nos a sua sugestão. Adicionamos constantemente novas opções.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Nome da Modalidade</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={modality}
                      onChange={(e) => setModality(e.target.value)}
                      placeholder="Ex: Padel, Escalada..." 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading || !modality.trim()}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-70"
                  >
                    {loading ? 'A Enviar...' : 'Enviar Sugestão'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
