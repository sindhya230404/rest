import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/kitchen/components/layout/PageHeader";
import { Card, CardContent } from "@/kitchen/components/ui/card";
import { Button } from "@/kitchen/components/ui/button";
import { Input } from "@/kitchen/components/ui/input";
import { Switch } from "@/kitchen/components/ui/switch";
import { Badge } from "@/kitchen/components/ui/badge";
import { UtensilsCrossed, Plus, Search, Trash2, Clock } from "lucide-react";
import { foodItems as mockFoodItems, restaurantInfo } from "@/kitchen/lib/mock-data";
import { useState } from "react";
import { useSupabaseTable, type MenuItem } from "@/hooks/useSupabaseData";
import { toast } from "sonner";

export const Route = createFileRoute("/kitchen/_app/menu/items")({
  head: () => ({ meta: [{ title: "Food Items — Kitchen" }, { name: "description", content: "Manage menu items availability." }] }),
  component: KitchenItemsPage,
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

function KitchenItemsPage() {
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
        title="Food items"
        description="Manage kitchen menu dishes and live availability."
        icon={<UtensilsCrossed className="h-5 w-5" />}
        actions={
          <Button asChild size="sm">
            <Link to="/kitchen/menu/add">
              <Plus className="mr-2 h-4 w-4" />
              Add new item
            </Link>
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search food items…"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <Card key={item.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <div className="relative h-40 w-full overflow-hidden bg-muted">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
              )}
              <div className="absolute right-2 top-2">
                <Badge variant={item.available ? "default" : "secondary"}>
                  {item.available ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-primary">{restaurantInfo.currency}{item.price}</span>
                {item.preparation_time && (
                  <span className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {item.preparation_time}m
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.available}
                    onCheckedChange={() => handleToggleAvailable(item.id, item.available)}
                  />
                  <span className="text-xs text-muted-foreground">Available</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
