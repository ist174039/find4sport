'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowLeft, FileText, Plus, Trash2, Check, Loader2 } from 'lucide-react'
import type { Qualification } from '@/lib/types'

export default function ProfessionalDocumentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [professionalId, setProfessionalId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newQual, setNewQual] = useState({ title: '', issuer: '', issue_date: '', expiry_date: '', document_url: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        const { data: prof } = await supabase.from('professionals').select('id').eq('user_id', user.id).single()
        if (prof) {
          setProfessionalId(prof.id)
          const { data: quals } = await supabase.from('qualifications').select('*').eq('professional_id', prof.id).order('created_at', { ascending: false })
          setQualifications(quals || [])
        }
      } catch (err) {
        setError('Erro ao carregar documentos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  async function addQualification() {
    if (!newQual.title.trim() || !professionalId) return
    setSaving(true)
    const supabase = createClient()
    const { data, error: insErr } = await supabase.from('qualifications').insert({
      professional_id: professionalId,
      title: newQual.title,
      issuer: newQual.issuer || null,
      issue_date: newQual.issue_date || null,
      expiry_date: newQual.expiry_date || null,
      document_url: newQual.document_url || null,
    }).select().single()

    if (!insErr && data) {
      setQualifications((prev) => [data, ...prev])
      setNewQual({ title: '', issuer: '', issue_date: '', expiry_date: '', document_url: '' })
      setShowForm(false)
    } else {
      setError('Erro ao adicionar documento')
    }
    setSaving(false)
  }

  async function deleteQual(id: string) {
    const supabase = createClient()
    await supabase.from('qualifications').delete().eq('id', id)
    setQualifications((prev) => prev.filter((q) => q.id !== id))
  }

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos e Certificações</h1>
          <p className="text-muted-foreground">Gerir qualificações e certificados profissionais</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>

      {error && <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}

      {showForm && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="space-y-4 p-6">
            <h3 className="font-semibold">Nova Qualificação</h3>
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={newQual.title} onChange={(e) => setNewQual(p => ({...p, title: e.target.value}))} placeholder="Ex: Licenciatura em Educação Física" />
            </div>
            <div className="space-y-2">
              <Label>Entidade Emissora</Label>
              <Input value={newQual.issuer} onChange={(e) => setNewQual(p => ({...p, issuer: e.target.value}))} placeholder="Ex: Universidade de Lisboa" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Data de Emissão</Label>
                <Input type="date" value={newQual.issue_date} onChange={(e) => setNewQual(p => ({...p, issue_date: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>Data de Validade</Label>
                <Input type="date" value={newQual.expiry_date} onChange={(e) => setNewQual(p => ({...p, expiry_date: e.target.value}))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL do Documento</Label>
              <Input value={newQual.document_url} onChange={(e) => setNewQual(p => ({...p, document_url: e.target.value}))} placeholder="Link para o documento" />
            </div>
            <div className="flex gap-2">
              <Button onClick={addQualification} disabled={saving || !newQual.title.trim()}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A guardar...</> : 'Guardar'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {qualifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum documento adicionado. Adicione as suas certificações.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {qualifications.map((qual) => (
            <Card key={qual.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{qual.title}</h3>
                      {qual.is_verified && (
                        <Badge variant="default" className="bg-green-500 text-xs"><Check className="mr-1 h-3 w-3" /> Verificado</Badge>
                      )}
                    </div>
                    {qual.issuer && <p className="text-sm text-muted-foreground">{qual.issuer}</p>}
                    {qual.issue_date && (
                      <p className="text-xs text-muted-foreground">
                        Emitido em: {new Date(qual.issue_date).toLocaleDateString('pt-PT')}
                        {qual.expiry_date && ` · Válido até: ${new Date(qual.expiry_date).toLocaleDateString('pt-PT')}`}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteQual(qual.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
