'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ClipboardList, Plus, Loader2, Check,
  EyeOff, CheckCircle, Clock
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { AUDIT_STATUS_LABELS } from '@/lib/constants'

interface AuditItem {
  id: string
  systemQuantity: number
  physicalQuantity: number | null
  difference: number | null
  note: string | null
  product: { name: string; unit: string }
  batch: { batchCode: string; storageLocation?: string }
}

interface Audit {
  id: string
  auditDate: string
  status: string
  notes: string | null
  conductor: { name: string }
  items: AuditItem[]
}

export default function StockOpnamePage() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [activeAudit, setActiveAudit] = useState<Audit | null>(null)
  const [auditInputs, setAuditInputs] = useState<Record<string, { qty: string; note: string }>>({})
  const [submitting, setSubmitting] = useState(false)
  const [creating, setCreating] = useState(false)
  const [viewResult, setViewResult] = useState<Audit | null>(null)

  const fetchAudits = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/stock-opname')
      if (res.redirected) { window.location.href = '/login'; return; }
      if (res.ok) setAudits(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAudits()
  }, [fetchAudits])

  const startNewAudit = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/stock-opname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      })
      const audit = await res.json()
      setActiveAudit(audit)
      const inputs: Record<string, { qty: string; note: string }> = {}
      audit.items.forEach((item: AuditItem) => {
        inputs[item.id] = { qty: '', note: '' }
      })
      setAuditInputs(inputs)
    } catch {
      alert('Gagal memulai audit')
    } finally {
      setCreating(false)
    }
  }

  const submitAudit = async () => {
    if (!activeAudit) return

    // Validate all items have input
    const incomplete = activeAudit.items.some(item => !auditInputs[item.id]?.qty)
    if (incomplete) {
      alert('Harap isi semua jumlah fisik')
      return
    }

    setSubmitting(true)
    try {
      await fetch('/api/stock-opname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          auditId: activeAudit.id,
          items: activeAudit.items.map(item => ({
            id: item.id,
            physicalQuantity: Number(auditInputs[item.id]?.qty || 0),
            note: auditInputs[item.id]?.note || '',
          })),
        }),
      })
      setActiveAudit(null)
      fetchAudits()
    } catch {
      alert('Gagal menyimpan hasil audit')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-primary)' }} /></div>
  }

  // Active audit view (blind audit)
  if (activeAudit) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Audit Sedang Berjalan</h1>
            <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <EyeOff className="w-4 h-4" />
              Mode Blind Audit — Stok sistem disembunyikan
            </p>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="p-3 rounded-xl mb-4 status-attention">
            <p className="text-sm font-medium">⚠️ Panduan Audit</p>
            <p className="text-xs mt-1 opacity-80">
              Hitung jumlah fisik barang di cold storage. Masukkan angka yang Anda lihat, JANGAN melihat data stok di sistem.
            </p>
          </div>

          <div className="space-y-3">
            {activeAudit.items.map((item, idx) => (
              <div key={item.id} className="p-4 rounded-xl animate-fade-in" style={{ background: 'var(--bg-tertiary)', animationDelay: `${idx * 0.03}s` }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.product.name}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{item.batch.batchCode}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                    {item.batch.storageLocation || '-'}
                  </span>
                </div>
                <div className="flex gap-3 mt-3">
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Jumlah Fisik ({item.product.unit})</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Masukkan jumlah..."
                      value={auditInputs[item.id]?.qty || ''}
                      onChange={e => setAuditInputs({
                        ...auditInputs,
                        [item.id]: { ...auditInputs[item.id], qty: e.target.value },
                      })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Catatan</label>
                    <input
                      className="input-field"
                      placeholder="Opsional..."
                      value={auditInputs[item.id]?.note || ''}
                      onChange={e => setAuditInputs({
                        ...auditInputs,
                        [item.id]: { ...auditInputs[item.id], note: e.target.value },
                      })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={() => setActiveAudit(null)} className="btn-secondary flex-1 py-2.5">Batal</button>
            <button onClick={submitAudit} disabled={submitting} className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {submitting ? 'Menyimpan...' : 'Submit Hasil Audit'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Result view
  if (viewResult) {
    const totalDifference = viewResult.items.reduce((sum, i) => sum + Math.abs(i.difference || 0), 0)
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Hasil Audit</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {formatDate(viewResult.auditDate)} · {viewResult.conductor.name}
            </p>
          </div>
          <button onClick={() => setViewResult(null)} className="btn-secondary text-sm">Kembali</button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{viewResult.items.length}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Item</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: '#4ade80' }}>
              {viewResult.items.filter(i => (i.difference || 0) === 0).length}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sesuai</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: totalDifference > 0 ? '#f87171' : '#4ade80' }}>
              {viewResult.items.filter(i => (i.difference || 0) !== 0).length}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Selisih</p>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Batch</th>
                <th className="text-right">Sistem</th>
                <th className="text-right">Fisik</th>
                <th className="text-right">Selisih</th>
                <th>Status</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {viewResult.items.map(item => {
                const diff = item.difference || 0
                const statusClass = diff === 0 ? 'status-safe' : Math.abs(diff) <= 2 ? 'status-attention' : 'status-critical'
                const statusLabel = diff === 0 ? 'Sesuai' : Math.abs(diff) <= 2 ? 'Selisih Kecil' : 'Selisih Besar'
                return (
                  <tr key={item.id}>
                    <td className="font-medium">{item.product.name}</td>
                    <td className="font-mono text-xs">{item.batch.batchCode}</td>
                    <td className="text-right">{item.systemQuantity} {item.product.unit}</td>
                    <td className="text-right">{item.physicalQuantity ?? '-'} {item.product.unit}</td>
                    <td className="text-right font-bold" style={{ color: diff === 0 ? '#4ade80' : diff > 0 ? '#fbbf24' : '#f87171' }}>
                      {diff > 0 ? '+' : ''}{diff}
                    </td>
                    <td><span className={`text-xs px-2 py-0.5 rounded-full ${statusClass}`}>{statusLabel}</span></td>
                    <td className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.note || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Stock Opname</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Audit stok berkala dengan metode blind audit</p>
        </div>
        <button onClick={startNewAudit} disabled={creating} className="btn-primary flex items-center gap-2 text-sm">
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Mulai Audit Baru
        </button>
      </div>

      {/* Audit history */}
      {audits.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Belum ada riwayat audit</p>
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map(audit => {
            const matchCount = audit.items.filter(i => (i.difference || 0) === 0).length
            const mismatchCount = audit.items.filter(i => (i.difference || 0) !== 0).length
            return (
              <div key={audit.id} className="glass-card p-4 cursor-pointer" onClick={() => audit.status === 'COMPLETED' ? setViewResult(audit) : null}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {audit.status === 'COMPLETED' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-400" />
                    )}
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        Audit {formatDate(audit.auditDate)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {audit.conductor.name} · {audit.items.length} item
                        {audit.status === 'COMPLETED' && (
                          <> · ✅ {matchCount} sesuai · ⚠️ {mismatchCount} selisih</>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    audit.status === 'COMPLETED' ? 'status-safe' : audit.status === 'IN_PROGRESS' ? 'status-attention' : 'bg-sky-500/12 text-sky-400'
                  }`}>
                    {AUDIT_STATUS_LABELS[audit.status]}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
