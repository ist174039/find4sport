'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ArrowLeft, Shield, Smartphone, KeyRound, Check, Loader2, QrCode } from 'lucide-react'

export default function TwoFactorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [enabled, setEnabled] = useState(false)
  const [method, setMethod] = useState<'app' | 'sms'>('app')
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'setup' | 'verify' | 'codes'>('setup')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [backupCodes] = useState([
    'F4S7-9K2M', 'X8P1-3W5N', 'R6T0-4Q9L',
    'V2C5-8H1J', 'Y3B7-1G4D', 'M9N0-6S3K',
  ])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/definicoes"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Autenticação de Dois Fatores</h1>
        <p className="text-muted-foreground">Aumente a segurança da sua conta</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>2FA</CardTitle>
                <CardDescription>Proteção adicional para a sua conta</CardDescription>
              </div>
            </div>
            <Badge variant={enabled ? 'default' : 'secondary'} className={enabled ? 'bg-green-500' : ''}>
              {enabled ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="space-y-6 p-6">
          {error && <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}

          <div className="space-y-2">
            <Label>Método de Autenticação</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMethod('app')}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors ${method === 'app' ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
              >
                <Smartphone className="h-6 w-6" />
                <span className="text-sm font-medium">App Autenticador</span>
                <span className="text-xs text-muted-foreground">Google Authenticator, Authy</span>
              </button>
              <button
                onClick={() => setMethod('sms')}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors ${method === 'sms' ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
              >
                <KeyRound className="h-6 w-6" />
                <span className="text-sm font-medium">SMS</span>
                <span className="text-xs text-muted-foreground">Código por mensagem</span>
              </button>
            </div>
          </div>

          {method === 'app' && (
            <div className="space-y-4 rounded-lg border border-dashed p-4">
              <div className="flex items-center gap-3">
                <QrCode className="h-16 w-16 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">1. Escaneie o código QR</p>
                  <p className="text-xs text-muted-foreground">Use o Google Authenticator ou Authy para escanear</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">2. Ou insira manualmente:</p>
                <code className="mt-1 block rounded bg-muted p-2 text-xs">F4S7 9K2M X8P1 3W5N</code>
              </div>
              <div className="space-y-2">
                <Label>Código de verificação</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" maxLength={6} className="text-center text-lg tracking-widest" />
              </div>
            </div>
          )}

          {method === 'sms' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Número de Telemóvel</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+351 912 345 678" />
              </div>
              <Button variant="outline" className="w-full" disabled={!phone.trim()}>
                <Smartphone className="mr-2 h-4 w-4" /> Enviar Código
              </Button>
            </div>
          )}

          <Button className="w-full" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A ativar...</> : <><Shield className="mr-2 h-4 w-4" /> Ativar 2FA</>}
          </Button>
        </CardContent>
      </Card>

      {/* Backup codes */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />
            Códigos de Backup
          </CardTitle>
          <CardDescription>Guarde estes códigos num local seguro. Use-os se perder o acesso ao autenticador.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-4 font-mono text-sm">
            {backupCodes.map((c, i) => (
              <span key={i} className="text-center tracking-wider">{c}</span>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3 w-full">
            <QrCode className="mr-2 h-4 w-4" /> Descarregar Códigos
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
