'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, X, Calendar, MapPin, User, Loader2 } from 'lucide-react'
import { approveEventAction, rejectEventAction } from '../actions'

type PendingEvent = { id: string; title: string; description: string | null; start_date: string; address: string | null; capacity: number | null; created_by: string | null; created_at: string; professional_name: string | null; professional_email: string | null }
type PendingEventRow = Omit<PendingEvent, 'professional_name' | 'professional_email'> & { professionals: { full_name: string | null; email: string | null } | null }

export default function AdminValidacaoEventosPage() {
 const router = useRouter(); const [events, setEvents] = useState<PendingEvent[]>([]); const [loading, setLoading] = useState(true); const [processing, setProcessing] = useState<string | null>(null)
 const loadPending = useCallback(async () => {
  const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.replace('/admin/login'); return }
  const { data: profile } = await supabase.from('admins').select('admin_type').eq('auth_user_id', user.id).maybeSingle(); if (profile?.admin_type !== 'general' && profile?.admin_type !== 'operacional') { router.replace('/admin'); return }
  const { data, error } = await supabase.from('events').select('id,title,description,start_date,address,capacity,created_by,created_at,professionals!events_created_by_fkey(full_name,email)').eq('status', 'pending').order('created_at', { ascending: false })
  if (error) { setEvents([]); setLoading(false); return }
  const rows = (data || []) as unknown as PendingEventRow[]; setEvents(rows.map(event => ({ ...event, professional_name: event.professionals?.full_name || null, professional_email: event.professionals?.email || null }))); setLoading(false)
 }, [router])
 useEffect(() => { void loadPending() }, [loadPending])
 async function updateStatus(id: string, decision: 'approved' | 'rejected') { setProcessing(id); try { const result = decision === 'approved' ? await approveEventAction(id) : await rejectEventAction(id); if (result.error) throw new Error(result.error.message); setEvents(current => current.filter(event => event.id !== id)) } finally { setProcessing(null) } }
 if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
 return <div><div className="mb-6"><h1 className="text-2xl font-bold text-foreground">Validação de Eventos</h1><p className="text-sm text-muted-foreground">Aprova ou rejeita eventos através do workflow administrativo auditado.</p></div>{events.length === 0 ? <Card><CardContent className="flex flex-col items-center py-12 text-center"><Check className="mb-4 h-12 w-12 text-green-500" /><h3 className="text-lg font-semibold">Tudo em dia!</h3><p className="text-sm text-muted-foreground">Não há eventos pendentes de validação.</p></CardContent></Card> : <div className="space-y-4">{events.map(event => <Card key={event.id}><CardContent className="pt-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-foreground">{event.title}</h3><Badge variant="outline">Pendente</Badge></div><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description || 'Sem descrição'}</p><div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(event.start_date).toLocaleDateString('pt-PT')}</span>{event.address && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.address}</span>}{event.professional_name && <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{event.professional_name}</span>}</div></div><div className="grid grid-cols-2 gap-2 sm:flex"><Button className="min-h-11" onClick={() => void updateStatus(event.id, 'approved')} disabled={processing === event.id}>{processing === event.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}Aprovar</Button><Button className="min-h-11" variant="outline" onClick={() => void updateStatus(event.id, 'rejected')} disabled={processing === event.id}><X className="mr-1 h-4 w-4" />Rejeitar</Button></div></div></CardContent></Card>)}</div>}</div>
}
