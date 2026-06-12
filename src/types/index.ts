// =============================================================================
// KongsiLogi — Shared Type Definitions
// =============================================================================
// Single source of truth for all shared interfaces and types.
// Per-feature interfaces that are NOT shared may remain local to their file.
// =============================================================================

// --- Domain Models -----------------------------------------------------------

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string | null
  isActive: boolean
  createdAt: string
}

export interface Supplier {
  id: string
  name: string
  phone?: string | null
  address?: string | null
  email?: string | null
  isActive: boolean
  createdAt: string
}

export interface Product {
  id: string
  name: string
  category: string
  unit: string
  sellingPrice: number
  costPrice: number
  minimumStock: number
  shelfLifeDays: number
  imageUrl?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface InventoryBatch {
  id: string
  batchCode: string
  qrCode?: string | null
  quantity: number
  remainingQuantity: number
  unit: string
  receivedDate: string
  expiryDate: string
  storageLocation: string
  status: InventoryStatus
  notes?: string | null
  createdAt: string
  supplier?: Pick<Supplier, 'name'> | null
  product?: Pick<Product, 'name' | 'category'>
}

export interface PurchaseRequest {
  id: string
  status: PurchaseRequestStatus
  notes: string | null
  totalEstimatedPrice: number
  createdAt: string
  approvedAt: string | null
  rejectionReason: string | null
  requestedBy: Pick<User, 'name'>
  approvedBy: Pick<User, 'name'> | null
  supplier: Pick<Supplier, 'name'> | null
  items: PurchaseRequestItem[]
}

export interface PurchaseRequestItem {
  id: string
  quantity: number
  unit: string
  estimatedPrice: number
  product: Pick<Product, 'name' | 'unit'>
}

export interface SalesTransaction {
  id: string
  transactionCode: string
  totalAmount: number
  paymentMethod: PaymentMethod
  customerName?: string | null
  createdAt: string
  cashier: Pick<User, 'name'>
  items: SalesTransactionItem[]
}

export interface SalesTransactionItem {
  id: string
  quantity: number
  price: number
  subtotal: number
  product: Pick<Product, 'name' | 'unit'>
  batch: Pick<InventoryBatch, 'batchCode'>
}

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  actionUrl?: string | null
  createdAt: string
}

// --- Enum Types (mirror Prisma enums) ----------------------------------------

export type Role = 'ADMIN' | 'WAREHOUSE_STAFF' | 'CASHIER' | 'VIEWER'

export type InventoryStatus = 'SAFE' | 'ATTENTION' | 'CRITICAL' | 'EXPIRED'

export type PurchaseRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED'

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS'

export type AuditStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'

export type NotificationType =
  | 'LOW_STOCK'
  | 'EXPIRY_ALERT'
  | 'PURCHASE_APPROVAL'
  | 'AUDIT_REMINDER'
  | 'PAYMENT_DUE'
  | 'GENERAL'

export type StockStatus = 'safe' | 'attention' | 'critical' | 'expired'

export type RfidTagStatusType = 'AVAILABLE' | 'ASSIGNED' | 'DECOMMISSIONED'

// --- Role Access -------------------------------------------------------------

export interface RoleAccessMap {
  dashboard: boolean
  inventory: boolean
  coldStorage: boolean
  smartReceiving: boolean
  procurement: boolean
  pos: boolean
  stockOpname: boolean
  reports: boolean
  notifications: boolean
  settings: boolean
  approvals: boolean
}

// --- AI Response Types -------------------------------------------------------

/** Response item from the AI `demand_forecasting` action */
export interface DemandForecastResult {
  productId: string
  urgencyLevel: string
  recommendation: string
}

/** Response item from the AI `supplier_scoring` action */
export interface SupplierScoringResult {
  supplierId: string
  score: number
  recommendationReason: string
}

/** Response item from the AI `smart_pricing` action */
export interface SmartPricingResult {
  batchId: string
  suggestedDiscountPercent: number
  reasoning: string
}

/** Union of all AI result types (used in the API route) */
export type AiResult = DemandForecastResult | SupplierScoringResult | SmartPricingResult

// --- Enriched / API Response Types -------------------------------------------

/** Product enriched with computed stock metrics, returned by GET /api/inventory */
export interface EnrichedProduct extends Product {
  totalRemaining: number
  stockStatus: StockStatus
  batchCount: number
  nearestExpiry: string | null
  daysUntilExpiry: number | null
  inventoryBatches: InventoryBatch[]
}

/** Dashboard summary returned by GET /api/dashboard */
export interface DashboardData {
  todaySales: { total: number; count: number }
  totalStock: number
  lowStockProducts: Array<{
    id: string
    name: string
    remaining: number
    minimum: number
    unit: string
  }>
  outOfStockProducts: Array<{ id: string; name: string; unit: string }>
  nearExpiryBatches: Array<{
    id: string
    productName: string
    batchCode: string
    remainingQuantity: number
    expiryDate: string
    daysLeft: number
    unit: string
  }>
  pendingPurchaseRequests: number
  coldStorage: { used: number; capacity: number; percentage: number }
  nextAudit: { id: string; date: string } | null
  unreadNotifications: number
  salesChart: Array<{ date: string; label: string; total: number; count: number }>
  recentTransactions: Array<{
    id: string
    code: string
    total: number
    cashier: string
    createdAt: string
  }>
}

/** Mock supplier profile (used for AI supplier scoring demo) */
export interface MockSupplier {
  id: string
  name: string
  priceLevel: string
  consistency: string
  onTimeRate: string
}

// --- RFID / Smart Receiving Types -------------------------------------------

export interface RfidTag {
  id: string
  tagCode: string
  status: RfidTagStatusType
  currentBatchId: string | null
  lastScannedAt: string | null
  createdAt: string
  currentBatch?: Pick<InventoryBatch, 'batchCode'> & { product?: Pick<Product, 'name'> } | null
}

export interface RackData {
  id: string
  rackCode: string
  zone: string
  capacityCrates: number
  isActive: boolean
  usedCrates: number
  occupancyPercent: number
  batches: Array<{ batchCode: string; productName: string; quantity: number; placedAt: string }>
}

export interface ReceivingLogEntry {
  id: string
  batchCode: string
  productName: string
  quantity: number
  action: string
  note: string | null
  createdAt: string
  rfidTag: Pick<RfidTag, 'tagCode'>
}
