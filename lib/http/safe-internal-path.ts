/** Resolve a redirect target while guaranteeing it stays on the current origin. */
export function safeInternalPath(value: string | null, fallback: string) {
  let decoded = value
  try {
    if (value) decoded = decodeURIComponent(value)
  } catch {
    return fallback
  }
  if (!value || !value.startsWith('/') || value.startsWith('//') || decoded?.includes('\\') || /[\u0000-\u001f\u007f]/.test(decoded || '')) {
    return fallback
  }

  try {
    const resolved = new URL(value, 'https://find4sport.invalid')
    if (resolved.origin !== 'https://find4sport.invalid') return fallback
    return `${resolved.pathname}${resolved.search}${resolved.hash}`
  } catch {
    return fallback
  }
}
