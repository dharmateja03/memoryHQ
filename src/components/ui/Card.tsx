'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export function Card({
  className,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  children,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl';

  const variants = {
    default: 'bg-navy-800 shadow-xl',
    glass: 'bg-navy-800/50 backdrop-blur-lg border border-navy-600/50',
    bordered: 'bg-navy-800 border border-navy-600',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  return (
    <motion.div
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        hoverable && 'hover:bg-navy-700 transition-colors cursor-pointer',
        className
      )}
      whileHover={hoverable ? { y: -2 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn('text-sm text-gray-400 mt-1', className)}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-navy-600', className)}>
      {children}
    </div>
  );
}
