'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Check, Clock, AlertTriangle, XCircle, ArrowLeft, Mail, RefreshCw } from 'lucide-react'
import type { ProfessionalStatus } from '@/lib/types'

type StatusStep = {
  label: string
  status: 'complete' | 'active' | 'pending' | 'error'
  icon: React.ReactNode
}

function getStatusSteps(professionalStatus: ProfessionalStatus): StatusStep[] {
  const baseSteps: StatusStep[] = [
    { label: 'Submetido', status: 'complete', icon: <Check className="h-4 w-4" /> },
    { label: 'Em Revisão', status: 'active', icon: <Clock className="h-4 w-4" /> },
    { label: 'Aprovado', status: 'pending', icon: <Check className="h-4 w-4" /> },
  ]

  if (professionalStatus === 'rejected') {
    baseSteps[1].status = 'error'
    baseSteps[1].icon = <XCircle className="h-4 w-4" />
    baseSteps[2].status = 'pending'
  } else if (professionalStatus === 'active') {
    baseSteps[1].status = 'complete'
    baseSteps[1].icon = <Check className="h-4 w-4" />
    baseSteps[2].status = 'complete'
  } else if (professionalStatus === 'suspended') {
    baseSteps[1].status = 'error'
    baseSteps[2].status = 'pending'
  }

  return baseSteps
}

export default function ProfessionalEstadoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [professional, setProfessional] = useState<{
    id: string
    status: ProfessionalStatus
    created_at: string
    rejection_reason?: string
    reviewed_at?: string
  } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }

        const { data: prof, error: profError } = await supabase
          .from('professionals')
          .select('id, status, created_at, rejection_reason, reviewed_at')
          .eq('user_id', user.id)
          .single()

        if (profError) {
          if (profError.code === 'PGRST116') {
            // No professional profile yet - redirect to register
            router.push('/profissional/registar')
            return
          }
          throw profError
        }

        setProfessional(prof)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar estado')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Erro</h2>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <Button onClick={() => router.push('/')} variant="outline" className="mt-6">
          Voltar ao Início
        </Button>
      </div>
    )
  }

  if (!professional) return null

  const steps = getStatusSteps(professional.status)
  const createdDate = new Date(professional.created_at).toLocaleDateString('pt-PT', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar ao Dashboard
      </Link>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Estado do Teu Perfil</CardTitle>
          <CardDescription>
            Acompanha o processo de validação do teu perfil profissional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Progress Timeline */}
          <div className="flex items-center justify-center gap-0">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                      s.status === 'complete'
                        ? 'bg-teal-600 text-white'
                        : s.status === 'active'
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                          : s.status === 'error'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {s.status === 'active' ? (
                      <Clock className="h-5 w-5 animate-pulse" />
                    ) : (
                      s.icon
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-medium ${
                      s.status === 'complete'
                        ? 'text-teal-600'
                        : s.status === 'active'
                          ? 'text-amber-600'
                          : s.status === 'error'
                            ? 'text-red-600'
                            : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-3 h-1 w-12 sm:w-16 ${
                      s.status === 'complete' ? 'bg-teal-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Status Card */}
          {professional.status === 'pending' && (
            <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-amber-800">Perfil em Revisão</h3>
              <p className="mt-2 text-sm text-amber-700">
                A nossa equipa está a analisar o teu perfil. Receberás um email assim que o processo estiver concluído.
              </p>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                <div>
                  <p className="font-semibold text-amber-800">Submetido</p>
                  <p className="text-amber-600">{createdDate}</p>
                </div>
                <div className="h-8 w-px bg-amber-300" />
                <div>
                  <p className="font-semibold text-amber-800">Estimativa</p>
                  <p className="text-amber-600">24-48h</p>
                </div>
              </div>
            </div>
          )}

          {professional.status === 'active' && (
            <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-teal-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-green-800">Perfil Aprovado! 🎉</h3>
              <p className="mt-2 text-sm text-green-700">
                O teu perfil está visível na plataforma. Já podes começar a receber contactos de clientes.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link href="/dashboard">
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    Ir para o Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/perfil">
                  <Button variant="outline">Editar Perfil</Button>
                </Link>
              </div>
            </div>
          )}

          {professional.status === 'rejected' && (
            <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-800">Perfil Não Aprovado</h3>
              <p className="mt-2 text-sm text-red-700">
                O teu perfil não foi aprovado. Motivo:
              </p>
              <div className="mt-3 rounded-lg border border-red-200 bg-white p-3 text-sm text-red-700">
                {professional.rejection_reason || 'Não foi especificado um motivo. Contacta o suporte para mais informações.'}
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <Link href="/profissional/registar">
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <RefreshCw className="mr-2 h-4 w-4" /> Submeter Novamente
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    const mailto = `mailto:suporte@find4sport.pt?subject=Revisão%20de%20Perfil%20Profissional&body=Olá,%20gostaria%20de%20obter%20mais%20informações%20sobre%20a%20rejeição%20do%20meu%20perfil.%0A%0AObrigado.`
                    window.open(mailto)
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" /> Contactar Suporte
                </Button>
              </div>
            </div>
          )}

          {professional.status === 'suspended' && (
            <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-800">Perfil Suspenso</h3>
              <p className="mt-2 text-sm text-red-700">
                O teu perfil foi suspenso. Contacta o suporte para mais informações.
              </p>
              <div className="mt-6">
                <Button variant="outline" onClick={() => window.open('mailto:suporte@find4sport.pt')}>
                  <Mail className="mr-2 h-4 w-4" /> Contactar Suporte
                </Button>
              </div>
            </div>
          )}

          {/* What happens next */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-gray-900">O que acontece a seguir?</h4>
            <div className="space-y-3">
              {[
                {
                  icon: <Check className="h-4 w-4" />,
                  bg: 'bg-green-100',
                  color: 'text-green-700',
                  text: 'Verificamos as tuas qualificações e dados',
                  done: true,
                },
                {
                  icon: <Clock className="h-4 w-4" />,
                  bg: 'bg-amber-100',
                  color: 'text-amber-700',
                  text: 'O teu perfil fica visível na plataforma',
                  done: professional.status === 'active',
                },
                {
                  icon: <Mail className="h-4 w-4" />,
                  bg: 'bg-gray-100',
                  color: 'text-gray-500',
                  text: 'Começas a receber contactos de clientes',
                  done: professional.status === 'active',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      item.done ? 'bg-teal-100 text-teal-700' : item.bg
                    } ${item.color}`}
                  >
                    {item.icon}
                  </div>
                  <span className={`text-sm ${item.done ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
