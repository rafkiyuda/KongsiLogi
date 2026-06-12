'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ShoppingCart, Plus, Minus, Trash2, CreditCard, Loader2,
  Package, Search, Receipt, Check, Banknote
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  category: string
  unit: string
  sellingPrice: number
  totalRemaining: number
  stockStatus: string
}

interface CartItem {
  productId: string
  productName: string
  price: number
  quantity: number
  unit: string
  maxStock: number
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [showReceipt, setShowReceipt] = useState<{code: string; total: number; items: CartItem[]} | null>(null)

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }, [])

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
      const res = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            price: i.price,
          })),
          paymentMethod,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Gagal memproses transaksi')
        return
      }

      const data = await res.json()
      setShowReceipt({ code: data.transactionCode, total: data.totalAmount, items: [...cart] })
      setCart([])

      // Refresh products
      const prodRes = await fetch('/api/inventory')
      setProducts(await prodRes.json())
    } catch {
      alert('Terjadi kesalahan')
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
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Kasir (POS)</h1>
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
                <div className="w-full aspect-square rounded-xl flex items-center justify-center mb-2"
                  style={{ background: 'var(--bg-tertiary)' }}>
                  <Package className="w-8 h-8" style={{ color: statusColor }} />
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
                ].map(m => (
                  <button
                    key={m.value}
                    onClick={() => setPaymentMethod(m.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      paymentMethod === m.value
                        ? 'bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/30'
                        : 'hover:bg-white/5'
                    }`}
                    style={paymentMethod !== m.value ? { color: 'var(--text-secondary)', background: 'var(--bg-tertiary)' } : {}}
                  >
                    <m.icon className="w-3.5 h-3.5" />
                    {m.label}
                  </button>
                ))}
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
