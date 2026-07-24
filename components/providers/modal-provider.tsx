'use client'

import React, { createContext, useContext, useState } from 'react'
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

type ModalType = 'success' | 'error' | 'info'

interface ModalContextType {
  showAlert: (title: string, message: string, type?: ModalType) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [modalContent, setModalContent] = useState<{ title: string; message: string; type: ModalType }>({
    title: '',
    message: '',
    type: 'info'
  })

  const showAlert = (title: string, message: string, type: ModalType = 'info') => {
    setModalContent({ title, message, type })
    setOpen(true)
  }

  const close = () => setOpen(false)

  return (
    <ModalContext.Provider value={{ showAlert }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-xl relative animate-in zoom-in-95 duration-200 text-center">
            <button 
              onClick={close}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex justify-center mb-4">
              {modalContent.type === 'success' && (
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              )}
              {modalContent.type === 'error' && (
                <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              )}
              {modalContent.type === 'info' && (
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Info className="w-8 h-8" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">{modalContent.title}</h3>
            <p className="text-muted-foreground text-sm mb-6">{modalContent.message}</p>
            
            <button 
              onClick={close}
              className="w-full py-3 rounded-xl font-bold transition-all bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Ok, entendi
            </button>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}
