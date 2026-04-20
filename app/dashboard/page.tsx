'use client'

import { useEffect, useState } from 'react'
import CulbridgeExporterDashboard from '../components/CulbridgeExporterDashboard'
import { Button } from '@/components/ui/button'


export default function DashboardPage() {
  const [showNewShipment, setShowNewShipment] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
<Button onClick={() => setShowNewShipment(true)}>
          New Shipment
        </Button>
      </div>
      <CulbridgeExporterDashboard 
        onNewShipment={() => setShowNewShipment(true)}
        onResubmit={(id) => console.log('Resubmit', id)}
      />
    </div>
  )
}

