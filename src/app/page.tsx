import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, BarChart3, Package, Settings,
  ShieldCheck, Star, Users, Building2, Truck, Check
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* ----------------- NAVBAR ----------------- */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-full border border-slate-200 bg-white/80 backdrop-blur-md z-50 px-6 h-16 flex items-center justify-between shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3">
          {/* Logo Placeholder - Pointing to the new assets folder */}
          <div className="relative w-8 h-8 md:w-10 md:h-10 rounded bg-gradient-to-br from-[#0090d7] to-[#01b5bd] flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-inner">
            KL
            {/* 
              When user uploads logo: 
              <Image src="/assets/logo/logo.png" alt="KongsiLogi" fill className="object-cover" /> 
            */}
          </div>
          <span className="font-bold text-xl md:text-2xl tracking-tight text-slate-800">
            KongsiLogi
          </span>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a className="text-slate-600 hover:text-[#0090d7] transition-colors" href="#features">Fitur</a>
          <a className="text-slate-600 hover:text-[#0090d7] transition-colors" href="#testimonials">Testimoni</a>
          <a className="text-slate-600 hover:text-[#0090d7] transition-colors" href="#pricing">Harga</a>
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

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-36 pb-20 md:py-40 bg-gradient-to-b from-white to-slate-100 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0090d7]/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#01b5bd]/5 blur-3xl" />

        <div className="inline-flex items-center rounded-full border border-[#0090d7]/20 px-3 py-1 text-xs font-semibold bg-[#0090d7]/5 text-[#0090d7] mb-8 shadow-sm">
          ✨ Dilengkapi AI Demand Forecasting
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 text-slate-900 leading-[1.1]">
          Sistem Pengadaan Koperasi <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0090d7] to-[#01b5bd]">
            Modern & Terpadu
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed">
          KongsiLogi mempermudah koperasi dalam mengelola stok gudang, memantau permintaan, hingga automasi pengadaan barang dengan dukungan Artificial Intelligence.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-10">
          <Link href="/login" className="inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all bg-[#0090d7] text-white shadow-lg shadow-[#0090d7]/30 hover:bg-[#007bb8] rounded-full h-14 px-10 text-lg w-full sm:w-auto">
            Mulai Sekarang Gratis
          </Link>
          <a href="#features">
            <button className="inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-full h-14 px-10 text-lg w-full sm:w-auto">
              Pelajari Fitur
            </button>
          </a>
        </div>

        {/* Social Proof */}
        <div className="mt-24 text-sm font-medium text-slate-400">
          <p className="mb-6 uppercase tracking-wider">Dipercaya Oleh Berbagai Koperasi & Ritel</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-slate-600"><Building2 className="h-5 w-5" /> Koperasi Makmur</div>
            <div className="flex items-center gap-2 text-slate-600"><Truck className="h-5 w-5" /> IndoLogistics</div>
            <div className="flex items-center gap-2 text-slate-600"><Package className="h-5 w-5" /> RetailHub</div>
          </div>
        </div>
      </section>

      {/* ----------------- FEATURES SECTION ----------------- */}
      <section id="features" className="py-24 bg-white px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Segala yang Anda Butuhkan untuk Operasional</h2>
            <p className="text-slate-500 text-lg">Platform all-in-one dari gudang penyimpanan hingga Point of Sale (POS).</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:border-[#0090d7]/20 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-[#0090d7]/10 flex items-center justify-center text-[#0090d7] mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Real-time Analytics</h3>
              <p className="text-slate-500 leading-relaxed">Pantau pergerakan stok, tren penjualan, dan performa koperasi Anda dalam satu dashboard intuitif.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:border-[#01b5bd]/20 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-[#01b5bd]/10 flex items-center justify-center text-[#01b5bd] mb-6 group-hover:scale-110 transition-transform">
                <Settings className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">AI Demand Forecasting</h3>
              <p className="text-slate-500 leading-relaxed">Prediksi permintaan barang bulan depan secara otomatis berkat analisis machine learning cerdas.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:border-[#0090d7]/20 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-[#0090d7]/10 flex items-center justify-center text-[#0090d7] mb-6 group-hover:scale-110 transition-transform">
                <Package className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Smart Procurement</h3>
              <p className="text-slate-500 leading-relaxed">Otomatisasi pembuatan Purchase Request (PR) ketika stok menipis agar tidak ada lagi barang kosong.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- TESTIMONIALS SECTION ----------------- */}
      <section id="testimonials" className="py-24 bg-slate-50 px-6 border-t border-slate-100">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-slate-900">Kisah Sukses Koperasi</h2>
          <p className="text-center text-slate-500 mb-16 max-w-2xl mx-auto text-lg">
            Lihat bagaimana KongsiLogi telah membantu pengurus koperasi merampingkan operasional mereka dengan lebih mudah.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Pak Hendra', role: 'Manajer Pengadaan', text: 'Sistem forecast AI-nya sangat membantu! Kami tidak pernah lagi overstock barang yang lambat terjual.' },
              { name: 'Ibu Ratna', role: 'Kepala Gudang', text: 'Stock opname dulu memakan waktu berhari-hari. Sekarang dengan fitur Audit KongsiLogi, semuanya selesai dalam hitungan jam.' },
              { name: 'Budi Santoso', role: 'Kasir Koperasi', text: 'Sistem POS-nya terintegrasi langsung dengan inventory. Transaksi jadi sangat cepat dan sinkron.' },
            ].map((testimonial, i) => (
              <div key={i} className="p-8 rounded-3xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex gap-1 text-amber-400 mb-6">
                    {[1,2,3,4,5].map(star => <Star key={star} className="h-5 w-5 fill-current" />)}
                  </div>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">"{testimonial.text}"</p>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0090d7] to-[#01b5bd] flex items-center justify-center text-white font-bold text-lg shadow-inner">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- PRICING SECTION ----------------- */}
      <section id="pricing" className="py-24 bg-white px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16 text-slate-900">Harga Simpel untuk Pertumbuhan Bisnis</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl border border-slate-200 flex flex-col bg-slate-50">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-700 mb-2">Starter Koperasi</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-slate-900">Rp 0</span>
                </div>
                <p className="text-sm text-slate-500 mt-4">Sempurna untuk koperasi skala kecil</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Manajemen Inventory Dasar', 'Akses POS Kasir', 'Laporan Bulanan', '1 Akun Pengurus'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                    <Check className="h-5 w-5 text-slate-400" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full inline-flex items-center justify-center border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-200 transition-colors h-14 rounded-full">
                Mulai Gratis
              </Link>
            </div>
            
            {/* Pro Tier */}
            <div className="p-8 rounded-3xl border border-[#0090d7]/30 flex flex-col bg-white shadow-2xl shadow-[#0090d7]/10 relative transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0090d7] to-[#01b5bd] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                Rekomendasi
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-700 mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-slate-900">Call</span>
                  <span className="text-lg font-medium text-slate-500">/ bulan</span>
                </div>
                <p className="text-sm text-slate-500 mt-4">Unlock semua kemampuan AI logistik</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['AI Demand Forecasting', 'Auto-Generate Purchase Request', 'Multi-Warehouse & Cold Storage', 'Akun Pengurus Tak Terbatas', 'Prioritas Support 24/7'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <Check className="h-5 w-5 text-[#01b5bd]" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full inline-flex items-center justify-center bg-gradient-to-r from-[#0090d7] to-[#01b5bd] text-white font-bold hover:opacity-90 shadow-lg shadow-[#0090d7]/20 transition-opacity h-14 rounded-full">
                Hubungi Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="py-12 border-t border-slate-200 bg-slate-50 text-center text-sm font-medium text-slate-400">
        <p>© {new Date().getFullYear()} KongsiLogi Inc. Built for the future of cooperatives.</p>
      </footer>
    </div>
  )
}
