'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  CheckCircle,
  Calendar,
  Clock,
  User,
  MessageSquare,
  CreditCard,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Lawyer, Service, AvailabilitySlot } from '@/lib/types'

const CASE_TYPES = [
  'Criminal Law',
  'Family Law',
  'Property & Real Estate',
  'Corporate & Business',
  'Labour & Employment',
  'Consumer Protection',
  'Civil Litigation',
  'Tax Law',
  'Intellectual Property',
  'Immigration',
  'Banking & Finance',
  'Other',
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = []
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)

  let current = startH * 60 + startM
  const end = endH * 60 + endM

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60)
    const m = current % 60
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
    slots.push(`${displayH}:${String(m).padStart(2, '0')} ${ampm}`)
    current += durationMinutes
  }

  return slots
}

function getDates(count = 14): Date[] {
  const dates: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 1; i <= count; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    dates.push(d)
  }
  return dates
}

declare global {
  interface Window {
    Cashfree: (config: { mode: string }) => {
      checkout: (opts: { paymentSessionId: string; redirectTarget: string }) => Promise<{
        error?: { message: string }
        paymentDetails?: { paymentMessage: string }
      }>
    }
  }
}

interface PageProps {
  params: Promise<{ username: string; serviceId: string }>
}

export default function BookingPage({ params }: PageProps) {
  const { username, serviceId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const isConsultation = () => service?.type === 'consultation'
  const [step, setStep] = useState<1 | 2 | 3 | 'success'>(1)
  const [lawyer, setLawyer] = useState<Lawyer | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')

  // Step 2
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [caseType, setCaseType] = useState('')
  const [description, setDescription] = useState('')
  // Result
  const [bookingId, setBookingId] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data: lawyerData } = await supabase
        .from('lawyers')
        .select('*')
        .eq('username', username)
        .single()

      if (!lawyerData) {
        router.push(`/${username}`)
        return
      }
      setLawyer(lawyerData)

      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single()

      if (!serviceData || serviceError) {
        setError('This service is no longer available. Please go back and choose another.')
        setLoadingData(false)
        return
      }
      setService(serviceData)

      // Skip date/time step for non-consultation services
      if (serviceData.type !== 'consultation') {
        setStep(2)
      }

      const { data: slots } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('lawyer_id', lawyerData.id)
        .eq('is_active', true)

      setAvailability(slots || [])
      setLoadingData(false)
    }

    fetchData()
  }, [username, serviceId])

  const dates = getDates(14)

  const getSlotForDate = (date: Date) => {
    const dow = date.getDay()
    return availability.find((s) => s.day_of_week === dow) || null
  }

  const timeSlots = selectedDate
    ? (() => {
        const slot = getSlotForDate(selectedDate)
        if (!slot) return []
        return generateTimeSlots(
          slot.start_time,
          slot.end_time,
          service?.duration_minutes || 30
        )
      })()
    : []

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })

  const formatDateISO = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const handleFreeBooking = async () => {
    if (!lawyer || !service || !selectedDate) return
    setPaymentLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bookings/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          lawyerId: lawyer.id,
          scheduledDate: formatDateISO(selectedDate),
          scheduledTime: selectedTime,
          clientName,
          clientEmail,
          clientPhone,
          caseType,
          description,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to book')
      setBookingId(data.bookingId)
      setStep('success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
    setPaymentLoading(false)
  }

  const handlePayment = async () => {
    if (!lawyer || !service || !selectedDate) return
    setPaymentLoading(true)
    setError('')

    try {
      // Create order
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          lawyerId: lawyer.id,
          scheduledDate: formatDateISO(selectedDate),
          scheduledTime: selectedTime,
          clientName,
          clientEmail,
          clientPhone,
          caseType,
          description,
          urgency: 'medium',
        }),
      })

      const orderData = await res.json()
      if (!res.ok) throw new Error(orderData.error || 'Failed to create order')

      // Load Cashfree SDK if not already loaded
      if (!window.Cashfree) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
          s.onload = () => resolve()
          s.onerror = () => reject(new Error('Cashfree SDK load failed'))
          document.head.appendChild(s)
        })
      }

      const cashfree = window.Cashfree({ mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || 'sandbox' })
      const result = await cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_modal',
      })

      if (result.error) throw new Error(result.error.message)

      // Verify payment server-side
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.orderId,
          bookingId: orderData.bookingId,
        }),
      })
      const verifyData = await verifyRes.json()
      if (verifyData.success) {
        setBookingId(orderData.bookingId)
        setStep('success')
      } else {
        setError(verifyData.error || 'Payment verification failed. Please contact support.')
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      setPaymentLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div
        style={{ backgroundColor: '#F4F5F8' }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-electric border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!loadingData && !service) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC' }} className="flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[#0F172A] mb-2">Service Not Available</h2>
          <p className="text-[#64748B] text-sm mb-6">{error || 'This consultation service could not be found. It may have been removed or updated.'}</p>
          <Link href={`/${username}`} className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1D4ED8] transition-colors text-sm">
            Back to Profile
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div
        style={{ backgroundColor: '#F4F5F8' }}
        className="min-h-screen flex items-center justify-center px-4"
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2
            
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            Booking Confirmed!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Your consultation with {lawyer?.full_name} has been booked successfully.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service</span>
              <span className="font-medium text-gray-900">{service?.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900">
                {selectedDate ? formatDate(selectedDate) : ''}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Time</span>
              <span className="font-medium text-gray-900">{selectedTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-medium text-gray-900">
                ₹{service?.price.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Booking ID</span>
              <span
                className="font-mono text-xs text-gray-500"
                style={{ fontFamily: 'Fira Code, monospace' }}
              >
                {bookingId.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6">
            <p className="text-xs text-green-700">
              📱 You&apos;ll receive a WhatsApp confirmation and meeting link shortly at your
              registered number.
            </p>
          </div>

          <Link
            href={`/${username}`}
            className="block w-full text-center bg-[#2563EB] text-white font-semibold py-3 rounded-xl hover:bg-[#1D4ED8] transition-colors"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="lazyOnload"
      />

      <div
        style={{ minHeight: '100vh', background: '#F8FAFC' }}
      >
        {/* Header */}
        <header className="h-14 bg-white border-b border-[#E2E8F0] flex items-center px-4 sm:px-6 gap-3">
          <Link href={`/${username}`} className="text-[#94A3B8] hover:text-[#475569]">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Image src="/logo.png" alt="vakil.bio" width={90} height={28} className="h-7 w-auto object-contain" />
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Progress steps */}
          <div className="flex items-center justify-center gap-1 mb-8">
            {(isConsultation()
              ? [{ n: 1, label: 'Date & Time', icon: Calendar }, { n: 2, label: 'Your Info', icon: User }, { n: 3, label: 'Payment', icon: CreditCard }]
              : [{ n: 2, label: 'Your Info', icon: User }, { n: 3, label: 'Payment', icon: CreditCard }]
            ).map(({ n, label, icon: Icon }) => (
              <div key={n} className="flex items-center gap-1">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    n === step
                      ? 'bg-[#2563EB] text-white'
                      : n < step
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">{label}</span>
                </div>
                {n < 3 && <div className="w-6 h-0.5 bg-gray-200" />}
              </div>
            ))}
          </div>

          {/* Service summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900 text-sm">{service?.title}</div>
              <div className="text-gray-400 text-xs mt-0.5">
                with {lawyer?.full_name}
                {service?.duration_minutes ? ` · ${service.duration_minutes} min` : ''}
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">
              ₹{service?.price.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Step 1: Date & Time */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in">
              <h2
                
                className="text-lg font-bold text-gray-900 mb-5"
              >
                Select Date & Time
              </h2>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Available Dates</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map((date, i) => {
                    const slot = getSlotForDate(date)
                    const isAvailable = !!slot
                    const isSelected =
                      selectedDate?.toDateString() === date.toDateString()

                    return (
                      <button
                        key={i}
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedDate(date)
                          setSelectedTime('')
                        }}
                        className={`flex flex-col items-center px-3 py-2.5 rounded-xl border text-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-[#2563EB] border-[#2563EB] text-white'
                            : isAvailable
                            ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                            : 'border-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-xs font-medium">
                          {DAY_NAMES[date.getDay()]}
                        </span>
                        <span className="text-lg font-bold leading-tight">
                          {date.getDate()}
                        </span>
                        <span className="text-xs">
                          {date.toLocaleString('en-IN', { month: 'short' })}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Available Slots on {formatDate(selectedDate)}
                  </p>
                  {timeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                            selectedTime === slot
                              ? 'bg-[#2563EB] border-[#2563EB] text-white font-medium'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No slots available on this date.
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!selectedDate || !selectedTime}
                className="mt-6 w-full bg-[#2563EB] text-white font-semibold py-3 rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Client Info */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in space-y-4">
              <h2
                
                className="text-lg font-bold text-gray-900"
              >
                Your Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Mobile Number *
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 h-[42px] rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm shrink-0">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="98765 43210"
                      value={clientPhone}
                      onChange={(e) =>
                        setClientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      className="flex-1 bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Case Type *
                </label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] transition-all cursor-pointer"
                  required
                >
                  <option value="">Select case type</option>
                  {CASE_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Brief Description
                </label>
                <textarea
                  placeholder="Describe your legal matter briefly..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => isConsultation() ? setStep(1) : router.push(`/${username}`)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={
                    !clientName || !clientEmail || clientPhone.length < 10 || !caseType
                  }
                  className="flex-1 bg-[#2563EB] text-white font-semibold py-3 rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="animate-fade-in space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2
                  
                  className="text-lg font-bold text-gray-900 mb-4"
                >
                  Order Summary
                </h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Service</span>
                    <span className="font-medium text-gray-900">{service?.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">With</span>
                    <span className="font-medium text-gray-900">{lawyer?.full_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-900">
                      {selectedDate ? formatDate(selectedDate) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-900">{selectedTime}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    {service?.price === 0 ? (
                      <span className="text-lg font-bold px-3 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}>Free</span>
                    ) : (
                      <span className="text-xl font-bold text-gray-900">₹{service?.price.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>

                {service?.price === 0 ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-5 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-green-700">
                      This is a free consultation. No payment required — confirm to book instantly.
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      Secure payment via Cashfree. UPI, Cards, Net Banking & more accepted.
                      Full refund if session is cancelled by the advocate.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={service?.price === 0 ? handleFreeBooking : handlePayment}
                    disabled={paymentLoading}
                    className="flex-1 bg-[#2563EB] text-white font-semibold py-3 rounded-xl hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {paymentLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </>
                    ) : service?.price === 0 ? (
                      'Confirm Free Booking'
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay ₹{service?.price.toLocaleString('en-IN')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
