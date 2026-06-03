'use client'

import { useEffect, useState } from 'react'
import { Search, Filter, Plus, Package, AlertTriangle, Timer, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, getDaysUntilExpiry, getExpiryStatus, statusColors, statusLabels } from '@/lib/utils'
import { PRODUCT_CATEGORIES } from '@/lib/constants'

interface Product {
  id: string
  name: string
  category: string
  unit: string
  sellingPrice: number
  minimumStock: number
  shelfLifeDays: number
  totalRemaining: number
  stockStatus: string
  batchCount: number
  nearestExpiry: string | null
  daysUntilExpiry: number | null
  inventoryBatches: Array<{
    id: string
    batchCode: string
    remainingQuantity: number
    expiryDate: string
    status: string
    storageLocation: string
    supplier: { name: string } | null
  }>
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [search, category])

  const fetchProducts = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)

    const res = await fetch(`/api/inventory?${params}`)
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  const getStatusStyle = (status: string) => {
    const colors = statusColors[status as keyof typeof statusColors] || statusColors.safe
    return colors
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Inventaris</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Kelola stok produk dan batch barang
          </p>
        </div>
        <Link
          href="/dashboard/inventory/add"
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-full sm:w-48"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {PRODUCT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-primary)' }} />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Belum ada produk</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Mulai tambahkan produk pertama Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product, idx) => {
            const sc = getStatusStyle(product.stockStatus)
            return (
              <div
                key={product.id}
                className="glass-card p-4 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
              >
                {/* Status badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sc.bg} ${sc.text} ${sc.border}`}>
                    {statusLabels[product.stockStatus as keyof typeof statusLabels] || 'Unknown'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{product.batchCount} batch</span>
                </div>

                {/* Product info */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--bg-tertiary)' }}>
                    <Package className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{product.category}</p>
                  </div>
                </div>

                {/* Stock info */}
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Stok</p>
                    <p className={`text-lg font-bold ${sc.text}`}>
                      {product.totalRemaining.toFixed(1)} <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{product.unit}</span>
                    </p>
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {formatCurrency(product.sellingPrice)}/{product.unit}
                  </p>
                </div>

                {/* Expiry warning */}
                {product.daysUntilExpiry !== null && product.daysUntilExpiry <= 3 && (
                  <div className="mt-3 flex items-center gap-2 text-xs p-2 rounded-lg status-attention">
                    <Timer className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {product.daysUntilExpiry <= 0
                        ? 'Ada batch kadaluarsa!'
                        : `Batch terdekat: ${product.daysUntilExpiry} hari lagi`}
                    </span>
                  </div>
                )}

                {/* Expanded detail */}
                {selectedProduct?.id === product.id && (
                  <div className="mt-4 pt-4 border-t animate-fade-in" style={{ borderColor: 'var(--border-color)' }}>
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                      Detail Batch (FIFO)
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {product.inventoryBatches.map(batch => {
                        const daysLeft = getDaysUntilExpiry(batch.expiryDate)
                        const expiryStatus = getExpiryStatus(daysLeft)
                        const bsc = statusColors[expiryStatus]
                        return (
                          <div key={batch.id} className="p-2.5 rounded-lg text-xs" style={{ background: 'var(--bg-tertiary)' }}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{batch.batchCode}</span>
                              <span className={`px-2 py-0.5 rounded-full ${bsc.bg} ${bsc.text}`}>
                                {daysLeft <= 0 ? 'Expired' : `${daysLeft}d`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ color: 'var(--text-muted)' }}>{batch.remainingQuantity} {product.unit}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{batch.storageLocation}</span>
                            </div>
                            {batch.supplier && (
                              <p style={{ color: 'var(--text-muted)' }}>Supplier: {batch.supplier.name}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <Link
                      href={`/dashboard/inventory/${product.id}`}
                      className="mt-3 block text-center text-xs font-medium py-2 rounded-lg"
                      style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-primary)' }}
                    >
                      Lihat Detail Lengkap →
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
