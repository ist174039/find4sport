'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import { User, Trophy, Building2, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlatformRole } from '@/lib/auth/roles'

type AccountType = PlatformRole

const accountTypes = [
  {
    id: 'athlete' as AccountType,
    label: 'Utilizador',
    subtitle: 'Para quem quer explorar',
    description: 'Explore espaços desportivos, descubra profissionais e inscreva-se em eventos perto de si.',
    features: ['Pesquisa e filtragem avançada', 'Favoritos e listas', 'Acesso gratuito'],
    icon: User,
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-600',
    borderActive: 'border-blue-500 ring-2 ring-blue-100',
    badgeText: 'Grátis',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'professional' as AccountType,
    label: 'Profissional',
    subtitle: 'Para PT, fisio, nutrição e mais',
    description: 'Crie o seu perfil verificado, gira a sua agenda e atraia novos clientes.',
    features: ['Perfil verificado', 'Gestão de agenda', 'Analytics de perfil'],
    icon: Trophy,
    accentColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-600',
    borderActive: 'border-emerald-500 ring-2 ring-emerald-100',
    badgeText: 'Mais popular',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'venue_manager' as AccountType,
    label: 'Espaço',
    subtitle: 'Para ginásios e instalações',
    description: 'Registe o seu espaço, gira reservas online e aumente a sua visibilidade.',
    features: ['Reservas online', 'Gestão de horários', 'Dashboard completo'],
    icon: Building2,
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-violet-600',
    borderActive: 'border-purple-500 ring-2 ring-purple-100',
    badgeText: 'Para negócios',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
]

type Step = 'tipo' | 'formulario'

function RegisterForm() {
  const [step, setStep] = useState<Step>('tipo')
  const [selectedType, setSelectedType] = useState<AccountType | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const router = useRouter()
  const selectedTypeData = accountTypes.find((t) => t.id === selectedType)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) setUser(currentUser)
    }
    checkUser()
  }, [])

  const handleTypeSelect = (type: AccountType) => setSelectedType(type)

  const handleContinueFromType = async () => {
    if (!selectedType) return
    if (selectedType === 'professional') {
      router.push('/auth/registar/profissional')
      return
    }
    if (selectedType === 'venue_manager') {
      router.push('/auth/registar/espaco')
      return
    }

    if (user) {
      setIsLoading(true)
      const supabase = createClient()
      const { error: upsertError } = await supabase.from('platform_users').upsert({
        id: user.id,
        type: 'athlete',
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
      })
      if (!upsertError) {
        window.location.href = '/dashboard'
      } else {
        setError('Ocorreu um erro ao atualizar o perfil. ' + upsertError.message)
        setIsLoading(false)
      }
      return
    }

    setStep('formulario')
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('As palavras-passe não coincidem')
      setIsLoading(false)
      return
    }
    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            type: selectedType ?? 'athlete',
          },
        },
      })
      if (error) throw error
      router.push('/auth/confirmar-email')
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message.includes('already registered') ? 'Este email já está registado' : error.message)
      } else {
        setError('Ocorreu um erro. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: 'google' | 'facebook') => {
    const supabase = createClient()
    setError(null)
    try {
      let nextParam = ''
      if (selectedType === 'professional') nextParam = '?next=/auth/registar/profissional&type=professional'
      else if (selectedType === 'venue_manager') nextParam = '?next=/auth/registar/espaco&type=venue_manager'
      else if (selectedType === 'athlete') nextParam = '?next=/dashboard&type=athlete'

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback${nextParam}` },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : `Erro ao autenticar com o ${provider}.`)
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        <section className="hidden md:flex md:w-[420px] xl:w-[480px] relative flex-col justify-center px-12 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden shrink-0">
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-400 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <span className="text-white font-extrabold text-lg">F4</span>
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">FIND4SPORT</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 leading-tight">A plataforma do desporto português</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-10">Escolha o tipo de conta certo para si e comece a usar a maior rede desportiva de Portugal.</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '500+', label: 'Espaços' },
                { value: '200+', label: 'Profissionais' },
                { value: '150+', label: 'Eventos' },
                { value: '50k+', label: 'Utilizadores' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex-1 flex flex-col items-center justify-center px-6 md:px-10 lg:px-16 py-12 bg-background overflow-y-auto">
          <div className="w-full max-w-xl">
            {step === 'tipo' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-foreground mb-1">{user ? 'Falta apenas um passo!' : 'Criar Conta'}</h1>
                  <p className="text-muted-foreground text-sm">{user ? 'Escolha o tipo de perfil para concluir o seu registo.' : 'Que tipo de conta pretende criar na plataforma?'}</p>
                </div>

                <div className="grid gap-4 mb-8">
                  {accountTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = selectedType === type.id
                    return (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => handleTypeSelect(type.id)}
                        className={cn('w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left group relative overflow-hidden', isSelected ? type.borderActive + ' bg-background shadow-md' : 'border-border hover:border-muted-foreground/40 hover:shadow-sm bg-background')}
                        id={`register-type-${type.id}`}
                      >
                        {isSelected && <div className="absolute top-4 right-4"><CheckCircle className={cn('h-5 w-5', type.accentColor)} /></div>}
                        <div className="flex items-start gap-4">
                          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all', isSelected ? type.bgColor : 'bg-muted group-hover:bg-muted/70')}>
                            <Icon className={cn('h-6 w-6 transition-colors', isSelected ? type.accentColor : 'text-muted-foreground')} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <p className="font-semibold text-sm text-foreground">{type.label}</p>
                              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', type.badgeColor)}>{type.badgeText}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{type.description}</p>
                            <div className="flex flex-wrap gap-2">{type.features.map((f) => <span key={f} className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground font-medium">{f}</span>)}</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={handleContinueFromType}
                  disabled={!selectedType}
                  className={cn('w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 mb-4', selectedType ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] shadow-sm' : 'bg-muted text-muted-foreground cursor-not-allowed')}
                  id="register-continue-btn"
                >
                  {selectedType === 'professional' && 'Continuar como Profissional'}
                  {selectedType === 'venue_manager' && 'Continuar como Espaço'}
                  {selectedType === 'athlete' && 'Continuar como Utilizador'}
                  {!selectedType && 'Selecione um tipo de conta'}
                  {selectedType && <ArrowRight className="h-4 w-4" />}
                </button>

                {!user && (
                  <>
                    <div className="relative flex items-center py-5">
                      <div className="flex-grow border-t border-border" />
                      <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase tracking-wider font-medium">ou</span>
                      <div className="flex-grow border-t border-border" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <button type="button" className="w-full h-11 border border-border bg-background rounded-xl text-sm font-medium text-foreground flex items-center justify-center gap-3 hover:bg-muted transition-all active:scale-[0.98]" onClick={() => handleOAuthSignUp('google')} id="google-register-btn">Registar com Google</button>
                      <button type="button" className="w-full h-11 border border-border bg-[#1877F2] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-3 hover:bg-[#1877F2]/90 transition-all active:scale-[0.98]" onClick={() => handleOAuthSignUp('facebook')} id="facebook-register-btn">Registar com Facebook</button>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">Já tem uma conta? <Link href="/auth/login" className="text-primary font-semibold hover:underline">Entrar</Link></p>
                  </>
                )}
              </div>
            )}

            {step === 'formulario' && selectedTypeData && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <button onClick={() => setStep('tipo')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group" id="register-back-btn">
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Voltar
                </button>
                <div className="flex items-center gap-3 mb-8">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', selectedTypeData.bgColor)}><selectedTypeData.icon className={cn('h-5 w-5', selectedTypeData.accentColor)} /></div>
                  <div><h2 className="text-xl font-bold text-foreground">Conta de Utilizador</h2><p className="text-xs text-muted-foreground">Preencha os seus dados para começar</p></div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4" id="register-form">
                  <div className="space-y-1.5"><label className="text-sm font-medium text-foreground" htmlFor="fullName">Nome Completo</label><input id="fullName" className="w-full h-11 px-4 rounded-lg bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" type="text" placeholder="João Silva" required value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} /></div>
                  <div className="space-y-1.5"><label className="text-sm font-medium text-foreground" htmlFor="email">E-mail</label><input id="email" className="w-full h-11 px-4 rounded-lg bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} /></div>
                  <div className="space-y-1.5"><label className="text-sm font-medium text-foreground" htmlFor="password">Palavra-passe</label><div className="relative"><input id="password" className="w-full h-11 px-4 pr-11 rounded-lg bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" id="toggle-password-btn">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                  <div className="space-y-1.5"><label className="text-sm font-medium text-foreground" htmlFor="repeatPassword">Confirmar Palavra-passe</label><div className="relative"><input id="repeatPassword" className="w-full h-11 px-4 pr-11 rounded-lg bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" type={showRepeatPassword ? 'text' : 'password'} placeholder="Repita a palavra-passe" required value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} disabled={isLoading} /><button type="button" onClick={() => setShowRepeatPassword(!showRepeatPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" id="toggle-repeat-password-btn">{showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                  {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2"><span className="shrink-0 mt-0.5">⚠</span>{error}</div>}
                  <button type="submit" className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] mt-2 disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading} id="register-submit-btn">
                    {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />A criar conta...</> : <>Criar Conta Gratuitamente<ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>

                <div className="relative flex items-center py-5"><div className="flex-grow border-t border-border" /><span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase tracking-wider font-medium">ou</span><div className="flex-grow border-t border-border" /></div>
                <div className="flex flex-col gap-3">
                  <button type="button" className="w-full h-11 border border-border bg-background rounded-xl text-sm font-medium text-foreground flex items-center justify-center gap-3 hover:bg-muted transition-all active:scale-[0.98]" onClick={() => handleOAuthSignUp('google')} id="google-register-btn">Registar com Google</button>
                  <button type="button" className="w-full h-11 border border-border bg-[#1877F2] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-3 hover:bg-[#1877F2]/90 transition-all active:scale-[0.98]" onClick={() => handleOAuthSignUp('facebook')} id="facebook-register-btn">Registar com Facebook</button>
                </div>
                <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">Ao criar uma conta, aceita os nossos <Link href="/termos" className="underline hover:text-foreground transition-colors">Termos de Serviço</Link> e <Link href="/privacidade" className="underline hover:text-foreground transition-colors">Política de Privacidade</Link>.</p>
                <p className="text-center text-sm text-muted-foreground mt-4">Já tem conta? <Link href="/auth/login" className="text-primary font-semibold hover:underline">Entrar</Link></p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}
