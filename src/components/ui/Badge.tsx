import type { BookingStatus, LeadUrgency } from '@/lib/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'violet' | 'cyan'
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: { background: 'rgba(15,23,42,0.06)', color: 'var(--text-secondary)' },
  success: { background: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' },
  warning: { background: 'rgba(245,158,11,0.08)', color: '#D97706', border: '1px solid rgba(245,158,11,0.2)' },
  danger:  { background: 'rgba(239,68,68,0.08)',  color: '#DC2626', border: '1px solid rgba(239,68,68,0.2)' },
  info:    { background: 'rgba(79,122,255,0.08)', color: 'var(--blue)', border: '1px solid rgba(79,122,255,0.2)' },
  violet:  { background: 'rgba(124,95,212,0.08)', color: 'var(--purple)', border: '1px solid rgba(124,95,212,0.2)' },
  cyan:    { background: 'rgba(14,165,233,0.08)', color: 'var(--cyan)', border: '1px solid rgba(14,165,233,0.2)' },
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${sizeClasses[size]} ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const config: Record<BookingStatus, { label: string; variant: BadgeProps['variant'] }> = {
    pending:   { label: 'Pending',   variant: 'warning' },
    confirmed: { label: 'Confirmed', variant: 'success' },
    completed: { label: 'Completed', variant: 'info' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
    refunded:  { label: 'Refunded',  variant: 'default' },
  }
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function UrgencyBadge({ urgency }: { urgency: LeadUrgency }) {
  const config: Record<LeadUrgency, { label: string; variant: BadgeProps['variant'] }> = {
    low:    { label: 'Low',    variant: 'info' },
    medium: { label: 'Medium', variant: 'warning' },
    high:   { label: 'High',   variant: 'danger' },
  }
  const { label, variant } = config[urgency]
  return <Badge variant={variant}>{label}</Badge>
}
