'use client'

import { useEffect, useState } from 'react'
import { Snowflake, Thermometer, Package, AlertTriangle, Loader2, Timer } from 'lucide-react'
import { getDaysUntilExpiry, statusColors, statusLabels } from '@/lib/utils'

interface Batch {
  id: string
  batchCode: string
  remainingQuantity: number
  unit: string
  expiryDate: string
  storageLocation: string
  status: string
  product: { name: string; category: string }
}

export default function ColdStoragePage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [capacity, setCapacity] = useState({ used: 0, total: 1000 })

  useEffect(() => {
    fetch('/api/cold-storage')
      .then(res => res.json())
      .then(data => {
        setBatches(data.batches || [])
        setCapacity(data.capacity || { used: 0, total: 1000 })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const percentage = Math.round((capacity.used / capacity.total) * 100)
  const capacityStatus = percentage > 90 ? 'critical' : percentage > 70 ? 'attention' : 'safe'

  const locationGroups: Record<string, Batch[]> = {}
  batches.forEach(b => {
    if (!locationGroups[b.storageLocation]) locationGroups[b.storageLocation] = []
    locationGroups[b.storageLocation].push(b)
  })

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-primary)' }} /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Cold Storage</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Monitor gudang pendingin dan kondisi penyimpanan</p>
      </div>

      {/* Capacity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Snowflake className="w-5 h-5" style={{ color: '#22d3ee' }} />
              Kapasitas Cold Storage
            </h3>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full status-${capacityStatus}`}>
              {statusLabels[capacityStatus]}
            </span>
          </div>
          <div className="flex items-end gap-4 mb-3">
            <p className="text-4xl font-bold" style={{ color: '#22d3ee' }}>{percentage}%</p>
            <p className="text-sm pb-1" style={{ color: 'var(--text-muted)' }}>
              {capacity.used.toFixed(1)} / {capacity.total} kg terpakai
            </p>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000 relative"
              style={{
                width: `${percentage}%`,
                background: capacityStatus === 'safe' ? 'linear-gradient(90deg, #06b6d4, #22d3ee)' :
                  capacityStatus === 'attention' ? 'linear-gradient(90deg, #d97706, #f59e0b)' :
                    'linear-gradient(90deg, #dc2626, #ef4444)',
              }}
            >
              <div className="absolute inset-0 opacity-30" style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                animation: 'shimmer 2s infinite',
              }} />
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="w-5 h-5" style={{ color: '#22d3ee' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Suhu</h3>
          </div>
          <div className="space-y-3">
            {['Cold Storage A', 'Cold Storage B', 'Cold Storage C'].map((loc, i) => (
              <div key={loc} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{loc}</span>
                <span className="font-bold text-sm" style={{ color: '#22d3ee' }}>
                  {(2 + i * 0.5).toFixed(1)}°C
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--text-muted)' }}>* Data suhu demo</p>
        </div>
      </div>

      {/* Storage Locations */}
      {Object.entries(locationGroups).map(([location, items]) => (
        <div key={location} className="glass-card p-5 animate-fade-in">
          <h3 className="font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
            <Snowflake className="w-4 h-4" style={{ color: '#22d3ee' }} />
            {location}
            <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
              ({items.length} batch)
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map(batch => {
              const daysLeft = getDaysUntilExpiry(batch.expiryDate)
              const expiryStatus = daysLeft <= 0 ? 'expired' : daysLeft <= 2 ? 'critical' : daysLeft <= 4 ? 'attention' : 'safe'
              const sc = statusColors[expiryStatus]
              return (
                <div key={batch.id} className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{batch.product.name}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                      {daysLeft <= 0 ? 'Expired' : `${daysLeft}d`}
                    </span>
                  </div>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{batch.batchCode}</p>
                  <p className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                    {batch.remainingQuantity} <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{batch.unit}</span>
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {batches.length === 0 && (
        <div className="text-center py-20">
          <Package className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Cold storage kosong</p>
        </div>
      )}
    </div>
  )
}
