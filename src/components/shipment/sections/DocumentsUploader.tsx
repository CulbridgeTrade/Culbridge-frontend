"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, CheckCircle } from "lucide-react";
import type { ShipmentFormData, Document } from "../types";

export function DocumentsUploader({ className }: { className?: string }) {
  const form = useFormContext<ShipmentFormData>();
  const { fields, append, remove } from useFieldArray({
    control: form.control,
    name: "documents",
  });

  const documentTypes = [
    "Invoice",
    "Bill of Lading",
    "Certificate of Origin",
    "Phytosanitary Certificate",
    "Lab Report",
  ] as const;

  const fileInputRef = useRef<HTMLInputElement>(null);

const handleFileSelect = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Max 10MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('https://culbridge.cloud/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      const { fileHash, documentId } = data;

      // Infer type from filename or default
      const lowerName = file.name.toLowerCase();
      let docType: Document['type'] = 'Lab Report';
      if (lowerName.includes('invoice')) docType = 'Invoice';
      else if (lowerName.includes('bill of lading') || lowerName.includes('bol')) docType = 'Bill of Lading';
      else if (lowerName.includes('certificate of origin') || lowerName.includes('coo')) docType = 'Certificate of Origin';
      else if (lowerName.includes('phytosanitary')) docType = 'Phytosanitary Certificate';

      append({ type: docType, fileHash, documentId, uploadStatus: "UPLOADED" });
    } catch (e) {
      console.error('Upload error:', e);
      alert('Upload failed: ' + e.message);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6 space-y-4">
        <h3 className="text-lg font-semibold">Documents</h3>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(file);
              e.target.value = ''; // Reset for multiple uploads
            }
          }}
          accept=".pdf,.doc,.docx,.jpg,.png"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentTypes.map((type) => (
            <Card key={type} className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <CardContent className="p-6 text-center hover:bg-accent/50">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-full w-full flex flex-col items-center gap-2 p-4"
                >
                  <Upload className="h-6 w-6" />
                  <span className="font-medium">{type}</span>
                  <span className="text-xs text-muted-foreground">Click to upload</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {fields.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Uploaded Documents</h4>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{field.type} ({field.fileHash?.slice(0,16)}...)</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
