"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { HsCodeCombobox } from "./HsCodeCombobox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ShipmentFormData } from "../types";

export function ProductDetailsSection({ className }: { className?: string }) {
  const form = useFormContext<ShipmentFormData>();

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold border-b pb-2">Product Details</h3>
      <FormField
        control={form.control}
        name="productDetails.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Detailed product description..." rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="productDetails.hsCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HS Code</FormLabel>
              <FormControl>
                <HsCodeCombobox value={field.value || ''} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="productDetails.exportVolume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Export Volume (optional)</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g. 1000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

