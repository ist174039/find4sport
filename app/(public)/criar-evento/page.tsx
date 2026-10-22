import { redirect } from 'next/navigation'

/**
 * The legacy public form wrote events directly from the browser, bypassing the
 * role, entitlement, category, and payment checks in createEventAction.
 * Keep this URL working while routing creation through the authenticated
 * dashboard form and its server-side authorization boundary.
 */
export default function LegacyCreateEventPage() {
  redirect('/dashboard/eventos/criar')
}
