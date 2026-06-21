'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Shield, ShieldOff } from 'lucide-react'

type UserProfile = {
  id: string
  email: string | null
  full_name: string | null
  role: string
  created_at: string
  status: string | null
}

export default function AdminUtilizadoresPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filtered, setFiltered] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'admin') { router.push('/'); return }

      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  useEffect(() => {
    let result = users
    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter)
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(u =>
        u.full_name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      )
    }
    setFiltered(result)
  }, [search, roleFilter, users])

  const toggleAdmin = async (userId: string, currentRole: string) => {
    const supabase = createClient()
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    await supabase.from('user_profiles').update({ role: newRole }).eq('id', userId)
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    professional: 'bg-blue-100 text-blue-700',
    space_owner: 'bg-green-100 text-green-700',
    user: 'bg-gray-100 text-gray-600',
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Utilizadores</h1>
          <p className="text-sm text-muted-foreground">Gerir utilizadores e permissões da plataforma.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filtrar role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="user">Utilizador</SelectItem>
              <SelectItem value="professional">Profissional</SelectItem>
              <SelectItem value="space_owner">Espaço</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum utilizador encontrado.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {u.full_name?.charAt(0) || u.email?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{u.full_name || 'Sem nome'}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={roleColors[u.role] || ''}>
                      {u.role === 'admin' ? 'Admin'
                        : u.role === 'professional' ? 'Profissional'
                          : u.role === 'space_owner' ? 'Espaço'
                            : 'Utilizador'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleAdmin(u.id, u.role)}
                      title={u.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                    >
                      {u.role === 'admin' ? <ShieldOff className="h-4 w-4 text-red-500" /> : <Shield className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
