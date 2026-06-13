'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  ShoppingCart, Plus, Minus, Trash2, CreditCard, Loader2,
  Package, Search, FileText, ArrowLeft, Receipt, Check, Banknote, WifiOff, Zap
} from 'lucide-react'

// Declare Midtrans Snap global
declare global {
  interface Window {
    snap: any;
  }
}

import { formatCurrency } from '@/lib/utils'
import { get, set } from 'idb-keyval'

interface OfflineOrder {
  id: string
  items: any[]
  paymentMethod: string
  totalAmount: number
  createdAt: number
}

interface Product {
  id: string
  name: string
  category: string
  unit: string
  sellingPrice: number
  totalRemaining: number
  stockStatus: string
  rfidTags?: string[]
}

interface CartItem {
  productId: string
  productName: string
  price: number
  quantity: number
  unit: string
  maxStock: number
}

const getProductImage = (name: string, category: string) => {
  const specificImages: Record<string, string> = {
    'Bayam': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80',
    'Kangkung': '/assets/images/products/kangkung.png',
    'Sawi Putih': '/assets/images/products/sawi_putih.png',
    'Selada': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&q=80',
    'Cabai Merah': 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=400&q=80',
    'Cabai Rawit': 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=400&q=80',
    'Tomat': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    'Wortel': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80',
    'Brokoli': 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=400&q=80',
    'Buncis': '/assets/images/products/buncis.png',
    'Kol': 'https://images.unsplash.com/photo-1598030304671-5aa1d6f21128?auto=format&fit=crop&w=400&q=80',
    'Daun Bawang': '/assets/images/products/daun_bawang.png',
  }

  if (specificImages[name]) return specificImages[name]

  const categoryImages: Record<string, string> = {
    'Sayur & Buah': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=200&q=80',
    'Daging & Seafood': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=200&q=80',
    'Minuman': 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=200&q=80',
    'Snack & Makanan Ringan': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=200&q=80',
    'Susu & Olahan': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80',
    'Frozen Food': 'https://images.unsplash.com/photo-1588169115783-05ec2c6a0c20?auto=format&fit=crop&w=200&q=80',
  }
  return categoryImages[category] || 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=400&q=80'
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [showReceipt, setShowReceipt] = useState<{code: string; total: number; items: CartItem[]} | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [offlineQueueCount, setOfflineQueueCount] = useState(0)
  const [aiRecs, setAiRecs] = useState<Array<{productId: string; ai: {urgency: string; recommendation: string; action: string}; stats: {daysOfStock: number | null; avgDailySales: number; salesTrend: string}}>>([])

  const checkQueue = async () => {
    try {
      const queue = await get<OfflineOrder[]>('offline_orders') || []
      setOfflineQueueCount(queue.length)
    } catch { }
  }

  const syncQueue = async () => {
    if (!navigator.onLine || syncing) return
    try {
      const queue = await get<OfflineOrder[]>('offline_orders') || []
      if (queue.length === 0) return

      setSyncing(true)
      const newQueue = [...queue]
      for (const order of queue) {
        try {
          const res = await fetch('/api/pos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: order.items,
              paymentMethod: order.paymentMethod,
            }),
          })
          if (res.ok) {
            const index = newQueue.findIndex(o => o.id === order.id)
            if (index !== -1) newQueue.splice(index, 1)
          }
        } catch (err) {
          console.error('Failed to sync order', order.id, err)
        }
      }
      await set('offline_orders', newQueue)
      setOfflineQueueCount(newQueue.length)
    } catch { } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    checkQueue()
  }, [])

  useEffect(() => {
    // Set initial online status
    setIsOffline(!navigator.onLine)
    
    // Listen for connection changes
    const handleOnline = () => {
      setIsOffline(false)
      syncQueue()
    }
    const handleOffline = () => {
      setIsOffline(true)
      setPaymentMethod('CASH') // Force cash if offline
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (navigator.onLine) {
          const res = await fetch('/api/inventory')
          if (res.redirected) { window.location.href = '/login'; return }
          if (!res.ok) throw new Error('API Error')
          const data = await res.json()
          setProducts(data)
          await set('pos_products', data)
        } else {
          const cached = await get<Product[]>('pos_products')
          if (cached) setProducts(cached)
        }
      } catch (err) {
        const cached = await get<Product[]>('pos_products')
        if (cached) setProducts(cached)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()

    // Lazy-load AI recommendations (non-blocking)
    if (navigator.onLine) {
      fetch('/api/ai/product-recommendation')
        .then(r => r.json())
        .then(d => { if (d.success) setAiRecs(d.recommendations) })
        .catch(() => {})
    }
  }, [])

  // Global Keydown Listener for USB RFID Scanner
  const barcodeBuffer = useRef('')
  const lastKeyTime = useRef(0)
  const addToCartRef = useRef<any>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now()
      
      // If time since last key is > 50ms, assume human typing and reset buffer
      if (currentTime - lastKeyTime.current > 50) {
        barcodeBuffer.current = ''
      }
      lastKeyTime.current = currentTime

      if (e.key === 'Enter') {
        if (barcodeBuffer.current.length > 5) {
          const scannedCode = barcodeBuffer.current
          // Find matching product by RFID tag
          const foundProduct = products.find(p => p.rfidTags?.includes(scannedCode))
          
          if (foundProduct && addToCartRef.current) {
            addToCartRef.current(foundProduct)
            
            // Clean up search input if the scanner typed into it
            if (e.target instanceof HTMLInputElement && e.target.type === 'text') {
              e.target.value = e.target.value.replace(scannedCode, '')
              setSearch(e.target.value) // Update search state
            }
          } else {
             // Optional: Show alert if product not found
             console.warn('RFID tag not recognized:', scannedCode)
          }
        }
        barcodeBuffer.current = '' // Reset after enter
      } else if (e.key.length === 1) {
        barcodeBuffer.current += e.key
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [products])

  const addToCart = useCallback((product: Product) => {
    if (product.totalRemaining <= 0) return

    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        if (existing.quantity >= product.totalRemaining) return prev
        return prev.map(i =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        price: product.sellingPrice,
        quantity: 1,
        unit: product.unit,
        maxStock: product.totalRemaining,
      }]
    })
  }, [])

  useEffect(() => {
    addToCartRef.current = addToCart
  }, [addToCart])

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId !== productId) return item
      const newQty = item.quantity + delta
      if (newQty <= 0 || newQty > item.maxStock) return item
      return { ...item, quantity: newQty }
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId))
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setProcessing(true)

    try {
      // 1. If NON-CASH payment, generate Midtrans Token first
      if (paymentMethod !== 'CASH') {
        const orderId = `POS-${Date.now()}` // Temporary order ID for Snap
        
        const snapRes = await fetch('/api/pos/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderId,
            gross_amount: total,
            item_details: cart.map(i => ({
              id: i.productId,
              price: i.price,
              quantity: i.quantity,
              name: i.productName.substring(0, 50)
            })),
            customer_details: {
              first_name: 'Customer',
              last_name: 'KongsiLogi'
            }
          })
        })

        const snapData = await snapRes.json()
        
        if (!snapRes.ok || !snapData.token) {
          alert('Gagal membuat transaksi Midtrans. Cek API Keys di .env')
          setProcessing(false)
          return
        }

        if (snapData.token.startsWith('sandbox-dummy-token')) {
          alert('API Key Midtrans belum dikonfigurasi. Menggunakan mode dummy dan mengalihkan ke simulator.');
          window.open(snapData.redirect_url, '_blank');
          finalizeOrder();
          return;
        }

        // Open Snap Popup
        window.snap.pay(snapData.token, {
          onSuccess: function(result: any) {
            // Payment success, proceed to save order in DB
            finalizeOrder()
          },
          onPending: function(result: any) {
            alert('Menunggu pembayaran selesai.')
            setProcessing(false)
          },
          onError: function(result: any) {
            alert('Pembayaran gagal.')
            setProcessing(false)
          },
          onClose: function() {
            alert('Anda menutup popup sebelum menyelesaikan pembayaran.')
            setProcessing(false)
          }
        })
      } else {
        // Cash payment, directly save to DB
        finalizeOrder()
      }
    } catch (e) {
      console.error(e)
      alert('Terjadi kesalahan')
      setProcessing(false)
    }
  }

  // 2. Finalize order in Database (called after Cash or successful Midtrans payment)
  const finalizeOrder = async () => {
    try {
      setProcessing(true)
      const orderPayload = {
        items: cart.map(i => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
        })),
        paymentMethod,
      }

      if (!navigator.onLine) {
        // Save to offline queue
        const queue = await get<OfflineOrder[]>('offline_orders') || []
        const offlineOrder: OfflineOrder = {
          id: `OFFLINE-${Date.now()}`,
          ...orderPayload,
          totalAmount: total,
          createdAt: Date.now()
        }
        await set('offline_orders', [...queue, offlineOrder])
        
        setShowReceipt({ code: offlineOrder.id, total, items: [...cart] })
        setCart([])
        checkQueue()
        return
      }

      const res = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gagal memproses transaksi')
        setProcessing(false)
        return
      }

      const data = await res.json()
      setShowReceipt({ code: data.transactionCode, total: data.totalAmount, items: [...cart] })
      setCart([])

      // Refresh products
      const prodRes = await fetch('/api/inventory')
      setProducts(await prodRes.json())
    } catch {
      alert('Terjadi kesalahan saat menyimpan transaksi')
    } finally {
      setProcessing(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100dvh-120px)] lg:h-[calc(100dvh-120px)] lg:min-h-0">
      {/* Product grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Kasir (POS)</h1>
            {isOffline && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full dark:bg-red-900/30 dark:text-red-400">
                <WifiOff className="w-3.5 h-3.5" />
                Offline
              </span>
            )}
            {offlineQueueCount > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
                <Package className="w-3.5 h-3.5" />
                {offlineQueueCount} Antrean {syncing ? '(Menyinkron...)' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            className="input-field pl-10"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          {filteredProducts.map(product => {
            const isOutOfStock = product.totalRemaining <= 0
            const inCart = cart.find(i => i.productId === product.id)
            const statusColor = isOutOfStock ? '#ef4444' : product.stockStatus === 'attention' ? '#f59e0b' : '#22c55e'

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={isOutOfStock}
                className={`glass-card p-3 text-left transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'} ${inCart ? 'ring-2 ring-sky-500/50' : ''}`}
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 relative group-hover:shadow-md transition-shadow">
                  {/* Fallback border if image fails to load quickly, but we use the img directly */}
                  <img 
                    src={getProductImage(product.name, product.category)} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Status overlay line */}
                  <div className="absolute bottom-0 left-0 w-full h-1" style={{ backgroundColor: statusColor }}></div>
                </div>
                <h3 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {isOutOfStock ? 'Habis' : `${product.totalRemaining} ${product.unit}`}
                </p>
                <p className="font-bold text-sm mt-1" style={{ color: 'var(--accent-primary)' }}>
                  {formatCurrency(product.sellingPrice)}
                </p>
                {inCart && (
                  <div className="mt-1 text-xs font-medium px-2 py-0.5 rounded-full inline-block"
                    style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
                    ×{inCart.quantity}
                  </div>
                )}
                {/* AI Insight Mini Badge */}
                {(() => {
                  const rec = aiRecs.find(r => r.productId === product.id)
                  if (!rec) return null
                  const urgencyStyles: Record<string, { bg: string; text: string; icon: string }> = {
                    kritis: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', icon: '🔴' },
                    tinggi: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', icon: '🟠' },
                    sedang: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', icon: '🟡' },
                    rendah: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', icon: '🟢' },
                  }
                  const s = urgencyStyles[rec.ai.urgency] || urgencyStyles.rendah
                  return (
                    <div className={`mt-1.5 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium ${s.bg} ${s.text}`}>
                      <Zap className="w-2.5 h-2.5" />
                      <span>{s.icon} {rec.stats.daysOfStock !== null ? `~${rec.stats.daysOfStock}d stok` : rec.ai.urgency}</span>
                    </div>
                  )
                })()}
              </button>
            )
          })}
        </div>
      </div>

      {/* Cart sidebar */}
      <div className="lg:w-[380px] glass-card p-4 flex flex-col max-h-[500px] lg:max-h-full">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Keranjang ({cart.length})
          </h2>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada produk dipilih</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {cart.map(item => (
              <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-tertiary)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.productName}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatCurrency(item.price)}/{item.unit}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="p-1 rounded-lg hover:bg-white/10"
                  >
                    <Minus className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="p-1 rounded-lg hover:bg-white/10"
                  >
                    <Plus className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 rounded-lg hover:bg-red-500/20 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
                <p className="text-sm font-semibold w-20 text-right" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Payment method */}
        {cart.length > 0 && (
          <>
            <div className="mb-3">
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Metode Pembayaran</p>
              <div className="flex gap-2">
                {[
                  { value: 'CASH', label: 'Tunai', icon: Banknote },
                  { value: 'TRANSFER', label: 'Transfer', icon: CreditCard },
                  { value: 'QRIS', label: 'QRIS', icon: CreditCard },
                ].map(m => {
                  const isDisabled = isOffline && m.value !== 'CASH'
                  return (
                    <button
                      key={m.value}
                      onClick={() => !isDisabled && setPaymentMethod(m.value)}
                      disabled={isDisabled}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' :
                        paymentMethod === m.value
                          ? 'bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30'
                          : 'hover:bg-white/5'
                      }`}
                      style={isDisabled ? { background: 'var(--bg-tertiary)', color: 'var(--text-muted)' } : paymentMethod !== m.value ? { color: 'var(--text-secondary)', background: 'var(--bg-tertiary)' } : {}}
                    >
                      <m.icon className="w-3.5 h-3.5" />
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Total & Checkout */}
            <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Total</span>
                <span className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{formatCurrency(total)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={processing}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                ) : (
                  <><Receipt className="w-4 h-4" /> Bayar & Cetak Struk</>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Receipt modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-md animate-fade-in">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Transaksi Berhasil!</h3>
              <p className="text-sm mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>{showReceipt.code}</p>
            </div>

            <div className="space-y-2 mb-4">
              {showReceipt.items.map(item => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {item.productName} ×{item.quantity}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold"
                style={{ borderColor: 'var(--border-color)' }}>
                <span style={{ color: 'var(--text-primary)' }}>Total</span>
                <span style={{ color: '#4ade80' }}>{formatCurrency(showReceipt.total)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowReceipt(null)}
              className="btn-primary w-full py-2.5"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
