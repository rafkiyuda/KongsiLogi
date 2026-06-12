'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Snowflake,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { useState, useEffect, useCallback, startTransition } from 'react'
import { ROLE_LABELS, ROLE_ACCESS_MAP } from '@/lib/constants'

interface SidebarProps {
  user: {
    name: string
    email: string
    role: string
  }
}

const menuItems = [
  { href: '/dashboard', label: 'System Overview', icon: LayoutDashboard, access: 'dashboard' },
  { href: '/dashboard/inventory', label: 'Inventory', icon: Package, access: 'inventory' },
  { href: '/dashboard/cold-storage', label: 'Cold Storage', icon: Snowflake, access: 'coldStorage' },
  { href: '/dashboard/procurement', label: 'Procurement', icon: ShoppingCart, access: 'procurement' },
  { href: '/dashboard/pos', label: 'Point of Sale', icon: Store, access: 'pos' },
  { href: '/dashboard/stock-opname', label: 'Stock Opname', icon: ClipboardList, access: 'stockOpname' },
  { href: '/dashboard/reports', label: 'Analytics & Reports', icon: BarChart3, access: 'reports' },
  { href: '/dashboard/notifications', label: 'System Alerts', icon: Bell, access: 'notifications' },
] as const


export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const access = ROLE_ACCESS_MAP[user.role] ?? ROLE_ACCESS_MAP.VIEWER

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }, [router])

  useEffect(() => {
    // Dismiss mobile drawer on route change.
    startTransition(() => setMobileOpen(false))
  }, [pathname])

  const filteredMenuItems = menuItems.filter(item => access[item.access])

  return (
    <>
      {/* Mobile hamburger - Sticky top */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-0 left-0 z-50 p-4 h-[60px] bg-white border-b border-slate-200 text-slate-800 w-full flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 shrink-0">
            <Image src="/assets/logo/KongsiLogi.png" alt="KongsiLogi" fill className="object-contain" />
          </div>
          <span className="font-bold text-lg">KongsiLogi</span>
        </div>
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - NO LONGER FIXED on Desktop, it's a Flex child! */}
      <aside
        className={`bg-[#0f172a] text-white z-40 flex flex-col transition-all duration-300 ease-in-out shrink-0
          ${collapsed ? 'w-[80px]' : 'w-[280px]'} 
          ${mobileOpen ? 'fixed top-0 left-0 h-[100dvh] translate-x-0' : 'fixed top-0 left-0 h-[100dvh] -translate-x-full lg:relative lg:translate-x-0 lg:h-full'}
        `}
      >
        {/* Header section */}
        <div className="flex items-center gap-3 p-5 h-[72px] bg-[#0b1120] shrink-0">
          <div className="relative w-10 h-10 shrink-0">
            <Image src="/assets/logo/KongsiLogi.png" alt="KongsiLogi" fill className="object-contain" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden whitespace-nowrap opacity-100 transition-opacity duration-300">
              <h1 className="text-lg font-bold text-white tracking-tight">KongsiLogi</h1>
              <p className="text-xs text-blue-400 font-medium">Enterprise Edition</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1.5 custom-scrollbar">
          {!collapsed && <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu</p>}
          
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${collapsed ? 'mx-auto' : ''}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}

          {access.settings && (
            <>
              {!collapsed && <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-2">System</p>}
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                  ${pathname === '/dashboard/settings' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                title={collapsed ? 'System Settings' : undefined}
              >
                <Settings className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:rotate-45 ${collapsed ? 'mx-auto' : ''}`} />
                {!collapsed && <span className="truncate">Settings</span>}
              </Link>
            </>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 bg-[#0b1120] shrink-0 m-3 rounded-2xl border border-slate-800">
          {!collapsed ? (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate font-medium">
                  {ROLE_LABELS[user.role] || user.role}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner cursor-help"
                title={`${user.name} - ${ROLE_LABELS[user.role] || user.role}`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors ${collapsed ? 'justify-center' : ''}`}
            title="Terminate Session"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-semibold">Log Out</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-4 top-24 w-8 h-8 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 items-center justify-center rounded-full z-50 shadow-md transition-all hover:scale-110"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </>
  )
}
