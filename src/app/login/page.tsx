'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Package, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Authentication Failed')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'System Error Occurred')
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { email: 'admin@kongsil.co', password: 'admin123', role: 'System Administrator' },
    { email: 'gudang@kongsil.co', password: 'gudang123', role: 'Warehouse Manager' },
    { email: 'kasir@kongsil.co', password: 'kasir123', role: 'POS Operator' },
    { email: 'viewer@kongsil.co', password: 'viewer123', role: 'Executive Viewer' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] p-4">
      <div className="w-full max-w-[420px]">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4">
            <Image src="/assets/logo/KongsiLogi.png" alt="KongsiLogi" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">KongsiLogi ERP</h1>
          <p className="text-sm text-[#475569] mt-1">Enterprise Resource Planning System</p>
        </div>

        {/* Login Box */}
        <div className="erp-card p-8">
          <h2 className="text-lg font-semibold text-[#0f172a] mb-6 border-b border-[#e2e8f0] pb-4">
            System Authentication
          </h2>

          {error && (
            <div className="mb-6 p-3 bg-[#fee2e2] border border-[#f87171] text-[#991b1b] text-sm rounded-[4px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1.5" htmlFor="login-email">
                Corporate Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="erp-input"
                placeholder="user@kongsil.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1.5" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="erp-input pr-10"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="erp-button w-full mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                'Secure Login'
              )}
            </button>
          </form>
        </div>

        {/* Demo Accounts - Formalized */}
        <div className="mt-6 er-card">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3 px-1">
            Test Environments
          </p>
          <div className="grid grid-cols-1 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => {
                  setEmail(acc.email)
                  setPassword(acc.password)
                }}
                type="button"
                className="flex items-center justify-between p-3 bg-white border border-[#e2e8f0] rounded-[4px] hover:border-[#94a3b8] hover:bg-[#f8fafc] text-left transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold text-[#0f172a]">{acc.role}</div>
                  <div className="text-xs text-[#64748b]">{acc.email}</div>
                </div>
                <div className="text-xs font-mono bg-[#f1f5f9] px-2 py-1 rounded text-[#475569]">
                  Auto-fill
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-[#94a3b8]">
          &copy; {new Date().getFullYear()} KongsiLogi Systems. All Rights Reserved.<br />
          Version 2.4.1 (Enterprise Edition)
        </div>
      </div>
    </div>
  )
}
