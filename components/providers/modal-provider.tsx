'use client'

import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

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
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info' as ModalType, confirmLabel: 'Confirmar', cancelLabel: 'Cancelar', destructive: false })
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const resolvePending = useCallback((value: boolean) => {
    resolverRef.current?.(value)
    resolverRef.current = null
  }, [])

  const close = useCallback((confirmed = false) => {
    if (mode === 'confirm') resolvePending(confirmed)
    setOpen(false)
  }, [mode, resolvePending])

  const showAlert = useCallback((title: string, message: string, type: ModalType = 'info') => {
    resolvePending(false)
    setMode('alert')
    setModalContent({ title, message, type, confirmLabel: 'OK', cancelLabel: '', destructive: false })
    setOpen(true)
  }, [resolvePending])

  const showConfirm = useCallback((title: string, message: string, options?: { confirmLabel?: string; cancelLabel?: string; destructive?: boolean }) => {
    resolvePending(false)
    setMode('confirm')
    setModalContent({ title, message, type: options?.destructive ? 'error' : 'info', confirmLabel: options?.confirmLabel || 'Confirmar', cancelLabel: options?.cancelLabel || 'Cancelar', destructive: Boolean(options?.destructive) })
    setOpen(true)
    return new Promise<boolean>(resolve => { resolverRef.current = resolve })
  }, [resolvePending])

  const Icon = modalContent.type === 'success' ? CheckCircle2 : modalContent.type === 'error' ? AlertTriangle : Info
  const iconClass = modalContent.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : modalContent.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Dialog open={open} onOpenChange={nextOpen => { if (!nextOpen) close(false); else setOpen(true) }}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl p-5 sm:max-w-sm sm:p-6">
          <DialogHeader className="text-left">
            <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}><Icon className="h-6 w-6" /></div>
            <DialogTitle className="text-xl">{modalContent.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-wrap text-sm leading-6">{modalContent.message}</DialogDescription>
          </DialogHeader>
          {mode === 'alert' ? <Button type="button" className="mt-2 min-h-11 w-full" onClick={() => close(false)}>OK</Button> : <div className="mt-2 grid grid-cols-2 gap-2"><Button type="button" variant="outline" className="min-h-11" onClick={() => close(false)}>{modalContent.cancelLabel}</Button><Button type="button" variant={modalContent.destructive ? 'destructive' : 'default'} className="min-h-11" onClick={() => close(true)}>{modalContent.confirmLabel}</Button></div>}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  )
}
