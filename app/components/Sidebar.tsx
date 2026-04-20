import { LayoutDashboard, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  return (
    <div className="w-64 bg-background border-r h-screen p-4">
      <div className="font-bold text-xl mb-8">Culbridge</div>
      <nav className="space-y-2">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </nav>
    </div>
  )
}
