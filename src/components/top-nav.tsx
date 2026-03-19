'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Bot,
  Settings,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, enabled: true },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase, enabled: true },
  { href: '/pipeline', label: 'Pipeline', icon: TrendingUp, enabled: true },
  { href: '/agents', label: 'Agents', icon: Bot, enabled: false },
  { href: '/settings', label: 'Settings', icon: Settings, enabled: true },
]

export function TopNav() {
  const pathname = usePathname()

  async function handleLogout() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-50 h-14 bg-background border-b border-border">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-heading text-lg font-bold text-primary">
            ANgelOS
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
              const Icon = item.icon

              if (!item.enabled) {
                return (
                  <span
                    key={item.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground/40 cursor-not-allowed"
                  >
                    <Icon size={16} />
                    {item.label}
                  </span>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
            MD
          </div>
        </div>
      </div>
    </header>
  )
}
