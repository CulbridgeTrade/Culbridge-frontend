"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface ReadOnlyCompliancePanelProps {
  shipmentId?: string;
  complianceStatus?: string;
  ruleFailures?: string[];
  missingDocuments?: string[];
  submissionReady?: boolean;
}

export function ReadOnlyCompliancePanel({
  shipmentId,
  complianceStatus = "PENDING",
  ruleFailures = [],
  missingDocuments = [],
  submissionReady = false,
}: ReadOnlyCompliancePanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Output (Backend Computed - Read Only)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Compliance Status</span>
          <Badge variant={complianceStatus === "PASS" ? "default" : complianceStatus === "WARNING" ? "secondary" : "destructive"}>
            {complianceStatus}
          </Badge>
        </div>
        {submissionReady !== undefined && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Submission Readiness</span>
            <Badge variant={submissionReady ? "default" : "destructive"}>
              {submissionReady ? "READY" : "NOT READY"}
            </Badge>
          </div>
        )}
        {ruleFailures.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Rule Failures:</div>
              <ul className="list-disc list-inside space-y-1">
                {ruleFailures.map((failure, i) => (
                  <li key={i}>{failure}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        {missingDocuments.length > 0 && (
          <Alert variant="secondary">
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Missing Documents:</div>
              <ul className="list-disc list-inside space-y-1">
                {missingDocuments.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        {!shipmentId && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Compliance results will appear here after backend evaluation.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

