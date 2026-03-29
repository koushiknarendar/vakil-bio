import Link from 'next/link'
import { Clock, ArrowRight, Briefcase } from 'lucide-react'
import type { Service } from '@/lib/types'

interface ServiceCardProps {
  service: Service
  username: string
}

function discountPct(original: number, current: number) {
  return Math.round(((original - current) / original) * 100)
}

export function ServiceCard({ service, username }: ServiceCardProps) {
  const isFree = service.price === 0
  const isConsultation = service.type === 'consultation'
  const pct = service.original_price && service.original_price > service.price
    ? discountPct(service.original_price, service.price)
    : 0

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#BFDBFE] transition-all duration-200 p-5 group">
      <div className="flex items-center justify-between gap-4">

        {/* Left: Icon + Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] shrink-0 group-hover:bg-[#DBEAFE] transition-colors">
            {isConsultation
              ? <Clock className="w-5 h-5" />
              : <Briefcase className="w-5 h-5" />
            }
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-semibold text-[#0F172A] text-base leading-tight mb-1">
              {service.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {service.duration_minutes && (
                <span className="text-sm text-[#64748B]">{service.duration_minutes} min</span>
              )}
              {service.description && (
                <span className="text-sm text-[#475569] line-clamp-1">{service.description}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Price + CTA */}
        <div className="flex flex-col items-end gap-2.5 shrink-0">
          {isFree ? (
            <div className="flex flex-col items-end gap-1">
              {service.original_price && service.original_price > 0 && (
                <span className="text-sm text-[#94A3B8] line-through">
                  ₹{service.original_price.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-base font-bold px-3 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' }}>
                Free
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1">
              {pct > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-[#94A3B8] line-through">
                    ₹{service.original_price!.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)' }}>
                    {pct}% off
                  </span>
                </div>
              )}
              <span className="font-heading text-xl font-bold text-[#0F172A]">
                ₹{service.price.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <Link
            href={`/${username}/book/${service.id}`}
            className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm"
          >
            {isFree ? 'Book Free' : 'Schedule'}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  )
}
