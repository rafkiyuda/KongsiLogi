import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export function FloatingWhatsApp() {
  return (
    <Link
      href="https://wa.me/6285283971917"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:bg-[#128C7E] hover:scale-110 hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] transition-all duration-300 group"
      aria-label="Chat WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />

      {/* Tooltip */}
      <span className="absolute right-16 px-3 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-lg">
        Tanya Sales via WhatsApp
      </span>

      {/* Ping Indicator */}
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
      </span>
    </Link>
  )
}
