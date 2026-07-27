import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/reception/components/layout/PageHeader";
import { Card } from "@/reception/components/ui/card";
import { Button } from "@/reception/components/ui/button";
import { Input } from "@/reception/components/ui/input";
import { Label } from "@/reception/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/reception/components/ui/select";
import { Avatar, AvatarFallback } from "@/reception/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/reception/components/ui/dialog";
import { Truck, Plus, Phone, Mail, MapPin, ShoppingCart, CheckCircle2, Edit3, Settings } from "lucide-react";
import { suppliers as mockSuppliersRaw, restaurantInfo } from "@/reception/lib/mock-data";
import { useSupabaseTable, type Supplier } from "@/hooks/useSupabaseData";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/reception/_app/inventory/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers — ScanDine" }, { name: "description", content: "Supplier directory and relationships." }] }),
  component: SuppliersPage,
});

const defaultSuppliers: Supplier[] = mockSuppliersRaw.map((s) => ({
  id: s.id,
  name: s.name,
  phone: s.phone,
  email: `${s.name.toLowerCase().replace(/\s+/g, "")}@supplier.com`,
  address: "Central Distribution Center, Block B",
  sku_count: s.items || 12,
  vendor_status: "Active Vendor",
}));

function SuppliersPage() {
  const { data: dbSuppliers, addItem, updateItem } = useSupabaseTable<Supplier>("suppliers", defaultSuppliers);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedContactSupplier, setSelectedContactSupplier] = useState<Supplier | null>(null);
  const [selectedOrderSupplier, setSelectedOrderSupplier] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // New Supplier form state
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [skuCount, setSkuCount] = useState("12");
  const [vendorStatus, setVendorStatus] = useState("Active Vendor");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editSkuCount, setEditSkuCount] = useState("12");
  const [editVendorStatus, setEditVendorStatus] = useState("Active Vendor");

  // Order modal state
  const [orderItem, setOrderItem] = useState("Fresh Vegetables & Ingredients");
  const [orderQty, setOrderQty] = useState("50 kg");

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a supplier name");
      return;
    }
    try {
      await addItem({
        name: name.trim(),
        phone: phone || "+91 98765 00000",
        email: email || `${name.toLowerCase().replace(/\s+/g, "")}@supplier.com`,
        address: address || "City Logistics Hub, Sector 4",
        sku_count: Number(skuCount) || 12,
        vendor_status: vendorStatus,
      });
      toast.success("Supplier added successfully!");
      setName("");
      setContactPerson("");
      setPhone("");
      setEmail("");
      setAddress("");
      setSkuCount("12");
      setVendorStatus("Active Vendor");
      setIsAddOpen(false);
    } catch (err) {
      console.error("Failed to add supplier:", err);
      toast.error("Failed to add supplier");
    }
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setEditName(s.name);
    setEditPhone(s.phone);
    setEditEmail(s.email || "");
    setEditAddress(s.address || "");
    setEditSkuCount(String(s.sku_count || 12));
    setEditVendorStatus(s.vendor_status || "Active Vendor");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    try {
      await updateItem(editingSupplier.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
        address: editAddress.trim(),
        sku_count: Number(editSkuCount) || 12,
        vendor_status: editVendorStatus,
      });
      toast.success(`Supplier ${editName} updated successfully!`);
      setEditingSupplier(null);
    } catch (err) {
      console.error("Failed to update supplier:", err);
      toast.error("Failed to update supplier");
    }
  };

  const handleSendOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderSupplier) return;
    toast.success(`Purchase order for ${orderQty} of ${orderItem} sent to ${selectedOrderSupplier.name}! 📦`);
    setSelectedOrderSupplier(null);
  };

  const suppliersList = dbSuppliers.length > 0 ? dbSuppliers : defaultSuppliers;

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description={`${suppliersList.length} trusted vendors supplying your kitchen`}
        icon={<Truck className="h-5 w-5" />}
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />New supplier</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSupplier} className="space-y-4 mt-2">
                <div className="space-y-1">
                  <Label htmlFor="sup-name">Supplier Name *</Label>
                  <Input
                    id="sup-name"
                    required
                    placeholder="e.g. Fresh Farm Produce"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="sup-phone">Phone Number</Label>
                    <Input
                      id="sup-phone"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sup-email">Email Address</Label>
                    <Input
                      id="sup-email"
                      type="email"
                      placeholder="orders@supplier.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="sup-skus">Supplied SKU Units</Label>
                    <Input
                      id="sup-skus"
                      type="number"
                      placeholder="12"
                      value={skuCount}
                      onChange={(e) => setSkuCount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Vendor Status</Label>
                    <Select value={vendorStatus} onValueChange={setVendorStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active Vendor">Active Vendor</SelectItem>
                        <SelectItem value="Preferred Partner">Preferred Partner</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sup-address">Address</Label>
                  <Input
                    id="sup-address"
                    placeholder="123 Warehouse Row, Sector 5"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Supplier</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {suppliersList.map((s, idx) => (
          <Card key={`${s.id}-${idx}`} className="p-5 relative group">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => handleOpenEdit(s)}
              title="Edit Supplier Details"
            >
              <Edit3 className="h-4 w-4" />
            </Button>

            <div className="flex items-start gap-3 pr-6">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 font-display font-bold text-primary">
                  {s.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display font-bold text-base">{s.name}</div>
                <div className="text-xs text-muted-foreground truncate">{s.email || "orders@supplier.com"}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />{s.phone}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-xs">
              <div>
                <div className="text-muted-foreground">Items supplied</div>
                <div className="mt-0.5 font-display text-lg font-bold">{s.sku_count || 12} SKUs</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <div className="mt-0.5 font-semibold text-emerald-600">
                  {s.vendor_status || "Active Vendor"}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setSelectedContactSupplier(s)}
              >
                Contact
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => setSelectedOrderSupplier(s)}
              >
                Order
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Supplier Modal Dialog */}
      <Dialog open={Boolean(editingSupplier)} onOpenChange={(open) => !open && setEditingSupplier(null)}>
        {editingSupplier && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Edit Supplier — {editingSupplier.name}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label>Supplier Name *</Label>
                <Input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Phone Number</Label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>SKU Units Supplied</Label>
                  <Input
                    type="number"
                    value={editSkuCount}
                    onChange={(e) => setEditSkuCount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Vendor Status</Label>
                  <Select value={editVendorStatus} onValueChange={setEditVendorStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active Vendor">Active Vendor</SelectItem>
                      <SelectItem value="Preferred Partner">Preferred Partner</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Address</Label>
                <Input
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setEditingSupplier(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>

      {/* Supplier Contact Modal Dialog */}
      <Dialog open={Boolean(selectedContactSupplier)} onOpenChange={(open) => !open && setSelectedContactSupplier(null)}>
        {selectedContactSupplier && (
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Contact {selectedContactSupplier.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-xl bg-muted/50 p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Supplier</span>
                  <span className="font-bold">{selectedContactSupplier.name}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-xs text-muted-foreground">Phone</span>
                  <span className="font-mono text-xs font-semibold">{selectedContactSupplier.phone}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <span className="text-xs">{selectedContactSupplier.email || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-xs text-muted-foreground">Address</span>
                  <span className="text-xs">{selectedContactSupplier.address || "Main Warehouse"}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedContactSupplier.phone);
                    toast.success("Phone number copied to clipboard!");
                  }}
                >
                  Copy Phone Number
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Purchase Order Placement Dialog */}
      <Dialog open={Boolean(selectedOrderSupplier)} onOpenChange={(open) => !open && setSelectedOrderSupplier(null)}>
        {selectedOrderSupplier && (
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Place Purchase Order with {selectedOrderSupplier.name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSendOrder} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Item Description</Label>
                <Input
                  value={orderItem}
                  onChange={(e) => setOrderItem(e.target.value)}
                  placeholder="e.g. Fresh Cheese & Dairy"
                />
              </div>

              <div className="space-y-1">
                <Label>Quantity & Unit</Label>
                <Input
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  placeholder="e.g. 50 kg"
                />
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                Order will be dispatched immediately to vendor email: <span className="font-semibold text-foreground">{selectedOrderSupplier.email || "orders@supplier.com"}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setSelectedOrderSupplier(null)}>Cancel</Button>
                <Button type="submit">Submit Purchase Order</Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}