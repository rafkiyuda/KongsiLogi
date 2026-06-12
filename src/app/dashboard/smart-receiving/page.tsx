'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Radio, ScanLine, Package, MapPin, Activity, Loader2,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, ArrowRight,
  Wifi, WifiOff, Tag, Box, Clock, ChevronRight, Warehouse
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface RfidTag {
  id: string; tagCode: string; status: string; currentBatchId: string | null
  lastScannedAt: string | null; createdAt: string
  currentBatch?: { batchCode: string; product: { name: string } } | null
}
interface RackData {
  id: string; rackCode: string; zone: string; capacityCrates: number
  isActive: boolean; usedCrates: number; occupancyPercent: number
  batches: { batchCode: string; productName: string; quantity: number; placedAt: string }[]
}
interface LogEntry {
  id: string; batchCode: string; productName: string; quantity: number
  action: string; note: string | null; createdAt: string
  rfidTag: { tagCode: string }
}
interface ProductOption { id: string; name: string; category: string; unit: string; shelfLifeDays: number }
interface SupplierOption { id: string; name: string }
interface PendingBatch {
  id: string; batchCode: string; quantity: number; product: { name: string; category: string }
  rfidTags: { tagCode: string }[]
}
interface Recommendation { rackId: string; rackCode: string; zone: string; available: number; suggested: number }

// ─── Tab List ────────────────────────────────────────────────────────────────
const tabs = [
  { key: 'receiving', label: 'RFID Receiving', icon: ScanLine },
  { key: 'putaway', label: 'Guided Putaway', icon: MapPin },
  { key: 'heatmap', label: 'Rack Heatmap', icon: Warehouse },
  { key: 'log', label: 'Tags & Activity', icon: Activity },
] as const
type TabKey = (typeof tabs)[number]['key']

