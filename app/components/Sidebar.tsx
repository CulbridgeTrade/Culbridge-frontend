import { LayoutDashboard, Home, Package } from 'lucide-react'
import Link from 'next/link'


export function Sidebar() {
  return (
    <div className="w-64 bg-background border-r h-screen p-4">
      <div className="font-bold text-xl mb-8">Culbridge</div>
      <nav className="space-y-2">
        <Link href="/" className="w-full justify-start flex h-10 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        <Link href="/dashboard" className="w-full justify-start flex h-10 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/shipment/new" className="w-full justify-start flex h-10 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
            <Package className="mr-2 h-4 w-4" />
            New Shipment
          </Link>
      </nav>
    </div>
  )
}
