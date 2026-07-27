import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/admin/components/layout/PageHeader";
import { StatusBadge } from "@/admin/components/layout/StatusBadge";
import { Card } from "@/admin/components/ui/card";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/admin/components/ui/table";
import { ShoppingBag, Search, Eye, Trash2 } from "lucide-react";
import { orders as mockOrders, restaurantInfo } from "@/admin/lib/mock-data";
import { useState, useCallback } from "react";
import { useSupabaseTable, type Order } from "@/hooks/useSupabaseData";
import { useRealtimeTable } from "@/hooks/useRealtime";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/admin/components/ui/dialog";

export const Route = createFileRoute("/admin/_app/orders")({
  head: () => ({ meta: [{ title: "Orders — ScanDine" }, { name: "description", content: "Manage active restaurant orders." }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const { data: dbOrders, fetchData } = useSupabaseTable<Order>("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleRealtimePayload = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useRealtimeTable("orders", handleRealtimePayload);

  const displayOrders = dbOrders.length > 0
    ? dbOrders
    : mockOrders.map((m) => ({
        id: m.id,
        order_id: m.id,
        customer: m.customer,
        table_number: m.table,
        item: m.items,
        total: m.total,
        status: m.status as Order["status"],
        payment: m.payment as Order["payment"],
        order_time: m.placedAt,
      }));

  const filteredOrders = displayOrders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      (o.order_id && o.order_id.toLowerCase().includes(q)) ||
      (o.customer && o.customer.toLowerCase().includes(q)) ||
      String(o.table_number).includes(q) ||
      (o.status && o.status.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${displayOrders.length} active and recent orders`}
        icon={<ShoppingBag className="h-5 w-5" />}
      />

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search order ID, table or customer…"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((o) => (
                <TableRow key={o.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs font-semibold">{o.order_id || o.id}</TableCell>
                  <TableCell className="font-medium">{o.customer}</TableCell>
                  <TableCell><span className="rounded-md bg-muted px-2 py-0.5 text-xs">T-{o.table_number}</span></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{Array.isArray(o.item) ? o.item.length : 1} items</TableCell>
                  <TableCell className="text-right font-semibold">{restaurantInfo.currency}{Number(o.total).toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell><StatusBadge status={o.payment} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{o.order_time ? new Date(o.order_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedOrder(o as Order)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details — {selectedOrder?.order_id || selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 pt-2 text-sm">
              <div className="grid grid-cols-2 gap-2 border-b pb-3 text-xs">
                <div><span className="text-muted-foreground">Customer</span><div className="font-semibold text-foreground">{selectedOrder.customer}</div></div>
                <div><span className="text-muted-foreground">Table</span><div className="font-semibold text-foreground">Table #{selectedOrder.table_number}</div></div>
                <div><span className="text-muted-foreground">Status</span><div className="mt-0.5"><StatusBadge status={selectedOrder.status} /></div></div>
                <div><span className="text-muted-foreground">Payment</span><div className="mt-0.5"><StatusBadge status={selectedOrder.payment} /></div></div>
              </div>

              <div>
                <div className="mb-2 font-semibold">Items Ordered</div>
                <div className="space-y-2 rounded-lg bg-muted/40 p-3">
                  {Array.isArray(selectedOrder.item) && selectedOrder.item.length > 0 ? (
                    selectedOrder.item.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span>{it.qty}x {it.name}</span>
                        <span className="font-medium">{restaurantInfo.currency}{(Number(it.price) * Number(it.qty)).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between text-xs">
                      <span>1x Order Items</span>
                      <span className="font-medium">{restaurantInfo.currency}{Number(selectedOrder.total).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-3 font-display text-base font-bold">
                <span>Total Amount</span>
                <span className="text-primary">{restaurantInfo.currency}{Number(selectedOrder.total).toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}