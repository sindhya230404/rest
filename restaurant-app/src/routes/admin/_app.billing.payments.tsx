import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/admin/components/layout/PageHeader";
import { StatusBadge } from "@/admin/components/layout/StatusBadge";
import { Card } from "@/admin/components/ui/card";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/admin/components/ui/table";
import { CreditCard, Search, Download, Banknote, Smartphone, Wallet } from "lucide-react";
import { payments, restaurantInfo } from "@/admin/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { exportToCSV } from "@/admin/lib/exportUtils";

export const Route = createFileRoute("/admin/_app/billing/payments")({
  head: () => ({ meta: [{ title: "Payments — ScanDine" }, { name: "description", content: "Payment transaction history across all methods." }] }),
  component: PaymentsPage,
});

const methodBreakdown = [
  { method: "Cash", amount: 1240, icon: Banknote },
  { method: "UPI", amount: 2140, icon: Smartphone },
  { method: "Credit Card", amount: 3620, icon: CreditCard },
  { method: "Debit Card", amount: 890, icon: CreditCard },
  { method: "Wallet", amount: 452, icon: Wallet },
];

function PaymentsPage() {
  const total = methodBreakdown.reduce((s, m) => s + m.amount, 0);

  const handleExport = () => {
    const exportData = payments.map((p) => ({
      TransactionID: p.id,
      InvoiceID: p.invoiceId,
      Customer: p.customer,
      Method: p.method,
      Date: p.date,
      Amount: p.amount,
      Status: p.status,
    }));
    exportToCSV("payments_history", exportData);
  };

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Track every transaction across cash, cards, UPI and wallets."
        icon={<CreditCard className="h-5 w-5" />}
        actions={<Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        {methodBreakdown.map((m) => (
          <Card key={m.method} className="p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <m.icon className="h-3.5 w-3.5" /> {m.method}
            </div>
            <div className="mt-1 font-display text-xl font-bold">{restaurantInfo.currency}{m.amount.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">{Math.round((m.amount / total) * 100)}% of total</div>
          </Card>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="font-display text-base font-semibold">Payment methods</div>
              <div className="text-xs text-muted-foreground">Distribution this week</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={methodBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.008 60)" vertical={false} />
              <XAxis dataKey="method" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 60)", fontSize: 12 }} />
              <Bar dataKey="amount" fill="oklch(0.68 0.19 40)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <div className="font-display text-base font-semibold">Settlement summary</div>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Gross</span><span className="font-semibold">{restaurantInfo.currency}{total.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Processing fees</span><span className="text-destructive">−{restaurantInfo.currency}142</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Refunds</span><span className="text-destructive">−{restaurantInfo.currency}68</span></div>
            <div className="flex justify-between border-t pt-3 font-display text-lg font-bold">
              <span>Net payout</span><span className="text-primary">{restaurantInfo.currency}{(total - 210).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search transactions…" className="pl-9" />
          </div>
        </div>
        <div className="-mx-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Transaction</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs font-semibold">{p.id}</TableCell>
                  <TableCell className="font-mono text-xs">{p.invoiceId}</TableCell>
                  <TableCell className="font-medium">{p.customer}</TableCell>
                  <TableCell><span className="rounded-md bg-muted px-2 py-0.5 text-xs">{p.method}</span></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.date}</TableCell>
                  <TableCell className="text-right font-semibold">{restaurantInfo.currency}{p.amount.toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
