import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ToastNotification {
  id: string
  title: string
  message?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

let toastQueue: ((toast: ToastNotification) => void)[] = []

export function toast(notification: Omit<ToastNotification, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  toastQueue.forEach((fn) => fn({ ...notification, id }))
}

toast.success = (title: string, message?: string) =>
  toast({ title, message, type: 'success' })
toast.error = (title: string, message?: string) =>
  toast({ title, message, type: 'error' })
toast.warning = (title: string, message?: string) =>
  toast({ title, message, type: 'warning' })
toast.info = (title: string, message?: string) =>
  toast({ title, message, type: 'info' })

const typeConfig = {
  success: {
    icon: '✓',
    border: 'border-emerald-500/40',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
    bar: 'bg-emerald-500',
  },
  error: {
    icon: '✕',
    border: 'border-red-500/40',
    iconBg: 'bg-red-500/20 text-red-400',
    bar: 'bg-red-500',
  },
  warning: {
    icon: '⚠',
    border: 'border-amber-500/40',
    iconBg: 'bg-amber-500/20 text-amber-400',
    bar: 'bg-amber-500',
  },
  info: {
    icon: 'ℹ',
    border: 'border-[rgba(200,169,91,0.4)]',
    iconBg: 'bg-[rgba(200,169,91,0.15)] text-[#C8A95B]',
    bar: 'bg-[#C8A95B]',
  },
}

export const NotificationToast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([])

  useEffect(() => {
    const handler = (toast: ToastNotification) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, toast.duration ?? 5000)
    }
    toastQueue.push(handler)
    return () => {
      toastQueue = toastQueue.filter((fn) => fn !== handler)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((t) => {
          const config = typeConfig[t.type]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
              className={cn(
                'relative overflow-hidden rounded-xl',
                'bg-[rgba(8,18,37,0.95)] backdrop-blur-xl',
                'border', config.border,
                'shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
                'p-4'
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                    config.iconBg
                  )}
                >
                  {config.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F8FAFC]">{t.title}</p>
                  {t.message && (
                    <p className="text-xs text-[#94A3B8] mt-0.5">{t.message}</p>
                  )}
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter((n) => n.id !== t.id))}
                  className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>

              {/* Progress bar */}
              <motion.div
                className={cn('absolute bottom-0 left-0 h-0.5', config.bar)}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: (t.duration ?? 5000) / 1000, ease: 'linear' }}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
