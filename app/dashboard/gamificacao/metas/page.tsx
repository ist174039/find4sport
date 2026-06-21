'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Target,
  Trophy,
  Plus,
  CheckCircle2,
  Loader2,
  Calendar,
  Dumbbell,
  Flame,
  Zap,
} from 'lucide-react'

type Goal = {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string
  target_value: number | null
  current_value: number | null
  unit: string | null
  start_date: string | null
  end_date: string | null
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at?: string
}

export default function GamificationMetasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'fitness',
    target_value: '',
    unit: '',
    end_date: '',
  })

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        const { data } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setGoals(data as Goal[] || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const handleAddGoal = async () => {
    if (!form.title) { setError('O título é obrigatório'); return }
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error: insertError } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: form.title,
          description: form.description || null,
          category: form.category,
          target_value: form.target_value ? parseFloat(form.target_value) : null,
          unit: form.unit || null,
          start_date: new Date().toISOString(),
          end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
          status: 'active',
        })
        .select()
        .single()

      if (insertError) { setError(insertError.message); return }

      if (data) {
        setGoals((prev) => [data as Goal, ...prev])
        setForm({ title: '', description: '', category: 'fitness', target_value: '', unit: '', end_date: '' })
        setShowForm(false)
      }
    } catch {
      setError('Erro ao criar meta')
    } finally {
      setSaving(false)
    }
  }

  const completeGoal = async (goalId: string) => {
    const supabase = createClient()
    await supabase.from('goals').update({ status: 'completed' }).eq('id', goalId)
    setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, status: 'completed' as const } : g)))
  }

  const categoryIcons: Record<string, any> = { fitness: Dumbbell, running: Flame, strength: Zap, weight: Target, general: Trophy }
  const categoryColors: Record<string, string> = {
    fitness: 'bg-blue-50 text-blue-600',
    running: 'bg-green-50 text-green-600',
    strength: 'bg-orange-50 text-orange-600',
    weight: 'bg-purple-50 text-purple-600',
    general: 'bg-amber-50 text-amber-600',
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-64" />
        <div className="mt-4 space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    )
  }

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard/gamificacao">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas</h1>
          <p className="mt-1 text-muted-foreground">Define e acompanha os teus objetivos desportivos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Cancelar' : 'Nova Meta'}
        </Button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Nova Meta</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium">Título *</label>
                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Correr 5km em 30 min" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <textarea className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreve a tua meta..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="fitness">Fitness</option>
                  <option value="running">Corrida</option>
                  <option value="strength">Força</option>
                  <option value="weight">Peso</option>
                  <option value="general">Geral</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unidade</label>
                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="Ex: km, kg, min" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor Alvo</label>
                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" type="number" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} placeholder="Ex: 30" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Limite</label>
                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <Button className="mt-4" onClick={handleAddGoal} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Criar Meta
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Metas Ativas ({activeGoals.length})</h2>
        {activeGoals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-8">
              <Target className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhuma meta ativa</p>
              <Button variant="link" onClick={() => setShowForm(true)}>Criar a primeira meta</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => {
              const Icon = categoryIcons[goal.category] || Trophy
              const colorClass = categoryColors[goal.category] || 'bg-gray-50 text-gray-600'
              return (
                <Card key={goal.id}>
                  <CardContent className="flex items-start justify-between p-4">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{goal.title}</h3>
                        {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {goal.target_value && <span>Meta: {goal.target_value}{goal.unit || ''}</span>}
                          {goal.end_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Até {new Date(goal.end_date).toLocaleDateString('pt-PT')}
                            </span>
                          )}
                        </div>
                        {goal.current_value !== null && goal.target_value && (
                          <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (goal.current_value / goal.target_value) * 100)}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-green-600" onClick={() => completeGoal(goal.id)}>
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Completar
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {completedGoals.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Metas Concluídas ({completedGoals.length})</h2>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="flex items-center gap-3 p-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">Concluída a {new Date(goal.updated_at || goal.created_at).toLocaleDateString('pt-PT')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
