'use client'

import Link from 'next/link'
import { useState } from 'react'
import { User, Trophy, Building2, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { cn } from '@/lib/utils'

type AccountType = 'utilizador' | 'profissional' | 'espaco'

const accountTypes = [
  {
    id: 'utilizador' as AccountType,
    label: 'Utilizador',
    description: 'Explore espaços, profissionais e eventos desportivos.',
    icon: User,
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderActive: 'border-blue-500 ring-2 ring-blue-200',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'profissional' as AccountType,
    label: 'Profissional',
    description: 'Gira os seus serviços, agenda e clientes na plataforma.',
    icon: Trophy,
    accentColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderActive: 'border-emerald-500 ring-2 ring-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'espaco' as AccountType,
    label: 'Espaço',
    description: 'Gira o seu espaço, reservas e horários.',
    icon: Building2,
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderActive: 'border-purple-500 ring-2 ring-purple-200',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
]

const redirectByType: Record<AccountType, string> = {
  utilizador: '/dashboard',
  profissional: '/profissional',
  espaco: '/espaco/dashboard',
}

export default function LoginPage() {
  const [step, setStep] = useState<'tipo' | 'formulario'>('tipo')
  const [selectedType, setSelectedType] = useState<AccountType | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const selectedTypeData = accountTypes.find((t) => t.id === selectedType)

  const handleTypeSelect = (type: AccountType) => {
    setSelectedType(type)
  }

  const handleContinue = () => {
    if (selectedType) {
      setStep('formulario')
    }
  }

  return (
    <PageShell hideFooter={false}>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">

        {/* ── Left Panel: Brand & Value Prop ── */}
        <section className="hidden md:flex md:w-1/2 relative flex-col justify-center px-12 bg-primary overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover mix-blend-overlay opacity-30"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAooePVRgbG1MssyQIBDo1NXsnGEcNnrOr86f41cmyApanmd-BGZgwTOGhAawgGl2J5shes6YOI_Ch9YQVqaBLYdcOZgKC2HAR9QQlfyIk16Mf5VX-ZLIHaiGp3svCB4UxAtCTCDiOsBnoPbAJQffpo8fe1cl2OVVZSW-6MZTswSpvdAPQ-eih5FOjyULJ8bTmFCGEjkmlRvustQLiQt3YFlJdug6dpCztRPig54yroiONDjxqxD3t4713vko4wM_5MwFtN7gs5"
              alt="Atleta a treinar"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-teal-800/90 z-10" />
          <div className="relative z-20 max-w-lg">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <span className="text-white font-extrabold text-lg">F4</span>
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">FIND4SPORT</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Onde a Performance<br />
              <span className="text-white/80">Encontra a Reputação.</span>
            </h1>
            <p className="text-white/80 text-base leading-relaxed mb-10">
              Junte-se à maior rede de desporto em Portugal. Descubra espaços premium, profissionais certificados e eventos exclusivos.
            </p>
            <div className="space-y-4">
              {[
                { icon: '✓', text: 'Profissionais verificados e certificados' },
                { icon: '✓', text: 'Espaços com reserva online instantânea' },
                { icon: '✓', text: 'Comunidade de mais de 50.000 atletas' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {item.icon}
                  </span>
                  <p className="text-white/90 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Right Panel: Auth Form ── */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-12 bg-background">
          <div className="w-full max-w-md">

            {/* ── STEP 1: Escolha de tipo ── */}
            {step === 'tipo' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-1">Bem-vindo de volta</h2>
                  <p className="text-muted-foreground text-sm">Como pretende entrar na plataforma?</p>
                </div>

                <div className="space-y-3 mb-8">
                  {accountTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = selectedType === type.id
                    return (
                      <button
                        key={type.id}
                        onClick={() => handleTypeSelect(type.id)}
                        className={cn(
                          'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group',
                          isSelected
                            ? type.borderActive
                            : 'border-border hover:border-muted-foreground/30 hover:bg-muted/30'
                        )}
                        id={`login-type-${type.id}`}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                          isSelected ? type.bgColor : 'bg-muted group-hover:bg-muted/80'
                        )}>
                          <Icon className={cn('h-6 w-6', isSelected ? type.accentColor : 'text-muted-foreground')} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className={cn('font-semibold text-sm', isSelected ? 'text-foreground' : 'text-foreground')}>
                              {type.label}
                            </p>
                            {isSelected && (
                              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', type.badgeColor)}>
                                Selecionado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-snug">{type.description}</p>
                        </div>
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
                          isSelected ? `border-current ${type.accentColor}` : 'border-muted-foreground/30'
                        )}>
                          {isSelected && <div className={cn('w-2.5 h-2.5 rounded-full', type.bgColor.replace('bg-', 'bg-').replace('-50', '-500'))} />}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={handleContinue}
                  disabled={!selectedType}
                  className={cn(
                    'w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200',
                    selectedType
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                  id="login-continue-btn"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Não tem conta?{' '}
                  <Link href="/auth/registar" className="text-primary font-semibold hover:underline">
                    Criar conta
                  </Link>
                </p>
              </div>
            )}

            {/* ── STEP 2: Formulário de Login ── */}
            {step === 'formulario' && selectedTypeData && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Back button */}
                <button
                  onClick={() => setStep('tipo')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
                  id="login-back-btn"
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
                    <h2 className="text-xl font-bold text-foreground">Entrar como {selectedTypeData.label}</h2>
                    <p className="text-xs text-muted-foreground">Insira as suas credenciais</p>
                  </div>
                </div>

                {/* Toggle Login/Signup */}
                <div className="flex p-1 bg-muted rounded-xl mb-6">
                  <button className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 bg-background text-foreground shadow-sm">
                    Entrar
                  </button>
                  <Link href="/auth/registar" className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-muted-foreground hover:bg-background/50 text-center flex items-center justify-center">
                    Criar Conta
                  </Link>
                </div>

                {/* Email & Password form */}
                <form className="space-y-4" action="/auth/login" method="POST" id="login-form">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground block" htmlFor="email">
                      E-mail
                    </label>
                    <input
                      id="email"
                      className="w-full h-11 px-4 rounded-lg bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      placeholder="nome@exemplo.pt"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-foreground block" htmlFor="password">
                        Palavra-passe
                      </label>
                      <Link href="/auth/recuperar-password" className="text-xs text-primary hover:underline font-medium">
                        Esqueceu-se?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        className="w-full h-11 px-4 pr-11 rounded-lg bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
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

                  <button
                    type="submit"
                    className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] mt-2"
                    id="login-submit-btn"
                  >
                    Entrar na Conta
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center py-5">
                  <div className="flex-grow border-t border-border" />
                  <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase tracking-wider font-medium">ou</span>
                  <div className="flex-grow border-t border-border" />
                </div>

                {/* Social Login */}
                <button
                  className="w-full h-11 border border-border bg-background rounded-xl text-sm font-medium text-foreground flex items-center justify-center gap-3 hover:bg-muted transition-all active:scale-[0.98]"
                  id="google-login-btn"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuar com Google
                </button>

                <p className="text-center text-xs text-muted-foreground mt-6">
                  Não tem conta?{' '}
                  <Link href="/auth/registar" className="text-primary font-semibold hover:underline">
                    Criar conta gratuitamente
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
