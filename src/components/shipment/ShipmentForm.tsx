"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Upload, FileText } from "lucide-react";
import api from "@/lib/api";
import type { ShipmentFormData, LabTest } from "./types";
import { CSFShipmentForm } from "./CSFShipmentForm";

const formSchema = z.object({
  exporterId: z.string().optional(),
  commodity: z.enum(["cocoa", "sesame", "cashew", "ginger", "groundnuts", "dry_beans"]),
  originCountry: z.literal("Nigeria"),
  destinationCountry: z.enum(["Netherlands", "Germany"]),
  destinationPort: z.enum(["Rotterdam", "Hamburg"]),
  productDetails: z.object({
    description: z.string().min(1),
    hsCode: z.string().min(1),
    exportVolume: z.string().optional(),
  }),
  labResults: z.array(z.object({
    testType: z.enum(["Salmonella", "Aflatoxin", "Pesticide residue", "Other"]),
    result: z.enum(["PASS", "FAIL", "ABSENT", "PRESENT"]),
    value: z.string().optional(),
    unit: z.string().optional(),
    labName: z.string().min(1),
    accredited: z.boolean(),
    testDate: z.string().min(1),
  })).min(1),
  documents: z.array(z.object({
    type: z.enum(["Invoice", "Bill of Lading", "Certificate of Origin", "Phytosanitary Certificate", "Lab Report"]),
    fileHash: z.string(),
    documentId: z.string().optional(),
    uploadStatus: z.literal("UPLOADED"),
  })),
  traceability: z.object({
    supplierName: z.string().min(1),
    supplierCountry: z.string(),
  }),
});

export function ShipmentForm({ onSuccess, exporterId }: { onSuccess?: () => void, exporterId?: string }) {
  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(formSchema),
  defaultValues: {
    commodity: "cocoa",
    originCountry: "Nigeria",
    destinationCountry: "Netherlands",
    destinationPort: "Rotterdam",
    productDetails: { description: "", hsCode: "", exportVolume: "" },
    labResults: [],
    documents: [],
    traceability: { supplierName: "", supplierCountry: "Nigeria" },
  },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "labResults",
  });

  const [submissionState, setSubmissionState] = useState<ShipmentFormData['complianceStatus'] | null>(null);
  const [complianceData, setComplianceData] = useState({
    complianceStatus: '',
    ruleFailures: [] as string[],
    missingDocuments: [] as string[],
    submissionReady: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ShipmentFormData) => {
    const payload = {
      ...data,
      exporterId: exporterId || data.exporterId || 'LIVE-EXPORTER-ID',
      labResults: data.labResults.map(({ id, ...lab }) => lab),  // Strip UI id
    };
    try {
      setIsSubmitting(true);
      const response = await fetch('https://culbridge.cloud/api/v1/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setComplianceData({
        complianceStatus: result.compliance?.status || 'PENDING',
        ruleFailures: result.compliance?.rulesTriggered?.map((r: any) => r.message) || [],
        missingDocuments: result.compliance?.missingFields || [],
        submissionReady: result.submission?.ready || false,
      });
      form.reset();
      onSuccess?.();
      alert("Shipment validated! Check compliance.");
    } catch (error) {
      console.error("Validation failed", error);
      alert('Validation failed: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return <CSFShipmentForm onSuccess={onSuccess} isOpen={true} onClose={() => {}} />;
}

