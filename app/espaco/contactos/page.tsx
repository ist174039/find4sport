'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowLeft, Mail, Phone, User, Check, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContactStatus } from '@/lib/types'

type ContactRequest = {
  id: string
  sender_name: string
  sender_email: string
  sender_phone: string | null
  subject: string | null
  message: string
  status: ContactStatus
  created_at: string
}

export default function SpaceContactsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('pending')

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/espaco/login'); return }

        const { data: userSpaces } = await supabase.from('sport_spaces').select('id').eq('created_by', user.id)
        const spaceIds = (userSpaces || []).map(s => s.id)

        if (spaceIds.length > 0) {
          const { data } = await supabase
            .from('contact_requests')
            .select('*')
            .in('space_id', spaceIds)
            .order('created_at', { ascending: false })
          setContacts(data || [])
        }
      } catch (err) {
        setError('Erro ao carregar contactos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  async function updateStatus(id: string, status: ContactStatus) {
    const supabase = createClient()
    await supabase.from('contact_requests').update({ status }).eq('id', id)
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  const filtered = tab === 'all' ? contacts : contacts.filter((c) => c.status === tab)

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/espaco/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Contactos</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Por ler ({contacts.filter(c => c.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="read">Lidos</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum contacto.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtered.map((contact) => (
                <Card key={contact.id} className={cn(!['read', 'responded', 'archived'].includes(contact.status) && 'border-primary/20')}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{contact.sender_name}</span>
                          <Badge variant={contact.status === 'pending' ? 'default' : contact.status === 'read' ? 'secondary' : 'outline'}>
                            {contact.status === 'pending' ? 'Por ler' : contact.status === 'read' ? 'Lido' : contact.status === 'responded' ? 'Respondido' : 'Arquivado'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {contact.sender_email}</span>
                          {contact.sender_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {contact.sender_phone}</span>}
                        </div>
                        {contact.subject && <p className="text-sm font-medium">{contact.subject}</p>}
                        <p className="text-sm">{contact.message}</p>
                        <p className="text-xs text-muted-foreground">{new Date(contact.created_at).toLocaleString('pt-PT')}</p>
                      </div>
                      <div className="flex gap-1">
                        {contact.status === 'pending' && (
                          <Button variant="ghost" size="sm" onClick={() => updateStatus(contact.id, 'read')}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {contact.status === 'read' && (
                          <Button variant="ghost" size="sm" onClick={() => updateStatus(contact.id, 'archived')}>
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
