'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Check,
  Building2,
  MonitorSmartphone,
  Warehouse,
  Brain,
  Snowflake,
  ShoppingCart,
  X,
  MessageCircle
} from 'lucide-react'

// Modul / Produk yang tersedia
const PRODUCTS = [
  {
    id: 'core',
    name: 'KongsiLogi Core (ERP)',
    price: 250000,
    icon: Building2,
    color: 'text-[#0090d7]',
    bgColor: 'bg-[#0090d7]/10'
  },
  {
    id: 'pos',
    name: 'KongsiLogi POS',
    price: 150000,
    icon: MonitorSmartphone,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10'
  },
  {
    id: 'wms',
    name: 'KongsiLogi WMS',
    price: 350000,
    icon: Warehouse,
    color: 'text-[#01b5bd]',
    bgColor: 'bg-[#01b5bd]/10'
  },
  {
    id: 'ai',
    name: 'KongsiLogi Demand AI',
    price: 450000,
    icon: Brain,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  {
    id: 'cold',
    name: 'KongsiLogi Cold Storage',
    price: 200000,
    icon: Snowflake,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10'
  },
  {
    id: 'procure',
    name: 'KongsiLogi Procurement',
    price: 250000,
    icon: ShoppingCart,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  }
]

export default function HargaPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleProduct = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const selectedProducts = PRODUCTS.filter(p => selectedIds.includes(p.id))
  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0)

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number)
  }

  // WA Link builder
  const buildWaLink = () => {
    if (selectedProducts.length === 0) return 'https://wa.me/6281234567890?text=Halo%20Tim%20Sales%20KongsiLogi,%20saya%20tertarik%20dengan%20produk%20Anda.'
    const productNames = selectedProducts.map(p => `- ${p.name}`).join('%0A')
    const totalFormatted = formatRupiah(totalPrice).replace(/\s/g, '%20')
    const text = `Halo Tim Sales KongsiLogi,%0ASaya tertarik untuk berlangganan bundle berikut:%0A${productNames}%0A%0AEstimasi Total: ${totalFormatted}/bulan.%0AMohon info lebih lanjut.`
    return `https://wa.me/6281234567890?text=${text}`
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Navbar Minimalis */}
      <nav className="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="mr-4 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
            <Image src="/assets/logo/KongsiLogi.png" alt="KongsiLogi" fill className="object-contain" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:block">
            KongsiLogi
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-16">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 text-center md:text-left">
          Penawaran pembelian bundle dan kustom sesuai kebutuhan Anda
        </h1>
        <p className="text-slate-500 mb-12 text-center md:text-left">
          Temukan pilihan paket harga yang tepat untuk kebutuhan bisnis logistik Anda
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sisi Kiri: Grid Produk */}
          <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Pilih produk yang Anda ingin beli secara bundle</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {PRODUCTS.map(product => {
                const isSelected = selectedIds.includes(product.id)
                const Icon = product.icon
                
                return (
                  <label 
                    key={product.id}
                    className={`
                      relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 flex flex-col items-center justify-center text-center h-40
                      ${isSelected ? 'border-[#0090d7] bg-[#0090d7]/5 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'}
                    `}
                  >
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={isSelected}
                      onChange={() => toggleProduct(product.id)}
                    />
                    
                    {/* Checkbox Icon */}
                    <div className={`
                      absolute top-3 left-3 w-5 h-5 rounded border flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-[#0090d7] border-[#0090d7]' : 'border-slate-300 bg-white'}
                    `}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>

                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${product.bgColor}`}>
                      <Icon className={`w-6 h-6 ${product.color}`} />
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">{product.name}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Sisi Kanan: Summary Bundle */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl sticky top-24">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Produk bundling yang Anda pilih:</h2>
              
              {selectedProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl mb-8">
                  <p>Belum ada produk yang dipilih</p>
                </div>
              ) : (
                <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                  {selectedProducts.map(product => {
                    const Icon = product.icon
                    return (
                      <div key={product.id} className="flex items-center justify-between py-3 border-b border-slate-100 group">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${product.color}`} />
                          <span className="font-semibold text-slate-800 text-sm">{product.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-slate-400">Mulai dari</p>
                            <p className="font-bold text-slate-900 text-sm">{formatRupiah(product.price)} <span className="font-normal text-slate-500 text-xs">/ bulan</span></p>
                          </div>
                          <button 
                            onClick={() => toggleProduct(product.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                            title="Hapus"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {selectedProducts.length > 0 && (
                <div className="border-t border-slate-200 pt-4 mb-8 flex items-end justify-between">
                  <span className="text-slate-500 font-medium">Estimasi Total</span>
                  <span className="text-2xl font-extrabold text-slate-900">{formatRupiah(totalPrice)}</span>
                </div>
              )}

              <a 
                href={buildWaLink()}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-4 px-6 rounded-2xl transition-colors shadow-lg shadow-[#25D366]/30"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp sekarang
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
