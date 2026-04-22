'use client'

import { useState } from 'react'
import CulbridgeExporterDashboard from '../components/CulbridgeExporterDashboard'
import { ShipmentForm } from "@/components/shipment/ShipmentForm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DashboardPage() {
  const [showNewShipment, setShowNewShipment] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <Dialog open={showNewShipment} onOpenChange={setShowNewShipment}>
          <DialogTrigger>
            <button className="px-4 py-2 bg-black text-white rounded">
              New Shipment
            </button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Shipment</DialogTitle>
              <DialogDescription>
                Fill out the shipment form. Backend will compute compliance.
              </DialogDescription>
            </DialogHeader>

            <ShipmentForm
              exporterId="LIVE-EXPORTER-ID"
              onSuccess={() => setShowNewShipment(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <CulbridgeExporterDashboard
        onNewShipment={() => setShowNewShipment(true)}
        onResubmit={(id: string) => console.log('Resubmit', id)}
      />
    </div>
  )
}