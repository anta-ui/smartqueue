import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { formatDateTime } from "@/lib/utils/date";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface WebhookMetricsExportProps {
  organizationId: string;
  webhookId: string;
}

export function WebhookMetricsExport({
  organizationId,
  webhookId,
}: WebhookMetricsExportProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours
    to: new Date(),
  });
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/webhooks/${webhookId}/metrics/export`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            format,
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
          }),
        }
      );

      if (!response.ok) throw new Error("Échec de l'export");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `webhook-metrics-${formatDateTime(dateRange.from)}-${formatDateTime(
        dateRange.to
      )}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export réussi",
        description: "Les données ont été exportées avec succès",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exporter les Métriques</DialogTitle>
          <DialogDescription>
            Sélectionnez la période et le format d'export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as "csv" | "json")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Période</label>
            <div className="flex gap-4">
              <div>
                <label className="text-sm text-gray-500">Du</label>
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) =>
                    date && setDateRange((prev) => ({ ...prev, from: date }))
                  }
                  disabled={(date) =>
                    date > new Date() || date > dateRange.to
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Au</label>
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) =>
                    date && setDateRange((prev) => ({ ...prev, to: date }))
                  }
                  disabled={(date) =>
                    date > new Date() || date < dateRange.from
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? "Export en cours..." : "Exporter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
