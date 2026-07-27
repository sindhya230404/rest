import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/admin/components/layout/PageHeader";
import { StatusBadge } from "@/admin/components/layout/StatusBadge";
import { Card } from "@/admin/components/ui/card";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/admin/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/admin/components/ui/sheet";
import { Receipt, Search, Download, Printer, Split, Percent, Trash2 } from "lucide-react";
import { invoices as mockInvoices, restaurantInfo } from "@/admin/lib/mock-data";
import { useState } from "react";
import { useSupabaseTable, type Invoice } from "@/hooks/useSupabaseData";

import { exportToCSV } from "@/admin/lib/exportUtils";

export const Route = createFileRoute("/admin/_app/billing/invoices")({
  head: () => ({ meta: [{ title: "Invoices — ScanDine" }, { name: "description", content: "Manage restaurant invoices, bills and split payments." }] }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const { data: dbInvoices } = useSupabaseTable<Invoice>("invoices");
  const [searchQuery, setSearchQuery] = useState("");

  const invoicesList = dbInvoices.length > 0
    ? dbInvoices
    : mockInvoices.map((m) => ({
        id: m.id,
        transition: m.orderId,
        invoice: m.id,
        customer: m.customer,
        method: m.method,
        date: m.date,
        amount: m.total,
        status: m.status as Invoice["status"],
      }));

  const totalBilled = invoicesList.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const filtered = invoicesList.filter((inv) => {
    const q = searchQuery.toLowerCase();
    return (
      (inv.invoice && inv.invoice.toLowerCase().includes(q)) ||
      (inv.customer && inv.customer.toLowerCase().includes(q)) ||
      (inv.method && inv.method.toLowerCase().includes(q))
    );
  });

  const handleExport = () => {
    const dataToExport = filtered.map((inv) => ({
      Invoice: inv.invoice || inv.id,
      Customer: inv.customer,
      Date: inv.date ? new Date(inv.date).toLocaleDateString() : "Today",
      Method: inv.method,
      Amount: inv.amount,
      Status: inv.status,
    }));
    exportToCSV("invoices", dataToExport);
  };

  return (
    <div>
      <PageHeader
        title="Invoices"
        description={`${invoicesList.length} invoices · ${restaurantInfo.currency}${totalBilled.toFixed(2)} billed`}
        icon={<Receipt className="h-5 w-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Paid", value: `${restaurantInfo.currency}${(totalBilled * 0.82).toFixed(0)}`, tone: "text-success" },
          { label: "Unpaid", value: `${restaurantInfo.currency}${(totalBilled * 0.12).toFixed(0)}`, tone: "text-warning" },
          { label: "Refunded", value: `${restaurantInfo.currency}${(totalBilled * 0.06).toFixed(0)}`, tone: "text-muted-foreground" },
          { label: "Avg invoice", value: `${restaurantInfo.currency}${invoicesList.length ? (totalBilled / invoicesList.length).toFixed(0) : 0}`, tone: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className={`mt-1 font-display text-2xl font-bold ${s.tone}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices…"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm"><Split className="mr-2 h-4 w-4" />Split bill</Button>
        </div>

        <div className="-mx-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs font-semibold">{inv.invoice || inv.id}</TableCell>
                  <TableCell className="font-medium">{inv.customer}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{inv.date ? new Date(inv.date).toLocaleDateString() : "Today"}</TableCell>
                  <TableCell className="text-xs">{inv.method}</TableCell>
                  <TableCell className="text-right font-semibold">{restaurantInfo.currency}{Number(inv.amount).toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Sheet>
                        <SheetTrigger asChild><Button variant="outline" size="sm">Preview</Button></SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md">
                          <SheetHeader><SheetTitle>Invoice {inv.invoice || inv.id}</SheetTitle></SheetHeader>
                          <InvoicePreview inv={inv} />
                          <SheetFooter>
                            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
                          </SheetFooter>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function InvoicePreview({ inv }: { inv: Invoice }) {
  const amt = Number(inv.amount) || 0;
  return (
    <Card className="mt-4 p-6">
      <div className="text-center">
        <div className="font-display text-2xl font-bold">{restaurantInfo.name}</div>
        <div className="text-xs text-muted-foreground">{restaurantInfo.branch}</div>
        <div className="mt-1 text-xs text-muted-foreground">{restaurantInfo.address}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 border-y py-3 text-xs">
        <div><span className="text-muted-foreground">Invoice</span><div className="font-semibold">{inv.invoice || inv.id}</div></div>
        <div className="text-right"><span className="text-muted-foreground">Date</span><div className="font-semibold">{inv.date ? new Date(inv.date).toLocaleDateString() : "Today"}</div></div>
        <div><span className="text-muted-foreground">Customer</span><div className="font-semibold">{inv.customer}</div></div>
        <div className="text-right"><span className="text-muted-foreground">Method</span><div className="font-semibold">{inv.method}</div></div>
      </div>
      <div className="mt-4 space-y-1 border-t pt-3 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span>{restaurantInfo.currency}{amt.toFixed(2)}</span></div>
        <div className="mt-2 flex justify-between border-t pt-2 font-display text-lg font-bold">
          <span>Total</span><span className="text-primary">{restaurantInfo.currency}{amt.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-2 text-xs">
        <div>Payment · {inv.method}</div>
        <StatusBadge status={inv.status} />
      </div>
      <Button variant="ghost" size="sm" className="mt-2 w-full text-xs"><Percent className="mr-1 h-3 w-3" />Apply coupon</Button>
    </Card>
  );
}
