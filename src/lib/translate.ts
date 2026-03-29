import { createHash } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import type { Service } from './types'

// ── Supported languages ──────────────────────────────────────────────
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English',   native: 'English'    },
  { code: 'hi', name: 'Hindi',     native: 'हिंदी'       },
  { code: 'bn', name: 'Bengali',   native: 'বাংলা'       },
  { code: 'te', name: 'Telugu',    native: 'తెలుగు'      },
  { code: 'mr', name: 'Marathi',   native: 'मराठी'       },
  { code: 'ta', name: 'Tamil',     native: 'தமிழ்'       },
  { code: 'gu', name: 'Gujarati',  native: 'ગુજરાતી'     },
  { code: 'kn', name: 'Kannada',   native: 'ಕನ್ನಡ'       },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം'     },
]

// ── Static UI label translations ─────────────────────────────────────
// Avoids API calls for fixed UI text
type UILabels = {
  services: string
  about: string
  education: string
  enquiryHeading: string
  enquirySub: (name: string) => string
  book: string
  bookFree: string
  call: string
  verified: string
  verifiedAdvocate: string
  verifiedProfessional: string
  free: string
  off: string
  min: string
  yrsExp: string
  website: string
  noResults: string
}

export const UI: Record<string, UILabels> = {
  en: {
    services: 'Services',
    about: 'About',
    education: 'Education & Experience',
    enquiryHeading: 'Send a Free Enquiry',
    enquirySub: (n) => `Not ready to book? Send your query and ${n} will get back to you.`,
    book: 'Book', bookFree: 'Book Free', call: 'Call',
    verified: 'Verified', verifiedAdvocate: 'Verified Advocate', verifiedProfessional: 'Verified Professional',
    free: 'Free', off: 'off', min: 'min', yrsExp: 'yrs exp',
    website: 'Website', noResults: '',
  },
  hi: {
    services: 'सेवाएं',
    about: 'परिचय',
    education: 'शिक्षा और अनुभव',
    enquiryHeading: 'निःशुल्क पूछताछ भेजें',
    enquirySub: (n) => `बुक करने के लिए तैयार नहीं? अपना प्रश्न भेजें और ${n} संपर्क करेंगे।`,
    book: 'बुक करें', bookFree: 'मुफ्त बुक करें', call: 'कॉल करें',
    verified: 'सत्यापित', verifiedAdvocate: 'सत्यापित अधिवक्ता', verifiedProfessional: 'सत्यापित विधि विशेषज्ञ',
    free: 'मुफ्त', off: 'छूट', min: 'मिनट', yrsExp: 'वर्ष का अनुभव',
    website: 'वेबसाइट', noResults: '',
  },
  bn: {
    services: 'পরিষেবাসমূহ',
    about: 'পরিচিতি',
    education: 'শিক্ষা ও অভিজ্ঞতা',
    enquiryHeading: 'বিনামূল্যে জিজ্ঞাসা পাঠান',
    enquirySub: (n) => `বুক করতে প্রস্তুত নন? আপনার প্রশ্ন পাঠান এবং ${n} যোগাযোগ করবেন।`,
    book: 'বুক করুন', bookFree: 'বিনামূল্যে বুক করুন', call: 'কল করুন',
    verified: 'যাচাইকৃত', verifiedAdvocate: 'যাচাইকৃত আইনজীবী', verifiedProfessional: 'যাচাইকৃত আইন বিশেষজ্ঞ',
    free: 'বিনামূল্যে', off: 'ছাড়', min: 'মিনিট', yrsExp: 'বছরের অভিজ্ঞতা',
    website: 'ওয়েবসাইট', noResults: '',
  },
  te: {
    services: 'సేవలు',
    about: 'గురించి',
    education: 'విద్య మరియు అనుభవం',
    enquiryHeading: 'ఉచిత విచారణ పంపండి',
    enquirySub: (n) => `బుక్ చేయడానికి సిద్ధంగా లేరా? మీ ప్రశ్న పంపండి, ${n} మీకు తిరిగి వస్తారు.`,
    book: 'బుక్ చేయండి', bookFree: 'ఉచితంగా బుక్ చేయండి', call: 'కాల్ చేయండి',
    verified: 'ధృవీకరించబడింది', verifiedAdvocate: 'ధృవీకరించబడిన న్యాయవాది', verifiedProfessional: 'ధృవీకరించబడిన నిపుణుడు',
    free: 'ఉచితం', off: 'తగ్గింపు', min: 'నిమిషాలు', yrsExp: 'సంవత్సరాల అనుభవం',
    website: 'వెబ్‌సైట్', noResults: '',
  },
  mr: {
    services: 'सेवा',
    about: 'परिचय',
    education: 'शिक्षण आणि अनुभव',
    enquiryHeading: 'विनामूल्य चौकशी पाठवा',
    enquirySub: (n) => `बुक करण्यास तयार नाही? आपला प्रश्न पाठवा आणि ${n} संपर्क करतील.`,
    book: 'बुक करा', bookFree: 'विनामूल्य बुक करा', call: 'कॉल करा',
    verified: 'सत्यापित', verifiedAdvocate: 'सत्यापित वकील', verifiedProfessional: 'सत्यापित कायदेशीर तज्ञ',
    free: 'विनामूल्य', off: 'सूट', min: 'मिनिटे', yrsExp: 'वर्षांचा अनुभव',
    website: 'वेबसाइट', noResults: '',
  },
  ta: {
    services: 'சேவைகள்',
    about: 'பற்றி',
    education: 'கல்வி மற்றும் அனுபவம்',
    enquiryHeading: 'இலவச விசாரணை அனுப்பவும்',
    enquirySub: (n) => `புக் செய்ய தயாரில்லையா? உங்கள் கேள்வியை அனுப்புங்கள், ${n} திரும்ப தொடர்பு கொள்வார்கள்.`,
    book: 'புக் செய்யுங்கள்', bookFree: 'இலவசமாக புக் செய்யுங்கள்', call: 'அழைக்கவும்',
    verified: 'சரிபார்க்கப்பட்டது', verifiedAdvocate: 'சரிபார்க்கப்பட்ட வழக்கறிஞர்', verifiedProfessional: 'சரிபார்க்கப்பட்ட சட்ட நிபுணர்',
    free: 'இலவசம்', off: 'தள்ளுபடி', min: 'நிமிடம்', yrsExp: 'ஆண்டு அனுபவம்',
    website: 'இணையதளம்', noResults: '',
  },
  gu: {
    services: 'સેવાઓ',
    about: 'પરિચય',
    education: 'શિક્ષણ અને અનુભવ',
    enquiryHeading: 'મફત પૂછપરછ મોકલો',
    enquirySub: (n) => `બુક કરવા માટે તૈયાર નથી? તમારો પ્રશ્ન મોકલો અને ${n} સંપર્ક કરશે.`,
    book: 'બુક કરો', bookFree: 'મફતમાં બુક કરો', call: 'કૉલ કરો',
    verified: 'ચકાસાયેલ', verifiedAdvocate: 'ચકાસાયેલ વકીલ', verifiedProfessional: 'ચકાસાયેલ કાનૂની નિષ્ણાત',
    free: 'મફત', off: 'છૂટ', min: 'મિનિટ', yrsExp: 'વર્ષનો અનુભવ',
    website: 'વેબસાઇટ', noResults: '',
  },
  kn: {
    services: 'ಸೇವೆಗಳು',
    about: 'ಬಗ್ಗೆ',
    education: 'ಶಿಕ್ಷಣ ಮತ್ತು ಅನುಭವ',
    enquiryHeading: 'ಉಚಿತ ವಿಚಾರಣೆ ಕಳುಹಿಸಿ',
    enquirySub: (n) => `ಬುಕ್ ಮಾಡಲು ಸಿದ್ಧರಿಲ್ಲವೇ? ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಕಳುಹಿಸಿ, ${n} ಸಂಪರ್ಕಿಸುತ್ತಾರೆ.`,
    book: 'ಬುಕ್ ಮಾಡಿ', bookFree: 'ಉಚಿತವಾಗಿ ಬುಕ್ ಮಾಡಿ', call: 'ಕರೆ ಮಾಡಿ',
    verified: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ', verifiedAdvocate: 'ಪರಿಶೀಲಿಸಲಾದ ವಕೀಲ', verifiedProfessional: 'ಪರಿಶೀಲಿಸಲಾದ ಕಾನೂನು ತಜ್ಞ',
    free: 'ಉಚಿತ', off: 'ರಿಯಾಯಿತಿ', min: 'ನಿಮಿಷ', yrsExp: 'ವರ್ಷಗಳ ಅನುಭವ',
    website: 'ವೆಬ್‌ಸೈಟ್', noResults: '',
  },
  ml: {
    services: 'സേവനങ്ങൾ',
    about: 'കുറിച്ച്',
    education: 'വിദ്യാഭ്യാസവും അനുഭവവും',
    enquiryHeading: 'സൗജന്യ അന്വേഷണം അയയ്ക്കൂ',
    enquirySub: (n) => `ബുക്ക് ചെയ്യാൻ തയ്യാറല്ലേ? നിങ്ങളുടെ ചോദ്യം അയയ്ക്കൂ, ${n} തിരിച്ച് ബന്ധപ്പെടും.`,
    book: 'ബുക്ക് ചെയ്യൂ', bookFree: 'സൗജന്യമായി ബുക്ക് ചെയ്യൂ', call: 'വിളിക്കൂ',
    verified: 'പരിശോധിക്കപ്പെട്ടത്', verifiedAdvocate: 'പരിശോധിക്കപ്പെട്ട അഭിഭാഷകൻ', verifiedProfessional: 'പരിശോധിക്കപ്പെട്ട നിയമ വിദഗ്ദ്ധൻ',
    free: 'സൗജന്യം', off: 'കിഴിവ്', min: 'മിനിറ്റ്', yrsExp: 'വർഷത്തെ പരിചയം',
    website: 'വെബ്‌സൈറ്റ്', noResults: '',
  },
}

