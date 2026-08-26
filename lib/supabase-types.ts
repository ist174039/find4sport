export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admins: {
        Row: { admin_type: string; auth_user_id: string | null; created_at: string; email: string; id: string }
        Insert: { admin_type: string; auth_user_id?: string | null; created_at?: string; email: string; id?: string }
        Update: { admin_type?: string; auth_user_id?: string | null; created_at?: string; email?: string; id?: string }
        Relationships: []
      }
      audit_logs: {
        Row: { action: string; created_at: string | null; id: string; new_data: Json | null; old_data: Json | null; record_id: string | null; table_name: string; user_email: string | null; user_id: string | null }
        Insert: { action: string; created_at?: string | null; id?: string; new_data?: Json | null; old_data?: Json | null; record_id?: string | null; table_name: string; user_email?: string | null; user_id?: string | null }
        Update: { action?: string; created_at?: string | null; id?: string; new_data?: Json | null; old_data?: Json | null; record_id?: string | null; table_name?: string; user_email?: string | null; user_id?: string | null }
        Relationships: []
      }
      carousel_slides: {
        Row: { button_link: string | null; button_text: string | null; created_at: string; display_order: number; id: string; image_url: string; is_active: boolean; subtitle: string | null; title: string | null }
        Insert: { button_link?: string | null; button_text?: string | null; created_at?: string; display_order?: number; id?: string; image_url: string; is_active?: boolean; subtitle?: string | null; title?: string | null }
        Update: { button_link?: string | null; button_text?: string | null; created_at?: string; display_order?: number; id?: string; image_url?: string; is_active?: boolean; subtitle?: string | null; title?: string | null }
        Relationships: []
      }
      categories: {
        Row: { code: string | null; color: string | null; created_at: string; emoji: string | null; icon_key: string | null; id: string; is_active: boolean; name: string; parent_id: string | null; slug: string; taxonomy_type: string }
        Insert: { code?: string | null; color?: string | null; created_at?: string; emoji?: string | null; icon_key?: string | null; id?: string; is_active?: boolean; name: string; parent_id?: string | null; slug: string; taxonomy_type?: string }
        Update: { code?: string | null; color?: string | null; created_at?: string; emoji?: string | null; icon_key?: string | null; id?: string; is_active?: boolean; name?: string; parent_id?: string | null; slug?: string; taxonomy_type?: string }
        Relationships: [{ foreignKeyName: "categories_parent_id_fkey"; columns: ["parent_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] }]
      }
      cms_pages: {
        Row: { content: Json; created_at: string; description: string | null; id: string; is_published: boolean | null; slug: string; title: string; updated_at: string }
        Insert: { content?: Json; created_at?: string; description?: string | null; id?: string; is_published?: boolean | null; slug: string; title: string; updated_at?: string }
        Update: { content?: Json; created_at?: string; description?: string | null; id?: string; is_published?: boolean | null; slug?: string; title?: string; updated_at?: string }
        Relationships: []
      }
      communities: {
        Row: { address: string | null; cover_url: string | null; created_at: string; created_by: string | null; description: string | null; id: string; is_private: boolean | null; latitude: number | null; location_scope: string; longitude: number | null; name: string; posting_policy: string; slug: string; sport_category: string | null; updated_at: string }
        Insert: { address?: string | null; cover_url?: string | null; created_at?: string; created_by?: string | null; description?: string | null; id?: string; is_private?: boolean | null; latitude?: number | null; location_scope?: string; longitude?: number | null; name: string; posting_policy?: string; slug: string; sport_category?: string | null; updated_at?: string }
        Update: { address?: string | null; cover_url?: string | null; created_at?: string; created_by?: string | null; description?: string | null; id?: string; is_private?: boolean | null; latitude?: number | null; location_scope?: string; longitude?: number | null; name?: string; posting_policy?: string; slug?: string; sport_category?: string | null; updated_at?: string }
        Relationships: [{ foreignKeyName: "communities_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }]
      }
      community_categories: {
        Row: { category_id: string; community_id: string; created_at: string }
        Insert: { category_id: string; community_id: string; created_at?: string }
        Update: { category_id?: string; community_id?: string; created_at?: string }
        Relationships: [
          { foreignKeyName: "community_categories_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
          { foreignKeyName: "community_categories_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] }
        ]
      }
      community_join_requests: {
        Row: { community_id: string; created_at: string; id: string; reviewed_at: string | null; reviewed_by: string | null; status: string; updated_at: string; user_id: string }
        Insert: { community_id: string; created_at?: string; id?: string; reviewed_at?: string | null; reviewed_by?: string | null; status?: string; updated_at?: string; user_id: string }
        Update: { community_id?: string; created_at?: string; id?: string; reviewed_at?: string | null; reviewed_by?: string | null; status?: string; updated_at?: string; user_id?: string }
        Relationships: [
          { foreignKeyName: "community_join_requests_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
          { foreignKeyName: "community_join_requests_reviewed_by_fkey"; columns: ["reviewed_by"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] },
          { foreignKeyName: "community_join_requests_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }
        ]
      }
      community_media: {
        Row: { caption: string | null; community_id: string; created_at: string; id: string; is_featured: boolean; storage_path: string; uploaded_by: string }
        Insert: { caption?: string | null; community_id: string; created_at?: string; id?: string; is_featured?: boolean; storage_path: string; uploaded_by: string }
        Update: { caption?: string | null; community_id?: string; created_at?: string; id?: string; is_featured?: boolean; storage_path?: string; uploaded_by?: string }
        Relationships: [{ foreignKeyName: "community_media_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] }]
      }
      community_members: {
        Row: { community_id: string | null; id: string; joined_at: string; role: string | null; user_id: string | null }
        Insert: { community_id?: string | null; id?: string; joined_at?: string; role?: string | null; user_id?: string | null }
        Update: { community_id?: string | null; id?: string; joined_at?: string; role?: string | null; user_id?: string | null }
        Relationships: [
          { foreignKeyName: "community_members_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
          { foreignKeyName: "community_members_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }
        ]
      }
      contact_messages: {
        Row: { created_at: string; email: string; full_name: string; id: string; message: string; subject: string }
        Insert: { created_at?: string; email: string; full_name: string; id?: string; message: string; subject: string }
        Update: { created_at?: string; email?: string; full_name?: string; id?: string; message?: string; subject?: string }
        Relationships: []
      }
      content_reports: {
        Row: { created_at: string; details: string | null; id: string; reason: string; reporter_user_id: string; reviewed_at: string | null; reviewed_by: string | null; status: string; target_id: string; target_type: string; updated_at: string }
        Insert: { created_at?: string; details?: string | null; id?: string; reason?: string; reporter_user_id: string; reviewed_at?: string | null; reviewed_by?: string | null; status?: string; target_id: string; target_type: string; updated_at?: string }
        Update: { created_at?: string; details?: string | null; id?: string; reason?: string; reporter_user_id?: string; reviewed_at?: string | null; reviewed_by?: string | null; status?: string; target_id?: string; target_type?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "content_reports_reporter_user_id_fkey"; columns: ["reporter_user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }]
      }
      event_categories: {
        Row: { category_id: string; created_at: string; event_id: string }
        Insert: { category_id: string; created_at?: string; event_id: string }
        Update: { category_id?: string; created_at?: string; event_id?: string }
        Relationships: [
          { foreignKeyName: "event_categories_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
          { foreignKeyName: "event_categories_event_id_fkey"; columns: ["event_id"]; isOneToOne: false; referencedRelation: "events"; referencedColumns: ["id"] }
        ]
      }
      event_participants: {
        Row: { amount: number | null; created_at: string; event_id: string; id: string; payment_status: string; status: string; ticket_type_id: string | null; updated_at: string; user_id: string }
        Insert: { amount?: number | null; created_at?: string; event_id: string; id?: string; payment_status?: string; status?: string; ticket_type_id?: string | null; updated_at?: string; user_id: string }
        Update: { amount?: number | null; created_at?: string; event_id?: string; id?: string; payment_status?: string; status?: string; ticket_type_id?: string | null; updated_at?: string; user_id?: string }
        Relationships: [
          { foreignKeyName: "event_participants_event_id_fkey"; columns: ["event_id"]; isOneToOne: false; referencedRelation: "events"; referencedColumns: ["id"] },
          { foreignKeyName: "event_participants_ticket_type_id_fkey"; columns: ["ticket_type_id"]; isOneToOne: false; referencedRelation: "event_ticket_types"; referencedColumns: ["id"] }
        ]
      }
      event_ticket_types: {
        Row: { capacity: number | null; created_at: string; description: string | null; event_id: string; id: string; is_active: boolean; name: string; price: number; sort_order: number; updated_at: string }
        Insert: { capacity?: number | null; created_at?: string; description?: string | null; event_id: string; id?: string; is_active?: boolean; name: string; price: number; sort_order?: number; updated_at?: string }
        Update: { capacity?: number | null; created_at?: string; description?: string | null; event_id?: string; id?: string; is_active?: boolean; name?: string; price?: number; sort_order?: number; updated_at?: string }
        Relationships: [{ foreignKeyName: "event_ticket_types_event_id_fkey"; columns: ["event_id"]; isOneToOne: false; referencedRelation: "events"; referencedColumns: ["id"] }]
      }
      events: {
        Row: { address: string | null; capacity: number | null; category_id: string | null; created_at: string; created_by: string | null; description: string | null; end_date: string | null; gallery_urls: string[] | null; id: string; image_url: string | null; is_featured: boolean | null; is_verified: boolean | null; latitude: number | null; longitude: number | null; organizer_email: string | null; organizer_name: string | null; price_max: number | null; price_min: number | null; professional_id: string | null; slug: string | null; space_id: string | null; start_date: string; status: Database["public"]["Enums"]["event_status"] | null; title: string; updated_at: string; views_count: number | null }
        Insert: { address?: string | null; capacity?: number | null; category_id?: string | null; created_at?: string; created_by?: string | null; description?: string | null; end_date?: string | null; gallery_urls?: string[] | null; id?: string; image_url?: string | null; is_featured?: boolean | null; is_verified?: boolean | null; latitude?: number | null; longitude?: number | null; organizer_email?: string | null; organizer_name?: string | null; price_max?: number | null; price_min?: number | null; professional_id?: string | null; slug?: string | null; space_id?: string | null; start_date: string; status?: Database["public"]["Enums"]["event_status"] | null; title: string; updated_at?: string; views_count?: number | null }
        Update: { address?: string | null; capacity?: number | null; category_id?: string | null; created_at?: string; created_by?: string | null; description?: string | null; end_date?: string | null; gallery_urls?: string[] | null; id?: string; image_url?: string | null; is_featured?: boolean | null; is_verified?: boolean | null; latitude?: number | null; longitude?: number | null; organizer_email?: string | null; organizer_name?: string | null; price_max?: number | null; price_min?: number | null; professional_id?: string | null; slug?: string | null; space_id?: string | null; start_date?: string; status?: Database["public"]["Enums"]["event_status"] | null; title?: string; updated_at?: string; views_count?: number | null }
        Relationships: [
          { foreignKeyName: "events_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
          { foreignKeyName: "events_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] },
          { foreignKeyName: "events_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professionals"; referencedColumns: ["id"] },
          { foreignKeyName: "events_space_id_fkey"; columns: ["space_id"]; isOneToOne: false; referencedRelation: "sport_spaces"; referencedColumns: ["id"] }
        ]
      }
      favorites: {
        Row: { created_at: string; event_id: string | null; id: string; professional_id: string | null; space_id: string | null; user_id: string }
        Insert: { created_at?: string; event_id?: string | null; id?: string; professional_id?: string | null; space_id?: string | null; user_id: string }
        Update: { created_at?: string; event_id?: string | null; id?: string; professional_id?: string | null; space_id?: string | null; user_id?: string }
        Relationships: [
          { foreignKeyName: "favorites_event_id_fkey"; columns: ["event_id"]; isOneToOne: false; referencedRelation: "events"; referencedColumns: ["id"] },
          { foreignKeyName: "favorites_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professionals"; referencedColumns: ["id"] },
          { foreignKeyName: "favorites_space_id_fkey"; columns: ["space_id"]; isOneToOne: false; referencedRelation: "sport_spaces"; referencedColumns: ["id"] },
          { foreignKeyName: "favorites_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }
        ]
      }
      feature_usage: {
        Row: { feature_key: string; id: string; period_start: string; period_type: string; updated_at: string; usage_count: number; user_id: string }
        Insert: { feature_key: string; id?: string; period_start: string; period_type: string; updated_at?: string; usage_count?: number; user_id: string }
        Update: { feature_key?: string; id?: string; period_start?: string; period_type?: string; updated_at?: string; usage_count?: number; user_id?: string }
        Relationships: [{ foreignKeyName: "feature_usage_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }]
      }
      message_threads: {
        Row: { archived_at: string | null; athlete_id: string; context_type: string; created_at: string; event_participant_id: string | null; id: string; provider_user_id: string; reservation_id: string | null; status: string; updated_at: string }
        Insert: { archived_at?: string | null; athlete_id: string; context_type: string; created_at?: string; event_participant_id?: string | null; id?: string; provider_user_id: string; reservation_id?: string | null; status?: string; updated_at?: string }
        Update: { archived_at?: string | null; athlete_id?: string; context_type?: string; created_at?: string; event_participant_id?: string | null; id?: string; provider_user_id?: string; reservation_id?: string | null; status?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: "message_threads_athlete_id_fkey"; columns: ["athlete_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] },
          { foreignKeyName: "message_threads_event_participant_id_fkey"; columns: ["event_participant_id"]; isOneToOne: false; referencedRelation: "event_participants"; referencedColumns: ["id"] },
          { foreignKeyName: "message_threads_provider_user_id_fkey"; columns: ["provider_user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] },
          { foreignKeyName: "message_threads_reservation_id_fkey"; columns: ["reservation_id"]; isOneToOne: false; referencedRelation: "reservations"; referencedColumns: ["id"] }
        ]
      }
      messages: {
        Row: { content: string; created_at: string; id: string; legacy_status: string | null; read_at: string | null; receiver_id: string; sender_id: string; thread_id: string | null }
        Insert: { content: string; created_at?: string; id?: string; legacy_status?: string | null; read_at?: string | null; receiver_id: string; sender_id: string; thread_id?: string | null }
        Update: { content?: string; created_at?: string; id?: string; legacy_status?: string | null; read_at?: string | null; receiver_id?: string; sender_id?: string; thread_id?: string | null }
        Relationships: [{ foreignKeyName: "messages_thread_id_fkey"; columns: ["thread_id"]; isOneToOne: false; referencedRelation: "message_threads"; referencedColumns: ["id"] }]
      }
      notifications: {
        Row: { created_at: string; data: Json; dedupe_key: string | null; id: string; link: string | null; message: string; read_at: string | null; type: string; user_id: string }
        Insert: { created_at?: string; data?: Json; dedupe_key?: string | null; id?: string; link?: string | null; message: string; read_at?: string | null; type: string; user_id: string }
        Update: { created_at?: string; data?: Json; dedupe_key?: string | null; id?: string; link?: string | null; message?: string; read_at?: string | null; type?: string; user_id?: string }
        Relationships: [{ foreignKeyName: "notifications_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }]
      }
      plan_change_history: {
        Row: { change_type: string; changed_by: string | null; created_at: string; effective_at: string; field_name: string | null; id: string; new_value: Json | null; old_value: Json | null; plan_id: string }
        Insert: { change_type: string; changed_by?: string | null; created_at?: string; effective_at?: string; field_name?: string | null; id?: string; new_value?: Json | null; old_value?: Json | null; plan_id: string }
        Update: { change_type?: string; changed_by?: string | null; created_at?: string; effective_at?: string; field_name?: string | null; id?: string; new_value?: Json | null; old_value?: Json | null; plan_id?: string }
        Relationships: [{ foreignKeyName: "plan_change_history_plan_id_fkey"; columns: ["plan_id"]; isOneToOne: false; referencedRelation: "subscription_plans"; referencedColumns: ["id"] }]
      }
      plan_entitlements: {
        Row: { boolean_value: boolean | null; created_at: string; decimal_value: number | null; description: string | null; feature_key: string; id: string; integer_value: number | null; is_unlimited: boolean; json_value: Json | null; plan_id: string; text_value: string | null; updated_at: string; value_type: string }
        Insert: { boolean_value?: boolean | null; created_at?: string; decimal_value?: number | null; description?: string | null; feature_key: string; id?: string; integer_value?: number | null; is_unlimited?: boolean; json_value?: Json | null; plan_id: string; text_value?: string | null; updated_at?: string; value_type: string }
        Update: { boolean_value?: boolean | null; created_at?: string; decimal_value?: number | null; description?: string | null; feature_key?: string; id?: string; integer_value?: number | null; is_unlimited?: boolean; json_value?: Json | null; plan_id?: string; text_value?: string | null; updated_at?: string; value_type?: string }
        Relationships: [{ foreignKeyName: "plan_entitlements_plan_id_fkey"; columns: ["plan_id"]; isOneToOne: false; referencedRelation: "subscription_plans"; referencedColumns: ["id"] }]
      }
      platform_users: {
        Row: { avatar_url: string | null; banner_url: string | null; created_at: string; full_name: string | null; id: string; language: string | null; location: string | null; preferences: Json | null; type: Database["public"]["Enums"]["user_role"] | null; updated_at: string }
        Insert: { avatar_url?: string | null; banner_url?: string | null; created_at?: string; full_name?: string | null; id: string; language?: string | null; location?: string | null; preferences?: Json | null; type?: Database["public"]["Enums"]["user_role"] | null; updated_at?: string }
        Update: { avatar_url?: string | null; banner_url?: string | null; created_at?: string; full_name?: string | null; id?: string; language?: string | null; location?: string | null; preferences?: Json | null; type?: Database["public"]["Enums"]["user_role"] | null; updated_at?: string }
        Relationships: []
      }
      post_comments: {
        Row: { content: string; created_at: string | null; id: string; post_id: string; user_id: string }
        Insert: { content: string; created_at?: string | null; id?: string; post_id: string; user_id: string }
        Update: { content?: string; created_at?: string | null; id?: string; post_id?: string; user_id?: string }
        Relationships: [
          { foreignKeyName: "post_comments_platform_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] },
          { foreignKeyName: "post_comments_post_id_fkey"; columns: ["post_id"]; isOneToOne: false; referencedRelation: "posts"; referencedColumns: ["id"] }
        ]
      }
      post_likes: {
        Row: { created_at: string | null; id: string; post_id: string; user_id: string }
        Insert: { created_at?: string | null; id?: string; post_id: string; user_id: string }
        Update: { created_at?: string | null; id?: string; post_id?: string; user_id?: string }
        Relationships: [{ foreignKeyName: "post_likes_post_id_fkey"; columns: ["post_id"]; isOneToOne: false; referencedRelation: "posts"; referencedColumns: ["id"] }]
      }
      posts: {
        Row: { community_id: string | null; content: string; created_at: string | null; id: string; media_type: string | null; media_url: string | null; professional_id: string | null; sport_space_id: string | null; user_id: string | null }
        Insert: { community_id?: string | null; content: string; created_at?: string | null; id?: string; media_type?: string | null; media_url?: string | null; professional_id?: string | null; sport_space_id?: string | null; user_id?: string | null }
        Update: { community_id?: string | null; content?: string; created_at?: string | null; id?: string; media_type?: string | null; media_url?: string | null; professional_id?: string | null; sport_space_id?: string | null; user_id?: string | null }
        Relationships: [
          { foreignKeyName: "posts_community_id_fkey"; columns: ["community_id"]; isOneToOne: false; referencedRelation: "communities"; referencedColumns: ["id"] },
          { foreignKeyName: "posts_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professionals"; referencedColumns: ["id"] },
          { foreignKeyName: "posts_sport_space_id_fkey"; columns: ["sport_space_id"]; isOneToOne: false; referencedRelation: "sport_spaces"; referencedColumns: ["id"] },
          { foreignKeyName: "posts_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }
        ]
      }
      professional_availability: {
        Row: { created_at: string; day_of_week: number; end_time: string; id: string; is_active: boolean | null; professional_id: string | null; start_time: string }
        Insert: { created_at?: string; day_of_week: number; end_time: string; id?: string; is_active?: boolean | null; professional_id?: string | null; start_time: string }
        Update: { created_at?: string; day_of_week?: number; end_time?: string; id?: string; is_active?: boolean | null; professional_id?: string | null; start_time?: string }
        Relationships: [{ foreignKeyName: "professional_availability_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professionals"; referencedColumns: ["id"] }]
      }
      professional_categories: {
        Row: { category_id: string; professional_id: string }
        Insert: { category_id: string; professional_id: string }
        Update: { category_id?: string; professional_id?: string }
        Relationships: [
          { foreignKeyName: "professional_categories_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
          { foreignKeyName: "professional_categories_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professionals"; referencedColumns: ["id"] }
        ]
      }
      professionals: {
        Row: { address: string | null; avatar_url: string | null; bio: string | null; contact_methods: string[] | null; cover_url: string | null; created_at: string; email: string; full_name: string; gallery_urls: string[] | null; id: string; is_premium: boolean | null; is_verified: boolean | null; latitude: number | null; longitude: number | null; nif: string | null; phone: string | null; private_gallery_urls: string[] | null; professional_name: string | null; public_slug: string | null; rating_avg: number | null; review_count: number | null; service_radius_km: number | null; social_links: Json | null; status: Database["public"]["Enums"]["professional_status"] | null; stripe_account_id: string | null; updated_at: string; user_id: string; views_count: number | null; website: string | null; whatsapp: string | null }
        Insert: { address?: string | null; avatar_url?: string | null; bio?: string | null; contact_methods?: string[] | null; cover_url?: string | null; created_at?: string; email: string; full_name: string; gallery_urls?: string[] | null; id?: string; is_premium?: boolean | null; is_verified?: boolean | null; latitude?: number | null; longitude?: number | null; nif?: string | null; phone?: string | null; private_gallery_urls?: string[] | null; professional_name?: string | null; public_slug?: string | null; rating_avg?: number | null; review_count?: number | null; service_radius_km?: number | null; social_links?: Json | null; status?: Database["public"]["Enums"]["professional_status"] | null; stripe_account_id?: string | null; updated_at?: string; user_id: string; views_count?: number | null; website?: string | null; whatsapp?: string | null }
        Update: { address?: string | null; avatar_url?: string | null; bio?: string | null; contact_methods?: string[] | null; cover_url?: string | null; created_at?: string; email?: string; full_name?: string; gallery_urls?: string[] | null; id?: string; is_premium?: boolean | null; is_verified?: boolean | null; latitude?: number | null; longitude?: number | null; nif?: string | null; phone?: string | null; private_gallery_urls?: string[] | null; professional_name?: string | null; public_slug?: string | null; rating_avg?: number | null; review_count?: number | null; service_radius_km?: number | null; social_links?: Json | null; status?: Database["public"]["Enums"]["professional_status"] | null; stripe_account_id?: string | null; updated_at?: string; user_id?: string; views_count?: number | null; website?: string | null; whatsapp?: string | null }
        Relationships: [{ foreignKeyName: "professionals_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }]
      }
      qualifications: {
        Row: { created_at: string; document_url: string | null; expiry_date: string | null; id: string; is_verified: boolean | null; issue_date: string | null; issuer: string | null; professional_id: string; title: string }
        Insert: { created_at?: string; document_url?: string | null; expiry_date?: string | null; id?: string; is_verified?: boolean | null; issue_date?: string | null; issuer?: string | null; professional_id: string; title: string }
        Update: { created_at?: string; document_url?: string | null; expiry_date?: string | null; id?: string; is_verified?: boolean | null; issue_date?: string | null; issuer?: string | null; professional_id?: string; title?: string }
        Relationships: [{ foreignKeyName: "qualifications_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professionals"; referencedColumns: ["id"] }]
      }
      reservation_change_requests: {
        Row: { created_at: string; id: string; requested_by: string; requested_date: string; requested_end_time: string; requested_start_time: string; reservation_id: string; reviewed_at: string | null; reviewer_id: string | null; reviewer_note: string | null; status: string; updated_at: string }
        Insert: { created_at?: string; id?: string; requested_by: string; requested_date: string; requested_end_time: string; requested_start_time: string; reservation_id: string; reviewed_at?: string | null; reviewer_id?: string | null; reviewer_note?: string | null; status?: string; updated_at?: string }
        Update: { created_at?: string; id?: string; requested_by?: string; requested_date?: string; requested_end_time?: string; requested_start_time?: string; reservation_id?: string; reviewed_at?: string | null; reviewer_id?: string | null; reviewer_note?: string | null; status?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "reservation_change_requests_reservation_id_fkey"; columns: ["reservation_id"]; isOneToOne: false; referencedRelation: "reservations"; referencedColumns: ["id"] }]
      }
      reservation_delivery_events: {
        Row: { actor_user_id: string | null; created_at: string; event_type: string; id: string; metadata: Json; note: string | null; reservation_id: string }
        Insert: { actor_user_id?: string | null; created_at?: string; event_type: string; id?: string; metadata?: Json; note?: string | null; reservation_id: string }
        Update: { actor_user_id?: string | null; created_at?: string; event_type?: string; id?: string; metadata?: Json; note?: string | null; reservation_id?: string }
        Relationships: [{ foreignKeyName: "reservation_delivery_events_reservation_id_fkey"; columns: ["reservation_id"]; isOneToOne: false; referencedRelation: "reservations"; referencedColumns: ["id"] }]
      }
      reservations: {
        Row: { amount: number; athlete_confirmed_at: string | null; auto_confirm_after: string | null; created_at: string; date: string; dispute_opened_at: string | null; dispute_reason: string | null; end_time: string; id: string; package_purchase_id: string | null; package_session_consumed: boolean; payment_status: string | null; professional_id: string | null; provider_marked_completed_at: string | null; service_delivery_status: string; service_id: string | null; settlement_released_at: string | null; settlement_status: string; space_id: string | null; space_room_id: string | null; start_time: string; status: Database["public"]["Enums"]["reservation_status"] | null; stripe_session_id: string | null; updated_at: string; user_id: string | null }
        Insert: { amount: number; athlete_confirmed_at?: string | null; auto_confirm_after?: string | null; created_at?: string; date: string; dispute_opened_at?: string | null; dispute_reason?: string | null; end_time: string; id?: string; package_purchase_id?: string | null; package_session_consumed?: boolean; payment_status?: string | null; professional_id?: string | null; provider_marked_completed_at?: string | null; service_delivery_status?: string; service_id?: string | null; settlement_released_at?: string | null; settlement_status?: string; space_id?: string | null; space_room_id?: string | null; start_time: string; status?: Database["public"]["Enums"]["reservation_status"] | null; stripe_session_id?: string | null; updated_at?: string; user_id?: string | null }
        Update: { amount?: number; athlete_confirmed_at?: string | null; auto_confirm_after?: string | null; created_at?: string; date?: string; dispute_opened_at?: string | null; dispute_reason?: string | null; end_time?: string; id?: string; package_purchase_id?: string | null; package_session_consumed?: boolean; payment_status?: string | null; professional_id?: string | null; provider_marked_completed_at?: string | null; service_delivery_status?: string; service_id?: string | null; settlement_released_at?: string | null; settlement_status?: string; space_id?: string | null; space_room_id?: string | null; start_time?: string; status?: Database["public"]["Enums"]["reservation_status"] | null; stripe_session_id?: string | null; updated_at?: string; user_id?: string | null }
        Relationships: [
          { foreignKeyName: "reservations_package_purchase_id_fkey"; columns: ["package_purchase_id"]; isOneToOne: false; referencedRelation: "service_package_purchases"; referencedColumns: ["id"] },
          { foreignKeyName: "reservations_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professionals"; referencedColumns: ["id"] },
          { foreignKeyName: "reservations_service_id_fkey"; columns: ["service_id"]; isOneToOne: false; referencedRelation: "services"; referencedColumns: ["id"] },
          { foreignKeyName: "reservations_space_id_fkey"; columns: ["space_id"]; isOneToOne: false; referencedRelation: "sport_spaces"; referencedColumns: ["id"] },
          { foreignKeyName: "reservations_space_room_id_fkey"; columns: ["space_room_id"]; isOneToOne: false; referencedRelation: "space_rooms"; referencedColumns: ["id"] },
          { foreignKeyName: "reservations_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }
        ]
      }
      reviews: {
        Row: { comment: string | null; created_at: string; event_id: string | null; helpful_count: number | null; id: string; is_verified: boolean | null; professional_id: string | null; rating: number; response: string | null; response_at: string | null; space_id: string | null; status: Database["public"]["Enums"]["review_status"] | null; title: string | null; updated_at: string; user_id: string }
        Insert: { comment?: string | null; created_at?: string; event_id?: string | null; helpful_count?: number | null; id?: string; is_verified?: boolean | null; professional_id?: string | null; rating: number; response?: string | null; response_at?: string | null; space_id?: string | null; status?: Database["public"]["Enums"]["review_status"] | null; title?: string | null; updated_at?: string; user_id: string }
        Update: { comment?: string | null; created_at?: string; event_id?: string | null; helpful_count?: number | null; id?: string; is_verified?: boolean | null; professional_id?: string | null; rating?: number; response?: string | null; response_at?: string | null; space_id?: string | null; status?: Database["public"]["Enums"]["review_status"] | null; title?: string | null; updated_at?: string; user_id?: string }
        Relationships: [
          { foreignKeyName: "reviews_event_id_fkey"; columns: ["event_id"]; isOneToOne: false; referencedRelation: "events"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professionals"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_space_id_fkey"; columns: ["space_id"]; isOneToOne: false; referencedRelation: "sport_spaces"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }
        ]
      }
      service_moderation_history: {
        Row: { actor_user_id: string | null; created_at: string; from_status: string | null; id: string; reason: string | null; service_id: string; to_status: string }
        Insert: { actor_user_id?: string | null; created_at?: string; from_status?: string | null; id?: string; reason?: string | null; service_id: string; to_status: string }
        Update: { actor_user_id?: string | null; created_at?: string; from_status?: string | null; id?: string; reason?: string | null; service_id?: string; to_status?: string }
        Relationships: [{ foreignKeyName: "service_moderation_history_service_id_fkey"; columns: ["service_id"]; isOneToOne: false; referencedRelation: "services"; referencedColumns: ["id"] }]
      }
      service_package_purchases: {
        Row: { created_at: string; currency: string; expires_at: string | null; id: string; package_id: string; price_paid: number; professional_id: string; purchased_at: string | null; service_id: string; sessions_remaining: number; sessions_total: number; status: string; stripe_payment_intent_id: string | null; stripe_session_id: string | null; updated_at: string; user_id: string }
        Insert: { created_at?: string; currency?: string; expires_at?: string | null; id?: string; package_id: string; price_paid: number; professional_id: string; purchased_at?: string | null; service_id: string; sessions_remaining: number; sessions_total: number; status?: string; stripe_payment_intent_id?: string | null; stripe_session_id?: string | null; updated_at?: string; user_id: string }
        Update: { created_at?: string; currency?: string; expires_at?: string | null; id?: string; package_id?: string; price_paid?: number; professional_id?: string; purchased_at?: string | null; service_id?: string; sessions_remaining?: number; sessions_total?: number; status?: string; stripe_payment_intent_id?: string | null; stripe_session_id?: string | null; updated_at?: string; user_id?: string }
        Relationships: [
          { foreignKeyName: "service_package_purchases_package_id_fkey"; columns: ["package_id"]; isOneToOne: false; referencedRelation: "service_packages"; referencedColumns: ["id"] },
          { foreignKeyName: "service_package_purchases_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professionals"; referencedColumns: ["id"] },
          { foreignKeyName: "service_package_purchases_service_id_fkey"; columns: ["service_id"]; isOneToOne: false; referencedRelation: "services"; referencedColumns: ["id"] },
          { foreignKeyName: "service_package_purchases_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }
        ]
      }
      service_packages: {
        Row: { created_at: string; id: string; is_active: boolean; name: string; price: number; professional_id: string; service_id: string; sessions_count: number; updated_at: string; validity_days: number | null }
        Insert: { created_at?: string; id?: string; is_active?: boolean; name: string; price: number; professional_id: string; service_id: string; sessions_count: number; updated_at?: string; validity_days?: number | null }
        Update: { created_at?: string; id?: string; is_active?: boolean; name?: string; price?: number; professional_id?: string; service_id?: string; sessions_count?: number; updated_at?: string; validity_days?: number | null }
        Relationships: [
          { foreignKeyName: "service_packages_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professionals"; referencedColumns: ["id"] },
          { foreignKeyName: "service_packages_service_id_fkey"; columns: ["service_id"]; isOneToOne: false; referencedRelation: "services"; referencedColumns: ["id"] }
        ]
      }
      services: {
        Row: { created_at: string; description: string | null; duration_minutes: number | null; id: string; is_active: boolean | null; modality: string | null; moderation_reason: string | null; moderation_status: string; name: string; price: number | null; price_unit: string | null; professional_id: string; reviewed_at: string | null; reviewed_by: string | null; submitted_at: string | null }
        Insert: { created_at?: string; description?: string | null; duration_minutes?: number | null; id?: string; is_active?: boolean | null; modality?: string | null; moderation_reason?: string | null; moderation_status?: string; name: string; price?: number | null; price_unit?: string | null; professional_id: string; reviewed_at?: string | null; reviewed_by?: string | null; submitted_at?: string | null }
        Update: { created_at?: string; description?: string | null; duration_minutes?: number | null; id?: string; is_active?: boolean | null; modality?: string | null; moderation_reason?: string; moderation_status?: string; name?: string; price?: number | null; price_unit?: string | null; professional_id?: string; reviewed_at?: string | null; reviewed_by?: string | null; submitted_at?: string | null }
        Relationships: [{ foreignKeyName: "services_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professionals"; referencedColumns: ["id"] }]
      }
      space_categories: {
        Row: { category_id: string; space_id: string }
        Insert: { category_id: string; space_id: string }
        Update: { category_id?: string; space_id?: string }
        Relationships: [
          { foreignKeyName: "space_categories_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
          { foreignKeyName: "space_categories_space_id_fkey"; columns: ["space_id"]; isOneToOne: false; referencedRelation: "sport_spaces"; referencedColumns: ["id"] }
        ]
      }
      space_claims: {
        Row: { created_at: string | null; documents_url: string | null; id: string; message: string | null; space_id: string | null; status: string | null; user_id: string | null }
        Insert: { created_at?: string | null; documents_url?: string | null; id?: string; message?: string | null; space_id?: string | null; status?: string | null; user_id?: string | null }
        Update: { created_at?: string | null; documents_url?: string | null; id?: string; message?: string | null; space_id?: string | null; status?: string | null; user_id?: string | null }
        Relationships: [{ foreignKeyName: "space_claims_space_id_fkey"; columns: ["space_id"]; isOneToOne: false; referencedRelation: "sport_spaces"; referencedColumns: ["id"] }]
      }
      space_professionals: {
        Row: { created_at: string; id: string; initiated_by: string; professional_id: string | null; space_id: string | null; status: string; updated_at: string }
        Insert: { created_at?: string; id?: string; initiated_by: string; professional_id?: string | null; space_id?: string | null; status: string; updated_at?: string }
        Update: { created_at?: string; id?: string; initiated_by?: string; professional_id?: string | null; space_id?: string | null; status?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: "space_professionals_professional_id_fkey"; columns: ["professional_id"]; isOneToOne: false; referencedRelation: "professionals"; referencedColumns: ["id"] },
          { foreignKeyName: "space_professionals_space_id_fkey"; columns: ["space_id"]; isOneToOne: false; referencedRelation: "sport_spaces"; referencedColumns: ["id"] }
        ]
      }
      space_room_availability: {
        Row: { created_at: string; day_of_week: number; end_time: string; id: string; is_active: boolean | null; room_id: string; start_time: string }
        Insert: { created_at?: string; day_of_week: number; end_time: string; id?: string; is_active?: boolean | null; room_id: string; start_time: string }
        Update: { created_at?: string; day_of_week?: number; end_time?: string; id?: string; is_active?: boolean | null; room_id?: string; start_time?: string }
        Relationships: [{ foreignKeyName: "space_room_availability_room_id_fkey"; columns: ["room_id"]; isOneToOne: false; referencedRelation: "space_rooms"; referencedColumns: ["id"] }]
      }
      space_rooms: {
        Row: { capacity: number | null; created_at: string; description: string | null; gallery_urls: string[] | null; id: string; is_active: boolean | null; name: string; price_per_hour: number | null; space_id: string; updated_at: string }
        Insert: { capacity?: number | null; created_at?: string; description?: string | null; gallery_urls?: string[] | null; id?: string; is_active?: boolean | null; name: string; price_per_hour?: number | null; space_id: string; updated_at?: string }
        Update: { capacity?: number | null; created_at?: string; description?: string | null; gallery_urls?: string[] | null; id?: string; is_active?: boolean | null; name?: string; price_per_hour?: number | null; space_id?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "space_rooms_space_id_fkey"; columns: ["space_id"]; isOneToOne: false; referencedRelation: "sport_spaces"; referencedColumns: ["id"] }]
      }
      sport_spaces: {
        Row: { address: string | null; amenities: string[] | null; claimed_at: string | null; cover_url: string | null; created_at: string; created_by: string | null; description: string | null; email: string | null; gallery_urls: string[] | null; google_places_id: string | null; id: string; is_verified: boolean | null; latitude: number | null; logo_url: string | null; longitude: number | null; name: string; opening_hours: Json | null; owner_user_id: string | null; phone: string | null; private_gallery_urls: string[] | null; rating_avg: number | null; review_count: number | null; slug: string | null; status: Database["public"]["Enums"]["space_status"] | null; stripe_account_id: string | null; updated_at: string; views_count: number | null; website: string | null }
        Insert: { address?: string | null; amenities?: string[] | null; claimed_at?: string | null; cover_url?: string | null; created_at?: string; created_by?: string | null; description?: string | null; email?: string | null; gallery_urls?: string[] | null; google_places_id?: string | null; id?: string; is_verified?: boolean | null; latitude?: number | null; logo_url?: string | null; longitude?: number | null; name: string; opening_hours?: Json | null; owner_user_id?: string | null; phone?: string | null; private_gallery_urls?: string[] | null; rating_avg?: number | null; review_count?: number | null; slug?: string | null; status?: Database["public"]["Enums"]["space_status"] | null; stripe_account_id?: string | null; updated_at?: string; views_count?: number | null; website?: string | null }
        Update: { address?: string | null; amenities?: string[] | null; claimed_at?: string | null; cover_url?: string | null; created_at?: string; created_by?: string | null; description?: string | null; email?: string | null; gallery_urls?: string[] | null; google_places_id?: string | null; id?: string; is_verified?: boolean | null; latitude?: number | null; logo_url?: string | null; longitude?: number | null; name?: string; opening_hours?: Json | null; owner_user_id?: string | null; phone?: string | null; private_gallery_urls?: string[] | null; rating_avg?: number | null; review_count?: number | null; slug?: string | null; status?: Database["public"]["Enums"]["space_status"] | null; stripe_account_id?: string | null; updated_at?: string; views_count?: number | null; website?: string | null }
        Relationships: [
          { foreignKeyName: "sport_spaces_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] },
          { foreignKeyName: "sport_spaces_owner_user_id_fkey"; columns: ["owner_user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }
        ]
      }
      stripe_webhook_events: {
        Row: { event_id: string; event_participant_id: string | null; event_type: string; financial_metadata: Json | null; id: string; payload: Json; processed_at: string; reservation_id: string | null; service_package_purchase_id: string | null; stripe_connected_account_id: string | null; stripe_payment_intent_id: string | null }
        Insert: { event_id: string; event_participant_id?: string | null; event_type: string; financial_metadata?: Json | null; id?: string; payload: Json; processed_at?: string; reservation_id?: string | null; service_package_purchase_id?: string | null; stripe_connected_account_id?: string | null; stripe_payment_intent_id?: string | null }
        Update: { event_id?: string; event_participant_id?: string | null; event_type?: string; financial_metadata?: Json | null; id?: string; payload?: Json; processed_at?: string; reservation_id?: string | null; service_package_purchase_id?: string | null; stripe_connected_account_id?: string | null; stripe_payment_intent_id?: string | null }
        Relationships: []
      }
      subscription_plans: {
        Row: { annual_price: number; audience: string; code: string; commission_rate: number; created_at: string; customer_service_fee_rate: number; description: string | null; id: string; is_active: boolean; is_public: boolean; monthly_price: number; name: string; sort_order: number; stripe_annual_price_id: string | null; stripe_monthly_price_id: string | null; stripe_product_id: string | null; updated_at: string }
        Insert: { annual_price?: number; audience: string; code: string; commission_rate?: number; created_at?: string; customer_service_fee_rate?: number; description?: string | null; id?: string; is_active?: boolean; is_public?: boolean; monthly_price?: number; name: string; sort_order?: number; stripe_annual_price_id?: string | null; stripe_monthly_price_id?: string | null; stripe_product_id?: string | null; updated_at?: string }
        Update: { annual_price?: number; audience?: string; code?: string; commission_rate?: number; created_at?: string; customer_service_fee_rate?: number; description?: string | null; id?: string; is_active?: boolean; is_public?: boolean; monthly_price?: number; name?: string; sort_order?: number; stripe_annual_price_id?: string | null; stripe_monthly_price_id?: string | null; stripe_product_id?: string | null; updated_at?: string }
        Relationships: []
      }
      system_config: {
        Row: { id: string; settings: Json; updated_at: string | null }
        Insert: { id?: string; settings?: Json; updated_at?: string | null }
        Update: { id?: string; settings?: Json; updated_at?: string | null }
        Relationships: []
      }
      transactions: {
        Row: { amount: number; application_fee_amount: number | null; base_amount: number | null; commission_rate: number | null; created_at: string; currency: string | null; customer_fee_amount: number | null; customer_fee_rate: number | null; financial_metadata: Json; gross_amount: number | null; id: string; platform_commission_amount: number | null; platform_net_amount: number | null; provider_net_amount: number | null; provider_user_id: string | null; related_transaction_id: string | null; source_id: string | null; source_type: string | null; status: string; stripe_charge_id: string | null; stripe_connected_account_id: string | null; stripe_payment_intent_id: string | null; stripe_processing_fee_amount: number | null; stripe_transfer_id: string | null; type: string; user_id: string | null }
        Insert: { amount: number; application_fee_amount?: number | null; base_amount?: number | null; commission_rate?: number | null; created_at?: string; currency?: string | null; customer_fee_amount?: number | null; customer_fee_rate?: number | null; financial_metadata?: Json; gross_amount?: number | null; id?: string; platform_commission_amount?: number | null; platform_net_amount?: number | null; provider_net_amount?: number | null; provider_user_id?: string | null; related_transaction_id?: string | null; source_id?: string | null; source_type?: string | null; status: string; stripe_charge_id?: string | null; stripe_connected_account_id?: string | null; stripe_payment_intent_id?: string | null; stripe_processing_fee_amount?: number | null; stripe_transfer_id?: string | null; type: string; user_id?: string | null }
        Update: { amount?: number; application_fee_amount?: number | null; base_amount?: number | null; commission_rate?: number | null; created_at?: string; currency?: string | null; customer_fee_amount?: number | null; customer_fee_rate?: number | null; financial_metadata?: Json; gross_amount?: number | null; id?: string; platform_commission_amount?: number | null; platform_net_amount?: number | null; provider_net_amount?: number | null; provider_user_id?: string | null; related_transaction_id?: string | null; source_id?: string | null; source_type?: string | null; status?: string; stripe_charge_id?: string | null; stripe_connected_account_id?: string | null; stripe_payment_intent_id?: string | null; stripe_processing_fee_amount?: number | null; stripe_transfer_id?: string | null; type?: string; user_id?: string | null }
        Relationships: [{ foreignKeyName: "transactions_related_transaction_id_fkey"; columns: ["related_transaction_id"]; isOneToOne: false; referencedRelation: "transactions"; referencedColumns: ["id"] }]
      }
      user_entitlement_overrides: {
        Row: { boolean_value: boolean | null; created_at: string; created_by: string | null; decimal_value: number | null; expires_at: string | null; feature_key: string; id: string; integer_value: number | null; is_unlimited: boolean; json_value: Json | null; reason: string | null; text_value: string | null; updated_at: string; user_id: string; value_type: string }
        Insert: { boolean_value?: boolean | null; created_at?: string; created_by?: string | null; decimal_value?: number | null; expires_at?: string | null; feature_key: string; id?: string; integer_value?: number | null; is_unlimited?: boolean; json_value?: Json | null; reason?: string | null; text_value?: string | null; updated_at?: string; user_id: string; value_type: string }
        Update: { boolean_value?: boolean | null; created_at?: string; created_by?: string | null; decimal_value?: number | null; expires_at?: string | null; feature_key?: string; id?: string; integer_value?: number | null; is_unlimited?: boolean; json_value?: Json | null; reason?: string | null; text_value?: string | null; updated_at?: string; user_id?: string; value_type?: string }
        Relationships: [{ foreignKeyName: "user_entitlement_overrides_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }]
      }
      user_follows: {
        Row: { created_at: string | null; follower_id: string; following_id: string; id: string }
        Insert: { created_at?: string | null; follower_id: string; following_id: string; id?: string }
        Update: { created_at?: string | null; follower_id?: string; following_id?: string; id?: string }
        Relationships: [
          { foreignKeyName: "user_follows_follower_id_fkey"; columns: ["follower_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] },
          { foreignKeyName: "user_follows_following_id_fkey"; columns: ["following_id"]; isOneToOne: false; referencedRelation: "platform_users"; referencedColumns: ["id"] }
        ]
      }
      user_subscriptions: {
        Row: { cancel_at_period_end: boolean | null; created_at: string; current_period_end: string | null; current_period_start: string | null; id: string; plan_id: string | null; status: Database["public"]["Enums"]["subscription_status"] | null; stripe_customer_id: string | null; stripe_subscription_id: string | null; tier: Database["public"]["Enums"]["subscription_tier"]; updated_at: string; user_id: string }
        Insert: { cancel_at_period_end?: boolean | null; created_at?: string; current_period_end?: string | null; current_period_start?: string | null; id?: string; plan_id?: string | null; status?: Database["public"]["Enums"]["subscription_status"] | null; stripe_customer_id?: string | null; stripe_subscription_id?: string | null; tier?: Database["public"]["Enums"]["subscription_tier"]; updated_at?: string; user_id: string }
        Update: { cancel_at_period_end?: boolean | null; created_at?: string; current_period_end?: string | null; current_period_start?: string | null; id?: string; plan_id?: string | null; status?: Database["public"]["Enums"]["subscription_status"] | null; stripe_customer_id?: string | null; stripe_subscription_id?: string | null; tier?: Database["public"]["Enums"]["subscription_tier"]; updated_at?: string; user_id?: string }
        Relationships: [
          { foreignKeyName: "user_subscriptions_plan_id_fkey"; columns: ["plan_id"]; isOneToOne: false; referencedRelation: "subscription_plans"; referencedColumns: ["id"] },
          { foreignKeyName: "user_subscriptions_user_id_fkey"; columns: ["user_id"]; isOneToOne: true; referencedRelation: "platform_users"; referencedColumns: ["id"] }
        ]
      }
    }
    Views: {
      admin_users: {
        Row: { created_at: string | null; id: string | null; is_active: boolean | null; role: string | null; updated_at: string | null; user_id: string | null }
        Insert: { created_at?: string | null; id?: string | null; is_active?: never; role?: string | null; updated_at?: string | null; user_id?: string | null }
        Update: { created_at?: string | null; id?: string | null; is_active?: never; role?: string | null; updated_at?: string | null; user_id?: string | null }
        Relationships: []
      }
    }
    Functions: {
      discover_communities: { Args: { p_category_ids?: string[]; p_lat?: number; p_limit?: number; p_lng?: number; p_offset?: number; p_q?: string; p_sort?: string }; Returns: { item: Json; total_count: number }[] }
      discover_events: { Args: { p_category_ids?: string[]; p_date_from?: string; p_date_to?: string; p_lat?: number; p_limit?: number; p_lng?: number; p_location?: string; p_offset?: number; p_price_max?: number; p_price_min?: number; p_q?: string; p_radius?: number; p_sort?: string }; Returns: { item: Json; total_count: number }[] }
      discover_professionals: { Args: { p_category_ids?: string[]; p_lat?: number; p_limit?: number; p_lng?: number; p_location?: string; p_offset?: number; p_price_max?: number; p_price_min?: number; p_q?: string; p_radius?: number; p_rating?: number; p_sort?: string }; Returns: { item: Json; total_count: number }[] }
      discover_spaces: { Args: { p_category_ids?: string[]; p_lat?: number; p_limit?: number; p_lng?: number; p_location?: string; p_offset?: number; p_price_max?: number; p_price_min?: number; p_q?: string; p_radius?: number; p_rating?: number; p_sort?: string }; Returns: { item: Json; total_count: number }[] }
      public_event_participant_count: { Args: { p_event_id: string }; Returns: number }
      search_public_entities: { Args: { p_category_ids?: string[]; p_date_from?: string; p_date_to?: string; p_entity_type?: string; p_lat?: number; p_limit?: number; p_lng?: number; p_location?: string; p_offset?: number; p_q?: string; p_radius?: number; p_rating?: number; p_sort?: string }; Returns: { item: Json; total_count: number }[] }
      get_monthly_registrations: { Args: { months_back?: number; table_name?: string }; Returns: { count: number; period: string }[] }
      get_weekly_registrations: { Args: { table_name?: string; weeks_back?: number }; Returns: { count: number; period: string }[] }
      increment_feature_usage: { Args: { p_feature_key: string; p_increment?: number; p_period_start: string; p_period_type: string; p_user_id: string }; Returns: number }
      increment_professional_views: { Args: { prof_id: string }; Returns: undefined }
      increment_space_views: { Args: { space_id: string }; Returns: undefined }
      push_notification: { Args: { p_data?: Json; p_dedupe_key?: string; p_link?: string; p_message: string; p_type: string; p_user_id: string }; Returns: undefined }
      reservation_provider_user: { Args: { p_professional_id: string; p_space_id: string }; Returns: string }
      search_professionals_by_radius: {
        Args: { lat: number; lng: number; radius_km: number }
        Returns: Database["public"]["Tables"]["professionals"]["Row"][]
        SetofOptions: { from: "*"; to: "professionals"; isOneToOne: false; isSetofReturn: true }
      }
      search_spaces_by_radius: {
        Args: { lat: number; lng: number; radius_km: number }
        Returns: Database["public"]["Tables"]["sport_spaces"]["Row"][]
        SetofOptions: { from: "*"; to: "sport_spaces"; isOneToOne: false; isSetofReturn: true }
      }
    }
    Enums: {
      contact_status: "pending" | "read" | "responded" | "archived"
      event_status: "draft" | "pending" | "published" | "cancelled" | "completed"
      notification_status: "unread" | "read" | "archived"
      notification_type: "contact_request" | "review" | "message" | "favorite" | "event" | "system" | "moderation"
      professional_status: "pending" | "active" | "suspended" | "rejected"
      reservation_status: "pending" | "confirmed" | "paid" | "cancelled" | "completed"
      review_status: "pending" | "approved" | "rejected" | "flagged"
      space_status: "pending" | "active" | "suspended" | "rejected"
      subscription_status: "active" | "canceled" | "past_due" | "trialing" | "incomplete" | "incomplete_expired" | "unpaid" | "paused"
      subscription_tier: "free" | "pro" | "premium"
      user_role: "athlete" | "professional" | "venue_manager"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R } ? R : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R } ? R : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I } ? I : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I } ? I : never : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U } ? U : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U } ? U : never : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions] : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"] : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions] : never

export const Constants = {
  public: {
    Enums: {
      contact_status: ["pending", "read", "responded", "archived"],
      event_status: ["draft", "pending", "published", "cancelled", "completed"],
      notification_status: ["unread", "read", "archived"],
      notification_type: ["contact_request", "review", "message", "favorite", "event", "system", "moderation"],
      professional_status: ["pending", "active", "suspended", "rejected"],
      reservation_status: ["pending", "confirmed", "paid", "cancelled", "completed"],
      review_status: ["pending", "approved", "rejected", "flagged"],
      space_status: ["pending", "active", "suspended", "rejected"],
      subscription_status: ["active", "canceled", "past_due", "trialing", "incomplete", "incomplete_expired", "unpaid", "paused"],
      subscription_tier: ["free", "pro", "premium"],
      user_role: ["athlete", "professional", "venue_manager"],
    },
  },
} as const
