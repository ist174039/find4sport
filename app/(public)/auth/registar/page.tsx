'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck, Trophy, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { User as AuthUser } from '@supabase/supabase-js'
import type { PlatformRole } from '@/lib/auth/roles'

const ACCOUNT_TYPES: Array<{ id: PlatformRole; label: string; description: string; detail: string; icon: LucideIcon }> = [
  { id: 'athlete', label: 'Utilizador', description: 'Descobrir, reservar e participar.', detail: 'Pesquisa, favoritos, eventos, comunidades e mensagens.', icon: User },
  { id: 'professional', label: 'Profissional', description: 'Promover serviços e gerir clientes.', detail: 'Perfil profissional, serviços, agenda, eventos e comunidades.', icon: Trophy },
  { id: 'venue_manager', label: 'Espaço', description: 'Gerir instalações e reservas.', detail: 'Espaço público, salas/campos, horários, reservas e equipa.', icon: Building2 },
]

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  return value
}

function accountTypeFromQuery(value: string | null): PlatformRole | null {
  return ACCOUNT_TYPES.some(item => item.id === value) ? value as PlatformRole : null
}

function setupDestination(type: PlatformRole, finalDestination: string) {
  if (type === 'professional') return `/auth/registar/profissional?next=${encodeURIComponent(finalDestination)}`
  if (type === 'venue_manager') return `/auth/registar/espaco?next=${encodeURIComponent(finalDestination)}`
  return finalDestination
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : ''
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const destination = safeNext(searchParams.get('next') || searchParams.get('redirect'))
  const [selectedType, setSelectedType] = useState<PlatformRole | null>(() => accountTypeFromQuery(searchParams.get('type')))
  const [step, setStep] = useState<'type' | 'credentials'>('type')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [existingUser, setExistingUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    void (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setExistingUser(user || null)
      if (user) {
        setFullName(user.user_metadata?.full_name || '')
        setEmail(user.email || '')
      }
    })()
  }, [])

  const continueWithType = async () => {
    if (!selectedType || isLoading) return
    setError(null)
    if (!existingUser) {
      setStep('credentials')
      return
    }

    if (selectedType === 'professional' || selectedType === 'venue_manager') {
      router.push(setupDestination(selectedType, destination))
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error: upsertError } = await supabase.from('platform_users').upsert({
        id: existingUser.id,
        type: 'athlete',
        full_name: existingUser.user_metadata?.full_name || existingUser.email?.split('@')[0] || 'Utilizador',
      })
      if (upsertError) throw upsertError
      window.location.assign(destination)
    } catch (err) {
      setError(getErrorMessage(err) || 'Não foi possível concluir o perfil.')
      setIsLoading(false)
    }
  }

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedType || isLoading) return
    setError(null)
    if (fullName.trim().length < 2) return setError('Indica o teu nome.')
    if (password.length < 8) return setError('Usa uma palavra-passe com pelo menos 8 caracteres.')
    if (password !== repeatPassword) return setError('As palavras-passe não coincidem.')

    setIsLoading(true)
    try {
      const supabase = createClient()
      const nextAfterAuth = setupDestination(selectedType, destination)
      const callback = new URL('/auth/callback', window.location.origin)
      callback.searchParams.set('next', nextAfterAuth)
      callback.searchParams.set('type', selectedType)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: callback.toString(), data: { full_name: fullName.trim(), type: selectedType } },
      })
      if (signUpError) throw signUpError
      if (data.user?.identities?.length === 0) throw new Error('Este e-mail já está registado. Inicia sessão para continuar.')
      router.push('/auth/confirmar-email')
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message.toLowerCase().includes('already registered') ? 'Este e-mail já está registado. Inicia sessão.' : message || 'Não foi possível criar a conta.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: 'google' | 'facebook') => {
    if (!selectedType) { setError('Escolhe primeiro o tipo de conta.'); return }
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const nextAfterAuth = setupDestination(selectedType, destination)
      const callback = new URL('/auth/callback', window.location.origin)
      callback.searchParams.set('type', selectedType)
      callback.searchParams.set('next', nextAfterAuth)
      const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: callback.toString() } })
      if (oauthError) throw oauthError
    } catch (err) {
      setError(getErrorMessage(err) || `Não foi possível continuar com ${provider}.`)
      setIsLoading(false)
    }
  }

  const selectedLabel = ACCOUNT_TYPES.find(item => item.id === selectedType)?.label || 'conta'

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-muted/15 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-teal-500/10 p-6 lg:border-b-0 lg:border-r lg:p-10">
            <Link href="/" className="inline-flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-xs font-black text-primary-foreground">F4S</div><span className="font-black tracking-tight">FIND4SPORT</span></Link>
            <div className="mt-8 lg:mt-14"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Criar conta</p><h1 className="mt-3 text-3xl font-black tracking-tight">Identidade primeiro. Perfil depois.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">A autenticação é criada uma única vez. Profissionais e espaços configuram o respetivo perfil depois de a identidade estar validada.</p></div>
            <div className="mt-7 space-y-3 text-sm"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span>O mesmo fluxo funciona com e-mail, Google ou Facebook.</span></div><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span>Evita contas parcialmente criadas e passwords misturadas com dados profissionais.</span></div></div>
          </aside>

          <section className="p-5 sm:p-8 lg:p-10">
            {step === 'type' ? <>
              <div><h2 className="text-2xl font-black">Que conta queres criar?</h2><p className="mt-1 text-sm text-muted-foreground">Escolhe com base no que pretendes fazer.</p></div>
              <div className="mt-6 grid gap-3">{ACCOUNT_TYPES.map(item => { const Icon = item.icon; const active = selectedType === item.id; return <button key={item.id} type="button" onClick={() => { setSelectedType(item.id); setError(null) }} className={`relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${active ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'border-border bg-background hover:border-primary/40 hover:bg-muted/30'}`}><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className="font-bold">{item.label}</span>{active && <Check className="h-5 w-5 text-primary" />}</div><p className="mt-0.5 text-sm font-medium">{item.description}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p></div></button> })}</div>
              {error && <div role="alert" className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              <button onClick={continueWithType} disabled={!selectedType || isLoading} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continuar<ArrowRight className="h-4 w-4" /></>}</button>
              {!existingUser && <><div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ou continuar com</span><div className="h-px flex-1 bg-border" /></div><div className="grid gap-3 sm:grid-cols-2"><button type="button" disabled={!selectedType || isLoading} onClick={() => handleOAuthSignUp('google')} className="min-h-12 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-muted disabled:opacity-50">Google</button><button type="button" disabled={!selectedType || isLoading} onClick={() => handleOAuthSignUp('facebook')} className="min-h-12 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-muted disabled:opacity-50">Facebook</button></div></>}
              <p className="mt-6 text-center text-sm text-muted-foreground">Já tens conta? <Link href={`/auth/login?redirect=${encodeURIComponent(destination)}`} className="font-bold text-primary hover:underline">Iniciar sessão</Link></p>
            </> : <>
              <button type="button" onClick={() => setStep('type')} className="mb-5 flex min-h-10 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Alterar tipo de conta</button>
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{selectedLabel}</p><h2 className="mt-2 text-2xl font-black">Criar dados de acesso</h2><p className="mt-1 text-sm text-muted-foreground">Depois de confirmares o e-mail, continuas automaticamente para a configuração adequada.</p></div>
              <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                <label className="block space-y-1.5"><span className="text-sm font-semibold">Nome</span><input className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" autoComplete="name" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nome completo" /></label>
                <label className="block space-y-1.5"><span className="text-sm font-semibold">E-mail</span><input className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@exemplo.pt" /></label>
                <label className="block space-y-1.5"><span className="text-sm font-semibold">Palavra-passe</span><span className="relative block"><input className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
                <label className="block space-y-1.5"><span className="text-sm font-semibold">Confirmar palavra-passe</span><span className="relative block"><input className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" type={showRepeatPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} placeholder="Repete a palavra-passe" /><button type="button" onClick={() => setShowRepeatPassword(v => !v)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" aria-label={showRepeatPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}>{showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
                {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                <button type="submit" disabled={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50">{isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />A criar…</> : <>Criar conta<ArrowRight className="h-4 w-4" /></>}</button>
              </form>
              <p className="mt-5 text-xs leading-5 text-muted-foreground">Ao criar a conta aceitas os <Link href="/termos" className="font-semibold underline">Termos</Link> e a <Link href="/privacidade" className="font-semibold underline">Política de Privacidade</Link>.</p>
            </>}
          </section>
        </div>
      </div>
    </main>
  )
}

export default function RegisterPage() {
  return <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}><RegisterForm /></Suspense>
}
