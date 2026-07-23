'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Shield, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const errCode = searchParams.get('error')
    if (errCode === 'unauthorized') {
      setError('A tua conta não tem permissões de administração.')
    }

    async function checkCurrentSession() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: adminUser } = await supabase
          .from('admins')
          .select('*')
          .eq('auth_user_id', user.id)
          .single()
        
        if (adminUser) {
          router.push('/admin')
        }
      }
    }
    checkCurrentSession()
  }, [searchParams, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      let loginEmail = email.trim()
      if (loginEmail.toLowerCase() === 'admin') {
        loginEmail = 'admin@find4sport.pt'
      }

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
      })

      if (signInError) throw signInError

      const user = authData.user
      if (!user) throw new Error('Falha ao autenticar utilizador.')

      const { data: adminUser, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (adminError || !adminUser) {
        await supabase.auth.signOut()
        throw new Error('A tua conta não tem permissões de administração.')
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      console.error('Admin Login Error:', err)
      setError(err.message || 'Erro ao efetuar login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-sans">
      
      {/* Light glow effects aligned with homepage aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-200/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-300/10 blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Unified Logo - Matches Header exactly */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-sm">
              <span className="text-xl font-bold text-white">F4</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-foreground">
              FIND<span className="text-primary">4</span>SPORT
            </span>
          </Link>
          <div className="space-y-1 mt-1">
            <h1 className="text-lg font-bold text-foreground/90 tracking-tight flex items-center justify-center gap-1.5">
              <Shield className="h-4.5 w-4.5 text-primary" /> Painel Administrativo
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Controle de Operações e Monitorização</p>
          </div>
        </div>

        {/* Login Card - Clean Light layout matching Homepage template */}
        <div className="bg-white border border-border/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-100/50 space-y-6">
          
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-foreground/80">Email Administrativo</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/75" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="admin@find4sport.pt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 rounded-xl h-12 bg-white border-border/70 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/45 transition-all text-sm shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-foreground/80">Palavra-passe</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/75" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 rounded-xl h-12 bg-white border-border/70 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/45 transition-all text-sm shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shadow-md shadow-primary/10 text-sm mt-6 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary-foreground" />
              ) : (
                'Entrar no Painel'
              )}
            </Button>
          </form>
        </div>

        {/* Footer info link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-all inline-flex items-center gap-1 font-medium">
            Voltar para a Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
