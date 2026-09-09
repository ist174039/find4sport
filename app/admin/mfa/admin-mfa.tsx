'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShieldCheck, KeyRound, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AdminMfa() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState<'setup' | 'challenge'>('challenge')
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initialize() {
      const supabase = createClient()
      const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (assurance?.currentLevel === 'aal2') {
        router.replace('/admin')
        return
      }

      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
      if (factorsError) {
        setError(factorsError.message)
        setLoading(false)
        return
      }

      const verified = factors.totp.find(factor => factor.status === 'verified')
      if (verified) {
        setMode('challenge')
        setFactorId(verified.id)
        setLoading(false)
        return
      }

      const { data: enrollment, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'FIND4SPORT Admin',
      })

      if (enrollError) {
        setError(enrollError.message)
        setLoading(false)
        return
      }

      setMode('setup')
      setFactorId(enrollment.id)
      setQrCode(enrollment.totp.qr_code)
      setSecret(enrollment.totp.secret)
      setLoading(false)
    }

    void initialize()
  }, [router])

  async function verify() {
    if (!factorId || code.trim().length !== 6) return
    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
    if (challengeError) {
      setError(challengeError.message)
      setSubmitting(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim(),
    })

    if (verifyError) {
      setError('Código inválido ou expirado. Tenta novamente.')
      setSubmitting(false)
      return
    }

    router.replace('/admin')
    router.refresh()
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-xl sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">Autenticação de dois fatores</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'setup'
              ? 'Configura uma aplicação autenticadora antes de aceder ao painel administrativo.'
              : 'Introduz o código da tua aplicação autenticadora para continuar.'}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-5">
            {mode === 'setup' && qrCode && (
              <div className="space-y-4">
                <div className="mx-auto w-fit rounded-2xl border bg-white p-3">
                  <Image src={qrCode} alt="QR code para configurar autenticação de dois fatores" width={200} height={200} unoptimized />
                </div>
                {secret && (
                  <div className="rounded-xl border bg-muted/30 p-3 text-center">
                    <p className="mb-1 text-xs text-muted-foreground">Chave manual</p>
                    <code className="break-all text-xs font-semibold">{secret}</code>
                  </div>
                )}
                <p className="text-xs leading-5 text-muted-foreground">
                  Digitaliza o QR code com Google Authenticator, Microsoft Authenticator, 1Password, Authy ou outra aplicação TOTP e introduz o código de 6 dígitos.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="mfa-code" className="text-xs font-bold text-foreground/80">Código de segurança</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={event => { if (event.key === 'Enter') void verify() }}
                  placeholder="000000"
                  className="h-12 rounded-xl pl-11 text-center text-lg tracking-[0.3em]"
                />
              </div>
            </div>

            {error && <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            <Button onClick={() => void verify()} disabled={submitting || code.length !== 6 || !factorId} className="h-12 w-full rounded-xl font-bold">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === 'setup' ? 'Ativar 2FA e entrar' : 'Verificar e entrar'}
            </Button>

            <button type="button" onClick={() => void signOut()} className="w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground">
              Terminar sessão
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
