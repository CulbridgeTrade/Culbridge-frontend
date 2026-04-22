"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import type { ShipmentFormData, LabTest } from "../types";

interface LabResultsRepeaterProps {
  className?: string;
}

export function LabResultsRepeater({ className }: LabResultsRepeaterProps) {
  const form = useFormContext<ShipmentFormData>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "labResults",
  });

  const defaultLabTest: LabTest = {
    testType: "Salmonella",
    result: "PASS",
    value: "",
    unit: "",
    labName: "",
    accredited: false,
    testDate: "",
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold border-b pb-2">Lab Tests (Add multiple)</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(defaultLabTest)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lab Test
        </Button>
      </div>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <span className="font-medium">Lab Test {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={`labResults.${index}.testType`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Test Type</FormLabel>
                    <Select onValueChange={f.onChange} defaultValue={f.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Salmonella">Salmonella</SelectItem>
                        <SelectItem value="Aflatoxin">Aflatoxin</SelectItem>
                        <SelectItem value="Pesticide residue">Pesticide residue</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`labResults.${index}.result`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Result</FormLabel>
                    <Select onValueChange={f.onChange} defaultValue={f.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PASS">PASS</SelectItem>
                        <SelectItem value="FAIL">FAIL</SelectItem>
                        <SelectItem value="ABSENT">ABSENT</SelectItem>
                        <SelectItem value="PRESENT">PRESENT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`labResults.${index}.labName`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Lab Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Accredited lab name" {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={`labResults.${index}.value`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Value (optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 0.5" {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`labResults.${index}.unit`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>Unit (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. ppm" {...f} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`labResults.${index}.testDate`}
                render={({ field: f }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Test Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !f.value && "text-muted-foreground"
                            )}
                          >
                            {f.value ? (
                              format(new Date(f.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={f.value ? new Date(f.value) : undefined}
                          onSelect={(date) => {
                            f.onChange(date ? date.toISOString().split('T')[0] : '');
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name={`labResults.${index}.accredited`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Accredited Lab</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Confirm lab accreditation status
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No lab tests added. Click 'Add Lab Test' to start.</p>
        )}
      </div>
    </div>
  );
}

