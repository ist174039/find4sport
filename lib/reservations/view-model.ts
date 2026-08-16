export type ReservationStatus = 'pending' | 'paid' | 'confirmed' | 'cancelled' | 'completed'

export type ReservationListItem = {
  id: string
  date: string
  start_time: string
  end_time: string
  status: ReservationStatus
  payment_status: string | null
  amount: number | null
  service: { name: string } | null
  room: { name: string } | null
  user: { id: string; full_name: string | null; avatar_url: string | null; type: string | null } | null
}

export type AvailabilityRow = {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export type ReservationsPageData = {
  items: ReservationListItem[]
  total: number
  page: number
  pageSize: number
  query: string
  status: string
}
