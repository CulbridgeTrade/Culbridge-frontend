export interface LabTest {
  testType: 'Salmonella' | 'Aflatoxin' | 'Pesticide residue' | 'Other';
  result: 'PASS' | 'FAIL' | 'ABSENT' | 'PRESENT';
  value?: string;
  unit?: string;
  labName: string;
  accredited: boolean;
  testDate: string; // ISO date
}

export interface Document {
  type: 'Invoice' | 'Bill of Lading' | 'Certificate of Origin' | 'Phytosanitary Certificate' | 'Lab Report';
  fileHash: string;
  documentId?: string;
  uploadStatus: 'UPLOADED';
}

export interface ShipmentFormData {
  exporterId?: string;
  commodity: 'cocoa' | 'sesame' | 'cashew' | 'ginger' | 'groundnuts' | 'dry_beans';
  originCountry: "Nigeria";
  destinationCountry: string;
  destinationPort: 'Rotterdam' | 'Hamburg';
  productDetails: {
    description: string;
    hsCode: string;
    exportVolume: string;
  };
  labResults: LabTest[];
  documents: Document[];
  traceability: {
    supplierName: string;
    supplierCountry: string;
  };
  // Backend-populated read-only
  complianceStatus?: string;
  ruleFailures?: string[];
  missingDocuments?: string[];
  submissionReady?: boolean;
}

