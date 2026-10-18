/** Shared, deterministic input normalization for public profile and event data. */
export function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? '').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

export function optionalContact(value: unknown, kind: 'email' | 'phone' | 'url', label: string, maxLength = 254): string | null {
  const text = cleanText(value, maxLength)
  if (!text) return null
  if (kind === 'email' && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) || text.length > 254)) throw new Error(`${label} inválido.`)
  if (kind === 'phone' && (!/^[+\d][\d\s().-]{5,24}$/.test(text) || text.replace(/\D/g, '').length < 7)) throw new Error(`${label} inválido.`)
  if (kind === 'url') {
    try {
      const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(text) ? text : `https://${text}`)
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) throw new Error()
      return url.toString()
    } catch { throw new Error(`${label} inválido.`) }
  }
  return text
}

export function validCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [, y, m, d] = match
  const date = new Date(0)
  date.setUTCFullYear(Number(y), Number(m) - 1, Number(d))
  date.setUTCHours(0, 0, 0, 0)
  return date.getUTCFullYear() === Number(y) && date.getUTCMonth() === Number(m) - 1 && date.getUTCDate() === Number(d)
}

export function parseEventDate(value: unknown, label: string): Date {
  const raw = cleanText(value, 80)
  // Date-only and local datetime inputs are explicit formats accepted by the UI.
  const dateOnly = validCalendarDate(raw)
  const local = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(raw)
  if (!dateOnly && !local) throw new Error(`${label} inválida.`)
  if (local && (!validCalendarDate(local[1]) || Number(local[2]) > 23 || Number(local[3]) > 59 || Number(local[4] || 0) > 59)) throw new Error(`${label} inválida.`)
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) throw new Error(`${label} inválida.`)
  return date
}
