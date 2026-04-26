import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  // Login and signup pages have their own full-page layouts.
  // This wrapper is kept minimal to avoid style conflicts.
  return <>{children}</>
}

