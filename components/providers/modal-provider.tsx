'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

type ModalType = 'success' | 'error' | 'info'

interface ModalContextType {
  showAlert: (title: string, message: string, type?: ModalType) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) throw new Error('useModal must be used within a ModalProvider')
  return context
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [modalContent, setModalContent] = useState<{ title: string; message: string; type: ModalType }>({ title: '', message: '', type: 'info' })

  const showAlert = useCallback((title: string, message: string, type: ModalType = 'info') => {
    setModalContent({ title, message, type })
    setOpen(true)
  }, [])

  useEffect(() => {
    const originalAlert = window.alert
    window.alert = (message?: unknown) => {
      const text = typeof message === 'string' ? message : String(message ?? '')
      const lower = text.toLowerCase()
      const type: ModalType = lower.includes('erro') || lower.includes('falh') || lower.includes('inválid') ? 'error' : 'info'
      showAlert(type === 'error' ? 'Ocorreu um problema' : 'Aviso', text, type)
    }
    return () => { window.alert = originalAlert }
  }, [showAlert])

  const close = () => setOpen(false)

  return (
    <ModalContext.Provider value={{ showAlert }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="global-modal-title">
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-xl animate-in zoom-in-95 duration-200">
            <button onClick={close} className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted" aria-label="Fechar">
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4 flex justify-center">
              {modalContent.type === 'success' && <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="h-8 w-8" /></div>}
              {modalContent.type === 'error' && <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive"><AlertTriangle className="h-8 w-8" /></div>}
              {modalContent.type === 'info' && <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><Info className="h-8 w-8" /></div>}
            </div>
            <h3 id="global-modal-title" className="mb-2 text-xl font-bold text-foreground">{modalContent.title}</h3>
            <p className="mb-6 whitespace-pre-wrap text-sm text-muted-foreground">{modalContent.message}</p>
            <button onClick={close} className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground transition-all hover:bg-primary/90">OK</button>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}
