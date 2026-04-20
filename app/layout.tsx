import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Culbridge - Compliance Dashboard",
  description: "AI-powered compliance evaluation for exporters",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter:blur(30px)]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl mx-auto items-center px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-primary">Culbridge</h1>
              </div>
              <div className="flex flex-1 items-center justify-end space-x-2 md:gap-2">
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium md:gap-8">
                  <a
                    href="/"
                    className="transition-colors hover:text-primary p-1"
                  >
                    Home
                  </a>
                  <a
                    href="/dashboard"
                    className="transition-colors hover:text-primary p-1"
                  >
                    Dashboard
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-muted/40">
            <div className="container flex flex-col gap-2 sm:flex-row py-8 md:py-12 mx-auto items-center justify-between">
              <p className="text-muted-foreground text-center text-sm">
                © 2024 Culbridge. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

