'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Settings, Tag, Key, Bell, Users, Mail, Brain, Trash2, Plus } from 'lucide-react'
import type { Category } from '@/lib/types'

type ApiKey = {
  id: string
  name: string
  key_preview: string
  provider: string
  is_active: boolean
  created_at: string
}

type SystemConfig = {
  site_name: string
  primary_color: string
  max_photos_per_profile: number
  max_categories_per_professional: number
  manual_profile_approval: boolean
  ai_enrichment_enabled: boolean
  email_notifications_enabled: boolean
  push_notifications_enabled: boolean
  default_radius_km: number
  review_auto_approve: boolean
}

const DEFAULT_CONFIG: SystemConfig = {
  site_name: 'find4sport',
  primary_color: '#18956e',
  max_photos_per_profile: 12,
  max_categories_per_professional: 5,
  manual_profile_approval: true,
  ai_enrichment_enabled: true,
  email_notifications_enabled: true,
  push_notifications_enabled: false,
  default_radius_km: 10,
  review_auto_approve: false,
}

export default function AdminDefinicoesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('geral')
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG)
  const [categories, setCategories] = useState<Category[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', emoji: '', color: '' })
  const [newApiKey, setNewApiKey] = useState({ name: '', provider: 'google_places' })
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddApiKey, setShowAddApiKey] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (!profile || profile.role !== 'admin') {
          router.push('/')
          return
        }

        // Load categories
        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .order('name')
        if (cats) setCategories(cats)

        // Load config from system_config table or use defaults
        const { data: sysConfig } = await supabase
          .from('system_config')
          .select('*')
          .single()

        if (sysConfig?.settings) {
          setConfig({ ...DEFAULT_CONFIG, ...sysConfig.settings as Partial<SystemConfig> })
        }

        // Load API keys
        const { data: keys } = await supabase
          .from('api_keys')
          .select('*')
          .order('created_at', { ascending: false })
        if (keys) setApiKeys(keys)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar definições')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  async function handleSaveConfig() {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const supabase = createClient()
      const { error: upsertError } = await supabase
        .from('system_config')
        .upsert({ id: 'global', settings: config, updated_at: new Date().toISOString() })

      if (upsertError) throw upsertError
      setSuccess('Definições guardadas com sucesso!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar definições')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddCategory() {
    if (!newCategory.name.trim()) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from('categories').insert({
        name: newCategory.name,
        slug: newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, '-'),
        emoji: newCategory.emoji || null,
        color: newCategory.color || null,
      })
      if (error) throw error
      setNewCategory({ name: '', slug: '', emoji: '', color: '' })
      setShowAddCategory(false)
      // Refresh categories
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      if (cats) setCategories(cats)
      setSuccess('Categoria adicionada!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar categoria')
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      setCategories(prev => prev.filter(c => c.id !== id))
      setSuccess('Categoria removida!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover categoria')
    }
  }

  async function handleAddApiKey() {
    if (!newApiKey.name.trim()) return
    try {
      const supabase = createClient()
      const generated = `${newApiKey.provider}_${Math.random().toString(36).substring(2, 10)}`
      const { error } = await supabase.from('api_keys').insert({
        name: newApiKey.name,
        provider: newApiKey.provider,
        key_value: generated,
        key_preview: generated.substring(0, 8) + '...',
      })
      if (error) throw error
      setNewApiKey({ name: '', provider: 'google_places' })
      setShowAddApiKey(false)
      const { data: keys } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false })
      if (keys) setApiKeys(keys)
      setSuccess('API Key adicionada!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar API Key')
    }
  }

  async function handleDeleteApiKey(id: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('api_keys').delete().eq('id', id)
      if (error) throw error
      setApiKeys(prev => prev.filter(k => k.id !== id))
      setSuccess('API Key removida!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover API Key')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Definições do Sistema</h1>
        <p className="mt-1 text-sm text-gray-500">Configurações base da plataforma find4sport</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="flex gap-6">
        {/* Settings Sidebar */}
        <div className="w-48 shrink-0">
          <nav className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
            {[
              { id: 'geral', label: 'Geral', icon: Settings },
              { id: 'categorias', label: 'Categorias', icon: Tag },
              { id: 'api-keys', label: 'API Keys', icon: Key },
              { id: 'notificacoes', label: 'Notificações', icon: Bell },
              { id: 'utilizadores', label: 'Utilizadores', icon: Users },
              { id: 'email', label: 'Email Templates', icon: Mail },
              { id: 'ia', label: 'IA / Enrichment', icon: Brain },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="min-w-0 flex-1">
          {activeTab === 'geral' && (
            <Card>
              <CardHeader>
                <CardTitle>Definições Gerais</CardTitle>
                <CardDescription>Configurações base da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nome da Plataforma</Label>
                  <Input
                    id="siteName"
                    value={config.site_name}
                    onChange={(e) => setConfig(prev => ({ ...prev, site_name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-7 w-7 rounded-md border-2 border-teal-100"
                      style={{ background: config.primary_color }}
                    />
                    <Input
                      id="primaryColor"
                      value={config.primary_color}
                      onChange={(e) => setConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxPhotos">Max Fotos / Perfil</Label>
                    <Input
                      id="maxPhotos"
                      type="number"
                      value={config.max_photos_per_profile}
                      onChange={(e) => setConfig(prev => ({ ...prev, max_photos_per_profile: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxCategories">Max Categorias / Prof.</Label>
                    <Input
                      id="maxCategories"
                      type="number"
                      value={config.max_categories_per_professional}
                      onChange={(e) => setConfig(prev => ({ ...prev, max_categories_per_professional: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultRadius">Raio de Acção Padrão (km)</Label>
                  <Input
                    id="defaultRadius"
                    type="number"
                    value={config.default_radius_km}
                    onChange={(e) => setConfig(prev => ({ ...prev, default_radius_km: Number(e.target.value) }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Aprovação Manual de Perfis</p>
                    <p className="text-xs text-gray-500">Requer aprovação admin antes de publicar</p>
                  </div>
                  <Switch
                    checked={config.manual_profile_approval}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, manual_profile_approval: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Aprovação Automática de Reviews</p>
                    <p className="text-xs text-gray-500">Reviews aprovadas automaticamente sem moderação</p>
                  </div>
                  <Switch
                    checked={config.review_auto_approve}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, review_auto_approve: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'categorias' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categorias</CardTitle>
                  <CardDescription>Gerir categorias desportivas da plataforma</CardDescription>
                </div>
                <Button onClick={() => setShowAddCategory(true)} className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="mr-1 h-4 w-4" /> Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                {showAddCategory && (
                  <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={newCategory.name}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Personal Trainer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input
                          value={newCategory.slug}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="personal-trainer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Emoji</Label>
                        <Input
                          value={newCategory.emoji}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, emoji: e.target.value }))}
                          placeholder="🏋️"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cor</Label>
                        <Input
                          value={newCategory.color}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                          placeholder="#18956e"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button onClick={handleAddCategory} className="bg-teal-600 hover:bg-teal-700">
                        <Save className="mr-1 h-4 w-4" /> Guardar
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddCategory(false)}>Cancelar</Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.emoji || '🏷️'}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                          <p className="text-xs text-gray-500">{cat.pro_count} profissionais</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {categories.length === 0 && !showAddCategory && (
                  <p className="py-8 text-center text-sm text-gray-500">
                    Nenhuma categoria definida. Clique em "Adicionar" para criar a primeira.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'api-keys' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Gerir chaves de API para integrações externas</CardDescription>
                </div>
                <Button onClick={() => setShowAddApiKey(true)} className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="mr-1 h-4 w-4" /> Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                {showAddApiKey && (
                  <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={newApiKey.name}
                          onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Google Places API"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Provider</Label>
                        <select
                          value={newApiKey.provider}
                          onChange={(e) => setNewApiKey(prev => ({ ...prev, provider: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                        >
                          <option value="google_places">Google Places</option>
                          <option value="openai">OpenAI</option>
                          <option value="sendgrid">SendGrid</option>
                          <option value="stripe">Stripe</option>
                          <option value="other">Outro</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button onClick={handleAddApiKey} className="bg-teal-600 hover:bg-teal-700">
                        <Save className="mr-1 h-4 w-4" /> Gerar
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddApiKey(false)}>Cancelar</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{key.name}</p>
                          <p className="text-xs text-gray-500">
                            {key.key_preview} · {key.provider} · {key.is_active ? 'Activa' : 'Inactiva'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteApiKey(key.id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {apiKeys.length === 0 && !showAddApiKey && (
                  <p className="py-8 text-center text-sm text-gray-500">
                    Nenhuma API Key configurada.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'notificacoes' && (
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configurar canais de notificação da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notificações por Email</p>
                    <p className="text-xs text-gray-500">Enviar emails para eventos, contactos e promoções</p>
                  </div>
                  <Switch
                    checked={config.email_notifications_enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, email_notifications_enabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notificações Push</p>
                    <p className="text-xs text-gray-500">Enviar notificações push para dispositivos móveis</p>
                  </div>
                  <Switch
                    checked={config.push_notifications_enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, push_notifications_enabled: checked }))}
                  />
                </div>

                <Separator />

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">
                    Os tipos de notificação (booking_request, new_message, new_review, etc.) são configurados na Edge Function <code className="rounded bg-blue-100 px-1 py-0.5 text-xs font-mono">send-notification</code>.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'utilizadores' && (
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Utilizadores</CardTitle>
                <CardDescription>Configurar roles, permissões e limites da plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Roles disponíveis</Label>
                  <div className="flex flex-wrap gap-2">
                    {['user', 'professional', 'moderator', 'admin'].map((role) => (
                      <Badge key={role} variant="secondary" className="capitalize">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="maxCategories">Limite de Profissionais por Utilizador</Label>
                  <Input
                    id="maxProfessionals"
                    type="number"
                    defaultValue={1}
                    className="max-w-xs"
                  />
                  <p className="text-xs text-gray-500">Número máximo de perfis profissionais que um utilizador pode criar</p>
                </div>

                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <p className="text-sm text-amber-700">
                    A gestão detalhada de utilizadores (listar, editar, suspender) pode ser feita através do painel Supabase.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'email' && (
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Gerir templates de email enviados pela plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Boas-vindas', subject: 'Bem-vindo ao find4sport', type: 'welcome' },
                  { name: 'Confirmação de Email', subject: 'Confirma o teu email', type: 'email_confirm' },
                  { name: 'Reset de Password', subject: 'Recuperação de password', type: 'password_reset' },
                  { name: 'Contacto Recebido', subject: 'Novo contacto profissional', type: 'contact_received' },
                  { name: 'Profissional Aprovado', subject: 'Perfil aprovado!', type: 'profile_approved' },
                  { name: 'Review Recebida', subject: 'Nova avaliação', type: 'new_review' },
                  { name: 'Lembrete Evento', subject: 'Evento amanhã!', type: 'event_reminder' },
                ].map((template) => (
                  <div key={template.type} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.subject}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {template.type}
                    </Badge>
                  </div>
                ))}

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">
                    Os templates de email são geridos pelo Supabase Auth (emails automáticos) e pela Edge Function de notificações.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'ia' && (
            <Card>
              <CardHeader>
                <CardTitle>IA / Enriquecimento</CardTitle>
                <CardDescription>Configurações de inteligência artificial e enriquecimento de dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enriquecimento IA Automático</p>
                    <p className="text-xs text-gray-500">Gerar descrições automaticamente ao importar espaços</p>
                  </div>
                  <Switch
                    checked={config.ai_enrichment_enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ai_enrichment_enabled: checked }))}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Modelo de IA</Label>
                  <select
                    className="flex h-10 w-full max-w-xs rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                    defaultValue="gpt-4o-mini"
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Prompt de Enriquecimento</Label>
                  <textarea
                    className="min-h-[100px] w-full rounded-md border border-gray-200 bg-white p-3 text-sm"
                    defaultValue="Gera uma descrição profissional e atrativa para um espaço desportivo em Portugal com base nos seguintes dados: {{name}}, {{address}}, {{amenities}}."
                  />
                </div>

                <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
                  <p className="text-sm text-purple-700">
                    O enriquecimento IA é usado principalmente no fluxo de importação (Google Places) para gerar descrições automáticas de espaços.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Floating Save Button */}
      {(activeTab === 'geral' || activeTab === 'notificacoes') && (
        <div className="fixed bottom-8 right-8">
          <Button
            onClick={handleSaveConfig}
            disabled={saving}
            className="bg-teal-600 px-6 py-3 shadow-lg hover:bg-teal-700"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar Alterações
          </Button>
        </div>
      )}
    </div>
  )
}
