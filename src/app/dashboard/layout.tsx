import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar Navigation - Handles its own width via Client Component */}
      <Sidebar user={{ name: session.name, email: session.email, role: session.role }} />

      {/* Main content wrapper */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="hidden lg:flex h-[72px] bg-white border-b border-slate-100 px-8 items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span className="text-primary font-bold">KongsiLogi</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Workspace</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
              v3.0.0-modern
            </span>
          </div>
        </header>

        {/* Mobile top spacer to account for mobile header in Sidebar */}
        <div className="h-[60px] lg:h-0 w-full shrink-0" />
        
        {/* Main content area */}
        <div className="p-6 sm:p-8 lg:p-10 max-w-[1600px] w-full mx-auto flex-1 pb-24">
          {children}
        </div>
      </main>
    </div>
  )
}
