'use client'

import { useRef, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { submitContactMessageAction } from '@/app/actions/contact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useModal } from '@/components/providers/modal-provider'

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const { showAlert } = useModal()

  async function submit(formData: FormData) {
    setSubmitting(true)
    try {
      await submitContactMessageAction(formData)
      formRef.current?.reset()
      showAlert('Mensagem enviada', 'Recebemos a sua mensagem. A equipa poderá responder através do email indicado.', 'success')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível enviar a mensagem.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form ref={formRef} action={submit} className="grid gap-4">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="contact-name">Nome *</Label><Input id="contact-name" name="fullName" required maxLength={120} className="min-h-11 text-base" autoComplete="name" /></div>
        <div className="space-y-2"><Label htmlFor="contact-email">Email *</Label><Input id="contact-email" name="email" type="email" required maxLength={254} className="min-h-11 text-base" autoComplete="email" /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="contact-subject">Assunto *</Label><select id="contact-subject" name="subject" required defaultValue="" className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base"><option value="" disabled>Selecionar assunto</option><option value="Suporte">Suporte</option><option value="Subscrição e faturação">Subscrição e faturação</option><option value="Parceria">Parceria</option><option value="Privacidade e dados">Privacidade e dados</option><option value="Feedback">Feedback</option><option value="Outro">Outro</option></select></div>
      <div className="space-y-2"><Label htmlFor="contact-message">Mensagem *</Label><Textarea id="contact-message" name="message" required minLength={10} maxLength={5000} rows={7} className="text-base" /></div>
      <Button type="submit" disabled={submitting} className="min-h-11 w-full sm:w-auto sm:justify-self-start">{submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}Enviar mensagem</Button>
    </form>
  )
}
