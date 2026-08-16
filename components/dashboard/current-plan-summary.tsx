import Link from 'next/link'
import { Crown, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type CurrentPlanSummaryProps = {
  planName: string
  tier: string
  commissionRate?: number | null
  status?: string | null
  currentPeriodEnd?: string | null
  cancelAtPeriodEnd?: boolean | null
}

export function CurrentPlanSummary({ planName, tier, commissionRate, status, currentPeriodEnd, cancelAtPeriodEnd }: CurrentPlanSummaryProps) {
  const renewal = currentPeriodEnd
    ? new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(currentPeriodEnd))
    : null

  return (
    <Card className="mb-8 overflow-hidden border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary"><Crown className="h-5 w-5" /></div>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className="font-semibold">Plano {planName}</p>
              <Badge variant="outline">{status || (tier === 'free' ? 'active' : '—')}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {commissionRate != null ? `Comissão ${commissionRate}%` : 'Plano comercial'}
              {renewal ? ` · período até ${renewal}` : ''}
              {cancelAtPeriodEnd ? ' · cancelamento agendado' : ''}
            </p>
          </div>
        </div>
        <Link href="/dashboard/faturacao">
          <Button variant="outline" className="w-full gap-2 sm:w-auto">Ver ou alterar plano <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </CardContent>
    </Card>
  )
}
