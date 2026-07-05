export type Role = 'OWNER' | 'SITTER'
export type PetType = 'dog' | 'cat' | 'other'
export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface Profile {
  id: string
  role: Role
  first_name: string
  last_name: string
  email: string
  city?: string
  bio?: string
  image_url?: string | null
  created_at: string
}

export interface SitterProfile {
  id: string
  profile_id: string
  price_per_day: number
  years_of_experience?: number
  services_offered?: string
  can_host_at_home: boolean
  created_at: string
}

// Joined type used on the Browse Sitters page
export interface SitterWithProfile extends SitterProfile {
  profile: {
    first_name: string
    last_name: string
    city?: string | null
    bio?: string | null
    image_url?: string | null
  }
}

export interface Pet {
  id: string
  owner_id: string
  name: string
  type: PetType
  breed?: string
  age?: number
  image_url?: string | null
  created_at: string
}

export interface Booking {
  id: string
  owner_id: string
  sitter_id: string
  pet_id: string
  start_date: string
  end_date: string
  total_price: number
  status: BookingStatus
  created_at: string
}