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
          {/* Logo */}
          <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
            <Image src="/assets/logo/KongsiLogi.png" alt="KongsiLogi" fill className="object-contain" />
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
              { name: 'Pak Hendra', role: 'Manajer Pengadaan', image: '/assets/testimonials/hendra.png', text: 'Sistem forecast AI-nya sangat membantu! Kami tidak pernah lagi overstock barang yang lambat terjual.' },
              { name: 'Ibu Ratna', role: 'Kepala Gudang', image: '/assets/testimonials/ratna.png', text: 'Stock opname dulu memakan waktu berhari-hari. Sekarang dengan fitur Audit KongsiLogi, semuanya selesai dalam hitungan jam.' },
              { name: 'Budi Santoso', role: 'Kasir Koperasi', image: '/assets/testimonials/budi.png', text: 'Sistem POS-nya terintegrasi langsung dengan inventory. Transaksi jadi sangat cepat dan sinkron.' },
            ].map((testimonial, i) => (
              <div key={i} className="p-8 rounded-3xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex gap-1 text-amber-400 mb-6">
                    {[1,2,3,4,5].map(star => <Star key={star} className="h-5 w-5 fill-current" />)}
                  </div>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">"{testimonial.text}"</p>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm shrink-0">
                    <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" />
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

      {/* ----------------- PRICING SECTION (Mekari Style) ----------------- */}
      <section id="pricing" className="py-24 bg-slate-50 px-6 border-t border-slate-200">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Satu Solusi Untuk Segala Skala Operasional</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Pilih paket berlangganan yang paling sesuai dengan kebutuhan logistik dan manajemen koperasi Anda. Tanpa biaya tersembunyi.</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 1. Essential Tier */}
            <div className="p-8 rounded-2xl border border-slate-200 flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-1">Essential</h3>
                <p className="text-sm text-slate-500 mb-6">Untuk koperasi yang baru mulai go-digital.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">Gratis</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Selamanya, tanpa batas waktu.</p>
              </div>
              <Link href="/login" className="w-full inline-flex items-center justify-center border-2 border-slate-200 text-slate-700 font-bold hover:border-[#0090d7] hover:text-[#0090d7] transition-colors h-12 rounded-lg mb-8">
                Mulai Gratis
              </Link>
              <div className="pt-6 border-t border-slate-100 flex-1">
                <p className="text-sm font-bold text-slate-900 mb-4">Fitur yang didapatkan:</p>
                <ul className="space-y-4">
                  {[
                    'Manajemen 1 Gudang',
                    'Akses POS Kasir (1 Outlet)',
                    'Pencatatan Stok Dasar',
                    'Laporan Penjualan Bulanan',
                    'Batas 500 Transaksi / bulan',
                    'Support via Email'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                      <Check className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* 2. Professional Tier (Highlighted) */}
            <div className="p-8 rounded-2xl border-2 border-[#0090d7] flex flex-col bg-white shadow-xl shadow-[#0090d7]/10 relative transform lg:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0090d7] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                Paling Diminati
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-1">Professional</h3>
                <p className="text-sm text-slate-500 mb-6">Cocok untuk operasi menengah yang butuh automasi.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-400 line-through mr-2">Rp 799rb</span>
                  <span className="text-4xl font-extrabold text-[#0090d7]">Rp 499rb</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">/ bulan (ditagih tahunan)</p>
              </div>
              <Link href="/login" className="w-full inline-flex items-center justify-center bg-[#0090d7] text-white font-bold hover:bg-[#007bb8] shadow-md transition-colors h-12 rounded-lg mb-8">
                Coba Gratis 14 Hari
              </Link>
              <div className="pt-6 border-t border-slate-100 flex-1">
                <p className="text-sm font-bold text-[#0090d7] mb-4">Semua fitur Essential, ditambah:</p>
                <ul className="space-y-4">
                  {[
                    'Manajemen Multi-Gudang (Hingga 5)',
                    'Multi-Outlet POS Kasir',
                    'AI Demand Forecasting (Standard)',
                    'Automasi Purchase Request',
                    'Audit & Stock Opname Cepat',
                    'Tanpa Batas Transaksi',
                    'Support Prioritas via WhatsApp'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 text-sm leading-relaxed font-medium">
                      <Check className="h-5 w-5 text-[#0090d7] shrink-0 mt-0.5" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3. Enterprise Tier */}
            <div className="p-8 rounded-2xl border border-slate-200 flex flex-col bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-1">Enterprise</h3>
                <p className="text-sm text-slate-500 mb-6">Untuk korporasi dan jaringan koperasi berskala nasional.</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">Custom</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Disesuaikan dengan volume bisnis.</p>
              </div>
              <Link href="/login" className="w-full inline-flex items-center justify-center border-2 border-slate-200 text-slate-700 font-bold hover:border-[#01b5bd] hover:text-[#01b5bd] transition-colors h-12 rounded-lg mb-8">
                Hubungi Tim Sales
              </Link>
              <div className="pt-6 border-t border-slate-100 flex-1">
                <p className="text-sm font-bold text-[#01b5bd] mb-4">Semua fitur Professional, ditambah:</p>
                <ul className="space-y-4">
                  {[
                    'Gudang & Outlet Tidak Terbatas',
                    'AI Demand Forecasting (Advanced)',
                    'Integrasi API (ERP Pihak Ketiga)',
                    'Sistem Cold-Storage Management',
                    'Dedicated Account Manager',
                    'SLA Uptime 99.9%',
                    'On-Premise Deployment (Opsional)'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                      <Check className="h-5 w-5 text-[#01b5bd] shrink-0 mt-0.5" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
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
