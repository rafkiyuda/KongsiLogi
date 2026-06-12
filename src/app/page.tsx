import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, BarChart3, Package, Settings,
  ShieldCheck, Star, Users, Building2, Truck, Check, Play
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

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="px-4 pt-36 pb-20 md:py-40 bg-gradient-to-b from-white to-slate-100 relative overflow-hidden">
        {/* Abstract Background Elements with Animations */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0090d7]/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#01b5bd]/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Sisi Kiri: Teks & CTA */}
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center rounded-full border border-[#0090d7]/20 px-3 py-1 text-xs font-semibold bg-[#0090d7]/5 text-[#0090d7] mb-6 shadow-sm">
              ✨ Dilengkapi AI Demand Forecasting
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 leading-[1.15]">
              Sistem Pengadaan Koperasi <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0090d7] to-[#01b5bd]">
                Modern & Terpadu
              </span>
            </h1>
            
            <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              KongsiLogi mempermudah koperasi dalam mengelola stok gudang, memantau permintaan, hingga automasi pengadaan barang dengan dukungan Artificial Intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
              <Link href="/login" className="inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all bg-[#0090d7] text-white shadow-lg shadow-[#0090d7]/30 hover:bg-[#007bb8] rounded-full h-14 px-8 text-lg w-full sm:w-auto">
                Mulai Sekarang Gratis
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <button className="inline-flex w-full items-center justify-center whitespace-nowrap font-semibold transition-all border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-full h-14 px-8 text-lg">
                  Pelajari Fitur
                </button>
              </a>
            </div>
          </div>

          {/* Sisi Kanan: Video Showcase */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-none relative z-10 group cursor-pointer mt-10 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0090d7]/20 to-[#01b5bd]/20 blur-2xl rounded-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden border-4 border-white/80 shadow-2xl flex items-center justify-center">
              
              {/* Actual Video Tag */}
              <video 
                className="absolute inset-0 w-full h-full object-cover opacity-80"
                controls
                muted 
                loop 
                playsInline
                poster="/assets/images/video-thumbnail.jpg"
              >
                {/* Nanti letakkan video asli di public/assets/videos/showcase.mp4 */}
                <source src="/assets/videos/showcase.mp4" type="video/mp4" />
              </video>
              
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof (Moved out of hero section) */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-sm font-medium text-slate-400 text-center">
            <p className="mb-6 uppercase tracking-wider">Dipercaya Oleh Berbagai Koperasi & Ritel</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-slate-600"><Building2 className="h-5 w-5" /> Koperasi Makmur</div>
              <div className="flex items-center gap-2 text-slate-600"><Truck className="h-5 w-5" /> IndoLogistics</div>
              <div className="flex items-center gap-2 text-slate-600"><Package className="h-5 w-5" /> RetailHub</div>
            </div>
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
            <div className="relative overflow-hidden p-8 rounded-3xl border border-slate-700 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group bg-[url('/assets/images/bg-analytics.png')] bg-cover bg-center h-[400px] flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40 z-0 group-hover:via-slate-900/70 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#0090d7]/20 border border-[#0090d7]/30 backdrop-blur-sm flex items-center justify-center text-[#0090d7] mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Real-time Analytics</h3>
                <p className="text-slate-300 leading-relaxed">Pantau pergerakan stok, tren penjualan, dan performa koperasi Anda dalam satu dashboard intuitif.</p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="relative overflow-hidden p-8 rounded-3xl border border-slate-700 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group bg-[url('/assets/images/bg-automation.png')] bg-cover bg-center h-[400px] flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40 z-0 group-hover:via-slate-900/70 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#01b5bd]/20 border border-[#01b5bd]/30 backdrop-blur-sm flex items-center justify-center text-[#01b5bd] mb-6 group-hover:scale-110 transition-transform">
                  <Settings className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">AI Demand Forecasting</h3>
                <p className="text-slate-300 leading-relaxed">Prediksi permintaan barang bulan depan secara otomatis berkat analisis machine learning cerdas.</p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="relative overflow-hidden p-8 rounded-3xl border border-slate-700 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group bg-[url('/assets/images/bg-pos.png')] bg-cover bg-center h-[400px] flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40 z-0 group-hover:via-slate-900/70 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#0090d7]/20 border border-[#0090d7]/30 backdrop-blur-sm flex items-center justify-center text-[#0090d7] mb-6 group-hover:scale-110 transition-transform">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Smart Procurement</h3>
                <p className="text-slate-300 leading-relaxed">Otomatisasi pembuatan Purchase Request (PR) ketika stok menipis agar tidak ada lagi barang kosong.</p>
              </div>
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



      {/* ----------------- FOOTER ----------------- */}
      <footer className="py-12 border-t border-slate-200 bg-slate-50 text-center text-sm font-medium text-slate-400">
        <p>© {new Date().getFullYear()} KongsiLogi Inc. Built for the future of cooperatives.</p>
      </footer>
    </div>
  )
}
