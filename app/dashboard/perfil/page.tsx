'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'
import { CheckCircle, Upload, Loader2, User as UserIcon, Camera, MapPin, Briefcase, Globe, ExternalLink, X } from 'lucide-react'
import { QualificationsManager } from '@/components/dashboard/qualifications-manager'
import type { Professional, Category } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isProfessional, setIsProfessional] = useState(false)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    full_name: '',
    professional_name: '',
    bio: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    website: '',
    service_radius_km: 10,
    avatar_url: '',
    location: '',
    language: 'pt',
    nif: ''
  })

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      setSaving(true)

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, avatar_url: publicUrlData.publicUrl }))
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      alert(`Erro ao fazer upload: ${error?.message || 'Erro desconhecido'}`)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: proData } = await supabase
        .from('professionals')
        .select(`*, professional_categories(category_id)`)
        .eq('user_id', user.id)
        .single()

      const { data: platformUser } = await supabase
        .from('platform_users')
        .select('location, language')
        .eq('id', user.id)
        .single()

      if (proData) {
        setIsProfessional(true)
        setProfessional(proData)
        setFormData({
          full_name: proData.full_name || user.user_metadata?.full_name || '',
          professional_name: proData.professional_name || '',
          bio: proData.bio || '',
          email: proData.email || user.email || '',
          phone: proData.phone || '',
          whatsapp: proData.whatsapp || '',
          address: proData.address || '',
          website: proData.website || '',
          service_radius_km: proData.service_radius_km || 10,
          avatar_url: proData.avatar_url || user.user_metadata?.avatar_url || '',
          location: platformUser?.location || '',
          language: platformUser?.language || 'pt',
          nif: proData.nif || user.user_metadata?.nif || ''
        })
        setSelectedCategories(
          proData.professional_categories?.map((pc: { category_id: string }) => pc.category_id) || []
        )
        
        const { data: catData } = await supabase.from('categories').select('*').order('name')
        if (catData) setCategories(catData)
      } else {
        setIsProfessional(false)
        setFormData(prev => ({
          ...prev,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          location: platformUser?.location || '',
          language: platformUser?.language || 'pt',
          phone: user.user_metadata?.phone || '',
          nif: user.user_metadata?.nif || ''
        }))
      }

      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    try {
      if (isProfessional && professional) {
        await supabase
          .from('professionals')
          .update({
            full_name: formData.full_name,
            professional_name: formData.professional_name,
            bio: formData.bio,
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            address: formData.address,
            website: formData.website,
            avatar_url: formData.avatar_url,
            service_radius_km: formData.service_radius_km,
            updated_at: new Date().toISOString(),
          })
          .eq('id', professional.id)

        await supabase.from('professional_categories').delete().eq('professional_id', professional.id)
        if (selectedCategories.length > 0) {
          await supabase.from('professional_categories').insert(
            selectedCategories.map((catId, index) => ({
              professional_id: professional.id,
              category_id: catId,
              is_primary: index === 0,
            }))
          )
        }
      }

      await supabase.auth.updateUser({
        data: { 
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          phone: formData.phone,
          nif: formData.nif
        }
      })

      await supabase
        .from('platform_users')
        .update({
          full_name: formData.full_name,
          location: formData.location,
          language: formData.language
        })
        .eq('id', user.id)

      router.refresh()
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const initials = formData.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header Section - Standard Homepage Layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">O Meu Perfil</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {isProfessional ? 'Gere a tua presença pública e atualiza as tuas informações na plataforma.' : 'Atualiza os teus dados pessoais.'}
          </p>
        </div>
        
        {isProfessional && professional && (
          <Link href={`/profissionais/${professional.public_slug || professional.id}`} target="_blank">
            <Button variant="outline" className="gap-2 font-bold rounded-xl border-primary text-primary hover:bg-primary/10 shadow-sm">
              <Globe className="w-4 h-4" />
              Ver Perfil Público Online
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Button>
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Avatar Section - Standard Card */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="relative group shrink-0">
            <Avatar className="h-24 w-24 border border-border shadow-sm">
              <AvatarImage src={formData.avatar_url || undefined} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
            </Avatar>
            <label htmlFor="avatar-upload" className="cursor-pointer absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </label>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-base mb-1">Fotografia de Perfil</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-sm">Esta imagem será visível para todos os utilizadores da plataforma.</p>
            <div className="relative inline-block">
              <Button type="button" variant="outline" className="rounded-lg border-border hover:bg-muted text-xs h-9 gap-1.5 pointer-events-none">
                <Upload className="h-3.5 w-3.5" /> Alterar Foto
              </Button>
              <input 
                id="avatar-upload"
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload}
                disabled={saving}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Basic Info Section - Standard Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base border-b border-border pb-3 flex items-center gap-2">
             <UserIcon className="h-4.5 w-4.5 text-primary" /> Informações Básicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-xs font-semibold text-foreground/80">Nome completo *</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="rounded-lg h-10 bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="rounded-lg h-10 bg-muted border-border opacity-70 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold text-foreground/80">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="rounded-lg h-10 bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nif" className="text-xs font-semibold text-foreground/80">NIF</Label>
              <Input
                id="nif"
                name="nif"
                value={formData.nif}
                onChange={handleInputChange}
                className="rounded-lg h-10 bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs font-semibold text-foreground/80">Morada / Localidade</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ex: Lisboa, Portugal"
                className="rounded-lg h-10 bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language" className="text-xs font-semibold text-foreground/80">Idioma de Preferência</Label>
              <Select value={formData.language} onValueChange={(val) => setFormData(p => ({...p, language: val || 'pt'}))}>
                <SelectTrigger className="w-full rounded-lg h-10 bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">Português (PT)</SelectItem>
                  <SelectItem value="en">English (EN)</SelectItem>
                  <SelectItem value="es">Español (ES)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Professional Details */}
        {isProfessional && (
          <>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base border-b border-border pb-3 flex items-center gap-2">
                <Briefcase className="h-4.5 w-4.5 text-teal-500" /> Detalhes Profissionais
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="professional_name" className="text-xs font-semibold text-foreground/80">Nome Profissional</Label>
                <Input
                  id="professional_name"
                  name="professional_name"
                  value={formData.professional_name}
                  onChange={handleInputChange}
                  placeholder="Ex: PT João Silva"
                  className="rounded-lg h-10 bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-xs font-semibold text-foreground/80">Biografia</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Conta um pouco sobre a tua experiência..."
                  rows={4}
                  className="rounded-lg bg-background border-border resize-none text-sm"
                />
              </div>
              
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-xs font-semibold text-foreground/80 mb-2 block">Modalidades Selecionadas</Label>
                  {selectedCategories.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Nenhuma modalidade selecionada.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {selectedCategories.map((catId) => {
                        const cat = categories.find(c => c.id === catId)
                        if (!cat) return null
                        return (
                          <Badge
                            key={cat.id}
                            variant="default"
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-primary hover:bg-primary/90"
                          >
                            {cat.emoji} {cat.name}
                            <X 
                              className="h-3 w-3 cursor-pointer ml-1 hover:text-white/70" 
                              onClick={(e) => { e.preventDefault(); toggleCategory(cat.id); }} 
                            />
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="border rounded-lg overflow-hidden bg-background">
                  <Accordion className="w-full">
                    {categories.filter(c => !c.parent_id).map((parent) => {
                      const children = categories.filter(c => c.parent_id === parent.id)
                      
                      // Se não tem filhos, apresentamos a própria categoria como selecionável (fallback)
                      if (children.length === 0) {
                        const isSelected = selectedCategories.includes(parent.id)
                        return (
                          <div key={parent.id} className="p-3 border-b last:border-0 flex items-center justify-between hover:bg-muted/50">
                            <span className="text-sm font-medium">{parent.emoji} {parent.name}</span>
                            <Badge
                              variant={isSelected ? 'default' : 'outline'}
                              className={`cursor-pointer transition-all px-2.5 py-1 text-xs rounded-md ${isSelected ? 'bg-primary hover:bg-primary/90' : 'hover:bg-muted'}`}
                              onClick={() => toggleCategory(parent.id)}
                            >
                              {isSelected ? 'Selecionado' : 'Selecionar'}
                            </Badge>
                          </div>
                        )
                      }

                      return (
                        <AccordionItem value={parent.id} key={parent.id} className="border-b last:border-0 px-1">
                          <AccordionTrigger className="hover:no-underline hover:bg-muted/30 px-3 py-3 rounded-md text-sm font-semibold">
                            <div className="flex items-center gap-2">
                              <span>{parent.emoji} {parent.name}</span>
                              <Badge variant="secondary" className="text-[10px] ml-2 font-normal">
                                {children.length} opções
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-3 pb-4">
                            <div className="flex flex-wrap gap-2 pt-2">
                              {children.map(child => {
                                const isSelected = selectedCategories.includes(child.id)
                                return (
                                  <Badge
                                    key={child.id}
                                    variant={isSelected ? 'default' : 'outline'}
                                    className={`cursor-pointer transition-all px-2.5 py-1 text-xs rounded-md ${isSelected ? 'bg-primary hover:bg-primary/90' : 'hover:bg-muted'}`}
                                    onClick={() => toggleCategory(child.id)}
                                  >
                                    {child.emoji} {child.name}
                                    {isSelected && <CheckCircle className="h-3 w-3 ml-1.5" />}
                                  </Badge>
                                )
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                </div>
              </div>
            </div>

            {/* Qualifications & Certifications Manager */}
            {professional && (
              <QualificationsManager professionalId={professional.id} />
            )}

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base border-b border-border pb-3 flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-amber-500" /> Localização & Contactos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-xs font-semibold">WhatsApp Profissional</Label>
                  <Input id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} className="rounded-lg h-10 bg-background border-border" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website" className="text-xs font-semibold">Website Profissional</Label>
                  <Input id="website" name="website" type="url" value={formData.website} onChange={handleInputChange} placeholder="https://" className="rounded-lg h-10 bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs font-semibold">Morada / Zona de Atuação</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} className="rounded-lg h-10 bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_radius_km" className="text-xs font-semibold">Raio de Deslocação</Label>
                  <Select value={String(formData.service_radius_km)} onValueChange={(val) => setFormData(p => ({...p, service_radius_km: Number(val)}))}>
                    <SelectTrigger className="w-full rounded-lg h-10 bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Até 5 km</SelectItem>
                      <SelectItem value="10">Até 10 km</SelectItem>
                      <SelectItem value="20">Até 20 km</SelectItem>
                      <SelectItem value="50">Até 50 km</SelectItem>
                      <SelectItem value="100">Qualquer zona (Online)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-lg h-10 px-5 hover:bg-muted border-border transition-all">
            Cancelar
          </Button>
          <Button type="submit" disabled={saving} className="rounded-lg h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm transition-all">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar Alterações
          </Button>
        </div>
      </form>
    </div>
  )
}
