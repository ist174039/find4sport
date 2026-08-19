'use client'

import { useState, useEffect } from 'react'
import { Award, Plus, Trash2, CheckCircle2, ShieldCheck, Loader2, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Qualification {
  id: string
  professional_id: string
  title: string
  issuer?: string | null
  issue_date?: string | null
  is_verified?: boolean | null
}

export function QualificationsManager({ professionalId }: { professionalId: string }) {
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    issuer: '',
    issue_date: ''
  })

  useEffect(() => {
    async function fetchQuals() {
      if (!professionalId) return
      const supabase = createClient()
      const { data } = await supabase
        .from('qualifications')
        .select('*')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false })

      if (data) setQualifications(data)
      setLoading(false)
    }

    fetchQuals()
  }, [professionalId])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    setAdding(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('qualifications')
        .insert({
          professional_id: professionalId,
          title: form.title.trim(),
          issuer: form.issuer.trim() || undefined,
          issue_date: form.issue_date || undefined,
          is_verified: true
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setQualifications([data, ...qualifications])
        setForm({ title: '', issuer: '', issue_date: '' })
      }
    } catch (error: unknown) {
      console.error(error)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('qualifications').delete().eq('id', id)
      if (error) throw error
      setQualifications(qualifications.filter(q => q.id !== id))
    } catch (error: unknown) {
      console.error(error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
          <Award className="h-5 w-5 text-amber-500" />
          Qualificações & Certificações
        </h3>
        <span className="text-xs text-muted-foreground font-medium">
          {qualifications.length} adicionadas
        </span>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-4">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Adicionar Nova Certificação ou Diploma
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1 sm:col-span-1">
            <Label className="text-xs font-semibold">Título / Nome *</Label>
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Licenciatura em Educação Física / CÉTP TEF"
              className="h-9 text-xs rounded-lg bg-background"
            />
          </div>

          <div className="space-y-1 sm:col-span-1">
            <Label className="text-xs font-semibold">Entidade Emissora</Label>
            <Input
              value={form.issuer}
              onChange={e => setForm({ ...form, issuer: e.target.value })}
              placeholder="Ex: IPDJ / FMH / CrossFit"
              className="h-9 text-xs rounded-lg bg-background"
            />
          </div>

          <div className="space-y-1 sm:col-span-1">
            <Label className="text-xs font-semibold">Data de Emissão</Label>
            <Input
              type="date"
              value={form.issue_date}
              onChange={e => setForm({ ...form, issue_date: e.target.value })}
              className="h-9 text-xs rounded-lg bg-background"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleAdd}
            disabled={adding || !form.title.trim()}
            className="h-8 px-4 text-xs font-bold gap-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Adicionar Certificação
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-6 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : qualifications.length > 0 ? (
        <div className="space-y-3">
          {qualifications.map(q => (
            <div key={q.id} className="flex items-center justify-between p-3.5 bg-background border border-border rounded-xl hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-foreground truncate">{q.title}</h5>
                    <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Verificado
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {q.issuer && <span>{q.issuer}</span>}
                    {q.issue_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(q.issue_date).toLocaleDateString('pt-PT', { year: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(q.id)}
                disabled={deletingId === q.id}
                className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                title="Eliminar certificação"
              >
                {deletingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">
          Ainda não adicionaste qualificações ou certificações ao teu perfil.
        </p>
      )}
    </div>
  )
}
