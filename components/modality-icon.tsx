import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Bike,
  CircleDot,
  Dumbbell,
  Footprints,
  Goal,
  Medal,
  Mountain,
  PersonStanding,
  ShipWheel,
  Snowflake,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Waves,
  Wind,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  athletics: Footprints,
  bike: Bike,
  ball: CircleDot,
  basketball: CircleDot,
  football: Goal,
  goal: Goal,
  golf: Target,
  target: Target,
  gym: Dumbbell,
  fitness: Dumbbell,
  functional: Dumbbell,
  martial: Swords,
  boxing: Swords,
  rugby: Trophy,
  trophy: Trophy,
  medal: Medal,
  running: Footprints,
  swimming: Waves,
  surf: Waves,
  rowing: ShipWheel,
  sailing: Wind,
  windsurf: Wind,
  kitesurf: Wind,
  climbing: Mountain,
  snow: Snowflake,
  yoga: PersonStanding,
  pilates: PersonStanding,
  meditation: Sparkles,
  dance: PersonStanding,
}

function normalizeIconKey(iconKey?: string | null) {
  return (iconKey || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isValidModalityIconKey(iconKey?: string | null) {
  const key = normalizeIconKey(iconKey)
  return Boolean(key && ICONS[key])
}

export function ModalityIcon({
  iconKey,
  className = 'h-7 w-7',
}: {
  iconKey?: string | null
  className?: string
}) {
  const key = normalizeIconKey(iconKey)
  const Icon = ICONS[key] || Activity

  return <Icon className={className} aria-hidden="true" />
}
