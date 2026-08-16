export const PUBLIC_PROFESSIONAL_STATUS='active' as const
export const PUBLIC_SPACE_STATUS='active' as const
export const PUBLIC_EVENT_STATUS='published' as const

export function isProfessionalPublic(entity:{status?:string|null}){return entity.status===PUBLIC_PROFESSIONAL_STATUS}
export function isSpacePublic(entity:{status?:string|null}){return entity.status===PUBLIC_SPACE_STATUS}
export function isEventPublic(entity:{status?:string|null;start_date?:string|null}){return entity.status===PUBLIC_EVENT_STATUS&&Boolean(entity.start_date)&&new Date(String(entity.start_date)).getTime()>Date.now()}
export function isProviderRole(value:unknown):value is 'professional'|'venue_manager'{return value==='professional'||value==='venue_manager'}
export function canReceiveMarketplacePayment(input:{role?:string|null;status?:string|null;stripeAccountId?:string|null}){return isProviderRole(input.role)&&input.status==='active'&&String(input.stripeAccountId||'').startsWith('acct_')}
