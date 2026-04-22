"use client";

import { ShipmentForm, CSFShipmentForm } from "@/components/shipment/ShipmentForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewShipmentPage() {
  const handleSuccess = () => {
    // Redirect or refresh dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-8">Classic Form</h3>
          <ShipmentForm onSuccess={handleSuccess} />
        </div>
        <div className="w-96 p-6 border rounded-lg">
          <h3 className="font-semibold mb-4 text-lg">New CSF Form (Recommended)</h3>
          <CSFShipmentForm onSuccess={handleSuccess} isOpen={true} onClose={() => {}} />
        </div>
      </div>
    </div>
  );
}