export function getUILabels(lang: string): UILabels {
  return UI[lang] ?? UI.en
}

// ── Types ────────────────────────────────────────────────────────────
export interface TranslatedProfile {
  title?: string
  bio?: string
  services: Array<{ id: string; title: string; description?: string }>
}

// ── Helpers ──────────────────────────────────────────────────────────
function contentHash(lawyer: { title?: string; bio?: string }, services: Service[]): string {
  const raw = [
    lawyer.title ?? '',
    lawyer.bio ?? '',
    ...services.map(s => `${s.title}|${s.description ?? ''}`),
  ].join('§')
  return createHash('sha256').update(raw).digest('hex').slice(0, 16)
}

async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  const nonEmpty = texts
    .map((text, i) => ({ text, i }))
    .filter(({ text }) => text.trim().length > 0)

  if (!nonEmpty.length) return texts

  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: nonEmpty.map(({ text }) => text),
        target: targetLang,
        source: 'en',
        format: 'text',
      }),
    }
  )

  if (!res.ok) throw new Error(`Google Translate API error: ${res.status}`)

  const data = await res.json()
  const translatedTexts: string[] = data.data.translations.map(
    (t: { translatedText: string }) => t.translatedText
  )

  const result = [...texts]
  nonEmpty.forEach(({ i }, j) => { result[i] = translatedTexts[j] })
  return result
}

