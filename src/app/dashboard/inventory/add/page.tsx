'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '@/lib/constants'

export default function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    category: PRODUCT_CATEGORIES[0],
    unit: 'kg',
    sellingPrice: '',
    costPrice: '',
    minimumStock: '10',
    shelfLifeDays: '7',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal menambahkan produk')
      }

      router.push('/dashboard/inventory')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/inventory" className="p-2 rounded-lg hover:bg-white/5">
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tambah Produk</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Tambahkan produk baru ke inventaris</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl text-sm status-critical">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Nama Produk *</label>
          <input
            className="input-field"
            placeholder="Contoh: Bayam"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Kategori *</label>
            <select
              className="input-field"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Satuan *</label>
            <select
              className="input-field"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            >
              {PRODUCT_UNITS.map(u => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Harga Jual (Rp) *</label>
            <input
              type="number"
              className="input-field"
              placeholder="15000"
              value={form.sellingPrice}
              onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Harga Beli (Rp)</label>
            <input
              type="number"
              className="input-field"
              placeholder="10000"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Stok Minimum</label>
            <input
              type="number"
              className="input-field"
              value={form.minimumStock}
              onChange={(e) => setForm({ ...form, minimumStock: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Umur Simpan (hari)</label>
            <input
              type="number"
              className="input-field"
              value={form.shelfLifeDays}
              onChange={(e) => setForm({ ...form, shelfLifeDays: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Menyimpan...' : 'Simpan Produk'}
        </button>
      </form>
    </div>
  )
}
