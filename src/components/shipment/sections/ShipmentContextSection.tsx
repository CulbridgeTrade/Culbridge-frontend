"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { ShipmentFormData } from "../types";

export function ShipmentContextSection({ className }: { className?: string }) {
  const form = useFormContext<ShipmentFormData>();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <FormField
        control={form.control}
        name="commodity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Commodity</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select commodity" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="cocoa">Cocoa</SelectItem>
                <SelectItem value="sesame">Sesame</SelectItem>
                <SelectItem value="cashew">Cashew</SelectItem>
                <SelectItem value="ginger">Ginger</SelectItem>
                <SelectItem value="groundnuts">Groundnuts</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="originCountry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Origin Country</FormLabel>
            <FormControl>
              <Input value="Nigeria" readOnly className="bg-muted" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="destinationCountry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Destination Country</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination country" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Netherlands">Netherlands</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="destinationPort"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Destination Port</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select port" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Rotterdam">Rotterdam</SelectItem>
                <SelectItem value="Hamburg">Hamburg</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

