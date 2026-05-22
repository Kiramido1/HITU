import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-slate-700/50';

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  const animationVariants = {
    pulse: {
      animate: { opacity: [0.5, 1, 0.5] },
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
    },
    wave: {
      animate: { x: ['-100%', '100%'] },
      transition: { duration: 1.5, repeat: Infinity, ease: 'linear' }
    },
    none: {}
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      {...animationVariants[animation]}
    />
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4
}) => (
  <div className="space-y-3">
    <div className="h-12 bg-slate-700/30 rounded-lg animate-pulse" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} variant="text" height={20} className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl space-y-4">
    <Skeleton variant="rectangular" height={150} className="w-full" />
    <Skeleton variant="text" height={24} width="60%" />
    <Skeleton variant="text" height={16} width="80%" />
    <Skeleton variant="text" height={16} width="40%" />
  </div>
);
