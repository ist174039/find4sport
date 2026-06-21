'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Users, Send, UserPlus, UserMinus, Loader2 } from 'lucide-react'
import type { Community } from '@/lib/types'

export default function CommunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [isJoined, setIsJoined] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const slug = params.slug as string

        const { data: communityData } = await supabase.from('communities').select('*').eq('slug', slug).single()
        if (!communityData) {
          const { data: byId } = await supabase.from('communities').select('*').eq('id', slug).single()
          if (!byId) return
          setCommunity(byId)
        } else {
          setCommunity(communityData)
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: member } = await supabase.from('community_members').select('id').eq('community_id', communityData?.id || slug).eq('user_id', user.id).single()
          setIsJoined(!!member)
        }
      } catch (err) {
        setError('Comunidade não encontrada')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.slug])

  async function toggleJoin() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    if (isJoined) {
      await supabase.from('community_members').delete().eq('community_id', community!.id).eq('user_id', user.id)
      setIsJoined(false)
    } else {
      await supabase.from('community_members').insert({ community_id: community!.id, user_id: user.id })
      setIsJoined(true)
    }
  }

  async function sendMessage() {
    if (!message.trim()) return
    setSending(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('community_messages').insert({
      community_id: community!.id,
      user_id: user.id,
      content: message.trim(),
    })
    setMessage('')
    setSending(false)
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>
  if (!community) return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h2 className="text-xl font-bold">Comunidade não encontrada</h2>
      <Button asChild className="mt-4"><Link href="/comunidades">Voltar</Link></Button>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/comunidades"><ArrowLeft className="mr-2 h-4 w-4" /> Todas as Comunidades</Link>
      </Button>

      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-teal-400 text-3xl text-white">
            {community.avatar_url ? <img src={community.avatar_url} alt="" className="h-full w-full rounded-2xl object-cover" /> : <Users className="h-8 w-8" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{community.name}</h1>
            <p className="text-muted-foreground">{community.description}</p>
            <p className="mt-1 text-sm text-muted-foreground">{community.member_count || 0} membros</p>
          </div>
        </div>
        <Button onClick={toggleJoin} variant={isJoined ? 'outline' : 'default'}>
          {isJoined ? <><UserMinus className="mr-2 h-4 w-4" /> Sair</> : <><UserPlus className="mr-2 h-4 w-4" /> Participar</>}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conversa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 max-h-96 space-y-3 overflow-y-auto">
            {messages.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">Ainda sem mensagens. Seja o primeiro a comentar!</p>
            )}
          </div>
          <div className="flex gap-2">
            <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escrever mensagem..." onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
            <Button onClick={sendMessage} disabled={!message.trim() || sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
