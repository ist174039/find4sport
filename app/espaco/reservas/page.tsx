'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertCircle, Check, X, CalendarCheck, Clock, User, Loader2,
} from 'lucide-react'

type Booking = {
  id: string
  sub_space_id: string | null
  space_id: string
  user_id: string
  date: string
  start_time: string
  end_time: string
  status: string
  notes: string | null
  created_at: string
  user?: { full_name: string; email: string; phone?: string }
  sub_space?: { name: string }
}

export default function BookingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [spaces, setSpaces] = useState<{ id: string; name: string }[]>([])
  const [selectedSpace, setSelectedSpace] = useState<string>('')
  const [filter, setFilter] = useState<string>('pending')
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: s } = await supabase.from('sport_spaces').select('id, name').eq('owner_user_id', user.id)
    setSpaces(s || [])
    if (s && s.length > 0) {
      setSelectedSpace(s[0].id)
      await loadBookings(s[0].id, filter)
    }
    setLoading(false)
  }

  async function loadBookings(spaceId: string, statusFilter: string) {
    const supabase = createClient()
    let query = supabase.from('bookings').select('*, user:user_id(full_name, email, phone), sub_space:sub_space_id(name)').eq('space_id', spaceId)
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    const { data } = await query.order('date', { ascending: false }).limit(50)
    setBookings(data || [])
  }

  useState(() => { load() })

  async function handleSpaceChange(id: string) {
    setSelectedSpace(id)
    setLoading(true)
    await loadBookings(id, filter)
    setLoading(false)
  }

  async function handleFilterChange(f: string) {
    setFilter(f)
    if (selectedSpace) await loadBookings(selectedSpace, f)
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600',
    confirmed: 'bg-green-500/10 text-green-600',
    cancelled: 'bg-destructive/10 text-destructive',
    completed: 'bg-blue-500/10 text-blue-600',
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pendente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Concluída',
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Reservas</h1>
      <p className="mb-8 text-muted-foreground">Gerir pedidos de reserva dos utilizadores</p>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <Label>Espaço</Label>
          <select className="mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedSpace} onChange={(e) => handleSpaceChange(e.target.value)}>
            {spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex gap-1">
          {['pending', 'confirmed', 'completed', 'cancelled', 'all'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => handleFilterChange(f)}>
              {f === 'all' ? 'Todas' : statusLabels[f] || f}
            </Button>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <CalendarCheck className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma reserva encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[booking.status] || ''}`}>
                        {statusLabels[booking.status] || booking.status}
                      </span>
                      {booking.sub_space && <Badge variant="outline">{booking.sub_space.name}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1"><CalendarCheck className="h-4 w-4 text-muted-foreground" /> {new Date(booking.date).toLocaleDateString('pt-PT')}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-muted-foreground" /> {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{booking.user?.full_name || 'Utilizador'}</span>
                      {booking.user?.email && <span>· {booking.user.email}</span>}
                      {booking.user?.phone && <span>· {booking.user.phone}</span>}
                    </div>
                    {booking.notes && <p className="text-sm text-muted-foreground italic">"{booking.notes}"</p>}
                  </div>
                  <div className="flex gap-1">
                    {booking.status === 'pending' && (
                      <>
                        <Button variant="ghost" size="sm" className="text-green-500" onClick={() => updateStatus(booking.id, 'confirmed')}>
                          <Check className="mr-1 h-4 w-4" /> Confirmar
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => updateStatus(booking.id, 'cancelled')}>
                          <X className="mr-1 h-4 w-4" /> Recusar
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button variant="ghost" size="sm" className="text-blue-500" onClick={() => updateStatus(booking.id, 'completed')}>
                        <Check className="mr-1 h-4 w-4" /> Concluir
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
