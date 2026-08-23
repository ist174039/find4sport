import type { Database as LegacyDatabase } from './supabase-types'

type LegacyCategory = LegacyDatabase['public']['Tables']['categories']
type CategoryTable = Omit<LegacyCategory, 'Row' | 'Insert' | 'Update'> & {
  Row: LegacyCategory['Row'] & { icon_key: string | null }
  Insert: LegacyCategory['Insert'] & { icon_key?: string | null }
  Update: LegacyCategory['Update'] & { icon_key?: string | null }
}

type PublicSchema = LegacyDatabase['public']
type Tables = PublicSchema['Tables']

/**
 * Runtime schema contract aligned with Supabase project bqjwsllnhvnxrfojftjb.
 * Keep this compatibility layer only until lib/supabase-types.ts is fully regenerated.
 */
export type Database = Omit<LegacyDatabase, 'public'> & {
  public: Omit<PublicSchema, 'Tables'> & {
    Tables: Omit<Tables, 'categories'> & { categories: CategoryTable }
  }
}
