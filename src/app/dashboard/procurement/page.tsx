'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ShoppingCart, Plus, Loader2, Check, X,
  Clock, CheckCircle, XCircle, Truck, ArrowLeft, Sparkles, Star
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { PURCHASE_STATUS_LABELS, MOCK_SUPPLIERS } from '@/lib/constants'
import type { PurchaseRequest, Product, SupplierScoringResult } from '@/types'

export default function ProcurementPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [newItems, setNewItems] = useState<Array<{productId: string; quantity: string; estimatedPrice: string}>>([])
  const [newNotes, setNewNotes] = useState('')
  const [selectedSupplierId, setSelectedSupplierId] = useState('')
  const [creating, setCreating] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)

  const [aiRecommendations, setAiRecommendations] = useState<SupplierScoringResult[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params = filter ? `?status=${filter}` : ''
      const [prRes, prodRes] = await Promise.all([
        fetch(`/api/procurement${params}`),
        fetch('/api/inventory'),
      ])
      if (prRes.ok) setRequests(await prRes.json())
      if (prodRes.ok) setProducts(await prodRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])

  const handleGetSupplierScoring = async () => {
    setAiLoading(true)
    setShowAiModal(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'supplier_scoring', data: MOCK_SUPPLIERS }),
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

  const handleCreate = async () => {
    if (newItems.length === 0) return
    setCreating(true)
    try {
      await fetch('/api/procurement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: newNotes,
          supplierId: selectedSupplierId || null,
          items: newItems.map(i => ({
            productId: i.productId,
            quantity: Number(i.quantity),
            estimatedPrice: Number(i.estimatedPrice),
            unit: products.find(p => p.id === i.productId)?.unit || 'kg',
          })),
        }),
      })
      setShowCreate(false)
      setNewItems([])
      setNewNotes('')
      setSelectedSupplierId('')
      fetchData()
    } catch {
      alert('Gagal membuat permintaan')
    } finally {
      setCreating(false)
    }
  }

  const handleAction = async (id: string, action: string) => {
    setProcessing(id)
    try {
      await fetch('/api/procurement', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      })
      fetchData()
    } catch {
      alert('Gagal memproses')
    } finally {
      setProcessing(null)
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-amber-400" />
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-400" />
      case 'RECEIVED': return <Truck className="w-4 h-4 text-sky-400" />
      default: return null
    }
  }

  const statusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'status-attention'
      case 'APPROVED': return 'status-safe'
      case 'REJECTED': return 'status-critical'
      case 'RECEIVED': return 'bg-sky-500/12 text-sky-400 border border-sky-500/20'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Pembelian</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Kelola permintaan pembelian barang</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Buat Permintaan
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'RECEIVED'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              filter === s ? 'bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30' : ''
            }`}
            style={filter !== s ? { color: 'var(--text-secondary)', background: 'var(--bg-tertiary)' } : {}}
          >
            {s ? PURCHASE_STATUS_LABELS[s] : 'Semua'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-primary)' }} /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Belum ada permintaan pembelian</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(pr => (
            <div key={pr.id} className="glass-card p-4 animate-fade-in">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {statusIcon(pr.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle(pr.status)}`}>
                        {PURCHASE_STATUS_LABELS[pr.status]}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        oleh {pr.requestedBy.name}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {formatDateTime(pr.createdAt)}
                      {pr.supplier && ` · Supplier: ${pr.supplier.name}`}
                    </p>
                  </div>
                </div>
                <p className="font-bold" style={{ color: 'var(--accent-primary)' }}>
                  {formatCurrency(pr.totalEstimatedPrice)}
                </p>
              </div>

              {/* Items */}
              <div className="mt-3 space-y-1">
                {pr.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{item.product.name} · {item.quantity} {item.unit}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(item.estimatedPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {pr.notes && <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>📝 {pr.notes}</p>}

              {/* Actions */}
              {pr.status === 'PENDING' && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleAction(pr.id, 'approve')}
                    disabled={processing === pr.id}
                    className="btn-primary flex-1 flex items-center justify-center gap-1 py-2 text-sm"
                  >
                    <Check className="w-4 h-4" /> Setujui
                  </button>
                  <button
                    onClick={() => handleAction(pr.id, 'reject')}
                    disabled={processing === pr.id}
                    className="btn-secondary flex-1 flex items-center justify-center gap-1 py-2 text-sm text-red-400"
                  >
                    <X className="w-4 h-4" /> Tolak
                  </button>
                </div>
              )}
              {pr.status === 'APPROVED' && (
                <button
                  onClick={() => handleAction(pr.id, 'receive')}
                  disabled={processing === pr.id}
                  className="mt-3 btn-primary w-full flex items-center justify-center gap-2 py-2 text-sm"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                >
                  <Truck className="w-4 h-4" /> Barang Sudah Diterima
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-white/5">
                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Buat Permintaan Pembelian</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Pemasok (Supplier)</label>
                  <button onClick={handleGetSupplierScoring} className="text-xs font-bold text-purple-500 hover:text-purple-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Rekomendasi AI
                  </button>
                </div>
                <select className="input-field" value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)}>
                  <option value="">-- Pilih Supplier --</option>
                  {MOCK_SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Catatan</label>
                <input className="input-field" placeholder="Catatan pembelian..." value={newNotes} onChange={e => setNewNotes(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Barang</label>
                {newItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <select className="input-field flex-1" value={item.productId} onChange={e => {
                      const updated = [...newItems]
                      updated[idx].productId = e.target.value
                      setNewItems(updated)
                    }}>
                      <option value="">Pilih produk</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" className="input-field w-20" placeholder="Qty" value={item.quantity}
                      onChange={e => { const u = [...newItems]; u[idx].quantity = e.target.value; setNewItems(u) }} />
                    <input type="number" className="input-field w-28" placeholder="Harga" value={item.estimatedPrice}
                      onChange={e => { const u = [...newItems]; u[idx].estimatedPrice = e.target.value; setNewItems(u) }} />
                    <button onClick={() => setNewItems(newItems.filter((_, i) => i !== idx))} className="p-2 text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={() => setNewItems([...newItems, { productId: '', quantity: '', estimatedPrice: '' }])}
                  className="btn-secondary text-sm flex items-center gap-1 mt-1">
                  <Plus className="w-3 h-3" /> Tambah Barang
                </button>
              </div>

              <button onClick={handleCreate} disabled={creating || newItems.length === 0}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                {creating ? 'Membuat...' : 'Kirim Permintaan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl ring-1 ring-purple-500/20">
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>AI Supplier Scoring</h2>
              </div>
              <button onClick={() => setShowAiModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                    <Star className="w-10 h-10 text-purple-500 animate-bounce relative z-10" />
                  </div>
                  <p className="text-sm font-medium animate-pulse" style={{ color: 'var(--text-secondary)' }}>Gemini AI sedang menyeleksi profil pemasok...</p>
                </div>
              ) : aiRecommendations.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Berdasarkan analisis riwayat konsistensi dan harga, berikut rekomendasi pemasok terbaik:</p>
                  {aiRecommendations.map((rec, i) => {
                    const supplier = MOCK_SUPPLIERS.find(s => s.id === rec.supplierId)
                    return (
                      <div key={i} className="p-4 rounded-xl border flex flex-col gap-3 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors" 
                           style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-light)' }}
                           onClick={() => { setSelectedSupplierId(rec.supplierId); setShowAiModal(false) }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                              {supplier?.name || rec.supplierId}
                            </p>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{rec.recommendationReason}</p>
                          </div>
                          <div className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-bold px-3 py-1.5 rounded-xl text-lg flex items-center gap-1 shrink-0 border border-purple-200 dark:border-purple-800">
                            <Star className="w-4 h-4 fill-current" /> {rec.score}
                          </div>
                        </div>
                        <div className="text-xs text-purple-500 font-medium text-right">Klik untuk memilih pemasok ini →</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p style={{ color: 'var(--text-secondary)' }}>Gagal memuat rekomendasi.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
