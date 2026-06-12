import type { RoleAccessMap, MockSupplier } from '@/types'

export const APP_NAME = 'KongsiLogi'
export const APP_DESCRIPTION = 'Platform Manajemen Inventory & Rantai Pasok Koperasi'
export const COOPERATIVE_NAME = 'Koperasi Melati Jaya'

export const ROLES = {
  ADMIN: 'ADMIN',
  WAREHOUSE_STAFF: 'WAREHOUSE_STAFF',
  CASHIER: 'CASHIER',
  VIEWER: 'VIEWER',
} as const

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin Koperasi',
  WAREHOUSE_STAFF: 'Staf Gudang',
  CASHIER: 'Kasir',
  VIEWER: 'Viewer',
}

export const INVENTORY_STATUS = {
  SAFE: 'SAFE',
  ATTENTION: 'ATTENTION',
  CRITICAL: 'CRITICAL',
  EXPIRED: 'EXPIRED',
} as const

export const PURCHASE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RECEIVED: 'RECEIVED',
} as const

export const PURCHASE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  RECEIVED: 'Diterima',
}

export const AUDIT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const

export const AUDIT_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Dijadwalkan',
  IN_PROGRESS: 'Sedang Berjalan',
  COMPLETED: 'Selesai',
}

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Tunai' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'QRIS', label: 'QRIS' },
] as const

export const PRODUCT_CATEGORIES = [
  'Sayuran Daun',
  'Sayuran Buah',
  'Sayuran Akar',
  'Bumbu Dapur',
  'Rempah',
  'Lainnya',
] as const

export const PRODUCT_UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'gram', label: 'Gram (g)' },
  { value: 'ikat', label: 'Ikat' },
  { value: 'buah', label: 'Buah' },
  { value: 'pack', label: 'Pack' },
] as const

export const STORAGE_LOCATIONS = [
  'Cold Storage A',
  'Cold Storage B',
  'Cold Storage C',
  'Rak Terbuka',
] as const

export const NOTIFICATION_TYPES = {
  LOW_STOCK: 'LOW_STOCK',
  EXPIRY_ALERT: 'EXPIRY_ALERT',
  PURCHASE_APPROVAL: 'PURCHASE_APPROVAL',
  AUDIT_REMINDER: 'AUDIT_REMINDER',
  PAYMENT_DUE: 'PAYMENT_DUE',
  GENERAL: 'GENERAL',
} as const

export const COLD_STORAGE_CAPACITY = 1000 // kg

// =============================================================================
// Role Access Map — Single Source of Truth for role-based permissions.
// Used by: src/lib/auth.ts (getRoleAccess), src/components/layout/Sidebar.tsx
// =============================================================================
export const ROLE_ACCESS_MAP: Record<string, RoleAccessMap> = {
  ADMIN: {
    dashboard: true,
    inventory: true,
    coldStorage: true,
    procurement: true,
    pos: true,
    stockOpname: true,
    reports: true,
    notifications: true,
    settings: true,
    approvals: true,
  },
  WAREHOUSE_STAFF: {
    dashboard: true,
    inventory: true,
    coldStorage: true,
    procurement: true,
    pos: false,
    stockOpname: true,
    reports: false,
    notifications: true,
    settings: false,
    approvals: false,
  },
  CASHIER: {
    dashboard: true,
    inventory: true,
    coldStorage: false,
    procurement: false,
    pos: true,
    stockOpname: false,
    reports: false,
    notifications: true,
    settings: false,
    approvals: false,
  },
  VIEWER: {
    dashboard: true,
    inventory: true,
    coldStorage: true,
    procurement: false,
    pos: false,
    stockOpname: false,
    reports: true,
    notifications: true,
    settings: false,
    approvals: false,
  },
}

// =============================================================================
// Mock Suppliers — Demo data for AI Supplier Scoring feature.
// In production, this data would come from the suppliers table in the database.
// =============================================================================
export const MOCK_SUPPLIERS: MockSupplier[] = [
  { id: 'S001', name: 'PT Maju Jaya Abadi', priceLevel: 'Sedang', consistency: 'Tinggi', onTimeRate: '95%' },
  { id: 'S002', name: 'CV Berkah Tani', priceLevel: 'Rendah', consistency: 'Sedang', onTimeRate: '80%' },
  { id: 'S003', name: 'Koperasi Tunas Harapan', priceLevel: 'Tinggi', consistency: 'Sangat Tinggi', onTimeRate: '99%' },
]
