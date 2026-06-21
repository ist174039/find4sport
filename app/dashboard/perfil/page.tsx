'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle, Upload, Loader2 } from 'lucide-react'
import type { Professional, Category } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  })

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Fetch categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (catData) setCategories(catData)

      // Fetch professional profile
      const { data: proData } = await supabase
        .from('professionals')
        .select(`
          *,
          professional_categories(category_id)
        `)
        .eq('user_id', user.id)
        .single()

      if (proData) {
        setProfessional(proData)
        setFormData({
          full_name: proData.full_name || '',
          professional_name: proData.professional_name || '',
          bio: proData.bio || '',
          email: proData.email || '',
          phone: proData.phone || '',
          whatsapp: proData.whatsapp || '',
          address: proData.address || '',
          website: proData.website || '',
          service_radius_km: proData.service_radius_km || 10,
        })
        setSelectedCategories(
          proData.professional_categories?.map((pc: { category_id: string }) => pc.category_id) || []
        )
      }

      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    try {
      if (professional) {
        // Update existing profile
        const { error } = await supabase
          .from('professionals')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', professional.id)

        if (error) throw error

        // Update categories
        await supabase
          .from('professional_categories')
          .delete()
          .eq('professional_id', professional.id)

        if (selectedCategories.length > 0) {
          await supabase.from('professional_categories').insert(
            selectedCategories.map((catId, index) => ({
              professional_id: professional.id,
              category_id: catId,
              is_primary: index === 0,
            }))
          )
        }
      } else {
        // Create new profile
        const { data: newPro, error } = await supabase
          .from('professionals')
          .insert({
            user_id: user.id,
            ...formData,
            public_slug: formData.professional_name
              ? formData.professional_name.toLowerCase().replace(/\s+/g, '-')
              : formData.full_name.toLowerCase().replace(/\s+/g, '-'),
          })
          .select()
          .single()

        if (error) throw error

        if (selectedCategories.length > 0 && newPro) {
          await supabase.from('professional_categories').insert(
            selectedCategories.map((catId, index) => ({
              professional_id: newPro.id,
              category_id: catId,
              is_primary: index === 0,
            }))
          )
        }

        setProfessional(newPro)
      }

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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const initials = formData.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerir as informacoes do seu perfil profissional
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>
              A sua foto aparecera no seu perfil publico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={professional?.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">{initials || 'U'}</AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Carregar foto
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informacoes Basicas</CardTitle>
            <CardDescription>
              Estas informacoes serao exibidas no seu perfil publico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome completo *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professional_name">Nome profissional</Label>
                <Input
                  id="professional_name"
                  name="professional_name"
                  value={formData.professional_name}
                  onChange={handleInputChange}
                  placeholder="Ex: Personal Trainer Joao"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Conte um pouco sobre a sua experiencia e especializacoes..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
            <CardDescription>
              Selecione as categorias em que atua (a primeira sera a principal)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id)
                return (
                  <Badge
                    key={category.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.emoji} {category.name}
                    {isSelected && <CheckCircle className="h-3 w-3 ml-1" />}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contactos</CardTitle>
            <CardDescription>
              Como os clientes podem entrar em contacto consigo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+351 912 345 678"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="+351 912 345 678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localizacao</CardTitle>
            <CardDescription>
              Onde presta os seus servicos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Morada / Zona de atuacao</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Ex: Lisboa, Portugal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_radius_km">Raio de deslocacao (km)</Label>
              <Select
                value={String(formData.service_radius_km)}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, service_radius_km: Number(value) }))
                }
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="20">20 km</SelectItem>
                  <SelectItem value="30">30 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                  <SelectItem value="100">100 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {professional ? 'Guardar alteracoes' : 'Criar perfil'}
          </Button>
        </div>
      </form>
    </div>
  )
}
