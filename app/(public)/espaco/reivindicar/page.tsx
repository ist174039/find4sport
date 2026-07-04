'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Building2, Loader2, ArrowLeft, Shield, Check } from 'lucide-react'

export default function ClaimSpacePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({ space_id: '', proof_document: '', justification: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { error: claimError } = await supabase.from('space_claims').insert({
        space_id: formData.space_id,
        user_id: user.id,
        proof_document: formData.proof_document || null,
        justification: formData.justification || null,
        status: 'pending',
      })
      if (claimError) throw claimError
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar pedido')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Pedido Enviado!</h1>
        <p className="mb-6 text-muted-foreground">O seu pedido de reivindicação será analisado pela nossa equipa.</p>
        <Button asChild><Link href="/">Voltar</Link></Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
              <Shield className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <CardTitle>Reivindicar Espaço</CardTitle>
              <CardDescription>É proprietário de um espaço que já está na plataforma? Reivindique a sua propriedade.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            <div className="space-y-2">
              <Label>ID do Espaço *</Label>
              <Input value={formData.space_id} onChange={(e) => setFormData(p => ({...p, space_id: e.target.value}))} placeholder="Cole o ID do espaço que pretende reivindicar" required />
              <p className="text-xs text-muted-foreground">Pode encontrar o ID na página do espaço.</p>
            </div>
            <div className="space-y-2">
              <Label>Documento de Comprovativo</Label>
              <Input value={formData.proof_document} onChange={(e) => setFormData(p => ({...p, proof_document: e.target.value}))} placeholder="URL para documento (certidão, licença, etc.)" />
            </div>
            <div className="space-y-2">
              <Label>Justificação</Label>
              <Textarea value={formData.justification} onChange={(e) => setFormData(p => ({...p, justification: e.target.value}))} placeholder="Explique porque é que é o proprietário..." rows={3} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A enviar...</> : 'Enviar Pedido'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
