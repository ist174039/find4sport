'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { MessageSquare, Mail, Check, X, Loader2 } from 'lucide-react'

type ContactRequest = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  status: string
  created_at: string
  space_name: string | null
  professional_name: string | null
}

export default function DashboardContactosPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!professional) { setLoading(false); return }

      const { data } = await supabase
        .from('contact_requests')
        .select('id, name, email, phone, message, status, created_at, space_id')
        .eq('professional_id', professional.id)
        .order('created_at', { ascending: false })

      if (data) {
        const mapped = await Promise.all((data || []).map(async (r) => {
          let space_name = null
          if (r.space_id) {
            const { data: sp } = await supabase.from('sport_spaces').select('name').eq('id', r.space_id).single()
            if (sp) space_name = sp.name
          }
          return { ...r, space_name, professional_name: null }
        }))
        setRequests(mapped)
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleUpdateStatus = async (id: string, status: string) => {
    setProcessing(id)
    const supabase = createClient()
    await supabase.from('contact_requests').update({ status }).eq('id', id)
    setRequests(requests.map(r => r.id === id ? { ...r, status } : r))
    setProcessing(null)
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pedidos de Contacto</h1>
        <p className="text-sm text-muted-foreground">Gerir pedidos de contacto recebidos.</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Nenhum pedido</h3>
            <p className="mt-1 text-sm text-muted-foreground">Ainda não recebeste pedidos de contacto.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className={`transition-opacity ${req.status === 'new' ? 'ring-2 ring-teal-200' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{req.name}</h3>
                      {req.status === 'new' && <Badge className="bg-teal-100 text-teal-700">Novo</Badge>}
                      {req.status === 'read' && <Badge variant="outline" className="bg-blue-100 text-blue-700">Lido</Badge>}
                      {req.status === 'replied' && <Badge variant="outline" className="bg-green-100 text-green-700">Respondido</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{req.email}</span>
                      {req.phone && <span>{req.phone}</span>}
                      {req.space_name && <span>Espaço: {req.space_name}</span>}
                      <span>{new Date(req.created_at).toLocaleDateString('pt-PT')}</span>
                    </div>
                    <p className="mt-2 rounded-lg bg-muted p-3 text-sm text-foreground">
                      {req.message}
                    </p>
                  </div>
                </div>
                {req.status === 'new' && (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => handleUpdateStatus(req.id, 'read')} disabled={processing === req.id}>
                      {processing === req.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
                      Marcar como Lido
                    </Button>
                    <Button size="sm" variant="outline" className="border-green-200 text-green-600 hover:bg-green-50" onClick={() => handleUpdateStatus(req.id, 'replied')} disabled={processing === req.id}>
                      <Mail className="mr-1 h-4 w-4" /> Respondido
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
