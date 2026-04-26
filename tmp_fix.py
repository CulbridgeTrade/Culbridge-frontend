content = r\"\"\"'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NewShipmentPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/" className="topbar-logo">
          <span className="logo-wordmark">
            <span className="logo-cul">Cul</span>
            <span className="logo-bridge">bridge</span>
        </Link>
        <div className="topbar-divider" />
        <div className="topbar-breadcrumb">
          <Link href="/dashboard">Exporter</Link>
          <span className="bc-sep">/</span>
          <span className="bc-active">New Shipment</span>
        </div>
      </header>
      <main className="main">
        <h1 className="page-title">Create New Shipment</h1>
        <p className="page-sub">Use the New Shipment page at /shipment/new instead.</p>
      </main>
    </div>
  );
}
\"\"\"

with open('app/dashboard/shipments/new/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
