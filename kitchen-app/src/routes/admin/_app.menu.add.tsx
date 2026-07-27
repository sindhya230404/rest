import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/admin/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/admin/components/ui/card";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { Textarea } from "@/admin/components/ui/textarea";
import { Switch } from "@/admin/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/admin/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/admin/components/ui/radio-group";
import { Checkbox } from "@/admin/components/ui/checkbox";
import { Badge } from "@/admin/components/ui/badge";
import { PlusSquare, Upload, Image as ImageIcon, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { foodItems as mockFoodItems } from "@/admin/lib/mock-data";
import { useSupabaseTable, type MenuItem } from "@/hooks/useSupabaseData";

export const Route = createFileRoute("/admin/_app/menu/add")({
  head: () => ({ meta: [{ title: "Add Menu Item — ScanDine" }, { name: "description", content: "Add a new dish to your menu." }] }),
  component: AddItemPage,
});

const defaultFormattedFoodItems: MenuItem[] = mockFoodItems.map((m) => ({
  id: m.id,
  name: m.name,
  description: m.description,
  image: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&auto=format&fit=crop",
  price: m.price,
  available: m.available,
  preparation_time: m.prepTime,
}));

function AddItemPage() {
  const navigate = useNavigate();
  const { addItem } = useSupabaseTable<MenuItem>("menu_items", defaultFormattedFoodItems);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("350.00");
  const [preparationTime, setPreparationTime] = useState("15");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&auto=format&fit=crop");
  const [available, setAvailable] = useState(true);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter item name");
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    try {
      await addItem({
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        preparation_time: parseInt(preparationTime, 10) || 15,
        image: image || "https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&auto=format&fit=crop",
        available,
      });
      toast.success("Food item published successfully!");
      navigate({ to: "/admin/menu/items" });
    } catch (err) {
      console.error("Failed to publish menu item:", err);
      toast.error("Failed to publish food item");
    }
  };

  return (
    <div>
      <PageHeader
        title="Add new item"
        description="Create a dish with pricing, add-ons, availability and imagery."
        icon={<PlusSquare className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/menu/items" })}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit}>Publish item</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Basic information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Item name</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Truffle Mushroom Pizza" />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your dish — ingredients, taste, serving style…" rows={4} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Preparation time (min)</Label>
                  <Input type="number" value={preparationTime} onChange={(e) => setPreparationTime(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Serving size</Label>
                  <Input placeholder="e.g. 1 plate" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Pricing & variants</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label>Base price (₹)</Label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <Label>Cost price (₹)</Label>
                  <Input type="number" placeholder="0.00" defaultValue="120.00" />
                </div>
                <div className="grid gap-2">
                  <Label>Tax rate</Label>
                  <Select defaultValue="8">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Exempt</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="8">8%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Item image</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label>Image URL</Label>
                <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://images.unsplash.com/..." />
              </div>
              <div className="mt-3 aspect-video overflow-hidden rounded-lg border bg-muted">
                <img src={image} alt="Preview" className="h-full w-full object-cover" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Visibility</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Available now</div>
                  <div className="text-xs text-muted-foreground">Show on QR menu</div>
                </div>
                <Switch checked={available} onCheckedChange={setAvailable} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
