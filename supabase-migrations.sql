-- ─────────────────────────────────────────────────────────────
-- vakil.bio — run this in Supabase SQL Editor (one-time setup)
-- ─────────────────────────────────────────────────────────────

-- Lawyers table additions
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS profile_views integer DEFAULT 0;
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS current_firm text;
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS university text;
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS graduation_year integer;

-- Verification subscription
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS verified_until timestamptz;
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS verification_plan text CHECK (verification_plan IN ('monthly', 'yearly'));
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS verification_type text CHECK (verification_type IN ('advocate', 'professional'));
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected'));

-- Verification applications
CREATE TABLE IF NOT EXISTS verification_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  verification_type text NOT NULL CHECK (verification_type IN ('advocate', 'professional')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  -- Advocate fields
  bar_council_number text,
  state_bar_council text,
  -- Professional fields
  professional_role text,
  -- Documents (storage URLs)
  document_1_url text,
  document_2_url text,
  linkedin_url text,
  -- Review
  rejection_reason text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(lawyer_id)
);
ALTER TABLE verification_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lawyers manage own verification application"
  ON verification_applications FOR ALL
  USING (lawyer_id IN (SELECT id FROM lawyers WHERE user_id = auth.uid()));

-- Contact visibility toggles
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS show_phone boolean DEFAULT true;
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS show_whatsapp boolean DEFAULT true;

-- Profile translations cache
CREATE TABLE IF NOT EXISTS profile_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  content_hash text NOT NULL,
  translated_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(lawyer_id, language_code)
);
ALTER TABLE profile_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profile translations"
  ON profile_translations FOR SELECT USING (true);

-- Social links
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS twitter_url text;
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE lawyers ADD COLUMN IF NOT EXISTS youtube_url text;

-- Grievances table
CREATE TABLE IF NOT EXISTS grievances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'open',
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

-- Services table additions
ALTER TABLE services ADD COLUMN IF NOT EXISTS original_price integer;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_type_check;

-- Calendar tokens table
CREATE TABLE IF NOT EXISTS lawyer_calendar_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('google', 'microsoft')),
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (lawyer_id, provider)
);

ALTER TABLE lawyer_calendar_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lawyers manage own calendar tokens"
  ON lawyer_calendar_tokens
  FOR ALL
  USING (lawyer_id IN (SELECT id FROM lawyers WHERE user_id = auth.uid()));

-- Profile views RPC function
CREATE OR REPLACE FUNCTION increment_profile_views(p_lawyer_id uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE lawyers
  SET profile_views = COALESCE(profile_views, 0) + 1
  WHERE id = p_lawyer_id;
$$;
