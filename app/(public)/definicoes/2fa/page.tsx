import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TwoFactorPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard/definicoes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar às definições
        </Link>
      </Button>

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Autenticação de Dois Fatores</h1>
          <Badge variant="secondary">Ainda não disponível</Badge>
        </div>
        <p className="mt-2 text-muted-foreground">
          O FIND4SPORT ainda não tem um fluxo de 2FA integrado e validado para contas de utilizador.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <ShieldAlert className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <CardTitle>Não apresentamos uma proteção que não esteja ativa</CardTitle>
              <CardDescription className="mt-1">
                Esta página não gera segredos, códigos QR ou códigos de recuperação enquanto a autenticação multifator não estiver implementada no backend.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            Quando o 2FA for disponibilizado, a ativação deverá incluir enrolamento do fator, confirmação do código, recuperação segura e validação do nível de autenticação antes de alterações sensíveis.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
