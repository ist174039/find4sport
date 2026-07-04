'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Plus, Trash2, UserCheck, UserX, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type Professional = {
  id: string
  full_name: string
  professional_name: string | null
  email: string | null
  bio: string | null
  photo_url: string | null
  status: string
}

export default function EspacoAssociacoesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [spaceId, setSpaceId] = useState<string | null>(null)
  const [associados, setAssociados] = useState<Professional[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Professional[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: space } = await supabase
        .from('sport_spaces')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (space) {
        setSpaceId(space.id)
        const { data: rels } = await supabase
          .from('space_professionals')
          .select('professional_id')
          .eq('space_id', space.id)

        if (rels && rels.length > 0) {
          const proIds = rels.map(r => r.professional_id)
          const { data: pros } = await supabase
            .from('professionals')
            .select('id, full_name, professional_name, email, bio, photo_url, status')
            .in('id', proIds)
          setAssociados(pros || [])
        }
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSearch = async () => {
    if (!searchTerm.trim() || !spaceId) return
    setSearching(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('professionals')
      .select('id, full_name, professional_name, email, bio, photo_url, status')
      .eq('status', 'active')
      .or(`full_name.ilike.%${searchTerm}%,professional_name.ilike.%${searchTerm}%`)
      .limit(10)
    setSearchResults(data || [])
    setSearching(false)
  }

  const handleAssociar = async (professionalId: string) => {
    if (!spaceId) return
    const supabase = createClient()
    await supabase.from('space_professionals').insert({
      space_id: spaceId,
      professional_id: professionalId,
    })
    const { data: pro } = await supabase
      .from('professionals')
      .select('id, full_name, professional_name, email, bio, photo_url, status')
      .eq('id', professionalId)
      .single()
    if (pro) {
      setAssociados([...associados, pro])
      setSearchResults(searchResults.filter(r => r.id !== professionalId))
    }
  }

  const handleRemover = async (professionalId: string) => {
    if (!spaceId) return
    const supabase = createClient()
    await supabase.from('space_professionals')
      .delete()
      .eq('space_id', spaceId)
      .eq('professional_id', professionalId)
    setAssociados(associados.filter(a => a.id !== professionalId))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Associações</h1>
        <p className="text-sm text-muted-foreground">Gere os profissionais associados ao teu espaço.</p>
      </div>

      {/* Search professionals */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Associar Profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Pesquisar por nome do profissional..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((pro) => (
                <div key={pro.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {pro.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{pro.full_name}</p>
                      <p className="text-xs text-muted-foreground">{pro.professional_name || pro.email}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleAssociar(pro.id)} className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="mr-1 h-4 w-4" /> Associar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current associations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profissionais Associados ({associados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {associados.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum profissional associado a este espaço.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {associados.map((pro) => (
                <div key={pro.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {pro.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{pro.full_name}</p>
                      <p className="text-xs text-muted-foreground">{pro.professional_name || pro.email}</p>
                    </div>
                    <Badge variant="outline" className="ml-2 bg-green-100 text-green-700">
                      {pro.status}
                    </Badge>
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleRemover(pro.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
