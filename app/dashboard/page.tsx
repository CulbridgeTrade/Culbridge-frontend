'use client'

import { useEffect, useState } from 'react'
import CulbridgeExporterDashboard from '../components/CulbridgeExporterDashboard'
// import { Button } from '@/components/ui/button'



export default function DashboardPage() {
  const [showNewShipment, setShowNewShipment] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={() => setShowNewShipment(true)}>
          New Shipment
        </button>
      </div>
      <CulbridgeExporterDashboard 
        onNewShipment={() => setShowNewShipment(true)}
        onResubmit={(id: string) => console.log('Resubmit', id)}
      />
    </div>
  )
}

