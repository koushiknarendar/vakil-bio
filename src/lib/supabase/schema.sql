-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Lawyers table
create table if not exists lawyers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique,
  username text unique not null,
  full_name text not null,
  title text,
  photo_url text,
  bio text,
  years_experience integer default 0,
  languages text[] default '{}',
  location text,
  bar_council_number text,
  is_verified boolean default false,
  practice_areas text[] default '{}',
  plan text default 'free' check (plan in ('free', 'pro')),
  consultations_completed integer default 0,
  phone text,
  email text,
  whatsapp_number text,
  show_bci_disclaimer boolean default true,
  current_firm text,
  university text,
  graduation_year integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Services table
create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  lawyer_id uuid references lawyers(id) on delete cascade,
  type text not null check (type in ('consultation_15', 'consultation_30', 'consultation_60', 'document_review', 'priority_dm')),
  title text not null,
  description text,
  duration_minutes integer,
  price integer not null, -- in rupees
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Availability slots table
create table if not exists availability_slots (
  id uuid primary key default uuid_generate_v4(),
  lawyer_id uuid references lawyers(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time text not null,
  end_time text not null,
  is_active boolean default true
);

-- Bookings table
create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  lawyer_id uuid references lawyers(id) on delete cascade,
  service_id uuid references services(id),
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  case_type text not null,
  description text,
  urgency text default 'medium' check (urgency in ('low', 'medium', 'high')),
  scheduled_date date not null,
  scheduled_time text not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  amount integer not null, -- in rupees
  platform_fee integer not null,
  meet_link text,
  created_at timestamptz default now()
);

-- Leads table
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  lawyer_id uuid references lawyers(id) on delete cascade,
  client_name text not null,
  client_phone text not null,
  client_email text,
  case_type text not null,
  description text,
  urgency text default 'medium' check (urgency in ('low', 'medium', 'high')),
  is_contacted boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table lawyers enable row level security;
alter table services enable row level security;
alter table availability_slots enable row level security;
alter table bookings enable row level security;
alter table leads enable row level security;

-- Lawyers policies
create policy "Public can read lawyers" on lawyers for select using (true);
create policy "Lawyers can update own profile" on lawyers for update using (auth.uid() = user_id);
create policy "Lawyers can insert own profile" on lawyers for insert with check (auth.uid() = user_id);

-- Services policies
create policy "Public can read active services" on services for select using (is_active = true);
create policy "Lawyers can manage own services" on services for all using (
  lawyer_id in (select id from lawyers where user_id = auth.uid())
);

-- Availability policies
create policy "Public can read availability" on availability_slots for select using (is_active = true);
create policy "Lawyers can manage own availability" on availability_slots for all using (
  lawyer_id in (select id from lawyers where user_id = auth.uid())
);

-- Bookings policies
create policy "Lawyers can read own bookings" on bookings for select using (
  lawyer_id in (select id from lawyers where user_id = auth.uid())
);
create policy "Anyone can create bookings" on bookings for insert with check (true);
create policy "Lawyers can update own bookings" on bookings for update using (
  lawyer_id in (select id from lawyers where user_id = auth.uid())
);

-- Leads policies
create policy "Lawyers can read own leads" on leads for select using (
  lawyer_id in (select id from lawyers where user_id = auth.uid())
);
create policy "Anyone can create leads" on leads for insert with check (true);
create policy "Lawyers can update own leads" on leads for update using (
  lawyer_id in (select id from lawyers where user_id = auth.uid())
);

-- Migration: add education & experience fields
alter table lawyers add column if not exists current_firm text;
alter table lawyers add column if not exists university text;
alter table lawyers add column if not exists graduation_year integer;
