import { ReactNode } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Culbridge
            </h1>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
            Welcome back
          </h2>
        </div>
        {children}
        <div className="text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary font-medium">
            ← Back to Dashboard Preview
          </Link>
        </div>
      </div>
    </div>
  )
}