// ── Main export ──────────────────────────────────────────────────────
export async function getProfileTranslation(
  lawyer: { id: string; title?: string; bio?: string },
  services: Service[],
  lang: string
): Promise<TranslatedProfile> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const hash = contentHash(lawyer, services)

  // Check cache
  const { data: cached } = await supabase
    .from('profile_translations')
    .select('translated_data, content_hash')
    .eq('lawyer_id', lawyer.id)
    .eq('language_code', lang)
    .single()

  if (cached && cached.content_hash === hash) {
    return cached.translated_data as TranslatedProfile
  }

  // Build translation batch:
  // indices 0 = title, 1 = bio, 2..N = service titles, N+1..2N = service descriptions
  const svcCount = services.length
  const texts = [
    lawyer.title ?? '',
    lawyer.bio ?? '',
    ...services.map(s => s.title),
    ...services.map(s => s.description ?? ''),
  ]

  const translated = await translateBatch(texts, lang)

  const result: TranslatedProfile = {
    title: translated[0] || lawyer.title,
    bio: translated[1] || lawyer.bio,
    services: services.map((s, i) => ({
      id: s.id,
      title: translated[2 + i] || s.title,
      description: translated[2 + svcCount + i] || s.description,
    })),
  }

  // Upsert cache
  await supabase.from('profile_translations').upsert(
    {
      lawyer_id: lawyer.id,
      language_code: lang,
      content_hash: hash,
      translated_data: result,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'lawyer_id,language_code' }
  )

  return result
}
