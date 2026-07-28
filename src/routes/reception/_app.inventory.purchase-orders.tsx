import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/reception/components/layout/PageHeader";
import { StatusBadge } from "@/reception/components/layout/StatusBadge";
import { Card } from "@/reception/components/ui/card";
import { Button } from "@/reception/components/ui/button";
import { Input } from "@/reception/components/ui/input";
import { Label } from "@/reception/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/reception/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/reception/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/reception/components/ui/dialog";
import { ClipboardList, Plus, Eye, Truck, Calendar } from "lucide-react";
import { purchaseOrders as mockPOsRaw, suppliers as mockSuppliers, restaurantInfo } from "@/reception/lib/mock-data";
import { useSupabaseTable, type PurchaseOrder } from "@/hooks/useSupabaseData";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/reception/_app/inventory/purchase-orders")({
  head: () => ({ meta: [{ title: "Purchase Orders — ScanDine" }, { name: "description", content: "Track supplier purchase orders and deliveries." }] }),
  component: POPage,
});

const defaultPOs: PurchaseOrder[] = mockPOsRaw.map((p) => ({
  id: p.id,
  supplier: p.supplier,
  items: p.items,
  total: p.total,
  date: p.date,
  status: p.status as PurchaseOrder["status"],
}));

function POPage() {
  const { data: dbPOs, addItem } = useSupabaseTable<PurchaseOrder>("purchase_orders", defaultPOs);

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New PO form state
  const [supplier, setSupplier] = useState(mockSuppliers[0]?.name || "Fresh Farm Produce");
  const [itemsCount, setItemsCount] = useState("5");
  const [totalAmount, setTotalAmount] = useState("4500");
  const [status, setStatus] = useState<PurchaseOrder["status"]>("pending");

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    const poNum = `#PO-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await addItem({
        id: poNum,
        supplier: supplier,
        items: Number(itemsCount) || 5,
        total: Number(totalAmount) || 4500,
        date: "Today",
        status: status,
      });
      toast.success(`Purchase Order ${poNum} created successfully! 🛒`);
      setItemsCount("5");
      setTotalAmount("4500");
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Failed to create PO:", err);
      toast.error("Failed to create Purchase Order");
    }
  };

  const poList = dbPOs.length > 0 ? dbPOs : defaultPOs;
  const committedTotal = poList.reduce((s, p) => s + Number(p.total), 0);

  return (
    <div>
      <PageHeader
        title="Purchase orders"
        description={`${poList.length} POs · ${restaurantInfo.currency}${committedTotal.toLocaleString()} committed`}
        icon={<ClipboardList className="h-5 w-5" />}
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New PO
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Create New Purchase Order
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePO} className="space-y-4 mt-2">
                <div className="space-y-1">
                  <Label>Supplier *</Label>
                  <Select value={supplier} onValueChange={setSupplier}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {mockSuppliers.map((s) => (
                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="po-items">Item SKUs Count</Label>
                    <Input
                      id="po-items"
                      type="number"
                      placeholder="5"
                      value={itemsCount}
                      onChange={(e) => setItemsCount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="po-total">Total Amount (₹) *</Label>
                    <Input
                      id="po-total"
                      type="number"
                      step="0.01"
                      placeholder="4500"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Order Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as PurchaseOrder["status"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing / Processing</SelectItem>
                      <SelectItem value="ready">Ready / Shipped</SelectItem>
                      <SelectItem value="completed">Completed / Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  Creating this PO commits {restaurantInfo.currency}{Number(totalAmount || 0).toFixed(2)} to {supplier} and logs the inventory restock request.
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Purchase Order</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="p-4">
        <div className="-mx-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>PO ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {poList.map((p, idx) => (
                <TableRow key={`${p.id}-${idx}`} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs font-semibold">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.supplier}</TableCell>
                  <TableCell className="text-right">{p.items} SKUs</TableCell>
                  <TableCell className="text-right font-semibold">{restaurantInfo.currency}{Number(p.total).toFixed(2)}</TableCell>
                  <TableCell className="text-xs">{p.date}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPO(p)}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Purchase Order View Modal Dialog */}
      <Dialog open={Boolean(selectedPO)} onOpenChange={(open) => !open && setSelectedPO(null)}>
        {selectedPO && (
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Purchase Order {selectedPO.id}</span>
                <StatusBadge status={selectedPO.status} />
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm rounded-xl bg-muted/40 p-3">
                <div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Supplier
                  </span>
                  <div className="font-bold mt-0.5">{selectedPO.supplier}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Date Placed
                  </span>
                  <div className="font-medium text-xs mt-0.5">{selectedPO.date}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Item Count</span>
                  <div className="font-semibold">{selectedPO.items} SKUs</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Order Total</span>
                  <div className="font-bold text-primary">{restaurantInfo.currency}{Number(selectedPO.total).toFixed(2)}</div>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Breakdown</h4>
                <div className="space-y-2 text-sm bg-card rounded-lg border p-3">
                  <div className="flex justify-between border-b pb-1 text-xs text-muted-foreground">
                    <span>Description</span>
                    <span>Subtotal</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span>Bulk Raw Food Ingredients ({selectedPO.items} items)</span>
                    <span>{restaurantInfo.currency}{(Number(selectedPO.total) * 0.92).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span>Logistics & Freight Fee</span>
                    <span>{restaurantInfo.currency}{(Number(selectedPO.total) * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-sm">
                    <span>Committed Total</span>
                    <span className="text-primary">{restaurantInfo.currency}{Number(selectedPO.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelectedPO(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}