import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveReservationDisputeAction } from '@/app/admin/actions/reservation-disputes'

function money(value: unknown) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(value || 0))
}

export default async function AdminDisputesPage() {
  const db = createAdminClient() as any
  const { data, error } = await db.from('reservations')
    .select('id,date,start_time,end_time,amount,dispute_reason,dispute_opened_at,user:platform_users(id,full_name),professional:professionals(full_name,professional_name),space:sport_spaces(name),service:services(name),room:space_rooms(name)')
    .eq('service_delivery_status', 'disputed')
    .eq('settlement_status', 'blocked')
    .order('dispute_opened_at', { ascending: true })
  if (error) throw new Error(`Não foi possível carregar as contestações: ${error.message}`)

  return <div className="space-y-5">
    <div>
      <h1 className="text-3xl font-bold">Contestações de serviços</h1>
      <p className="mt-1 text-sm text-muted-foreground">O dinheiro permanece bloqueado até uma decisão administrativa. Revê o motivo e regista sempre a fundamentação.</p>
    </div>
    {!data?.length ? <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">Não existem contestações pendentes.</div> : <div className="space-y-4">
      {data.map((row: any) => {
        const provider = row.professional?.professional_name || row.professional?.full_name || row.space?.name || 'Prestador'
        const subject = row.service?.name || row.room?.name || 'Reserva'
        return <article key={row.id} className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{subject}</h2><Badge variant="destructive">Pagamento bloqueado</Badge></div>
              <p className="mt-1 text-sm text-muted-foreground">Atleta: {row.user?.full_name || 'Utilizador'} · Prestador: {provider}</p>
              <p className="mt-1 text-sm text-muted-foreground">{new Date(`${row.date}T12:00:00`).toLocaleDateString('pt-PT')} · {String(row.start_time).slice(0,5)}–{String(row.end_time).slice(0,5)}</p>
            </div>
            <strong className="shrink-0">{money(row.amount)}</strong>
          </div>
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Motivo indicado pelo atleta</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{row.dispute_reason || 'Sem descrição.'}</p>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <form action={async (formData: FormData) => { 'use server'; await resolveReservationDisputeAction(row.id, 'release', String(formData.get('note') || '')) }} className="rounded-xl border p-3">
              <p className="text-sm font-semibold">Decidir a favor do prestador</p>
              <p className="mt-1 text-xs text-muted-foreground">Marca a prestação como concluída e liberta o valor para o prestador.</p>
              <Textarea name="note" minLength={5} maxLength={2000} required className="mt-3" placeholder="Fundamentação da decisão" />
              <Button type="submit" className="mt-3 w-full">Libertar pagamento</Button>
            </form>
            <form action={async (formData: FormData) => { 'use server'; await resolveReservationDisputeAction(row.id, 'refund', String(formData.get('note') || '')) }} className="rounded-xl border border-destructive/30 p-3">
              <p className="text-sm font-semibold">Decidir a favor do atleta</p>
              <p className="mt-1 text-xs text-muted-foreground">Inicia o reembolso integral e cancela a liquidação ao prestador.</p>
              <Textarea name="note" minLength={5} maxLength={2000} required className="mt-3" placeholder="Fundamentação da decisão" />
              <Button type="submit" variant="destructive" className="mt-3 w-full">Reembolsar atleta</Button>
            </form>
          </div>
        </article>
      })}
    </div>}
  </div>
}
