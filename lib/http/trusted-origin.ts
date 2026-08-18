function normalizeOrigin(value: string | undefined) {
  const candidate = value?.trim()
  if (!candidate) return null

  try {
    return new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`).origin
  } catch {
    return null
  }
}

export function getTrustedApplicationOrigin(request: Request) {
  const configured = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL)
  if (configured) return configured

  const deployment = normalizeOrigin(process.env.VERCEL_URL)
  if (deployment) return deployment

  return new URL(request.url).origin
}
