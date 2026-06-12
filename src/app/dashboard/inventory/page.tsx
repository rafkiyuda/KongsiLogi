'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Plus, Package, Timer, Loader2, Sparkles, X, TrendingDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency, getDaysUntilExpiry, getExpiryStatus, statusColors, statusLabels } from '@/lib/utils'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { DemandForecastResult, EnrichedProduct } from '@/types'

export default function InventoryPage() {
  const [products, setProducts] = useState<EnrichedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<EnrichedProduct | null>(null)

  const [aiRecommendations, setAiRecommendations] = useState<DemandForecastResult[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)

  const handleGetDemandForecasting = async () => {
    setAiLoading(true)
    setShowAiModal(true)
    try {
      const lowStockProducts = products.filter(p => p.stockStatus === 'critical' || p.stockStatus === 'attention').map(p => ({
        productId: p.id,
        productName: p.name,
        category: p.category,
        remainingStock: p.totalRemaining,
        minimumStock: p.minimumStock
      }))

      if (lowStockProducts.length === 0) {
        setAiRecommendations([])
        setAiLoading(false)
        return
      }

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demand_forecasting', data: lowStockProducts })
      })
      const data = await res.json()
      if (data.success) {
        setAiRecommendations(data.result)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAiLoading(false)
    }
  }

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category) params.set('category', category)

      const res = await fetch(`/api/inventory?${params}`)
      if (res.redirected) { window.location.href = '/login'; return; }
      if (!res.ok) throw new Error('API Error')
      const data = await res.json()
      setProducts(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, category])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts()
  }, [fetchProducts])

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
        <div className="flex gap-2">
          <button 
            onClick={handleGetDemandForecasting}
            className="btn-primary flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white border-0 shadow-lg shadow-teal-500/30"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Demand Forecasting AI</span>
          </button>
          <Link href="/dashboard/inventory/new" className="btn-primary flex items-center gap-2 bg-[var(--accent-primary)]">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Produk</span>
          </Link>
        </div>
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
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md p-4 cursor-pointer transition-all animate-fade-in"
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
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-slate-100 border border-slate-200">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold truncate text-slate-800">{product.name}</h3>
                    <p className="text-xs text-slate-500">{product.category}</p>
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
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl ring-1 ring-teal-500/20">
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-500" />
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>AI Demand Forecasting</h2>
              </div>
              <button onClick={() => setShowAiModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl animate-pulse"></div>
                    <TrendingDown className="w-10 h-10 text-teal-500 animate-bounce relative z-10" />
                  </div>
                  <p className="text-sm font-medium animate-pulse" style={{ color: 'var(--text-secondary)' }}>Gemini AI sedang memprediksi kebutuhan restock...</p>
                </div>
              ) : aiRecommendations.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Berdasarkan analisis sisa stok dan batas minimum, berikut saran restock otomatis dari AI:</p>
                  {aiRecommendations.map((rec, i) => (
                    <div key={i} className="p-4 rounded-xl border flex flex-col gap-2" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>ID Produk: {rec.productId}</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{rec.recommendation}</p>
                        </div>
                        <div className={`font-bold px-3 py-1 rounded-full text-sm shrink-0 shadow-sm border ${
                          rec.urgencyLevel.toLowerCase().includes('kritis') ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                          rec.urgencyLevel.toLowerCase().includes('tinggi') ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' :
                          'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                        }`}>
                          {rec.urgencyLevel}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--text-secondary)' }}>Tidak ada produk dengan stok menipis (kritis/perhatian) saat ini. Inventaris terpantau aman.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
