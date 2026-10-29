import { z } from 'zod'

export const subscriptionCheckoutInputSchema = z.object({
  planCode: z.enum(['pro', 'premium']),
  billingCycle: z.enum(['monthly', 'annual']).catch('monthly'),
})

export type SubscriptionCheckoutInput = z.infer<typeof subscriptionCheckoutInputSchema>
