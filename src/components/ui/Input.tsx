import { forwardRef } from 'react'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  theme?: 'dark' | 'light'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      prefix,
      suffix,
      theme = 'dark',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const baseInput =
      theme === 'dark'
        ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-blue-electric focus:ring-1 focus:ring-blue-electric'
        : 'bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-electric focus:ring-1 focus:ring-blue-electric'

    const labelClass =
      theme === 'dark' ? 'text-white/70' : 'text-gray-700'

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={`text-sm font-medium ${labelClass}`}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3 flex items-center pointer-events-none text-white/40">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-xl px-4 py-2.5 text-sm outline-none
              transition-all duration-200
              ${baseInput}
              ${prefix ? 'pl-10' : ''}
              ${suffix ? 'pr-10' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 flex items-center">{suffix}</div>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && (
          <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  theme?: 'dark' | 'light'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, theme = 'dark', className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const baseInput =
      theme === 'dark'
        ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-blue-electric focus:ring-1 focus:ring-blue-electric'
        : 'bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-electric focus:ring-1 focus:ring-blue-electric'

    const labelClass = theme === 'dark' ? 'text-white/70' : 'text-gray-700'

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className={`text-sm font-medium ${labelClass}`}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none
            transition-all duration-200
            ${baseInput}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && (
          <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  theme?: 'dark' | 'light'
  children: React.ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, theme = 'dark', className = '', id, children, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const baseSelect =
      theme === 'dark'
        ? 'bg-white/5 border border-white/10 text-white focus:border-blue-electric'
        : 'bg-white border border-gray-200 text-gray-900 focus:border-blue-electric'

    const labelClass = theme === 'dark' ? 'text-white/70' : 'text-gray-700'

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className={`text-sm font-medium ${labelClass}`}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-xl px-4 py-2.5 text-sm outline-none
            transition-all duration-200 cursor-pointer
            ${baseSelect}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && (
          <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