// ─── Main Component ─────────────────────────────────────────────────────────
export default function SmartReceivingPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('receiving')
  const [loading, setLoading] = useState(true)

  // Data
  const [rfidTags, setRfidTags] = useState<RfidTag[]>([])
  const [racks, setRacks] = useState<RackData[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const [pendingPutaway, setPendingPutaway] = useState<PendingBatch[]>([])

  // Receiving state
  const [scannedTags, setScannedTags] = useState<RfidTag[]>([])
  const [scanning, setScanning] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [inferredProduct, setInferredProduct] = useState<{id: string, name: string} | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [receiving, setReceiving] = useState(false)
  const [receiveResult, setReceiveResult] = useState<string | null>(null)
  const [adminOverride, setAdminOverride] = useState(false)

  // Putaway state
  const [selectedBatch, setSelectedBatch] = useState<PendingBatch | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [allocating, setAllocating] = useState(false)
  const [putawaySuccess, setPutawaySuccess] = useState(false)
  const [showAddRack, setShowAddRack] = useState(false)

  // Heatmap state
  const [selectedRack, setSelectedRack] = useState<RackData | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/smart-receiving')
      if (res.redirected) { window.location.href = '/login'; return }
      if (!res.ok) throw new Error('API Error')
      const data = await res.json()
      setRfidTags(data.rfidTags || [])
      setRacks(data.racks || [])
      setLogs(data.receivingLogs || [])
      setProducts(data.products || [])
      setSuppliers(data.suppliers || [])
      setPendingPutaway(data.pendingPutaway || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Simulate Scan ────────────────────────────────────────────────────
  const handleScan = async (isBulk = false) => {
    setScanning(true)
    setReceiveResult(null)

    // Simulating reading delay
    await new Promise(r => setTimeout(r, 800))

    try {
      if (isBulk) {
        if (!tagInput) { alert('Pilih satu tag dari dropdown untuk menentukan SKU yang ingin di bulk-scan.'); setScanning(false); return }
        const prefix = tagInput.split('-')[0]
        const availableTags = rfidTags.filter(t => t.status === 'AVAILABLE' && t.tagCode.startsWith(prefix))
        
        if (availableTags.length === 0) { alert(`Tidak ada tag AVAILABLE untuk SKU ${prefix}`); setScanning(false); return }
        
        const res = await fetch('/api/smart-receiving', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'scan_tag', tagCode: availableTags[0].tagCode }),
        })
        const data = await res.json()
        
        if (data.tag) {
          setScannedTags(availableTags) // Add all available tags
          if (data.inferredProduct) {
            setInferredProduct(data.inferredProduct)
            setSelectedProduct(data.inferredProduct.id)
          }
        }
      } else {
        const tagToScan = tagInput || rfidTags.find(t => t.status === 'AVAILABLE')?.tagCode
        if (!tagToScan) { setScanning(false); return }

        if (scannedTags.some(t => t.tagCode === tagToScan)) {
          alert('Tag ini sudah di-scan!')
          setScanning(false); return
        }

        if (scannedTags.length > 0) {
          const firstPrefix = scannedTags[0].tagCode.split('-')[0]
          const currentPrefix = tagToScan.split('-')[0]
          if (currentPrefix !== firstPrefix) {
            alert(`Error: Tag ${tagToScan} berbeda SKU dengan tag sebelumnya (${firstPrefix})! Harus 1 SKU per batch.`)
            setScanning(false); return
          }
        }

        const res = await fetch('/api/smart-receiving', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'scan_tag', tagCode: tagToScan }),
        })
        const data = await res.json()
        if (data.tag) {
          setScannedTags(prev => [...prev, data.tag])
          setTagInput('')
          if (data.inferredProduct && scannedTags.length === 0) {
            setInferredProduct(data.inferredProduct)
            setSelectedProduct(data.inferredProduct.id)
          }
        }
      }
    } catch (e) { console.error(e) }
    finally { setScanning(false) }
  }

  // ── Receive Batch ────────────────────────────────────────────────────
  const handleReceive = async () => {
    if (scannedTags.length === 0 || !selectedProduct) return
    setReceiving(true)
    try {
      const res = await fetch('/api/smart-receiving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'receive_batch',
          tagCodes: scannedTags.map(t => t.tagCode),
          productId: selectedProduct,
          supplierId: selectedSupplier || undefined,
        }),
      })
      const data = await res.json()
      if (data.batchCode) {
        setReceiveResult(data.batchCode)
        setScannedTags([])
        setTagInput('')
        setSelectedProduct('')
        setInferredProduct(null)
        setSelectedSupplier('')
        
        // Auto-open Putaway modal with recommendations immediately
        if (data.batch) {
          setActiveTab('putaway')
          handleSelectBatch(data.batch)
        }
        
        fetchData()
      } else {
        alert(data.error || 'Gagal menerima batch')
      }
    } catch (e) { console.error(e) }
    finally { setReceiving(false) }
  }

  // ── Get Recommendations ──────────────────────────────────────────────
  const handleSelectBatch = async (batch: PendingBatch) => {
    setSelectedBatch(batch)
    setPutawaySuccess(false)
    setAllocations({})
    setShowAddRack(false)
    try {
      const res = await fetch('/api/smart-receiving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recommend_racks', quantity: batch.quantity }),
      })
      const data = await res.json()
      setRecommendations(data.recommendations || [])
      // Auto-fill allocations from suggestions
      const allocs: Record<string, number> = {}
      for (const rec of data.recommendations || []) {
        allocs[rec.rackId] = rec.suggested
      }
      setAllocations(allocs)
    } catch (e) { console.error(e) }
  }

  // ── Confirm Putaway ──────────────────────────────────────────────────
  const handleConfirmPutaway = async () => {
    if (!selectedBatch) return
    setAllocating(true)
    const allocs = Object.entries(allocations)
      .filter(([, qty]) => qty > 0)
      .map(([rackId, quantity]) => ({ rackId, quantity }))

    try {
      const res = await fetch('/api/smart-receiving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'allocate_rack', batchId: selectedBatch.id, allocations: allocs, overrideAdmin: adminOverride }),
      })
      const data = await res.json()
      if (data.success) {
        setPutawaySuccess(true)
        setSelectedBatch(null)
        setRecommendations([])
        setAllocations({})
        setShowAddRack(false)
        fetchData()
      } else {
        alert(data.error || 'Gagal melakukan putaway')
      }
    } catch (e) { console.error(e) }
    finally { setAllocating(false) }
  }

  const totalAllocated = Object.values(allocations).reduce((s, v) => s + (v || 0), 0)

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: 'var(--accent-primary)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Memuat Smart Receiving...</p>
        </div>
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Radio className="w-7 h-7" style={{ color: 'var(--accent-primary)' }} />
            Smart Receiving & Guided Putaway
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Sistem penerimaan barang otomatis dengan RFID dan alokasi rak cerdas
          </p>
        </div>
        <button onClick={() => { setLoading(true); fetchData() }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'RFID Tags', value: rfidTags.length, sub: `${rfidTags.filter(t => t.status === 'AVAILABLE').length} tersedia`, color: '#3b82f6', icon: Tag },
          { label: 'Tag Aktif', value: rfidTags.filter(t => t.status === 'ASSIGNED').length, sub: 'sedang digunakan', color: '#22c55e', icon: Wifi },
          { label: 'Total Rak', value: racks.length, sub: `Avg ${Math.round(racks.reduce((s, r) => s + r.occupancyPercent, 0) / (racks.length || 1))}% terisi`, color: '#f59e0b', icon: Box },
          { label: 'Menunggu Putaway', value: pendingPutaway.length, sub: 'batch perlu dialokasikan', color: '#ef4444', icon: Clock },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto" style={{ background: 'var(--bg-tertiary)' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key
          const Icon = tab.icon
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${isActive ? 'shadow-md' : 'hover:opacity-80'}`}
              style={isActive ? { background: 'var(--accent-primary)', color: '#fff' } : { color: 'var(--text-muted)' }}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: RFID RECEIVING                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'receiving' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left — Scan Panel */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <ScanLine className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              Scan RFID Tag
            </h2>

            {/* Tag selector for simulation */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Pilih Tag (Simulasi PoC)
              </label>
              <select value={tagInput} onChange={e => setTagInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
                <option value="">-- Pilih RFID Tag --</option>
                {rfidTags.filter(t => t.status === 'AVAILABLE' && !scannedTags.some(st => st.tagCode === t.tagCode)).map(t => (
                  <option key={t.id} value={t.tagCode}>{t.tagCode} (Available)</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleScan(false)} disabled={scanning}
                className="flex-1 py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ background: scanning ? '#6366f1' : 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                {scanning ? <Loader2 className="w-6 h-6 animate-spin" /> : <Radio className="w-6 h-6" />}
                Scan 1 Tag
              </button>
              
              <button onClick={() => handleScan(true)} disabled={scanning}
                className="px-6 rounded-2xl font-bold text-blue-600 flex flex-col items-center justify-center transition-all hover:bg-blue-50 border-2 border-blue-200 disabled:opacity-50">
                <Box className="w-5 h-5 mb-1" />
                <span className="text-xs">Bulk Scan</span>
              </button>
            </div>

            {scannedTags.length > 0 && (
              <button onClick={() => { setScannedTags([]); setInferredProduct(null); setTagInput('') }} className="w-full text-sm text-red-500 font-medium py-2 hover:bg-red-50 rounded-lg transition-colors">
                Bersihkan Hasil Scan
              </button>
            )}

            {/* Scan pulse animation */}
            {scanning && (
              <div className="flex justify-center py-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-blue-500/20 animate-ping absolute" />
                  <div className="w-20 h-20 rounded-full bg-blue-500/30 flex items-center justify-center relative">
                    <Radio className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Scan Result */}
            {scannedTags.length > 0 && (
              <div className="p-4 rounded-xl border-2 space-y-3"
                style={{ borderColor: '#3b82f6', background: 'rgba(59,130,246,0.05)' }}>
                <div className="flex items-center justify-between text-blue-700 font-bold">
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> {scannedTags.length} Tag Terbaca</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {scannedTags.map(t => (
                    <span key={t.id} className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-white border shadow-sm" style={{ color: 'var(--text-primary)' }}>
                      {t.tagCode}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-blue-600 font-medium">✓ Siap di-generate menjadi 1 Batch berisi {scannedTags.length} Crate</p>
              </div>
            )}

            {/* Receive Result */}
            {receiveResult && (
              <div className="p-4 rounded-xl space-y-2"
                style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e' }}>
                <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
                  <CheckCircle2 className="w-6 h-6" /> Batch Berhasil Diterima!
                </div>
                <p className="text-sm font-mono font-bold text-green-800 text-xl">{receiveResult}</p>
                <p className="text-xs text-green-600">Status: Waiting for Putaway</p>
              </div>
            )}
          </div>

          {/* Right — Receiving Form */}
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Package className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              Form Penerimaan Barang
            </h2>

            {!scannedTags.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ScanLine className="w-16 h-16 mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p className="font-medium" style={{ color: 'var(--text-muted)' }}>
                  Scan RFID tag terlebih dahulu
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Pilih tag yang tersedia lalu tekan tombol Scan
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="flex items-center gap-3">
                    <Tag className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total Tag / Crate</p>
                      <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{scannedTags.length} Crate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-md">1 Tag = 1 Crate</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>SKU / Produk *</label>
                  {inferredProduct ? (
                    <div className="w-full px-4 py-3 rounded-xl border text-sm flex items-center justify-between"
                      style={{ background: 'rgba(59,130,246,0.1)', borderColor: '#3b82f6', color: 'var(--text-primary)' }}>
                      <span className="font-bold text-lg">{inferredProduct.name}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold shadow-sm">Auto-detected dari Tag</span>
                    </div>
                  ) : (
                    <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
                      <option value="">-- Pilih Produk --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Jumlah (Crate) *</label>
                  <div className="w-full px-4 py-3 rounded-xl border text-sm font-bold flex items-center justify-between opacity-70"
                    style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
                    <span>{scannedTags.length}</span>
                    <span className="text-xs text-gray-500">Auto-calculated</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Supplier</label>
                  <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}>
                    <option value="">-- Opsional --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tanggal Masuk</p>
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <button onClick={handleReceive} disabled={receiving || !selectedProduct || scannedTags.length === 0}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                  {receiving ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</> : <><CheckCircle2 className="w-5 h-5" /> Generate Batch & Terima</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: GUIDED PUTAWAY                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'putaway' && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left — Pending Batches */}
          <div className="lg:col-span-2 glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Batch Menunggu Putaway
            </h2>
            {pendingPutaway.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: '#22c55e', opacity: 0.5 }} />
                <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Semua batch sudah dialokasikan!</p>
              </div>
            ) : (
              pendingPutaway.map(batch => (
                <button key={batch.id} onClick={() => handleSelectBatch(batch)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:scale-[1.01] ${selectedBatch?.id === batch.id ? 'border-blue-500 shadow-lg' : ''}`}
                  style={{ background: 'var(--bg-secondary)', borderColor: selectedBatch?.id === batch.id ? '#3b82f6' : 'var(--border-primary)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-sm" style={{ color: 'var(--accent-primary)' }}>{batch.batchCode}</p>
                      <p className="font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{batch.product.name}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {batch.quantity} crate • Tag: {batch.rfidTags.map(t => t.tagCode).join(', ')}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </button>
              ))
            )}

            {putawaySuccess && (
              <div className="p-4 rounded-xl bg-green-50 border-2 border-green-500">
                <p className="text-green-700 font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Putaway berhasil dikonfirmasi!</p>
              </div>
            )}
          </div>

          {/* Right — Rack Recommendations */}
          <div className="lg:col-span-3 glass-card p-6 space-y-5">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Rekomendasi Alokasi Rak
            </h2>

            {!selectedBatch ? (
              <div className="text-center py-16">
                <MapPin className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Pilih batch di sebelah kiri untuk melihat rekomendasi rak</p>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: 'var(--bg-tertiary)' }}>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Batch</p>
                    <p className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{selectedBatch.batchCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
                    <p className="font-bold text-lg" style={{ color: 'var(--accent-primary)' }}>{selectedBatch.quantity} crate</p>
                  </div>
                </div>

                {recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                    <p className="font-medium text-amber-600">Tidak ada rak dengan kapasitas cukup!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendations.map(rec => (
                      <div key={rec.rackId} className="p-4 rounded-xl border"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{rec.rackCode}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{rec.zone} • Sisa kapasitas: {rec.available} crate</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="number" min="0" max={adminOverride ? undefined : rec.available}
                              value={allocations[rec.rackId] || ''}
                              onChange={e => setAllocations(prev => ({ ...prev, [rec.rackId]: Number(e.target.value) }))}
                              className={`w-20 px-3 py-2 rounded-lg border text-center font-bold text-sm ${(!adminOverride && (allocations[rec.rackId] || 0) > rec.available) ? 'border-red-500 text-red-600 bg-red-50' : ''}`}
                              style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>crate</span>
                          </div>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, ((rec.available - (allocations[rec.rackId] || 0)) / rec.available) * 100)}%`, background: '#3b82f6' }} />
                        </div>
                      </div>
                    ))}

                    {/* Manual Add Rack Button */}
                    {!showAddRack ? (
                      <button 
                        onClick={() => setShowAddRack(true)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2 px-2 transition-colors"
                      >
                        + Tambahkan rak lain secara manual
                      </button>
                    ) : (
                      <div className="mt-4 p-3 rounded-xl border border-dashed border-gray-300 flex items-center gap-2 transition-all" style={{ background: 'var(--bg-tertiary)' }}>
                        <select
                          className="flex-1 px-3 py-2 rounded-lg border text-sm font-medium"
                          style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                          onChange={e => {
                            const rack = racks.find(r => r.id === e.target.value)
                            if (rack && !recommendations.some(r => r.rackId === rack.id)) {
                              setRecommendations(prev => [...prev, {
                                rackId: rack.id,
                                rackCode: rack.rackCode,
                                zone: rack.zone,
                                available: rack.capacityCrates - rack.usedCrates,
                                suggested: 0
                              }])
                              setShowAddRack(false)
                            }
                          }}
                        >
                          <option value="">Pilih rak...</option>
                          {racks.filter(r => !recommendations.some(rec => rec.rackId === r.id)).map(r => (
                            <option key={r.id} value={r.id}>
                              {r.rackCode} ({r.zone}) - Sisa: {r.capacityCrates - r.usedCrates} crate
                            </option>
                          ))}
                        </select>
                        <button onClick={() => setShowAddRack(false)} className="text-gray-400 hover:text-gray-600 p-1">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4 px-2 pt-2 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                      <input type="checkbox" id="adminOverride" checked={adminOverride} onChange={e => setAdminOverride(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <label htmlFor="adminOverride" className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Admin Override (Izinkan alokasi melebihi kapasitas)</label>
                    </div>
                  </div>
                )}

                {/* Validation */}
                <div className={`p-3 rounded-xl flex items-center justify-between ${totalAllocated === selectedBatch.quantity ? 'bg-green-50 border border-green-300' : totalAllocated > selectedBatch.quantity ? 'bg-red-50 border border-red-300' : 'bg-amber-50 border border-amber-300'}`}>
                  <span className="text-sm font-medium" style={{ color: totalAllocated === selectedBatch.quantity ? '#16a34a' : totalAllocated > selectedBatch.quantity ? '#dc2626' : '#d97706' }}>
                    {totalAllocated === selectedBatch.quantity ? '✓ Alokasi valid' : totalAllocated > selectedBatch.quantity ? '✗ Alokasi melebihi jumlah batch' : `⚠ ${selectedBatch.quantity - totalAllocated} crate belum dialokasikan`}
                  </span>
                  <span className="font-bold" style={{ color: totalAllocated === selectedBatch.quantity ? '#16a34a' : totalAllocated > selectedBatch.quantity ? '#dc2626' : '#d97706' }}>
                    {totalAllocated} / {selectedBatch.quantity}
                  </span>
                </div>

                <button onClick={handleConfirmPutaway}
                  disabled={allocating || totalAllocated > selectedBatch.quantity}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: totalAllocated === selectedBatch.quantity ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : '#94a3b8' }}>
                  {allocating ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengalokasikan...</> : <><CheckCircle2 className="w-5 h-5" /> Confirm Putaway</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: RACK HEATMAP                                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'heatmap' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {racks.reduce((s, r) => s + r.capacityCrates, 0)}
              </p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total Kapasitas (crate)</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: '#3b82f6' }}>
                {racks.reduce((s, r) => s + r.usedCrates, 0)}
              </p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Terpakai (crate)</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold" style={{ color: '#f59e0b' }}>
                {Math.round(racks.reduce((s, r) => s + r.occupancyPercent, 0) / (racks.length || 1))}%
              </p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Rata-rata Occupancy</p>
            </div>
          </div>

          {/* Zones */}
          {Array.from(new Set(racks.map(r => r.zone))).map(zone => (
            <div key={zone} className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Warehouse className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} /> {zone}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {racks.filter(r => r.zone === zone).map(rack => {
                  const pct = rack.occupancyPercent
                  const color = pct > 100 ? '#7f1d1d' : pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#22c55e'
                  const bgColor = pct > 100 ? 'rgba(127,29,29,0.08)' : pct > 80 ? 'rgba(239,68,68,0.08)' : pct > 50 ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)'
                  return (
                    <button key={rack.id} onClick={() => setSelectedRack(selectedRack?.id === rack.id ? null : rack)}
                      className={`p-4 rounded-2xl border-2 text-center transition-all hover:scale-105 cursor-pointer ${selectedRack?.id === rack.id ? 'ring-2 ring-blue-400 shadow-lg' : ''}`}
                      style={{ background: bgColor, borderColor: color }}>
                      <p className="font-bold text-lg" style={{ color }}>{rack.rackCode}</p>
                      <div className="w-full h-3 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <p className="text-2xl font-bold mt-2" style={{ color }}>{pct}%</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {rack.usedCrates}/{rack.capacityCrates} crate
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Rack Detail */}
          {selectedRack && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                  Detail {selectedRack.rackCode}
                </h3>
                <button onClick={() => setSelectedRack(null)} className="text-sm px-3 py-1 rounded-lg"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>Tutup</button>
              </div>
              {selectedRack.batches.length === 0 ? (
                <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>Rak kosong</p>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                  {selectedRack.batches.map((b, i) => (
                    <div key={i} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-mono font-bold text-sm" style={{ color: 'var(--accent-primary)' }}>{b.batchCode}</p>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{b.productName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{b.quantity} crate</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(b.placedAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: RFID TAGS & ACTIVITY LOG                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'log' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* RFID Tags */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Semua RFID Tags
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
              {rfidTags.map(tag => (
                <div key={tag.id} className="p-3 rounded-xl flex items-center justify-between"
                  style={{ background: 'var(--bg-secondary)' }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${tag.status === 'AVAILABLE' ? 'bg-green-500' : tag.status === 'ASSIGNED' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                    <div>
                      <p className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{tag.tagCode}</p>
                      {tag.currentBatch && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          → {tag.currentBatch.batchCode} ({tag.currentBatch.product?.name})
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tag.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : tag.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {tag.status}
                    </span>
                    {tag.lastScannedAt && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(tag.lastScannedAt).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Activity Log
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              {logs.length === 0 ? (
                <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Belum ada aktivitas</p>
              ) : (
                logs.map(log => {
                  const actionColors: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
                    'SCAN_IN': { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', icon: ScanLine },
                    'PUTAWAY': { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', icon: MapPin },
                    'RELEASE': { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', icon: RefreshCw },
                  }
                  const style = actionColors[log.action] || { bg: 'var(--bg-tertiary)', text: 'var(--text-muted)', icon: Activity }
                  const ActionIcon = style.icon
                  return (
                    <div key={log.id} className="p-3 rounded-xl flex items-start gap-3"
                      style={{ background: style.bg }}>
                      <ActionIcon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: style.text }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm" style={{ color: style.text }}>{log.action}</span>
                          <span className="font-mono text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-primary)' }}>
                            {log.rfidTag.tagCode}
                          </span>
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>
                          {log.productName} • {log.batchCode} {log.quantity > 0 ? `• ${log.quantity} crate` : ''}
                        </p>
                        {log.note && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{log.note}</p>}
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          {new Date(log.createdAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
