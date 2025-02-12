"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useCache } from "@/hooks/cache/useCache";
import { Card, CardHeader, CardContent } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/Table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/common/Dialog";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  ArchiveBoxIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import type { Invoice } from "@/types/billing";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  open: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  void: "bg-red-100 text-red-800",
  uncollectible: "bg-red-100 text-red-800",
};

export default function InvoicesPage() {
  const params = useParams();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [status, setStatus] = useState<string>("");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data: invoices, loading, refresh } = useCache<Invoice[]>({
    key: `organization_${params.id}_invoices`,
    fetchData: async () => {
      const searchParams = new URLSearchParams({
        search,
        status,
        startDate: dateRange.start,
        endDate: dateRange.end,
      });
      const response = await fetch(
        `/api/admin/organizations/${params.id}/invoices?${searchParams}`
      );
      return response.json();
    },
  });

  const handleAction = async (action: string, invoice: Invoice) => {
    try {
      switch (action) {
        case "download":
          window.open(
            `/api/admin/organizations/${params.id}/invoices/${invoice.id}/pdf`,
            "_blank"
          );
          break;
        case "send":
          setSelectedInvoice(invoice);
          setShowSendDialog(true);
          break;
        case "void":
          if (confirm("Are you sure you want to void this invoice?")) {
            await fetch(
              `/api/admin/organizations/${params.id}/invoices/${invoice.id}/void`,
              {
                method: "POST",
              }
            );
            refresh();
          }
          break;
        case "mark-paid":
          await fetch(
            `/api/admin/organizations/${params.id}/invoices/${invoice.id}/mark-paid`,
            {
              method: "POST",
            }
          );
          refresh();
          break;
      }
    } catch (error) {
      console.error("Failed to perform action:", error);
    }
  };

  const handleSendInvoice = async (email: string) => {
    if (!selectedInvoice) return;

    try {
      await fetch(
        `/api/admin/organizations/${params.id}/invoices/${selectedInvoice.id}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      setShowSendDialog(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error("Failed to send invoice:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={() => window.open("/api/admin/organizations/${params.id}/invoices/export", "_blank")}>
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Export All
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="w-full"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="w-full"
            />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="paid">Paid</option>
              <option value="void">Void</option>
              <option value="uncollectible">Uncollectible</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : (
                invoices?.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">#{invoice.number}</div>
                        <div className="text-sm text-gray-500">
                          {invoice.items[0]?.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: invoice.currency,
                      }).format(invoice.total)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[invoice.status]
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleAction("download", invoice)}
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleAction("send", invoice)}
                        >
                          <EnvelopeIcon className="h-5 w-5" />
                        </Button>
                        {invoice.status === "open" && (
                          <Button
                            variant="ghost"
                            onClick={() => handleAction("mark-paid", invoice)}
                          >
                            <CreditCardIcon className="h-5 w-5" />
                          </Button>
                        )}
                        {invoice.status !== "void" && (
                          <Button
                            variant="ghost"
                            onClick={() => handleAction("void", invoice)}
                          >
                            <ArchiveBoxIcon className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal d'envoi de facture */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSendInvoice(formData.get("email") as string);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <Input type="email" name="email" required />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSendDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Send</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
