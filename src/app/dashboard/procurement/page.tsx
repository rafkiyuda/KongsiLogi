'use client'

import { useEffect, useState } from 'react'
import {
  ShoppingCart, Plus, Loader2, Check, X, Package as PackageIcon,
  Clock, CheckCircle, XCircle, Truck, ArrowLeft
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { PURCHASE_STATUS_LABELS } from '@/lib/constants'

interface PurchaseRequest {
  id: string
  status: string
  notes: string | null
  totalEstimatedPrice: number
  createdAt: string
  approvedAt: string | null
  rejectionReason: string | null
  requestedBy: { name: string }
  approvedBy: { name: string } | null
  supplier: { name: string } | null
  items: Array<{
    id: string
    quantity: number
    unit: string
    estimatedPrice: number
    product: { name: string; unit: string }
  }>
}

interface Product {
  id: string
  name: string
  unit: string
  costPrice: number
}

export default function ProcurementPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [newItems, setNewItems] = useState<Array<{productId: string; quantity: string; estimatedPrice: string}>>([])
  const [newNotes, setNewNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    setLoading(true)
    const params = filter ? `?status=${filter}` : ''
    const [prRes, prodRes] = await Promise.all([
      fetch(`/api/procurement${params}`),
      fetch('/api/inventory'),
    ])
    setRequests(await prRes.json())
    setProducts(await prodRes.json())
    setLoading(false)
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
    </div>
  )
}
