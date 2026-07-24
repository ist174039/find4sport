'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { adminCreateUser } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Check, ArrowLeft, ArrowRight, Upload, X, Image, GraduationCap, Briefcase, Camera } from 'lucide-react'
import type { Category } from '@/lib/types'

type Step = 'dados' | 'categorias' | 'qualificacoes' | 'galeria' | 'confirmar'

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: 'dados', label: 'Dados', icon: '1' },
  { id: 'categorias', label: 'Categorias', icon: '2' },
  { id: 'qualificacoes', label: 'Qualificações', icon: '3' },
  { id: 'galeria', label: 'Galeria', icon: '4' },
  { id: 'confirmar', label: 'Confirmar', icon: '5' },
]

export default function ProfessionalRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('dados')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  // Step 1: Dados
  const [formData, setFormData] = useState({
    full_name: '',
    professional_name: '',
    bio: '',
    email: '',
    password: '',
    phone: '',
    whatsapp: '',
    address: '',
    website: '',
    service_radius_km: 10,
    nif: '',
  })

  // Step 2: Categorias
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Step 3: Qualificações
  const [qualifications, setQualifications] = useState<{ title: string; issuer: string; issue_date: string }[]>([])
  const [newQual, setNewQual] = useState({ title: '', issuer: '', issue_date: '' })

  // Step 4: Galeria
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [newPhotoUrl, setNewPhotoUrl] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Check if already a professional
        if (user) {
          const { data: existing } = await supabase
            .from('professionals')
            .select('id')
            .eq('user_id', user.id)
            .single()

          if (existing) {
            router.push('/profissional/estado')
            return
          }
        }

        // Load categories
        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .order('name')
        if (cats) setCategories(cats)

        // Pre-fill name from auth
        if (user) {
          setFormData(prev => ({
            ...prev,
            full_name: user.user_metadata?.full_name || '',
            email: user.email || '',
          }))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const stepIndex = STEPS.findIndex(s => s.id === step)
  const isLastStep = step === 'confirmar'
  const isFirstStep = step === 'dados'

  function validateStep(): string | null {
    switch (step) {
      case 'dados':
        if (!formData.full_name.trim()) return 'Nome completo é obrigatório'
        if (!formData.email.trim()) return 'Email é obrigatório'
        if (!formData.password.trim() || formData.password.length < 6) return 'Password é obrigatória (mín. 6 caracteres)'
        if (!formData.phone.trim()) return 'Telefone é obrigatório'
        return null
      case 'categorias':
        if (selectedCategories.length === 0) return 'Seleciona pelo menos uma categoria'
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

  function toggleCategory(categoryId: string) {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      }
      if (prev.length >= 5) return prev
      return [...prev, categoryId]
    })
  }

  function addQualification() {
    if (!newQual.title.trim()) return
    setQualifications(prev => [...prev, { ...newQual, issue_date: newQual.issue_date || new Date().toISOString().split('T')[0] }])
    setNewQual({ title: '', issuer: '', issue_date: '' })
  }

  function removeQualification(index: number) {
    setQualifications(prev => prev.filter((_, i) => i !== index))
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  function addPhoto() {
    if (!newPhotoUrl.trim()) return
    setGalleryUrls(prev => [...prev, newPhotoUrl.trim()])
    setNewPhotoUrl('')
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    files.forEach(file => {
      if (galleryUrls.length >= 12) return
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (result) {
          setGalleryUrls(prev => {
            if (prev.length >= 12) return prev
            return [...prev, result]
          })
        }
      }
      reader.readAsDataURL(file)
    })

    if (e.target) e.target.value = ''
  }

  function removePhoto(index: number) {
    setGalleryUrls(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      let { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Create user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              type: 'profissional',
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })

        if (signUpError) {
          // If rate limited, bypass via server action (Admin API)
          if (signUpError.message.toLowerCase().includes('rate limit')) {
            const adminRes = await adminCreateUser(formData.email, formData.password, formData.full_name, 'profissional')
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

      if (!user) throw new Error('Não autenticado')

      // Create professional profile
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .insert({
          user_id: user.id,
          full_name: formData.full_name,
          professional_name: formData.professional_name || null,
          bio: formData.bio || null,
          email: formData.email,
          phone: formData.phone || null,
          whatsapp: formData.whatsapp || null,
          address: formData.address || null,
          website: formData.website || null,
          service_radius_km: formData.service_radius_km,
          nif: formData.nif || null,
          status: 'pending',
          gallery_urls: galleryUrls.length > 0 ? galleryUrls : null,
        })
        .select('id')
        .single()

      if (profError) throw new Error(`Erro na base de dados (professionals): ${profError.message}`)

      // Add categories
      if (selectedCategories.length > 0 && professional) {
        const { error: catError } = await supabase
          .from('professional_categories')
          .insert(selectedCategories.map(catId => ({
            professional_id: professional.id,
            category_id: catId,
          })))
        if (catError) console.error('Error adding categories:', catError)
      }

      // Add qualifications
      if (qualifications.length > 0 && professional) {
        const { error: qualError } = await supabase
          .from('qualifications')
          .insert(qualifications.map(q => ({
            professional_id: professional.id,
            title: q.title,
            issuer: q.issuer || null,
            issue_date: q.issue_date || null,
          })))
        if (qualError) console.error('Error adding qualifications:', qualError)
      }

      // Update user type
      await supabase.from('platform_users').upsert({
        id: user.id,
        type: 'profissional',
      })

      router.push('/profissional/estado')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao submeter registo')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Registo Profissional</h1>
        <p className="mt-1 text-sm text-gray-500">
          Cria o teu perfil profissional na plataforma find4sport
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

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 'dados' && 'Dados Pessoais'}
            {step === 'categorias' && 'Seleciona as tuas categorias'}
            {step === 'qualificacoes' && 'Qualificações e Certificações'}
            {step === 'galeria' && 'Galeria de Fotos'}
            {step === 'confirmar' && 'Confirma os teus dados'}
          </CardTitle>
          <CardDescription>
            {step === 'dados' && 'Informação básica do teu perfil profissional'}
            {step === 'categorias' && 'Escolhe as áreas onde actuas (máx. 5)'}
            {step === 'qualificacoes' && 'Adiciona as tuas certificações e formações'}
            {step === 'galeria' && 'Adiciona fotos do teu trabalho (máx. 12)'}
            {step === 'confirmar' && 'Revisa toda a informação antes de submeter'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Dados */}
          {step === 'dados' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professional_name">Nome Profissional</Label>
                  <Input
                    id="professional_name"
                    value={formData.professional_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, professional_name: e.target.value }))}
                    placeholder="Personal Trainer João"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Descreve a tua experiência, especialidades e abordagem profissional..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telemóvel *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+351 912 345 678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+351 912 345 678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input
                    id="nif"
                    value={formData.nif}
                    onChange={(e) => setFormData(prev => ({ ...prev, nif: e.target.value }))}
                    placeholder="123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Morada</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua das Flores, 123, Lisboa"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://meusite.pt"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius">Raio de Acção (km)</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={formData.service_radius_km}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_radius_km: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Categorias */}
          {step === 'categorias' && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {selectedCategories.length}/5 selecionadas
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      } ${selectedCategories.length >= 5 && !isSelected ? 'opacity-50' : ''}`}
                    >
                      <span className="mb-1 text-2xl">{cat.emoji || '🏷️'}</span>
                      <span className={`text-sm font-medium ${isSelected ? 'text-teal-700' : 'text-gray-700'}`}>
                        {cat.name}
                      </span>
                      {isSelected && (
                        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              {categories.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-500">
                  Nenhuma categoria disponível de momento.
                </p>
              )}
            </div>
          )}

          {/* Step 3: Qualificações */}
          {step === 'qualificacoes' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Título / Certificação</Label>
                    <Input
                      value={newQual.title}
                      onChange={(e) => setNewQual(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Licenciatura em Educação Física"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Entidade</Label>
                    <Input
                      value={newQual.issuer}
                      onChange={(e) => setNewQual(prev => ({ ...prev, issuer: e.target.value }))}
                      placeholder="Universidade de Lisboa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={newQual.issue_date}
                      onChange={(e) => setNewQual(prev => ({ ...prev, issue_date: e.target.value }))}
                    />
                  </div>
                </div>
                <Button
                  onClick={addQualification}
                  disabled={!newQual.title.trim()}
                  className="mt-3 bg-teal-600 hover:bg-teal-700"
                  size="sm"
                >
                  <GraduationCap className="mr-1 h-4 w-4" /> Adicionar
                </Button>
              </div>

              {qualifications.length > 0 && (
                <div className="space-y-2">
                  {qualifications.map((qual, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{qual.title}</p>
                          <p className="text-xs text-gray-500">{qual.issuer} · {qual.issue_date}</p>
                        </div>
                      </div>
                      <button onClick={() => removeQualification(i)} className="text-red-400 hover:text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {qualifications.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
                  <Briefcase className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">Adiciona as tuas certificações e formações</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Galeria */}
          {step === 'galeria' && (
            <div className="space-y-6">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                multiple
                className="hidden"
              />

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={galleryUrls.length >= 12}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-6 py-2.5 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    <Upload className="h-4 w-4" />
                    Carregar Ficheiros do PC
                  </Button>
                  <span className="text-xs text-gray-400 font-medium">ou</span>
                </div>

                <div className="pt-2 border-t border-gray-200/60">
                  <Label className="text-xs text-gray-600 mb-1 block text-left sm:text-center">Adicionar por URL de imagem:</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="https://exemplo.com/foto.jpg"
                      className="bg-white rounded-xl text-sm"
                    />
                    <Button
                      type="button"
                      onClick={addPhoto}
                      disabled={!newPhotoUrl.trim() || galleryUrls.length >= 12}
                      variant="outline"
                      className="rounded-xl shrink-0"
                    >
                      <Image className="mr-1 h-4 w-4" /> Adicionar
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-medium">{galleryUrls.length}/12 fotos adicionadas</p>
              </div>

              {galleryUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {galleryUrls.map((url, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
                      <img
                        src={url}
                        alt={`Foto ${i + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/e2e8f0/94a3b8?text=Sem+Imagem' }}
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-md cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {galleryUrls.length === 0 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-gray-300 hover:border-teal-500 p-8 text-center cursor-pointer transition-colors bg-white hover:bg-teal-50/20"
                >
                  <Camera className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm font-semibold text-gray-700">Clica aqui para escolher fotos do teu computador</p>
                  <p className="text-xs text-gray-400 mt-1">Formatos suportados: JPG, PNG, WEBP (máx. 12 fotos)</p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Confirmar */}
          {step === 'confirmar' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Dados Pessoais</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Nome:</span> <span className="font-medium">{formData.full_name}</span></div>
                  {formData.professional_name && <div><span className="text-gray-500">Nome Prof.:</span> <span className="font-medium">{formData.professional_name}</span></div>}
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{formData.email}</span></div>
                  <div><span className="text-gray-500">Telefone:</span> <span className="font-medium">{formData.phone}</span></div>
                  {formData.address && <div className="col-span-2"><span className="text-gray-500">Morada:</span> <span className="font-medium">{formData.address}</span></div>}
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Categorias ({selectedCategories.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.filter(c => selectedCategories.includes(c.id)).map(cat => (
                    <Badge key={cat.id} variant="secondary">
                      {cat.emoji} {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {qualifications.length > 0 && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Qualificações ({qualifications.length})</h4>
                  <div className="space-y-2">
                    {qualifications.map((qual, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-teal-600" />
                        <span className="font-medium">{qual.title}</span>
                        <span className="text-gray-500">— {qual.issuer}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {galleryUrls.length > 0 && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">Galeria ({galleryUrls.length} fotos)</h4>
                  <div className="flex gap-2 overflow-x-auto">
                    {galleryUrls.map((url, i) => (
                      <div key={i} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-200">
                        <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
                <p className="font-medium">📋 Ao submeter, o teu perfil será analisado pela nossa equipa.</p>
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
