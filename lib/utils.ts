import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns'
import { pt } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a date to Portuguese locale */
export function formatDate(date: string | Date, fmt = 'dd/MM/yyyy') {
  return format(new Date(date), fmt, { locale: pt })
}

/** Format a date with time */
export function formatDateTime(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: pt })
}

/** Format a date as relative time (e.g., "há 2 dias") */
export function formatRelativeDate(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: pt })
}

/** Format a price in EUR */
export function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) return 'A combinar'
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(price)
}

/** Format a price range */
export function formatPriceRange(min: number | null, max: number | null) {
  if (min === null && max === null) return 'A combinar'
  if (min && !max) return `Desde ${formatPrice(min)}`
  if (!min && max) return `Até ${formatPrice(max)}`
  return `${formatPrice(min)} — ${formatPrice(max)}`
}

/** Format a phone number to Portuguese format */
export function formatPhone(phone: string | null | undefined) {
  if (!phone) return ''
  // Already formatted
  if (phone.startsWith('+') || phone.startsWith('0')) return phone
  // 9 digits → +351 XXX XXX XXX
  if (/^\d{9}$/.test(phone)) {
    return `+351 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`
  }
  return phone
}

/** Get event status badge variant */
export function getEventStatusInfo(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-600' },
    pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
    published: { label: 'Publicado', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-600' },
    completed: { label: 'Concluído', color: 'bg-blue-100 text-blue-700' },
  }
  return map[status] || { label: status, color: 'bg-gray-100 text-gray-600' }
}

/** Get professional status info */
export function getProfessionalStatusInfo(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
    active: { label: 'Ativo', color: 'bg-green-100 text-green-700' },
    suspended: { label: 'Suspenso', color: 'bg-red-100 text-red-600' },
    rejected: { label: 'Rejeitado', color: 'bg-gray-100 text-gray-600' },
  }
  return map[status] || { label: status, color: 'bg-gray-100 text-gray-600' }
}

/** Truncate text to a max length */
export function truncate(text: string, maxLen = 100) {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}

/** Generate a random color from a string seed */
export function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 65%, 55%)`
}

/** Get user initials from name */
export function getInitials(name: string | null | undefined) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/** Check if an event is happening today */
export function isEventToday(date: string | Date) {
  return isToday(new Date(date))
}

/** Check if an event is past */
export function isEventPast(date: string | Date) {
  return isPast(new Date(date))
}

/** Check if an event is tomorrow */
export function isEventTomorrow(date: string | Date) {
  return isTomorrow(new Date(date))
}

/** Build a URL-friendly slug */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/** Pluralize a Portuguese word */
export function pluralize(count: number, singular: string, plural?: string) {
  if (count === 1) return singular
  return plural || singular + 's'
}
