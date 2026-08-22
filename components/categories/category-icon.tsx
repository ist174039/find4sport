import type { LucideIcon } from 'lucide-react'
import { Activity, Apple, BadgeCheck, Bike, Brain, BriefcaseBusiness, CalendarDays, Camera, ChartNoAxesCombined, CircleDot, Cross, Dumbbell, Footprints, GraduationCap, HeartPulse, Laptop, Medal, Megaphone, Microscope, PersonStanding, ShieldCheck, Sparkles, Stethoscope, Target, Timer, Trophy, Users, Video, Volleyball, Waves, Wrench } from 'lucide-react'

export const CATEGORY_ICON_KEYS = ['activity','nutrition','verified','cycling','mental','business','events','media','analytics','sport','medical','strength','running','education','health','digital','competition','communication','science','fitness','security','wellness','clinical','target','timing','trophy','community','video','ball-sport','recovery','technical'] as const
export type CategoryIconKey = typeof CATEGORY_ICON_KEYS[number]

const icons: Record<CategoryIconKey, LucideIcon> = {
 activity: Activity, nutrition: Apple, verified: BadgeCheck, cycling: Bike, mental: Brain, business: BriefcaseBusiness, events: CalendarDays, media: Camera, analytics: ChartNoAxesCombined, sport: CircleDot, medical: Cross, strength: Dumbbell, running: Footprints, education: GraduationCap, health: HeartPulse, digital: Laptop, competition: Medal, communication: Megaphone, science: Microscope, fitness: PersonStanding, security: ShieldCheck, wellness: Sparkles, clinical: Stethoscope, target: Target, timing: Timer, trophy: Trophy, community: Users, video: Video, 'ball-sport': Volleyball, recovery: Waves, technical: Wrench,
}

const slugRules: Array<[RegExp, CategoryIconKey]> = [
 [/nutri|diet|suplement/, 'nutrition'], [/fisioter|enferme|acupuntur|medic|saude/, 'clinical'], [/mental|stress|psic|sono|breath/, 'mental'], [/cicl|bike/, 'cycling'], [/running|corrida/, 'running'], [/futebol|basket|volei|tenis|padel|andebol/, 'ball-sport'], [/crossfit|personal|fitness|treinador/, 'fitness'], [/performance|analista/, 'analytics'], [/video/, 'video'], [/fotograf|conteudo/, 'media'], [/evento/, 'events'], [/arbitro|comissario|delegado/, 'competition'], [/diretor|gestao|agente|consultor/, 'business'], [/formador|docente/, 'education'], [/seguranca/, 'security'], [/crio|compress|recuper/, 'recovery'], [/biomecan|fisiolog|cientista|wearable/, 'science'], [/cronomet/, 'timing'], [/coreograf/, 'activity'], [/marketing|comentador/, 'communication'], [/artes-marciais/, 'strength'],
]

export function inferCategoryIconKey(slug?: string | null, name?: string | null): CategoryIconKey {
 const value = `${slug || ''} ${name || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
 for (const [pattern, key] of slugRules) if (pattern.test(value)) return key
 return 'sport'
}

export function getCategoryIcon(key?: string | null, slug?: string | null, name?: string | null): LucideIcon {
 return icons[(CATEGORY_ICON_KEYS as readonly string[]).includes(key || '') ? key as CategoryIconKey : inferCategoryIconKey(slug, name)]
}

export function CategoryIcon({ iconKey, slug, name, className }: { iconKey?: string | null; slug?: string | null; name?: string | null; className?: string }) {
 const Icon = getCategoryIcon(iconKey, slug, name)
 return <Icon aria-hidden="true" className={className || 'h-5 w-5'} strokeWidth={1.8} />
}
