import type { LucideIcon } from 'lucide-react'
import { Activity, Bike, CircleDot, Dumbbell, Footprints, Goal, Medal, Mountain, PersonStanding, ShipWheel, Snowflake, Sparkles, Swords, Target, Trophy, Waves, Wind } from 'lucide-react'
import { normalizeSearchTerm } from '@/lib/search/semantic'

const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  athletics: Footprints,
  atletismo: Footprints,
  bike: Bike,
  btt: Bike,
  ciclismo: Bike,
  ball: CircleDot,
  basketball: CircleDot,
  basquetebol: CircleDot,
  football: Goal,
  futebol: Goal,
  futsal: Goal,
  goal: Goal,
  golf: Target,
  golfe: Target,
  target: Target,
  gym: Dumbbell,
  fitness: Dumbbell,
  musculacao: Dumbbell,
  hiit: Dumbbell,
  functional: Dumbbell,
  martial: Swords,
  boxing: Swords,
  boxe: Swords,
  judo: Swords,
  karate: Swords,
  taekwondo: Swords,
  mma: Swords,
  rugby: Trophy,
  trophy: Trophy,
  medal: Medal,
  running: Footprints,
  caminhada: Footprints,
  swimming: Waves,
  natacao: Waves,
  surf: Waves,
  bodyboard: Waves,
  mergulho: Waves,
  rowing: ShipWheel,
  remo: ShipWheel,
  canoagem: ShipWheel,
  sailing: Wind,
  windsurf: Wind,
  kitesurf: Wind,
  climbing: Mountain,
  escalada: Mountain,
  snow: Snowflake,
  yoga: PersonStanding,
  pilates: PersonStanding,
  meditation: Sparkles,
  meditacao: Sparkles,
  dance: PersonStanding,
  danca: PersonStanding,
}

function resolveIcon(iconKey?: string | null, name?: string | null): LucideIcon {
  const key = normalizeSearchTerm(iconKey || '').replace(/[^a-z0-9]+/g, '-')
  const compactKey = key.replace(/-/g, '')
  if (ICONS[key]) return ICONS[key]
  if (ICONS[compactKey]) return ICONS[compactKey]
  const normalizedName = normalizeSearchTerm(name || '')
  const words = normalizedName.split(/\s+/)
  for (const word of words) if (ICONS[word]) return ICONS[word]
  for (const [candidate, Icon] of Object.entries(ICONS)) if (normalizedName.includes(candidate)) return Icon
  return Activity
}

export function ModalityIcon({ iconKey, name, className = 'h-7 w-7' }: { iconKey?: string | null; name?: string | null; className?: string }) {
  const Icon = resolveIcon(iconKey, name)
  return <Icon className={className} aria-hidden="true" />
}
