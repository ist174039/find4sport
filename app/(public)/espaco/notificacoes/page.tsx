'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, CheckCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SpaceNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30)
        setNotifications(data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/espaco/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Notificações do Espaço</h1>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Sem notificações.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={`rounded-lg border p-4 ${!n.is_read ? 'border-primary/20 bg-primary/5' : ''}`}>
              <h4 className="text-sm font-medium">{n.title}</h4>
              <p className="text-sm text-muted-foreground">{n.message}</p>
              <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString('pt-PT')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
