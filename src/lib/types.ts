export type ServiceType = string

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export type LeadUrgency = 'low' | 'medium' | 'high'

export interface Lawyer {
  id: string
  user_id: string
  username: string
  full_name: string
  title?: string
  photo_url?: string
  bio?: string
  years_experience?: number
  languages?: string[]
  location?: string
  bar_council_number?: string
  is_verified: boolean
  practice_areas?: string[]
  plan: 'free' | 'pro'
  consultations_completed: number
  phone?: string
  email?: string
  whatsapp_number?: string
  show_bci_disclaimer: boolean
  show_phone?: boolean
  show_whatsapp?: boolean
  verified_until?: string
  verification_plan?: 'monthly' | 'yearly'
  verification_type?: 'advocate' | 'professional'
  verification_status?: 'none' | 'pending' | 'approved' | 'rejected'
  current_firm?: string
  university?: string
  graduation_year?: number
  profile_views?: number
  linkedin_url?: string
  twitter_url?: string
  instagram_url?: string
  website_url?: string
  youtube_url?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  lawyer_id: string
  type: ServiceType
  title: string
  description?: string
  duration_minutes?: number
  price: number
  original_price?: number
  is_active: boolean
  created_at: string
}

export interface AvailabilitySlot {
  id: string
  lawyer_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export interface Booking {
  id: string
  lawyer_id: string
  service_id: string
  client_name: string
  client_email: string
  client_phone: string
  case_type: string
  description?: string
  urgency: LeadUrgency
  scheduled_date: string
  scheduled_time: string
  status: BookingStatus
  razorpay_order_id?: string
  razorpay_payment_id?: string
  amount: number
  platform_fee: number
  meet_link?: string
  created_at: string
  service?: Service
  lawyer?: Lawyer
}

export interface Lead {
  id: string
  lawyer_id: string
  client_name: string
  client_phone: string
  client_email?: string
  case_type: string
  description?: string
  urgency: LeadUrgency
  is_contacted: boolean
  created_at: string
}
