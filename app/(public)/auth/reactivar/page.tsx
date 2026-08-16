import { redirect } from 'next/navigation'
import { RotateCcw, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { reactivateAccountAction } from '@/app/actions/account-lifecycle'
import { Button } from '@/components/ui/button'

export default async function ReactivateAccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/auth/reactivar')

  const status = String(user.user_metadata?.account_status || '')
  if (!['deactivated', 'deletion_requested'].includes(status)) redirect('/dashboard')

  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-muted/20 px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="h-6 w-6" /></div>
        <h1 className="mt-5 text-2xl font-bold">Conta desativada</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{status === 'deletion_requested' ? 'Existe um pedido de eliminação associado a esta conta porque foi detetado histórico transacional. Podes cancelar o pedido e reativar a conta.' : 'A conta está desativada. Os dados permanecem preservados e podes reativá-la agora.'}</p>
        <form action={reactivateAccountAction} className="mt-6"><Button type="submit" className="min-h-11 w-full"><RotateCcw className="mr-2 h-4 w-4" />Reativar conta</Button></form>
        <form action="/auth/logout" method="get" className="mt-2"><Button type="submit" variant="ghost" className="min-h-11 w-full">Terminar sessão</Button></form>
      </section>
    </main>
  )
}
