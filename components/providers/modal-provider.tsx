'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

type ModalType = 'success' | 'error' | 'info'
type ModalMode = 'alert' | 'confirm'

interface ModalContextType {
  showAlert: (title: string, message: string, type?: ModalType) => void
  showConfirm: (title: string, message: string, options?: { confirmLabel?: string; cancelLabel?: string; destructive?: boolean }) => Promise<boolean>
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) throw new Error('useModal must be used within a ModalProvider')
  return context
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ModalMode>('alert')
  const [modalContent, setModalContent] = useState({
    title: '', message: '', type: 'info' as ModalType,
    confirmLabel: 'Confirmar', cancelLabel: 'Cancelar', destructive: false,
  })
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const resolvePending = useCallback((value: boolean) => {
    resolverRef.current?.(value)
    resolverRef.current = null
  }, [])

  const closeAlert = useCallback(() => setOpen(false), [])
  const closeConfirm = useCallback((value: boolean) => {
    resolvePending(value)
    setOpen(false)
  }, [resolvePending])

  const showAlert = useCallback((title: string, message: string, type: ModalType = 'info') => {
    resolvePending(false)
    setMode('alert')
    setModalContent({ title, message, type, confirmLabel: 'OK', cancelLabel: '', destructive: false })
    setOpen(true)
  }, [resolvePending])

  const showConfirm = useCallback((title: string, message: string, options?: { confirmLabel?: string; cancelLabel?: string; destructive?: boolean }) => {
    resolvePending(false)
    setMode('confirm')
    setModalContent({
      title,
      message,
      type: options?.destructive ? 'error' : 'info',
      confirmLabel: options?.confirmLabel || 'Confirmar',
      cancelLabel: options?.cancelLabel || 'Cancelar',
      destructive: Boolean(options?.destructive),
    })
    setOpen(true)
    return new Promise<boolean>(resolve => { resolverRef.current = resolve })
  }, [resolvePending])

  useEffect(() => {
    const originalAlert = window.alert
    const originalConfirm = window.confirm

    window.alert = (message?: unknown) => {
      const text = typeof message === 'string' ? message : String(message ?? '')
      const lower = text.toLowerCase()
      const type: ModalType = lower.includes('erro') || lower.includes('falh') || lower.includes('inválid') ? 'error' : 'info'
      showAlert(type === 'error' ? 'Ocorreu um problema' : 'Aviso', text, type)
    }

    window.confirm = (message?: string) => {
      void showConfirm('Confirmar ação', String(message ?? ''), { destructive: true })
      return false
    }

    return () => {
      window.alert = originalAlert
      window.confirm = originalConfirm
      resolvePending(false)
    }
  }, [resolvePending, showAlert, showConfirm])

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="global-modal-title">
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-xl animate-in zoom-in-95 duration-200">
            <button onClick={() => mode === 'confirm' ? closeConfirm(false) : closeAlert()} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted" aria-label="Fechar"><X className="h-5 w-5" /></button>
            <div className="mb-4 flex justify-center">
              {modalContent.type === 'success' && <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="h-8 w-8" /></div>}
              {modalContent.type === 'error' && <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive"><AlertTriangle className="h-8 w-8" /></div>}
              {modalContent.type === 'info' && <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><Info className="h-8 w-8" /></div>}
            </div>
            <h3 id="global-modal-title" className="mb-2 text-xl font-bold text-foreground">{modalContent.title}</h3>
            <p className="mb-6 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{modalContent.message}</p>
            {mode === 'alert' ? (
              <button onClick={closeAlert} className="min-h-11 w-full rounded-xl bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90">OK</button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => closeConfirm(false)} className="min-h-11 rounded-xl border border-border px-4 font-semibold text-foreground hover:bg-muted">{modalContent.cancelLabel}</button>
                <button onClick={() => closeConfirm(true)} className={`min-h-11 rounded-xl px-4 font-bold text-white ${modalContent.destructive ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}>{modalContent.confirmLabel}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}
