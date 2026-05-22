import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { backdropVariants, modalVariants } from '@/animations/variants'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?: boolean
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl',
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(2,8,23,0.85)] backdrop-blur-md"
          />

          {/* Modal panel */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'relative w-full rounded-2xl z-10',
              'bg-[rgba(8,18,37,0.95)] backdrop-blur-xl',
              'border border-[rgba(200,169,91,0.25)]',
              'shadow-[0_25px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(200,169,91,0.1)]',
              'overflow-hidden',
              sizeMap[size]
            )}
          >
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(200,169,91,0.6)] to-transparent" />

            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-start justify-between p-6 pb-4">
                <div>
                  {title && (
                    <h2 className="font-sora text-xl font-bold text-[#F8FAFC]">{title}</h2>
                  )}
                  {description && (
                    <p className="text-sm text-[#94A3B8] mt-1">{description}</p>
                  )}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      'text-[#94A3B8] hover:text-[#F8FAFC]',
                      'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]',
                      'border border-[rgba(200,169,91,0.1)] hover:border-[rgba(200,169,91,0.3)]',
                      'transition-all duration-200',
                      'text-lg leading-none'
                    )}
                  >
                    ×
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={cn('px-6 pb-6', !title && 'pt-6')}>{children}</div>

            {/* Corner accents */}
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[rgba(200,169,91,0.4)] rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[rgba(200,169,91,0.4)] rounded-br-sm pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
