"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import type { AdvancedFilters } from "@/types/organization";

interface OrganizationExportProps {
  filters: AdvancedFilters;
  search: string;
}

interface ExportField {
  key: string;
  label: string;
  category: string;
}

const exportFields: ExportField[] = [
  // Informations générales
  { key: "id", label: "ID", category: "general" },
  { key: "name", label: "Name", category: "general" },
  { key: "status", label: "Status", category: "general" },
  { key: "createdAt", label: "Created At", category: "general" },
  { key: "updatedAt", label: "Updated At", category: "general" },
  
  // Contact et adresse
  { key: "contact.name", label: "Contact Name", category: "contact" },
  { key: "contact.email", label: "Contact Email", category: "contact" },
  { key: "contact.phone", label: "Contact Phone", category: "contact" },
  { key: "address.street", label: "Street", category: "contact" },
  { key: "address.city", label: "City", category: "contact" },
  { key: "address.state", label: "State", category: "contact" },
  { key: "address.country", label: "Country", category: "contact" },
  { key: "address.postalCode", label: "Postal Code", category: "contact" },
  
  // Facturation
  { key: "plan", label: "Plan", category: "billing" },
  { key: "billingCycle", label: "Billing Cycle", category: "billing" },
  { key: "billing.email", label: "Billing Email", category: "billing" },
  { key: "billing.vatNumber", label: "VAT Number", category: "billing" },
  { key: "billing.paymentMethod.type", label: "Payment Method", category: "billing" },
  
  // Utilisation
  { key: "usage.activeUsers", label: "Active Users", category: "usage" },
  { key: "usage.totalQueues", label: "Total Queues", category: "usage" },
  { key: "usage.monthlyTickets", label: "Monthly Tickets", category: "usage" },
  { key: "usage.storageUsed", label: "Storage Used", category: "usage" },
  
  // Métriques
  { key: "metrics.mrr", label: "MRR", category: "metrics" },
  { key: "metrics.growth", label: "Growth", category: "metrics" },
  { key: "metrics.churn", label: "Churn Rate", category: "metrics" },
  { key: "metrics.nps", label: "NPS", category: "metrics" },
];

export function OrganizationExport({ filters, search }: OrganizationExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [fileFormat, setFileFormat] = useState<"csv" | "json" | "xlsx">("csv");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Construire les paramètres de la requête
      const params = new URLSearchParams({
        format: fileFormat,
        fields: selectedFields.join(","),
        search,
        ...filters,
      });

      // Faire la requête d'export
      const response = await fetch(`/api/admin/organizations/export?${params}`);
      const blob = await response.blob();
      
      // Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `organizations_export_${new Date().toISOString()}.${fileFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleCategory = (category: string, checked: boolean) => {
    const categoryFields = exportFields
      .filter((field) => field.category === category)
      .map((field) => field.key);

    setSelectedFields((prev) =>
      checked
        ? [...new Set([...prev, ...categoryFields])]
        : prev.filter((field) => !categoryFields.includes(field))
    );
  };

  const isCategorySelected = (category: string) => {
    const categoryFields = exportFields
      .filter((field) => field.category === category)
      .map((field) => field.key);
    
    return categoryFields.every((field) => selectedFields.includes(field));
  };

  const categories = Array.from(new Set(exportFields.map((field) => field.category)));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ArrowDownTrayIcon className="h-5 w-5" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Organizations</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-medium">Format</Label>
            <RadioGroup
              value={fileFormat}
              onValueChange={(value) => setFileFormat(value as any)}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="xlsx" />
                <Label htmlFor="xlsx">Excel</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-lg font-medium">Fields to Export</Label>
            <div className="space-y-4 mt-2">
              {categories.map((category) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={isCategorySelected(category)}
                      onCheckedChange={(checked) => toggleCategory(category, checked as boolean)}
                    />
                    <Label className="font-medium">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Label>
                  </div>
                  <div className="ml-6 grid grid-cols-2 gap-2">
                    {exportFields
                      .filter((field) => field.category === category)
                      .map((field) => (
                        <div key={field.key} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedFields.includes(field.key)}
                            onCheckedChange={(checked) => {
                              setSelectedFields((prev) =>
                                checked
                                  ? [...prev, field.key]
                                  : prev.filter((key) => key !== field.key)
                              );
                            }}
                          />
                          <Label>{field.label}</Label>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={selectedFields.length === 0 || isExporting}
            >
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
