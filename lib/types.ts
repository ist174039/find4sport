// Database enums
export type UserRole = 'user' | 'professional' | 'admin' | 'moderator'
export type ProfessionalStatus = 'pending' | 'active' | 'suspended' | 'rejected'
export type SpaceStatus = 'pending' | 'active' | 'suspended' | 'rejected'
export type OwnershipStatus = 'unclaimed' | 'pending' | 'claimed' | 'rejected'
export type EventStatus = 'draft' | 'pending' | 'published' | 'cancelled' | 'completed'
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged'
export type ContactStatus = 'pending' | 'read' | 'responded' | 'archived'
export type NotificationStatus = 'unread' | 'read' | 'archived'
export type NotificationType = 'contact_request' | 'review' | 'message' | 'favorite' | 'event' | 'system' | 'moderation'

// Database types
export interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  location: string | null
  language: string
  preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  emoji: string | null
  color: string | null
  pro_count: number
  space_count: number
  event_count: number
  created_at: string
}

export interface Professional {
  id: string
  user_id: string
  full_name: string
  professional_name: string | null
  bio: string | null
  avatar_url: string | null
  phone: string | null
  whatsapp: string | null
  email: string
  nif: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  service_radius_km: number
  status: ProfessionalStatus
  public_slug: string | null
  contact_methods: string[]
  rating_avg: number
  review_count: number
  views_count: number
  website: string | null
  social_links: Record<string, string>
  is_verified: boolean
  is_premium: boolean
  gallery_urls: string[] | null
  created_at: string
  updated_at: string
  // Relations
  categories?: Category[]
  services?: Service[]
  qualifications?: Qualification[]
}

export interface Service {
  id: string
  professional_id: string
  name: string
  description: string | null
  duration_minutes: number | null
  price: number | null
  price_unit: string
  modality: string | null
  is_active: boolean
  created_at: string
}

export interface Qualification {
  id: string
  professional_id: string
  title: string
  issuer: string | null
  issue_date: string | null
  expiry_date: string | null
  is_verified: boolean
  document_url: string | null
  created_at: string
}

export interface SportSpace {
  id: string
  name: string
  slug: string | null
  description: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  email: string | null
  website: string | null
  opening_hours: Record<string, { open: string; close: string }>
  amenities: string[] | null
  source: string
  google_places_id: string | null
  status: SpaceStatus
  is_verified: boolean
  rating_avg: number
  review_count: number
  views_count: number
  gallery_urls: string[] | null
  created_by: string | null
  owner_user_id: string | null
  ownership_status: OwnershipStatus
  claimed_at: string | null
  created_at: string
  updated_at: string
  // Relations
  categories?: Category[]
}

export interface Event {
  id: string
  title: string
  slug: string | null
  description: string | null
  category_id: string | null
  space_id: string | null
  professional_id: string | null
  organizer_name: string | null
  organizer_email: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  start_date: string
  end_date: string | null
  capacity: number | null
  price_min: number | null
  price_max: number | null
  image_url: string | null
  gallery_urls: string[] | null
  source: string
  external_url: string | null
  source_type: string | null
  status: EventStatus
  is_featured: boolean
  is_verified: boolean
  views_count: number
  created_by: string | null
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  space?: SportSpace
  professional?: Professional
}

export interface Review {
  id: string
  user_id: string
  professional_id: string | null
  space_id: string | null
  rating: number
  title: string | null
  comment: string | null
  status: ReviewStatus
  is_verified: boolean
  helpful_count: number
  response: string | null
  response_at: string | null
  created_at: string
  updated_at: string
  // Relations
  user?: UserProfile
}

export interface Favorite {
  id: string
  user_id: string
  professional_id: string | null
  space_id: string | null
  event_id: string | null
  created_at: string
}

export interface ContactRequest {
  id: string
  sender_user_id: string | null
  professional_id: string | null
  space_id: string | null
  sender_name: string
  sender_email: string
  sender_phone: string | null
  subject: string | null
  message: string
  status: ContactStatus
  response: string | null
  responded_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  data: Record<string, unknown>
  status: NotificationStatus
  read_at: string | null
  created_at: string
}

export interface Conversation {
  id: string
  participant_1_id: string
  participant_2_id: string
  last_message_at: string
  created_at: string
  // Relations
  messages?: Message[]
  other_participant?: UserProfile
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  read_at: string | null
  created_at: string
  // Relations
  sender?: UserProfile
}

export interface Community {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  image_url: string | null
  cover_url: string | null
  is_private: boolean
  member_count: number
  created_by: string
  created_at: string
  updated_at: string
  // Relations
  category?: Category
}

export interface Badge {
  id: string
  name: string
  slug: string
  description: string | null
  icon_url: string | null
  criteria: Record<string, unknown>
  points: number
  created_at: string
}

// Search and filter types
export interface SearchFilters {
  query?: string
  category?: string
  location?: string
  latitude?: number
  longitude?: number
  radius?: number
  minRating?: number
  priceMin?: number
  priceMax?: number
  amenities?: string[]
  isVerified?: boolean
  sortBy?: 'relevance' | 'rating' | 'distance' | 'reviews' | 'newest'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Form types
export interface ProfessionalFormData {
  full_name: string
  professional_name?: string
  bio?: string
  email: string
  phone?: string
  whatsapp?: string
  address?: string
  service_radius_km: number
  website?: string
  categories: string[]
}

export interface SpaceFormData {
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  opening_hours?: Record<string, { open: string; close: string }>
  amenities?: string[]
  categories: string[]
}

export interface EventFormData {
  title: string
  description?: string
  category_id?: string
  space_id?: string
  address?: string
  start_date: string
  end_date?: string
  capacity?: number
  price_min?: number
  price_max?: number
}

export interface ReviewFormData {
  rating: number
  title?: string
  comment?: string
}

export interface ContactFormData {
  sender_name: string
  sender_email: string
  sender_phone?: string
  subject?: string
  message: string
}
