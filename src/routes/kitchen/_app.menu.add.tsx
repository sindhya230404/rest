import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/kitchen/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/kitchen/components/ui/card";
import { Button } from "@/kitchen/components/ui/button";
import { Input } from "@/kitchen/components/ui/input";
import { Label } from "@/kitchen/components/ui/label";
import { Textarea } from "@/kitchen/components/ui/textarea";
import { Switch } from "@/kitchen/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/kitchen/components/ui/select";
import { PlusSquare, Upload, Image as ImageIcon, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { foodItems as mockFoodItems } from "@/kitchen/lib/mock-data";
import { useSupabaseTable, type MenuItem } from "@/hooks/useSupabaseData";

export const Route = createFileRoute("/kitchen/_app/menu/add")({
  head: () => ({ meta: [{ title: "Add Menu Item — Kitchen" }, { name: "description", content: "Add a new dish to the kitchen menu." }] }),
  component: KitchenAddItemPage,
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

function KitchenAddItemPage() {
  const navigate = useNavigate();
  const { addItem } = useSupabaseTable<MenuItem>("menu_items", defaultFormattedFoodItems);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [preparationTime, setPreparationTime] = useState("15");
  const [category, setCategory] = useState("mains");
  const [available, setAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&auto=format&fit=crop");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a food item name");
      return;
    }
    if (!price || isNaN(Number(price))) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      await addItem({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        preparation_time: Number(preparationTime) || 15,
        category: category,
        available: available,
        image: imageUrl || "https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&auto=format&fit=crop",
      });

      toast.success("Food item published successfully!");
      navigate({ to: "/kitchen/menu/items" });
    } catch (err) {
      console.error("Failed to publish menu item:", err);
      toast.error("Failed to publish food item");
    }
  };

  return (
    <div>
      <PageHeader
        title="Add menu item"
        description="Create a new dish for your restaurant menu."
        icon={<PlusSquare className="h-5 w-5" />}
        actions={
          <Button size="sm" onClick={handleSubmit}>
            Publish item
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Basic details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item name *</Label>
                <Input
                  id="item-name"
                  placeholder="e.g. Truffle Mushroom Risotto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe ingredients, flavor profile, dietary callouts..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Pricing & Timing</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Base price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="24.50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prep-time">Est. prep time (minutes)</Label>
                <Input
                  id="prep-time"
                  type="number"
                  placeholder="15"
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Item image URL</Label>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              {imageUrl && (
                <div className="relative h-48 w-full overflow-hidden rounded-lg border bg-muted">
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7"
                    onClick={() => setImageUrl("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Category & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starters">Starters</SelectItem>
                    <SelectItem value="mains">Main Courses</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <div className="font-medium text-sm">Available immediately</div>
                  <div className="text-xs text-muted-foreground">Show in menu right after publishing</div>
                </div>
                <Switch checked={available} onCheckedChange={setAvailable} />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
