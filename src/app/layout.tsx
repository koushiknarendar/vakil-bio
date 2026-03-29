import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter, Instrument_Serif } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-cursive',
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://vakil.bio'),
  title: 'vakil.bio — Your professional profile, in one link',
  description:
    'Create your professional profile on vakil.bio. Share your credentials, let clients schedule consultations, and manage your practice — all without a website.',
  keywords: 'lawyer profile, advocate, legal consultation, Indian lawyer, vakil.bio, find lawyer India',
  openGraph: {
    title: 'vakil.bio — Your professional profile, in one link',
    description:
      'The professional profile platform for Indian advocates. Share one link — your credentials, practice areas, and consultation availability, all in one place.',
    type: 'website',
    siteName: 'vakil.bio',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vakilbio',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${plusJakartaSans.variable} ${inter.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-body antialiased">{children}</body>
    </html>
  )
}
