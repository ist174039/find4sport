'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowLeft, Save, Loader2, Building2, Clock, Phone, Mail, Globe, Image } from 'lucide-react'
import type { SportSpace } from '@/lib/types'

export default function SpaceProfilePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>}>
      <SpaceProfileContent />
    </Suspense>
  )
}

function SpaceProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const spaceId = searchParams.get('id')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '', description: '', address: '', phone: '', email: '',
    website: '', amenities: '', opening_hours: '',
  })

  useEffect(() => {
    async function load() {
      if (!spaceId) { setLoading(false); return }
      try {
        const supabase = createClient()
        const { data } = await supabase.from('sport_spaces').select('*').eq('id', spaceId).single()
        if (data) {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            website: data.website || '',
            amenities: (data.amenities || []).join(', '),
            opening_hours: JSON.stringify(data.opening_hours || {}),
          })
        }
      } catch (err) {
        setError('Erro ao carregar espaço')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [spaceId])

  async function handleSave() {
    if (!spaceId) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const supabase = createClient()
      let openingHours = {}
      try { openingHours = JSON.parse(formData.opening_hours) } catch { openingHours = {} }

      const { error: updateError } = await supabase.from('sport_spaces').update({
        name: formData.name,
        description: formData.description || null,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : [],
        opening_hours: openingHours,
        updated_at: new Date().toISOString(),
      }).eq('id', spaceId)

      if (updateError) throw updateError
      setSuccess('Perfil atualizado com sucesso!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>

  if (!spaceId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Selecione um espaço</h2>
        <p className="mb-6 text-muted-foreground">Escolha um espaço no dashboard para editar.</p>
        <Button asChild><Link href="/espaco/dashboard">Ir para Dashboard</Link></Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/espaco/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>

      <h1 className="mb-8 text-3xl font-bold tracking-tight">Editar Espaço</h1>

      <Tabs defaultValue="info">
        <TabsList className="mb-6">
          <TabsTrigger value="info">Informação</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="gallery">Galeria</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              {error && <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}
              {success && <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-600"><Save className="h-4 w-4" />{success}</div>}

              <div className="space-y-2">
                <Label>Nome do Espaço</Label>
                <Input value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData(p => ({...p, description: e.target.value}))} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Morada</Label>
                <Input value={formData.address} onChange={(e) => setFormData(p => ({...p, address: e.target.value}))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData(p => ({...p, phone: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={formData.email} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A guardar...</> : <><Save className="mr-2 h-4 w-4" /> Guardar</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={formData.website} onChange={(e) => setFormData(p => ({...p, website: e.target.value}))} placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label>Comodidades (separadas por vírgula)</Label>
                <Input value={formData.amenities} onChange={(e) => setFormData(p => ({...p, amenities: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>Horário de Funcionamento (JSON)</Label>
                <Textarea value={formData.opening_hours} onChange={(e) => setFormData(p => ({...p, opening_hours: e.target.value}))} rows={4} placeholder='{"segunda":{"open":"09:00","close":"21:00"}}' />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A guardar...</> : <><Save className="mr-2 h-4 w-4" /> Guardar</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Image className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Galeria de Fotos</h3>
              <p className="mb-6 text-sm text-muted-foreground">Adicione fotos do seu espaço para atrair mais clientes.</p>
              <Button variant="outline">Adicionar Fotos</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
