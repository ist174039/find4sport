'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { CheckCircle, Loader2, Building2, MapPin, Globe, Plus, ShieldAlert, ArrowRightLeft } from 'lucide-react'
import { ClaimSpaceModal } from '@/components/dashboard/claim-space-modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function EspacoPage() {
// ... omitting unchanged code but modifying line 140 ...
// I need to be careful with the exact replacement. Let's just grab the whole block and insert it cleanly.
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ownedSpaces, setOwnedSpaces] = useState<any[]>([])
  const [spaceId, setSpaceId] = useState<string | null>(null)
  const [unclaimedSpaces, setUnclaimedSpaces] = useState<any[]>([])
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [selectedClaimSpace, setSelectedClaimSpace] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    amenities: ''
  })

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUnclaimedSpaces(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  async function searchUnclaimedSpaces(query: string) {
    setIsSearching(true)
    const supabase = createClient()
    
    let dbQuery = supabase
      .from('sport_spaces')
      .select('id, name, address')
      .is('owner_user_id', null)
      .order('created_at', { ascending: false })
      .limit(6)
      
    if (query.trim()) {
      dbQuery = dbQuery.ilike('name', `%${query.trim()}%`)
    }
    
    const { data: unclaimed } = await dbQuery
    if (unclaimed) setUnclaimedSpaces(unclaimed)
    setIsSearching(false)
  }

  const selectSpace = (spaceData: any) => {
    setSpaceId(spaceData.id)
    setFormData({
      name: spaceData.name || '',
      description: spaceData.description || '',
      email: spaceData.email || '',
      phone: spaceData.phone || '',
      website: spaceData.website || '',
      address: spaceData.address || '',
      amenities: Array.isArray(spaceData.amenities) ? spaceData.amenities.join(', ') : ''
    })
  }

  async function fetchData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Fetch all spaces owned by this user
    const { data: spacesData } = await supabase
      .from('sport_spaces')
      .select('*')
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: true })

    if (spacesData && spacesData.length > 0) {
      setOwnedSpaces(spacesData)
      // Check if we currently have a selected space that is still valid
      const currentlySelected = spaceId ? spacesData.find(s => s.id === spaceId) : null
      if (currentlySelected) {
        selectSpace(currentlySelected)
      } else {
        selectSpace(spacesData[0])
      }
    }

    // Fetch initial unclaimed spaces
    await searchUnclaimedSpaces('')
    
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!spaceId) return
    
    setSaving(true)
    try {
      const supabase = createClient()
      
      const amenitiesArray = formData.amenities
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      const { error } = await supabase
        .from('sport_spaces')
        .update({
          name: formData.name,
          description: formData.description,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          address: formData.address,
          amenities: amenitiesArray
        })
        .eq('id', spaceId)

      if (error) throw error
      
      alert('Informações do espaço atualizadas com sucesso!')
    } catch (error) {
      console.error('Error saving space data:', error)
      alert('Erro ao guardar as alterações. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const openClaimModal = (space: any) => {
    setSelectedClaimSpace(space)
    setIsClaimModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">O Meu Espaço Desportivo</h1>
          <p className="text-muted-foreground mt-2">
            Gira as informações públicas, comodidades e contactos do seu espaço.
          </p>
        </div>
        
        {ownedSpaces.length > 1 && (
          <div className="bg-muted/30 p-1.5 rounded-xl border border-border flex items-center gap-2">
            <div className="h-8 w-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <Select 
              value={spaceId || ''} 
              onValueChange={(val) => {
                const space = ownedSpaces.find(s => s.id === val)
                if (space) selectSpace(space)
              }}
            >
              <SelectTrigger className="w-[200px] h-8 bg-background border-none shadow-sm text-sm font-semibold">
                <SelectValue placeholder="Selecione um espaço" />
              </SelectTrigger>
              <SelectContent>
                {ownedSpaces.map(space => (
                  <SelectItem key={space.id} value={space.id} className="text-sm font-medium">
                    {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Informações Gerais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name" className="text-sm font-semibold">Nome do Espaço</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="text-sm font-semibold">Descrição do Espaço</Label>
              <Textarea
                id="description"
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o seu espaço, as modalidades que oferece, a sua missão..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email de Contacto</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-sm font-semibold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Morada Completa
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ex: Rua Direita 123, 1000-001 Lisboa"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website" className="text-sm font-semibold flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-muted-foreground" />
                Website ou Link Principal
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://exemplo.com"
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-foreground">Comodidades</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities" className="text-sm font-semibold">Facilidades do Espaço</Label>
            <Textarea
              id="amenities"
              rows={3}
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              placeholder="Ex: Balneários, Estacionamento Gratuito, Wi-Fi, Cafetaria (separar por vírgulas)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Introduza as comodidades separadas por vírgula. Estas aparecerão no seu perfil público.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto font-bold rounded-xl h-11 px-8"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A Guardar...
              </>
            ) : (
              'Guardar Alterações'
            )}
          </Button>
        </div>
      </form>

      {/* Reivindicar Outro Espaço Section */}
      <div className="mt-12 bg-muted/30 border border-border rounded-xl p-6 space-y-6">
        <div className="text-center">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Gere múltiplos espaços?</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
            Se for administrador ou proprietário de outro recinto desportivo, pesquise na lista abaixo e reivindique-o.
          </p>
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Espaços Sem Gestor</h4>
            <div className="w-full sm:w-64 relative">
              <Input 
                placeholder="Pesquisar por nome..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm rounded-lg bg-background"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                )}
              </div>
            </div>
          </div>
          
          {unclaimedSpaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unclaimedSpaces.map(space => (
                <div key={space.id} className="bg-background border border-border p-4 rounded-xl flex flex-col justify-between gap-4 hover:border-primary/40 transition-colors">
                  <div>
                    <h5 className="font-bold text-sm text-foreground line-clamp-1">{space.name}</h5>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {space.address || 'Sem morada registada'}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs font-bold gap-2"
                    onClick={() => openClaimModal(space)}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Reivindicar Espaço
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8 border border-dashed border-border rounded-xl">
              {searchQuery ? 'Não encontrámos nenhum espaço sem gestor com esse nome.' : 'Não há espaços orfãos de momento.'}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">O espaço não se encontra na plataforma?</p>
          <Button asChild variant="default" className="font-bold rounded-xl">
            <Link href="/auth/registar/espaco">
              <Plus className="w-4 h-4 mr-2" />
              Registar Novo Espaço
            </Link>
          </Button>
        </div>
      </div>

      <ClaimSpaceModal 
        isOpen={isClaimModalOpen} 
        onClose={() => setIsClaimModalOpen(false)} 
        space={selectedClaimSpace}
        onSuccess={() => {
          // Refresh list or show success toast
          fetchData()
        }}
      />
    </div>
  )
}
