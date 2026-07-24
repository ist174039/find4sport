'use client'

import { useState } from 'react'
import {  ArrowRight, ArrowLeft, Image as ImageIcon, MapPin, Tag, Users, CheckCircle2, Trophy, Loader2  } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'
import { useRouter } from 'next/navigation'
import { createCommunityAction } from '@/app/actions/community'

export function CreateCommunityWizard() {
  const { showAlert } = useModal()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    modality: 'Futebol',
    privacy: 'pub',
    city: ''
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 3))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await createCommunityAction(formData)
      showAlert('Sucesso', 'Comunidade criada com sucesso!', 'success')
      router.push(`/comunidades/${result.id}`)
    } catch (err: any) {
      showAlert('Erro', err.message || 'Erro ao criar comunidade.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Progress Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-foreground text-center mb-8">Criar Nova Comunidade</h1>
          
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-border -z-10 transform -translate-y-1/2 rounded-full"></div>
            <div className={`absolute left-0 top-1/2 h-1 bg-primary -z-10 transform -translate-y-1/2 rounded-full transition-all duration-500`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
            
            {[1, 2, 3].map((i) => (
              <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                step >= i ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card text-muted-foreground border-2 border-border'
              }`}>
                {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-medium text-muted-foreground mt-3 px-1">
            <span>Básico</span>
            <span>Detalhes</span>
            <span>Branding</span>
          </div>
        </div>

        {/* Wizard Form Content */}
        <div className="bg-card border border-border shadow-lg rounded-3xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <div className="p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">A base da sua comunidade</h2>
                  <p className="text-muted-foreground mt-2">Dê um nome e identidade forte para o seu novo grupo desportivo.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Nome da Comunidade</label>
                    <input 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                      placeholder="Ex: Lisbon Padel Club" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Descrição Curta</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
                      placeholder="Qual é o objetivo principal desta comunidade? Quem deve participar?" 
                      required 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Categorization */}
            {step === 2 && (
              <div className="p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Tag className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Detalhes Técnicos</h2>
                  <p className="text-muted-foreground mt-2">Como os atletas vão encontrar e juntar-se à sua comunidade.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Modalidade Principal</label>
                    <select 
                      name="modality"
                      value={formData.modality}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option>Futebol</option>
                      <option>Padel</option>
                      <option>Ténis</option>
                      <option>Crossfit</option>
                      <option>Corrida</option>
                      <option>Yoga</option>
                      <option>Outra</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Localização Base</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                      <input 
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                        placeholder="Ex: Lisboa, Portugal" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-3">Privacidade</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className={`cursor-pointer border p-4 rounded-xl flex items-start gap-3 transition-all ${formData.privacy === 'pub' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}>
                        <input type="radio" name="privacy" value="pub" checked={formData.privacy === 'pub'} onChange={handleChange} className="mt-1" />
                        <div>
                          <span className="font-bold text-sm block text-foreground">Pública</span>
                          <span className="text-xs text-muted-foreground">Qualquer um pode aderir de imediato.</span>
                        </div>
                      </label>
                      <label className={`cursor-pointer border p-4 rounded-xl flex items-start gap-3 transition-all ${formData.privacy === 'priv' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}>
                        <input type="radio" name="privacy" value="priv" checked={formData.privacy === 'priv'} onChange={handleChange} className="mt-1" />
                        <div>
                          <span className="font-bold text-sm block text-foreground">Privada</span>
                          <span className="text-xs text-muted-foreground">Requer aprovação para adesão.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Visuals & Preview */}
            {step === 3 && (
              <div className="p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Identidade Visual</h2>
                  <p className="text-muted-foreground mt-2">Dê uma cara ao seu projeto (Pode adicionar imagens mais tarde).</p>
                </div>

                <div className="space-y-8">
                  {/* Live Preview Card */}
                  <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="h-32 bg-muted relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
                      <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-2xl bg-white border-2 border-border shadow-md flex items-center justify-center">
                        <Users className="text-primary h-6 w-6" />
                      </div>
                    </div>
                    <div className="pt-10 px-6 pb-6 bg-card">
                      <h3 className="font-bold text-xl text-foreground mb-1">{formData.name || 'Nome da Comunidade'}</h3>
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">{formData.modality}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{formData.description || 'Descrição da sua comunidade aparecerá aqui...'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="p-6 bg-muted/30 border-t border-border flex items-center justify-between">
              {step > 1 ? (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="px-6 py-2.5 rounded-xl font-bold text-foreground bg-background border border-border shadow-sm hover:bg-muted transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Anterior
                </button>
              ) : (
                <div></div> // Spacer
              )}

              {step < 3 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="px-8 py-2.5 rounded-xl font-bold text-primary-foreground bg-primary shadow-md hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  Próximo Passo <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-2.5 rounded-xl font-bold text-primary-foreground bg-primary shadow-md hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Publicar Comunidade
                </button>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
