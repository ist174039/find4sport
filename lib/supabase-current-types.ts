import type { Database } from '@/lib/supabase-types'

type CategoryRow = {
  code: string | null
  color: string | null
  created_at: string
  emoji: string | null
  icon_key: string | null
  id: string
  is_active: boolean
  name: string
  parent_id: string | null
  slug: string
  taxonomy_type: string
}

type CategoryInsert = {
  code?: string | null
  color?: string | null
  created_at?: string
  emoji?: string | null
  icon_key?: string | null
  id?: string
  is_active?: boolean
  name: string
  parent_id?: string | null
  slug: string
  taxonomy_type?: string
}

type CategoryUpdate = Partial<CategoryInsert>

type CategoryTable = {
  Row: CategoryRow
  Insert: CategoryInsert
  Update: CategoryUpdate
  Relationships: [{
    foreignKeyName: 'categories_parent_id_fkey'
    columns: ['parent_id']
    isOneToOne: false
    referencedRelation: 'categories'
    referencedColumns: ['id']
  }]
}

/**
 * Compatibility overlay for schema changes that are already authoritative in
 * the live Supabase project but have not yet been folded into the compact
 * generated snapshot. Keep this narrow: once supabase-types.ts is regenerated
 * from production, this alias can return to Database directly.
 */
export type CurrentDatabase = Omit<Database, 'public'> & {
  public: Omit<Database['public'], 'Tables'> & {
    Tables: Omit<Database['public']['Tables'], 'categories'> & {
      categories: CategoryTable
    }
  }
}
