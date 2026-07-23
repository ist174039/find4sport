with open("lib/supabase-types.ts", "r") as f:
    text = f.read()

text = text.replace("user_profiles", "platform_users")
text = text.replace("role: Database[\"public\"][\"Enums\"][\"user_role\"]", "type: Database[\"public\"][\"Enums\"][\"user_role\"]")
text = text.replace("role?: Database[\"public\"][\"Enums\"][\"user_role\"]", "type?: Database[\"public\"][\"Enums\"][\"user_role\"]")

admins_type = """      admins: {
        Row: {
          id: string
          auth_user_id: string
          email: string
          admin_type: string
          created_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string
          email: string
          admin_type: string
          created_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          email?: string
          admin_type?: string
          created_at?: string
        }
        Relationships: []
      }
"""
text = text.replace("      platform_users: {", admins_type + "      platform_users: {")

with open("lib/supabase-types.ts", "w") as f:
    f.write(text)
