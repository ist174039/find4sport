export type EntityImageType = 'professional' | 'space' | 'event' | 'community'

/**
 * Product-owned visual fallbacks. Keeping them local avoids external image
 * dependencies and guarantees the same empty-state treatment across discovery.
 */
export const ENTITY_IMAGE_FALLBACKS: Record<EntityImageType, string> = {
  professional: '/placeholders/professional.svg',
  space: '/placeholders/space.svg',
  event: '/placeholders/event.svg',
  community: '/placeholders/community.svg',
}

export function entityImage(type: EntityImageType, source?: string | null) {
  const value = source?.trim()
  return value || ENTITY_IMAGE_FALLBACKS[type]
}
