'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Check,
  X,
  MessageCircle
} from 'lucide-react'

// Modul / Produk yang tersedia
const PRODUCTS = [
  {
    id: 'core',
    name: 'KongsiLogi Core (ERP)',
    price: 250000,
    hue: 0, // Original Blue
    color: 'text-[#0090d7]',
    bgColor: 'bg-[#0090d7]/10'
  },
  {
    id: 'pos',
    name: 'KongsiLogi POS',
    price: 150000,
    hue: 60, // Shifts to Purple/Indigo
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10'
  },
  {
    id: 'wms',
    name: 'KongsiLogi WMS',
    price: 350000,
    hue: -30, // Shifts to Teal/Green
    color: 'text-[#01b5bd]',
    bgColor: 'bg-[#01b5bd]/10'
  },
  {
    id: 'ai',
    name: 'KongsiLogi Demand AI',
    price: 450000,
    hue: 200, // Shifts to Orange/Amber
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  {
    id: 'cold',
    name: 'KongsiLogi Cold Storage',
    price: 200000,
    hue: -90, // Shifts to Cyan/Light Blue
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10'
  },
  {
    id: 'procure',
    name: 'KongsiLogi Procurement',
    price: 250000,
    hue: -60, // Shifts to Green
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
    if (selectedProducts.length === 0) return 'https://wa.me/6285283971917?text=Halo%20Tim%20Sales%20KongsiLogi,%20saya%20tertarik%20dengan%20produk%20Anda.'
    const productNames = selectedProducts.map(p => `- ${p.name}`).join('%0A')
    const totalFormatted = formatRupiah(totalPrice).replace(/\s/g, '%20')
    const text = `Halo Tim Sales KongsiLogi,%0ASaya tertarik untuk berlangganan bundle berikut:%0A${productNames}%0A%0AEstimasi Total: ${totalFormatted}/bulan.%0AMohon info lebih lanjut.`
    return `https://wa.me/6285283971917?text=${text}`
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* NAVBAR */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-full border border-slate-200 bg-white/80 backdrop-blur-md z-50 px-6 h-16 flex items-center justify-between shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3">
          <Link href="/" className="relative w-8 h-8 md:w-10 md:h-10 shrink-0 cursor-pointer">
            <Image src="/assets/logo/KongsiLogi.png" alt="KongsiLogi" fill className="object-contain" />
          </Link>
          <Link href="/" className="font-bold text-xl md:text-2xl tracking-tight text-slate-800 cursor-pointer">
            KongsiLogi
          </Link>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <Link className="text-slate-600 hover:text-[#0090d7] transition-colors" href="/#features">Fitur</Link>
          <Link className="text-slate-600 hover:text-[#0090d7] transition-colors" href="/#testimonials">Testimoni</Link>
          <Link className="text-slate-600 hover:text-[#0090d7] transition-colors" href="/harga">Harga</Link>
        </nav>
        
        <div className="flex gap-4 items-center">
          <Link href="/login" className="hidden md:inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-colors hover:bg-slate-100 text-slate-700 h-10 px-5 py-2">
            Log In
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg bg-gradient-to-r from-[#0090d7] to-[#01b5bd] text-white hover:opacity-90 h-10 px-5 py-2">
            Masuk Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-36">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 text-center md:text-left">
          Penawaran pembelian bundle dan kustom sesuai kebutuhan Anda
        </h1>
        <p className="text-slate-500 mb-12 text-center md:text-left">
          Temukan pilihan paket harga yang tepat untuk kebutuhan bisnis logistik Anda pakai wa +6285283971917
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sisi Kiri: Grid Produk */}
          <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Pilih produk yang Anda ingin beli secara bundle</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {PRODUCTS.map(product => {
                const isSelected = selectedIds.includes(product.id)
                
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
                      <div className="relative w-7 h-7" style={{ filter: `hue-rotate(${product.hue}deg)` }}>
                        <Image src="/assets/logo/product_icon.png" alt={product.name} fill className="object-contain" />
                      </div>
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
                    return (
                      <div key={product.id} className="flex items-center justify-between py-3 border-b border-slate-100 group">
                        <div className="flex items-center gap-3">
                          <div className="relative w-5 h-5" style={{ filter: `hue-rotate(${product.hue}deg)` }}>
                            <Image src="/assets/logo/product_icon.png" alt={product.name} fill className="object-contain" />
                          </div>
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
