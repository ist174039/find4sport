'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ShieldCheck, Upload, FileText, CheckCircle2 } from 'lucide-react'

interface ClaimSpaceModalProps {
  isOpen: boolean
  onClose: () => void
  space: { id: string; name: string; address?: string } | null
  onSuccess: () => void
}

export function ClaimSpaceModal({ isOpen, onClose, space, onSuccess }: ClaimSpaceModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [documentUrl, setDocumentUrl] = useState<string>('')
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        setDocumentUrl(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!space) return
    setLoading(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Não autenticado")

      const { error } = await supabase.from('space_claims').insert({
        space_id: space.id,
        user_id: user.id,
        message: message,
        documents_url: documentUrl || null,
        status: 'pending'
      })

      if (error) throw error

      setStep(2) // Move to success step
    } catch (err: any) {
      console.error(err)
      alert("Ocorreu um erro ao submeter a sua reivindicação. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset state after a small delay to allow animation to finish
    setTimeout(() => {
      setStep(1)
      setMessage('')
      setDocumentUrl('')
      setFileName(null)
    }, 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Reivindicar Espaço Desportivo
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Siga os passos abaixo para comprovar que é o gestor deste espaço.' : ''}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && space && (
          <div className="space-y-6 py-4">
            <div className="bg-muted/50 p-4 rounded-xl border border-border">
              <h4 className="font-bold text-foreground text-sm">Espaço Selecionado</h4>
              <p className="text-sm font-medium mt-1">{space.name}</p>
              {space.address && <p className="text-xs text-muted-foreground mt-0.5">{space.address}</p>}
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Mensagem / Justificação *</Label>
              <Textarea 
                placeholder="Por favor, explique qual a sua relação com o espaço (ex: Sou o proprietário, presidente do clube, etc)..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Documento Comprovativo (Opcional)</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 bg-muted/20 hover:bg-muted/40 transition-colors">
                <input
                  type="file"
                  id="claim-document"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Label
                  htmlFor="claim-document"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    {fileName ? <FileText className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {fileName ? fileName : 'Clique para enviar um documento'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, JPG ou PNG (Máx. 5MB)
                    </p>
                  </div>
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !message.trim()} className="font-bold">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submeter Pedido
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Pedido Submetido!</h3>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                O seu pedido de reivindicação foi enviado para a nossa equipa. Iremos rever a informação e notificá-lo brevemente.
              </p>
            </div>
            <Button onClick={() => { handleClose(); onSuccess(); }} className="mt-4 w-full sm:w-auto font-bold px-8">
              Concluir
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
