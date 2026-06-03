'use client'

import { useEffect, useState } from 'react'
import {
  Bell, Check, CheckCheck, Loader2, Package, AlertTriangle,
  ShoppingCart, ClipboardList, Clock, DollarSign
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  actionUrl: string | null
  createdAt: string
}

const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  LOW_STOCK: { icon: Package, color: '#fbbf24' },
  EXPIRY_ALERT: { icon: AlertTriangle, color: '#ef4444' },
  PURCHASE_APPROVAL: { icon: ShoppingCart, color: '#0ea5e9' },
  AUDIT_REMINDER: { icon: ClipboardList, color: '#a78bfa' },
  PAYMENT_DUE: { icon: DollarSign, color: '#f472b6' },
  GENERAL: { icon: Bell, color: '#94a3b8' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => { setNotifications(data); setLoading(false) })
  }, [])

  const markAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'read' }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const markAllAsRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read-all' }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-primary)' }} /></div>
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Notifikasi</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Tidak ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const config = typeConfig[notif.type] || typeConfig.GENERAL
            const Icon = config.icon
            return (
              <div
                key={notif.id}
                className={`glass-card p-4 flex items-start gap-3 animate-fade-in ${!notif.isRead ? 'ring-1' : 'opacity-70'}`}
                style={!notif.isRead ? { borderColor: `${config.color}30` } : {}}
                onClick={() => !notif.isRead && markAsRead(notif.id)}
              >
                <div className="p-2 rounded-lg shrink-0" style={{ background: `${config.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{notif.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{notif.message}</p>
                  <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Clock className="w-3 h-3" />
                    {formatDateTime(notif.createdAt)}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ background: config.color }} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
