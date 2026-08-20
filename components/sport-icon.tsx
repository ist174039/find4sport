import { Activity, Dumbbell, Mountain, Shield, Sparkles, Target, Trophy, Users, Waves, type LucideIcon } from 'lucide-react'
import { getSportFamily, type SportFamilyId } from '@/lib/sports-taxonomy'
import { cn } from '@/lib/utils'

const FAMILY_ICONS: Record<SportFamilyId, LucideIcon> = {
  team: Users,
  racket: Target,
  fitness: Dumbbell,
  combat: Shield,
  endurance: Activity,
  water: Waves,
  outdoor: Mountain,
  'mind-body': Sparkles,
  other: Trophy,
}

export function SportIcon({ name, family, className }: { name?: string | null; family?: SportFamilyId; className?: string }) {
  const familyId = family || getSportFamily(name || '').id
  const Icon = FAMILY_ICONS[familyId] || Activity
  return <Icon className={cn('h-5 w-5', className)} aria-hidden="true" />
}
