'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { adminCreateUser } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Loader2, ArrowLeft, Check, ArrowRight } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

type Step = 'dados' | 'detalhes' | 'confirmar'

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: 'dados', label: 'Dados Básicos', icon: '1' },
  { id: 'detalhes', label: 'Contactos', icon: '2' },
  { id: 'confirmar', label: 'Confirmar', icon: '3' },
]

export default function RegisterSpacePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('dados')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    website: '',
    amenities: '',
    capacity: '',
  })

  const stepIndex = STEPS.findIndex(s => s.id === step)
  const isLastStep = step === 'confirmar'
  const isFirstStep = step === 'dados'

  function validateStep(): string | null {
    switch (step) {
      case 'dados':
        if (!formData.name.trim()) return 'Nome do Espaço é obrigatório'
        return null
      case 'detalhes':
        if (!formData.email.trim()) return 'Email é obrigatório'
        if (!formData.password.trim() || formData.password.length < 6) return 'Password é obrigatória (mín. 6 caracteres)'
        return null
      default:
        return null
    }
  }

  function handleNext() {
    const validationError = validateStep()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    const nextIndex = Math.min(stepIndex + 1, STEPS.length - 1)
    setStep(STEPS[nextIndex].id)
  }

  function handlePrev() {
    setError(null)
    const prevIndex = Math.max(stepIndex - 1, 0)
    setStep(STEPS[prevIndex].id)
  }

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      let { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Password é obrigatória e deve ter pelo menos 6 caracteres')
        }
        if (!formData.email) {
          throw new Error('Email é obrigatório')
        }
        // Create user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              type: 'espaco',
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })

        if (signUpError) {
          // If rate limited, bypass via server action (Admin API)
          if (signUpError.message.toLowerCase().includes('rate limit')) {
            const adminRes = await adminCreateUser(formData.email, formData.password, formData.name, 'espaco')
            if (adminRes.error) throw new Error(adminRes.error)
            
            // Now log the user in to get the session needed for RLS
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: formData.email,
              password: formData.password,
            })
            if (signInError) throw signInError
            user = signInData.user
          } else {
            throw signUpError
          }
        } else {
          if (!signUpData.user) throw new Error('Falha ao criar utilizador')
          user = signUpData.user
        }
      }

      if (!user) {
        throw new Error('Não foi possível autenticar o utilizador')
      }

      const { error: spaceError } = await supabase.from('sport_spaces').insert({
        name: formData.name,
        description: formData.description || null,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        amenities: formData.amenities ? formData.amenities.split(',').map((a) => a.trim()) : [],
        status: 'pending',
        created_by: user.id,
        owner_user_id: user.id,
      })

      if (spaceError) throw new Error(`Erro na base de dados (sport_spaces): ${spaceError.message}`)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registar espaço')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Registo de Espaço Desportivo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Adiciona o teu espaço à plataforma find4sport
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    stepIndex >= i
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {stepIndex > i ? '✓' : s.icon}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:inline ${
                    stepIndex >= i ? 'text-teal-600' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-8 sm:w-12 ${
                    stepIndex > i ? 'bg-teal-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 'dados' && 'Informação Básica'}
            {step === 'detalhes' && 'Contactos e Detalhes'}
            {step === 'confirmar' && 'Confirma os teus dados'}
          </CardTitle>
          <CardDescription>
            {step === 'dados' && 'Informação básica do espaço'}
            {step === 'detalhes' && 'Contactos e detalhes de acesso'}
            {step === 'confirmar' && 'Revisa toda a informação antes de submeter'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 'dados' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Espaço *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Ginásio FitPlus" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Descrição</Label>
                <Textarea id="desc" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} placeholder="Descreva o espaço..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Morada</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))} placeholder="Rua, número, cidade" />
              </div>
            </div>
          )}

          {step === 'detalhes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} placeholder="91x xxx xxx" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={formData.website} onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))} placeholder="https://..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="contacto@espaco.pt" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password * (para nova conta)</Label>
                  <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} placeholder="Mínimo 6 caracteres" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenities">Comodidades (separadas por vírgula)</Label>
                <Input id="amenities" value={formData.amenities} onChange={(e) => setFormData((p) => ({ ...p, amenities: e.target.value }))} placeholder="Estacionamento, Balneários, Bar" />
              </div>
            </div>
          )}

          {step === 'confirmar' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Dados Básicos</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Nome:</span> <span className="font-medium">{formData.name}</span></div>
                  {formData.address && <div><span className="text-gray-500">Morada:</span> <span className="font-medium">{formData.address}</span></div>}
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Contactos</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{formData.email}</span></div>
                  <div><span className="text-gray-500">Telefone:</span> <span className="font-medium">{formData.phone}</span></div>
                  {formData.website && <div className="col-span-2"><span className="text-gray-500">Website:</span> <span className="font-medium">{formData.website}</span></div>}
                </div>
              </div>

              <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
                <p className="font-medium">📋 Ao submeter, o teu espaço será analisado pela nossa equipa.</p>
                <p className="mt-1">Receberás um email assim que o processo estiver concluído (estimativa: 24-48h).</p>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {!isFirstStep && (
                <Button variant="outline" onClick={handlePrev}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
              )}
            </div>
            <div>
              {isLastStep ? (
                <Button onClick={handleSubmit} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Submeter Registo
                </Button>
              ) : (
                <Button onClick={handleNext} className="bg-teal-600 hover:bg-teal-700">
                  Próximo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
