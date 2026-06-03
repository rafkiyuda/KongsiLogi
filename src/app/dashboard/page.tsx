'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  Package,
  Snowflake,
  AlertTriangle,
  ShoppingCart,
  ClipboardList,
  Bell,
  ArrowUpRight,
  Loader2,
  Timer,
  DollarSign,
  TriangleAlert,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate, statusLabels } from '@/lib/utils'
import SalesChart from '@/components/dashboard/SalesChart'

interface DashboardData {
  todaySales: { total: number; count: number }
  totalStock: number
  lowStockProducts: { id: string; name: string; remaining: number; minimum: number; unit: string }[]
  outOfStockProducts: { id: string; name: string; unit: string }[]
  nearExpiryBatches: { id: string; productName: string; batchCode: string; remainingQuantity: number; expiryDate: string; daysLeft: number; unit: string }[]
  pendingPurchaseRequests: number
  coldStorage: { used: number; capacity: number; percentage: number }
  nextAudit: { id: string; date: string } | null
  unreadNotifications: number
  salesChart: { date: string; label: string; total: number; count: number }[]
  recentTransactions: { id: string; code: string; total: number; cashier: string; createdAt: string }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Memuat Data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh] erp-card p-10">
        <p className="text-red-500 font-bold uppercase">System Error: Gagal memuat modul.</p>
      </div>
    )
  }

  const coldStorageStatus = data.coldStorage.percentage > 90 ? 'critical' : data.coldStorage.percentage > 70 ? 'attention' : 'safe'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ringkasan Sistem</h1>
          <p className="text-base text-slate-500 mt-2">
            Pantau metrik operasional harian secara real-time.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <button className="erp-button-secondary bg-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm border border-slate-200">
            Unduh Laporan
          </button>
        </div>
      </div>

      {/* Stat widgets - Modern Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Today's Sales */}
        <div className="erp-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="widget-label">Pendapatan Hari Ini</p>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="widget-value text-blue-600">
              {formatCurrency(data.todaySales.total)}
            </p>
            <p className="text-sm text-slate-500 font-medium mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 font-bold">{data.todaySales.count}</span> Transaksi sukses
            </p>
          </div>
        </div>

        {/* Total Stock */}
        <div className="erp-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="widget-label">Total Inventaris Aktif</p>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div>
            <p className="widget-value">
              {data.totalStock.toFixed(1)} <span className="text-lg font-medium text-slate-400">kg</span>
            </p>
            <p className="text-sm text-slate-500 font-medium mt-2">
              Tersedia di gudang saat ini
            </p>
          </div>
        </div>

        {/* Cold Storage */}
        <div className="erp-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="widget-label">Kapasitas Cold Storage</p>
            <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
          <div>
            <p className="widget-value flex items-center gap-3">
              {data.coldStorage.percentage}%
              <span className={`status-badge status-${coldStorageStatus} scale-90 origin-left`}>
                {statusLabels[coldStorageStatus]}
              </span>
            </p>
            <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${data.coldStorage.percentage}%`,
                  background: coldStorageStatus === 'safe' ? '#3b82f6' : coldStorageStatus === 'attention' ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
          </div>
        </div>

        {/* Pending PR */}
        <div className="erp-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="widget-label">Purchase Requests</p>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div>
            <p className="widget-value">
              {data.pendingPurchaseRequests} <span className="text-lg font-medium text-slate-400">Menunggu</span>
            </p>
            <div className="mt-3">
              {data.pendingPurchaseRequests > 0 ? (
                <Link href="/dashboard/procurement" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors">
                  TINDAK LANJUTI <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700">Semua tugas selesai</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Chart (2/3 width) */}
        <div className="lg:col-span-2 erp-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Tren Pendapatan 7 Hari
            </h3>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">Lihat Detail</button>
          </div>
          <SalesChart data={data.salesChart} />
        </div>

        {/* System Alerts (1/3 width) */}
        <div className="erp-card flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Peringatan Sistem
            </h3>
            {data.unreadNotifications > 0 && (
              <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold shadow-sm">
                {data.unreadNotifications} BARU
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 min-h-[300px]">
            {data.nearExpiryBatches.length === 0 && data.lowStockProducts.length === 0 && data.outOfStockProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">Sistem berjalan optimal.<br />Tidak ada peringatan terdeteksi.</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {data.outOfStockProducts.map(p => (
                  <div key={`out-${p.id}`} className="p-4 rounded-xl flex gap-4 bg-red-50 hover:bg-red-100 transition-colors border border-red-100/50">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <TriangleAlert className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs font-semibold text-red-600 mt-1">STOK HABIS: 0 {p.unit} tersisa</p>
                    </div>
                  </div>
                ))}
                {data.nearExpiryBatches.slice(0, 3).map(b => (
                  <div key={b.id} className={`p-4 rounded-xl flex gap-4 ${b.daysLeft <= 1 ? 'bg-red-50 border-red-100/50' : 'bg-amber-50 border-amber-100/50'} hover:opacity-80 transition-opacity border`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${b.daysLeft <= 1 ? 'bg-red-100' : 'bg-amber-100'}`}>
                      <Timer className={`w-4 h-4 ${b.daysLeft <= 1 ? 'text-red-600' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{b.productName}</p>
                      <p className={`text-xs font-semibold mt-1 ${b.daysLeft <= 1 ? 'text-red-600' : 'text-amber-700'}`}>
                        {b.daysLeft <= 0 ? 'KEDALUWARSA' : `KEDALUWARSA DALAM ${b.daysLeft} HARI`} <span className="text-slate-400 font-medium">({b.remainingQuantity} {b.unit})</span>
                      </p>
                    </div>
                  </div>
                ))}
                {data.lowStockProducts.slice(0, 3).map(p => (
                  <div key={`low-${p.id}`} className="p-4 rounded-xl flex gap-4 hover:bg-slate-50 transition-colors border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Sisa: <span className="font-bold text-slate-700">{p.remaining} {p.unit}</span> (Min: {p.minimum})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions Table */}
        <div className="erp-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Transaksi Kasir Terbaru</h3>
            <Link href="/dashboard/pos" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Semua Log <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="p-2">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-4 pb-2">Ref ID</th>
                  <th className="px-4 py-4 pb-2">Waktu</th>
                  <th className="px-4 py-4 pb-2">Kasir</th>
                  <th className="px-4 py-4 pb-2 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-slate-500">Belum ada transaksi hari ini</td>
                  </tr>
                ) : (
                  data.recentTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-4 font-mono text-slate-600 font-medium group-hover:text-blue-600 transition-colors">{t.code}</td>
                      <td className="px-4 py-4 text-slate-500">
                        {new Date(t.createdAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">{t.cashier}</td>
                      <td className="px-4 py-4 text-right font-bold text-slate-900">{formatCurrency(t.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Schedule */}
        <div className="erp-card h-fit">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Jadwal Pemeliharaan</h3>
          </div>
          <div className="p-6">
            {data.nextAudit ? (
              <div className="flex items-center gap-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 shrink-0">
                  <ClipboardList className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">Audit Stock Opname</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Jadwal berikutnya: <span className="font-semibold text-slate-700">{formatDate(data.nextAudit.date)}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">Tidak ada jadwal dalam waktu dekat</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
