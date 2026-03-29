import { createClient } from '@supabase/supabase-js'
import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://vakil.bio'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: lawyers } = await supabase
    .from('lawyers')
    .select('username, updated_at')
    .neq('is_suspended', true)

  const profileUrls: MetadataRoute.Sitemap = (lawyers ?? []).map((l) => ({
    url: `${BASE}/${l.username}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const practiceAreas = [
    'Criminal Law', 'Family Law', 'Property & Real Estate', 'Corporate & Business',
    'Labour & Employment', 'Consumer Protection', 'Civil Litigation', 'Tax Law',
    'Intellectual Property', 'Immigration', 'Banking & Finance', 'Environmental Law',
  ]

  const filterUrls: MetadataRoute.Sitemap = practiceAreas.map((area) => ({
    url: `${BASE}/discover?area=${encodeURIComponent(area)}`,
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  return [
    { url: BASE, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/discover`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/pricing`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: 'monthly', priority: 0.3 },
    ...filterUrls,
    ...profileUrls,
  ]
}
