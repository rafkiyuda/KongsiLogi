'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3, Download, Loader2, TrendingUp, TrendingDown,
  ShoppingCart, Package, ClipboardList, DollarSign, FileText
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

type ReportType = 'sales' | 'purchases' | 'stock' | 'audit' | 'profit-loss'

interface ReportData {
  type: string
  summary: Record<string, number | string>
  data: unknown[] | null
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('sales')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [reportType, dateFrom, dateTo])

  const fetchReport = async () => {
    setLoading(true)
    const params = new URLSearchParams({ type: reportType })
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)

    const res = await fetch(`/api/reports?${params}`)
    setReport(await res.json())
    setLoading(false)
  }

  const reportTypes = [
    { value: 'sales' as const, label: 'Penjualan', icon: TrendingUp, color: '#4ade80' },
    { value: 'purchases' as const, label: 'Pembelian', icon: ShoppingCart, color: '#fbbf24' },
    { value: 'stock' as const, label: 'Stok', icon: Package, color: '#38bdf8' },
    { value: 'audit' as const, label: 'Audit', icon: ClipboardList, color: '#a78bfa' },
    { value: 'profit-loss' as const, label: 'Laba Rugi', icon: DollarSign, color: '#f472b6' },
  ]

  const handleExport = (format: 'pdf' | 'excel') => {
    alert(`Export ${format.toUpperCase()} dalam pengembangan. Data sudah siap untuk diunduh.`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Laporan</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Unduh dan lihat laporan keuangan & operasional</p>
      </div>

      {/* Report type selector */}
      <div className="flex gap-2 flex-wrap">
        {reportTypes.map(rt => (
          <button
            key={rt.value}
            onClick={() => setReportType(rt.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              reportType === rt.value ? 'ring-1' : ''
            }`}
            style={{
              background: reportType === rt.value ? `${rt.color}15` : 'var(--bg-tertiary)',
              color: reportType === rt.value ? rt.color : 'var(--text-secondary)',
              borderColor: reportType === rt.value ? `${rt.color}30` : 'transparent',
              ...(reportType === rt.value ? { boxShadow: `0 0 12px ${rt.color}15` } : {}),
            }}
          >
            <rt.icon className="w-4 h-4" />
            {rt.label}
          </button>
        ))}
      </div>

      {/* Date filter */}
      <div className="flex gap-3 flex-wrap items-end">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Dari</label>
          <input type="date" className="input-field w-44" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Sampai</label>
          <input type="date" className="input-field w-44" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('pdf')} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => handleExport('excel')} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Report content */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-primary)' }} /></div>
      ) : !report ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Pilih jenis laporan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary cards */}
          {report.type === 'profit-loss' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-5">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pendapatan</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#4ade80' }}>
                  {formatCurrency(Number(report.summary.revenue))}
                </p>
              </div>
              <div className="glass-card p-5">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pengeluaran</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#f87171' }}>
                  {formatCurrency(Number(report.summary.expenses))}
                </p>
              </div>
              <div className="glass-card p-5">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Laba/Rugi</p>
                <p className="text-2xl font-bold mt-1" style={{ color: Number(report.summary.profit) >= 0 ? '#4ade80' : '#f87171' }}>
                  {formatCurrency(Number(report.summary.profit))}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Margin: {report.summary.margin}%</p>
              </div>
            </div>
          )}

          {report.type === 'sales' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-5">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Penjualan</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: '#4ade80' }}>{formatCurrency(Number(report.summary.totalSales))}</p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Jumlah Transaksi</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--accent-primary)' }}>{report.summary.totalTransactions}</p>
                </div>
              </div>
              {report.data && Array.isArray(report.data) && (
                <div className="glass-card overflow-hidden">
                  <table className="data-table">
                    <thead>
                      <tr><th>Kode</th><th>Kasir</th><th>Metode</th><th className="text-right">Total</th><th>Tanggal</th></tr>
                    </thead>
                    <tbody>
                      {(report.data as Array<{id: string; transactionCode: string; cashier: {name: string}; paymentMethod: string; totalAmount: number; createdAt: string}>).slice(0, 20).map(t => (
                        <tr key={t.id}>
                          <td className="font-mono text-xs">{t.transactionCode}</td>
                          <td>{t.cashier.name}</td>
                          <td className="text-xs">{t.paymentMethod}</td>
                          <td className="text-right font-medium" style={{ color: '#4ade80' }}>{formatCurrency(t.totalAmount)}</td>
                          <td className="text-xs">{formatDate(t.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {report.type === 'stock' && report.data && Array.isArray(report.data) && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-5">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nilai Stok</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: '#38bdf8' }}>{formatCurrency(Number(report.summary.totalStockValue))}</p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Stok</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{Number(report.summary.totalStockQty).toFixed(1)} kg</p>
                </div>
                <div className="glass-card p-5">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Produk</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{report.summary.totalProducts}</p>
                </div>
              </div>
              <div className="glass-card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr><th>Produk</th><th>Kategori</th><th className="text-right">Stok</th><th className="text-right">Nilai</th><th>Batch</th></tr>
                  </thead>
                  <tbody>
                    {(report.data as Array<{id: string; name: string; category: string; totalRemaining: number; unit: string; totalValue: number; batchCount: number}>).map(s => (
                      <tr key={s.id}>
                        <td className="font-medium">{s.name}</td>
                        <td className="text-xs">{s.category}</td>
                        <td className="text-right">{s.totalRemaining.toFixed(1)} {s.unit}</td>
                        <td className="text-right font-medium">{formatCurrency(s.totalValue)}</td>
                        <td className="text-center">{s.batchCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
