import { Building2, CalendarDays, Users, UserRound } from 'lucide-react'
import { ModalityIcon } from '@/components/modality-icon'

type Kind = 'professional' | 'space' | 'event' | 'community'
const labels: Record<Kind, string> = { professional: 'Profissional', space: 'Espaço desportivo', event: 'Evento desportivo', community: 'Comunidade desportiva' }
const defaults = { professional: UserRound, space: Building2, event: CalendarDays, community: Users }

export function CategoryPlaceholder({ kind, categoryName, iconKey, className = '' }: { kind: Kind; categoryName?: string | null; iconKey?: string | null; className?: string }) {
  const Fallback = defaults[kind]
  return <div className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 via-muted to-secondary/20 p-4 text-center text-primary ${className}`}><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-background/70 shadow-sm">{iconKey ? <ModalityIcon iconKey={iconKey} className="h-7 w-7" /> : <Fallback className="h-7 w-7" />}</div><span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{categoryName || labels[kind]}</span></div>
}
