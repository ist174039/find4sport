'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Search, Shield } from 'lucide-react'

type AuditLog = {
  id: string
  action: string
  table_name: string
  record_id: string | null
  user_id: string | null
  user_email: string | null
  old_data: any
  new_data: any
  created_at: string
}

export default function AdminAuditPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filtered, setFiltered] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/'); return }

      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      setLogs(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  useEffect(() => {
    if (!search.trim()) { setFiltered(logs); return }
    const term = search.toLowerCase()
    setFiltered(logs.filter(l =>
      l.action.toLowerCase().includes(term) ||
      l.table_name.toLowerCase().includes(term) ||
      l.user_email?.toLowerCase().includes(term)
    ))
  }, [search, logs])

  const actionColors: Record<string, string> = {
    INSERT: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
  }

  if (loading) return <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground">Registo de alterações na plataforma.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum registo de auditoria encontrado.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map((log) => (
                <div key={log.id} className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className={actionColors[log.action] || ''}>
                      {log.action}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">{log.table_name}</span>
                    {log.user_email && <span className="text-xs text-muted-foreground">por {log.user_email}</span>}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('pt-PT')}
                    </span>
                  </div>
                  {log.action === 'UPDATE' && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                        Ver alterações
                      </summary>
                      <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                        {JSON.stringify({ old: log.old_data, new: log.new_data }, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
