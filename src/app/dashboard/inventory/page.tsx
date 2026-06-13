'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Plus, Package, Timer, Loader2, Sparkles, X, TrendingUp, TrendingDown, Minus, Zap, Brain } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency, getDaysUntilExpiry, getExpiryStatus, statusColors, statusLabels } from '@/lib/utils'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { EnrichedProduct, ProductRecommendation } from '@/types'

const urgencyConfig = {
  kritis: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500', label: 'Kritis', icon: '🔴' },
  tinggi: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500', label: 'Tinggi', icon: '🟠' },
  sedang: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', label: 'Sedang', icon: '🟡' },
  rendah: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500', label: 'Aman', icon: '🟢' },
}

export default function InventoryPage() {
  const [products, setProducts] = useState<EnrichedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<EnrichedProduct | null>(null)

  // AI Recommendation state
  const [aiRecs, setAiRecs] = useState<ProductRecommendation[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiLoaded, setAiLoaded] = useState(false)
  const [expandedAi, setExpandedAi] = useState<string | null>(null)

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

  const handleFetchAiInsights = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/product-recommendation')
      const data = await res.json()
      if (data.success) {
        setAiRecs(data.recommendations)
        setAiLoaded(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setAiLoading(false)
    }
  }

  const getRecForProduct = (productId: string) => aiRecs.find(r => r.productId === productId)

  const getStatusStyle = (status: string) => {
    const colors = statusColors[status as keyof typeof statusColors] || statusColors.safe
    return colors
  }

  const TrendIcon = ({ trend, percent }: { trend: string; percent: number }) => {
    if (trend === 'naik') return <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400"><TrendingUp className="w-3 h-3" />+{percent}%</span>
    if (trend === 'turun') return <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400"><TrendingDown className="w-3 h-3" />{percent}%</span>
    return <span className="inline-flex items-center gap-0.5 text-slate-500"><Minus className="w-3 h-3" />Stabil</span>
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
            onClick={handleFetchAiInsights}
            disabled={aiLoading}
            className="btn-primary flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-violet-500/30 disabled:opacity-60"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{aiLoading ? 'Menganalisis...' : aiLoaded ? '✓ AI Insights' : '✨ AI Insights'}</span>
          </button>
          <Link href="/dashboard/inventory/add" className="btn-primary flex items-center gap-2 bg-[var(--accent-primary)]">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Produk</span>
          </Link>
        </div>
      </div>

      {/* AI Summary Banner */}
      {aiLoaded && !aiLoading && (
        <div className="p-4 rounded-2xl border bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">AI Insights Aktif</span>
            <span className="text-xs text-violet-500 dark:text-violet-400 ml-auto">Berdasarkan 30 hari data penjualan</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {(['kritis', 'tinggi', 'sedang', 'rendah'] as const).map(level => {
              const count = aiRecs.filter(r => r.ai.urgency === level).length
              if (count === 0) return null
              const cfg = urgencyConfig[level]
              return (
                <span key={level} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                  {cfg.icon} {count} {cfg.label}
                </span>
              )
            })}
          </div>
        </div>
      )}


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
            const rec = getRecForProduct(product.id)
            const isAiExpanded = expandedAi === product.id
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

                {/* AI Recommendation Badge */}
                {rec && (
                  <div
                    className={`mt-3 p-2.5 rounded-xl border transition-all ${urgencyConfig[rec.ai.urgency].bg} ${urgencyConfig[rec.ai.urgency].border}`}
                    onClick={(e) => { e.stopPropagation(); setExpandedAi(isAiExpanded ? null : product.id) }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className={`w-3.5 h-3.5 ${urgencyConfig[rec.ai.urgency].text}`} />
                        <span className={`text-xs font-semibold ${urgencyConfig[rec.ai.urgency].text}`}>
                          {urgencyConfig[rec.ai.urgency].icon} {urgencyConfig[rec.ai.urgency].label}
                        </span>
                      </div>
                      {rec.stats.daysOfStock !== null && (
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          ~{rec.stats.daysOfStock}d stok
                        </span>
                      )}
                    </div>
                    {isAiExpanded && (
                      <div className="mt-2 pt-2 border-t border-current/10 animate-fade-in">
                        <p className={`text-xs leading-relaxed ${urgencyConfig[rec.ai.urgency].text}`}>
                          {rec.ai.recommendation}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            Jual/hari: {rec.stats.avgDailySales} {product.unit}
                          </span>
                          <span className="text-[10px]">
                            <TrendIcon trend={rec.stats.salesTrend} percent={rec.stats.trendPercent} />
                          </span>
                        </div>
                        <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                          📈 Prediksi besok (ES): <strong className="text-slate-700 dark:text-slate-200">{rec.stats.forecastNextDay} {product.unit}</strong>
                        </div>
                        <p className="mt-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          → {rec.ai.action}
                        </p>
                      </div>
                    )}
                  </div>
                )}

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

      {/* AI Loading Overlay */}
      {aiLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl animate-pulse"></div>
              <Brain className="w-12 h-12 text-violet-600 dark:text-violet-400 animate-bounce relative z-10" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 text-center animate-pulse">
              AI sedang menganalisis 30 hari data penjualan dan stok...
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Powered by Gemini AI
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
