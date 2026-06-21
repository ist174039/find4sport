'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'
import { User, Trophy, Building2, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { cn } from '@/lib/utils'

type AccountType = 'utilizador' | 'profissional' | 'espaco'

const accountTypes = [
  {
    id: 'utilizador' as AccountType,
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
    id: 'profissional' as AccountType,
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
    id: 'espaco' as AccountType,
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

  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const selectedTypeData = accountTypes.find((t) => t.id === selectedType)

  const handleTypeSelect = (type: AccountType) => {
    setSelectedType(type)
  }

  const handleContinueFromType = () => {
    if (!selectedType) return
    if (selectedType === 'profissional') {
      router.push('/auth/registo-profissional/passo1-1')
      return
    }
    if (selectedType === 'espaco') {
      router.push('/auth/registo-espaco/passo1')
      return
    }
    // utilizador — show the form
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
            role: selectedType ?? 'utilizador',
          },
        },
      })
      if (error) throw error
      router.push('/auth/confirmar-email')
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('already registered')) {
          setError('Este email já está registado')
        } else {
          setError(error.message)
        }
      } else {
        setError('Ocorreu um erro. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: 'google') => {
    const supabase = createClient()
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Erro ao autenticar com o Google.')
      }
    }
  }

  return (
    <PageShell>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">

        {/* ── Left Panel: Brand ── */}
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
            <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
              A plataforma do desporto português
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-10">
              Escolha o tipo de conta certo para si e comece a usar a maior rede desportiva de Portugal.
            </p>

            {/* Stats */}
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

        {/* ── Right Panel: Step-based Registration ── */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 md:px-10 lg:px-16 py-12 bg-background overflow-y-auto">
          <div className="w-full max-w-xl">

            {/* ── STEP 1: Escolha do tipo de conta ── */}
            {step === 'tipo' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-foreground mb-1">Criar Conta</h1>
                  <p className="text-muted-foreground text-sm">Que tipo de conta pretende criar na plataforma?</p>
                </div>

                <div className="grid gap-4 mb-8">
                  {accountTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = selectedType === type.id
                    return (
                      <button
                        key={type.id}
                        onClick={() => handleTypeSelect(type.id)}
                        className={cn(
                          'w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left group relative overflow-hidden',
                          isSelected
                            ? type.borderActive + ' bg-background shadow-md'
                            : 'border-border hover:border-muted-foreground/40 hover:shadow-sm bg-background'
                        )}
                        id={`register-type-${type.id}`}
                      >
                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="absolute top-4 right-4">
                            <CheckCircle className={cn('h-5 w-5', type.accentColor)} />
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all',
                            isSelected ? type.bgColor : 'bg-muted group-hover:bg-muted/70'
                          )}>
                            <Icon className={cn('h-6 w-6 transition-colors', isSelected ? type.accentColor : 'text-muted-foreground')} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <p className="font-semibold text-sm text-foreground">{type.label}</p>
                              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', type.badgeColor)}>
                                {type.badgeText}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{type.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {type.features.map((f) => (
                                <span key={f} className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground font-medium">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={handleContinueFromType}
                  disabled={!selectedType}
                  className={cn(
                    'w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 mb-4',
                    selectedType
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] shadow-sm'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                  id="register-continue-btn"
                >
                  {selectedType === 'profissional' && 'Continuar como Profissional'}
                  {selectedType === 'espaco' && 'Continuar como Espaço'}
                  {selectedType === 'utilizador' && 'Continuar como Utilizador'}
                  {!selectedType && 'Selecione um tipo de conta'}
                  {selectedType && <ArrowRight className="h-4 w-4" />}
                </button>

                <p className="text-center text-sm text-muted-foreground">
                  Já tem uma conta?{' '}
                  <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                    Entrar
                  </Link>
                </p>
              </div>
            )}

            {/* ── STEP 2: Formulário (Utilizador) ── */}
            {step === 'formulario' && selectedTypeData && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Back */}
                <button
                  onClick={() => setStep('tipo')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
                  id="register-back-btn"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Voltar
                </button>

                {/* Type badge */}
                <div className="flex items-center gap-3 mb-8">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', selectedTypeData.bgColor)}>
                    <selectedTypeData.icon className={cn('h-5 w-5', selectedTypeData.accentColor)} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Conta de Utilizador</h2>
                    <p className="text-xs text-muted-foreground">Preencha os seus dados para começar</p>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4" id="register-form">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="fullName">
                      Nome Completo
                    </label>
                    <input
                      id="fullName"
                      className="w-full h-11 px-4 rounded-lg bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      type="text"
                      placeholder="João Silva"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="email">
                      E-mail
                    </label>
                    <input
                      id="email"
                      className="w-full h-11 px-4 rounded-lg bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="password">
                      Palavra-passe
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        className="w-full h-11 px-4 pr-11 rounded-lg bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        id="toggle-password-btn"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="repeatPassword">
                      Confirmar Palavra-passe
                    </label>
                    <div className="relative">
                      <input
                        id="repeatPassword"
                        className="w-full h-11 px-4 pr-11 rounded-lg bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        type={showRepeatPassword ? 'text' : 'password'}
                        placeholder="Repita a palavra-passe"
                        required
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        id="toggle-repeat-password-btn"
                      >
                        {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">⚠</span>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    id="register-submit-btn"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        A criar conta...
                      </>
                    ) : (
                      <>
                        Criar Conta Gratuitamente
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center py-5">
                  <div className="flex-grow border-t border-border" />
                  <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase tracking-wider font-medium">ou</span>
                  <div className="flex-grow border-t border-border" />
                </div>

                {/* Google OAuth */}
                <button
                  className="w-full h-11 border border-border bg-background rounded-xl text-sm font-medium text-foreground flex items-center justify-center gap-3 hover:bg-muted transition-all active:scale-[0.98]"
                  onClick={() => handleOAuthSignUp('google')}
                  id="google-register-btn"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Registar com Google
                </button>

                {/* Legal */}
                <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
                  Ao criar uma conta, aceita os nossos{' '}
                  <Link href="/termos" className="underline hover:text-foreground transition-colors">
                    Termos de Serviço
                  </Link>{' '}
                  e{' '}
                  <Link href="/privacidade" className="underline hover:text-foreground transition-colors">
                    Política de Privacidade
                  </Link>.
                </p>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  Já tem conta?{' '}
                  <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                    Entrar
                  </Link>
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
