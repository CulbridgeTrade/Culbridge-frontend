'use client';

import { LayoutDashboard, Home, Package, FileCheck, Settings, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', icon: Home, label: 'Home', external: true },
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/shipment/new', icon: Package, label: 'New Shipment' },
    { href: '/evaluate', icon: FileCheck, label: 'Evaluate' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/dashboard/')
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lg-sidebar" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F7911E" />
                <stop offset="100%" stopColor="#9C9DA1" />
              </linearGradient>
            </defs>
            <path d='M6 22 C6 14, 14 10, 22 14 C30 10, 38 14, 38 22'
              stroke="url(#lg-sidebar)" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d='M6 22 C6 30, 14 34, 22 30 C30 34, 38 30, 38 22'
              stroke="url(#lg-sidebar)" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="22" cy="22" r="2.8" fill="#F7911E" />
          </svg>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight leading-none">
              <span className="text-slate-900">Cul</span>
              <span className="text-[#F7911E]">bridge</span>
            </span>
            <span className="text-[9px] font-bold tracking-[0.15em] text-slate-400 uppercase leading-none mt-0.5">
              Export Compliance
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? 'bg-[#111D6F] text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-slate-100 space-y-1">
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <HelpCircle className="w-4 h-4" />
          Support
        </Link>
      </div>
    </div>
  )
}

