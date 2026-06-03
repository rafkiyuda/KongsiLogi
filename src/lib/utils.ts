import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getDaysUntilExpiry(expiryDate: Date | string): number {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getExpiryStatus(daysLeft: number): 'safe' | 'attention' | 'critical' | 'expired' {
  if (daysLeft <= 0) return 'expired'
  if (daysLeft <= 2) return 'critical'
  if (daysLeft <= 4) return 'attention'
  return 'safe'
}

export function getStockStatus(remaining: number, minimum: number): 'safe' | 'attention' | 'critical' {
  if (remaining <= 0) return 'critical'
  if (remaining <= minimum * 1.2) return 'attention'
  return 'safe'
}

export function generateBatchCode(productName: string): string {
  const prefix = productName.substring(0, 3).toUpperCase()
  const date = new Date()
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${dateStr}-${random}`
}

export function generateTransactionCode(): string {
  const date = new Date()
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TRX-${dateStr}-${random}`
}

export const statusColors = {
  safe: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  attention: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  critical: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
  expired: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
} as const

export const statusLabels = {
  safe: 'Aman',
  attention: 'Perlu Perhatian',
  critical: 'Kritis',
  expired: 'Kadaluarsa',
} as const
