"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ShipmentFormData } from "../types";

export function TraceabilitySection({ className }: { className?: string }) {
  const form = useFormContext<ShipmentFormData>();

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold border-b pb-2">Traceability (EUDR Prep)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="traceability.supplierName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier Name</FormLabel>
              <FormControl>
                <Input placeholder="Supplier name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="traceability.supplierCountry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier Country</FormLabel>
              <FormControl>
                <Input placeholder="Supplier country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

