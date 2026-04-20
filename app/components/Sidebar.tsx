import { LayoutDashboard, Home } from 'lucide-react'
import Link from 'next/link'


export function Sidebar() {
  return (
    <div className="w-64 bg-background border-r h-screen p-4">
      <div className="font-bold text-xl mb-8">Culbridge</div>
      <nav className="space-y-2">
        <button className="w-full justify-start flex h-10 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </button>
        <button className="w-full justify-start flex h-10 px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50" asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </button>
      </nav>
    </div>
  )
}
