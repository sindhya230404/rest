import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/admin/components/layout/PageHeader";
import { StatusBadge } from "@/admin/components/layout/StatusBadge";
import { Card } from "@/admin/components/ui/card";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Switch } from "@/admin/components/ui/switch";
import { Salad, Search, Timer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { foodItems as mockFoodItems, restaurantInfo } from "@/admin/lib/mock-data";
import { useState } from "react";
import { useSupabaseTable, type MenuItem } from "@/hooks/useSupabaseData";

export const Route = createFileRoute("/admin/_app/menu/items")({
  head: () => ({ meta: [{ title: "Food Items — ScanDine" }, { name: "description", content: "Manage every dish on your menu." }] }),
  component: ItemsPage,
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

function ItemsPage() {
  const { data: dbMenuItems, updateItem, deleteItem } = useSupabaseTable<MenuItem>("menu_items", defaultFormattedFoodItems);
  const [searchQuery, setSearchQuery] = useState("");

  const itemsList = dbMenuItems;

  const filtered = itemsList.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.description && f.description.toLowerCase().includes(q))
    );
  });

  const handleToggleAvailable = async (id: string, currentVal: boolean) => {
    try {
      await updateItem(id, { available: !currentVal });
      toast.success(!currentVal ? "Item marked as available" : "Item marked as unavailable");
    } catch (err) {
      console.error("Failed to update availability:", err);
      toast.error("Failed to update availability");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      toast.success("Food item deleted successfully");
    } catch (err) {
      console.error("Failed to delete menu item:", err);
      toast.error("Failed to delete food item");
    }
  };

  return (
    <div>
      <PageHeader
        title="All food items"
        description={`${itemsList.length} dishes available on your menu`}
        icon={<Salad className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" size="sm">Bulk edit</Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search dishes…"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((f) => (
          <Card key={f.id} className="group overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-red-100 text-7xl overflow-hidden">
              <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
              {!f.available && <div className="absolute inset-0 grid place-items-center bg-black/50 text-white"><StatusBadge status="expired" /></div>}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-display text-base font-bold">{f.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-bold text-primary">{restaurantInfo.currency}{Number(f.price).toFixed(2)}</div>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{f.description}</p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{f.preparation_time || 15}m</span>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t pt-3">
                <Switch
                  checked={f.available}
                  onCheckedChange={() => handleToggleAvailable(f.id, f.available)}
                  className="scale-90"
                />
                <span className="text-xs text-muted-foreground">Available</span>
                <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-destructive" onClick={() => handleDelete(f.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
