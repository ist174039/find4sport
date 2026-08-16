'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  return value
}

function LoginForm() {
  const searchParams = useSearchParams()
  const destination = safeNext(searchParams.get('redirect') || searchParams.get('next'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setError(null)
    setOauthLoading(provider)
    try {
      const supabase = createClient()
      const callback = new URL('/auth/callback', window.location.origin)
      callback.searchParams.set('next', destination)
      const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: callback.toString() } })
      if (oauthError) throw oauthError
    } catch (err: any) {
      setError(err?.message || 'Não foi possível iniciar sessão com este fornecedor.')
      setOauthLoading(null)
    }
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (signInError) throw signInError
      const resolve = new URL('/auth/resolve', window.location.origin)
      resolve.searchParams.set('next', destination)
      window.location.assign(resolve.toString())
    } catch (err: any) {
      const message = String(err?.message || '').toLowerCase()
      setError(message.includes('invalid login credentials') ? 'E-mail ou palavra-passe incorretos.' : err?.message || 'Não foi possível iniciar sessão.')
    } finally {
      setIsLoading(false)
    }
  }

  const busy = isLoading || Boolean(oauthLoading)

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-muted/15 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden border-r border-border bg-gradient-to-br from-primary/10 via-background to-teal-500/10 p-10 lg:flex lg:flex-col lg:justify-between">
          <div><Link href="/" className="inline-flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary font-black text-primary-foreground">F4S</div><span className="text-xl font-black tracking-tight">FIND4SPORT</span></Link><div className="mt-14 max-w-sm"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Conta FIND4SPORT</p><h1 className="mt-3 text-4xl font-black leading-tight">Entra e continua exatamente onde estavas.</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">Pesquisa, reservas, favoritos, comunidades, mensagens e gestão do teu perfil numa única sessão.</p></div></div>
          <div className="space-y-3 text-sm"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-primary" /><span>Autenticação protegida pelo Supabase Auth</span></div><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /><span>O destino original é preservado depois do login</span></div></div>
        </aside>

        <section className="p-5 sm:p-8 lg:p-12">
          <div className="mx-auto max-w-md">
            <div className="lg:hidden"><Link href="/" className="inline-flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-black text-primary-foreground">F4S</div><span className="font-black">FIND4SPORT</span></Link></div>
            <div className="mt-8 lg:mt-0"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Iniciar sessão</p><h2 className="mt-2 text-3xl font-black tracking-tight">Bem-vindo de volta</h2><p className="mt-2 text-sm text-muted-foreground">Usa o teu e-mail ou uma conta social. Depois do login regressas ao fluxo que estavas a executar.</p></div>

            <form className="mt-8 space-y-5" onSubmit={handleLogin}>
              <label className="block space-y-2"><span className="text-sm font-semibold">E-mail</span><input className="h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="nome@exemplo.pt" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={busy} /></label>
              <label className="block space-y-2"><span className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">Palavra-passe</span><Link href="/auth/recuperar-password" className="text-xs font-semibold text-primary hover:underline">Recuperar palavra-passe</Link></span><span className="relative block"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-12 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="A tua palavra-passe" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>

              {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

              <button type="submit" disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">{isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />A entrar…</> : <>Entrar<ArrowRight className="h-4 w-4" /></>}</button>
            </form>

            <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ou continuar com</span><div className="h-px flex-1 bg-border" /></div>

            <div className="grid gap-3 sm:grid-cols-2"><button type="button" disabled={busy} onClick={() => handleOAuthLogin('google')} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold hover:bg-muted disabled:opacity-60">{oauthLoading === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-base font-black">G</span>}Google</button><button type="button" disabled={busy} onClick={() => handleOAuthLogin('facebook')} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold hover:bg-muted disabled:opacity-60">{oauthLoading === 'facebook' ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-base font-black text-[#1877F2]">f</span>}Facebook</button></div>

            <p className="mt-7 text-center text-sm text-muted-foreground">Ainda não tens conta? <Link href={`/auth/registar?next=${encodeURIComponent(destination)}`} className="font-bold text-primary hover:underline">Criar conta</Link></p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}><LoginForm /></Suspense>
}
