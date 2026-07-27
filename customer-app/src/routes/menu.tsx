import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Star } from "lucide-react";
import { motion } from "framer-motion";
import { CustomerNav } from "@/components/customer-nav";
import { FoodCard } from "@/components/food-card";
import { foods as mockFoods, categories, combos, type FoodItem } from "@/lib/mock-data";
import { fetchDbMenuItems, subscribeToMenuItems } from "@/lib/supabase";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/menu")({
  component: Menu,
  head: () => ({ meta: [{ title: "Menu · Ember & Oak" }] }),
});

function Menu() {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [itemList, setItemList] = useState<FoodItem[]>(mockFoods);

  useEffect(() => {
    async function loadMenu() {
      const dbItems = await fetchDbMenuItems();
      if (dbItems && dbItems.length > 0) {
        const mapped: FoodItem[] = dbItems.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || "Freshly prepared by our chef.",
          price: item.price,
          image: item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
          category: (item.category as any) || "Dinner",
          rating: 4.8,
          reviews: 120,
          veg: item.veg ?? true,
          prepTime: item.prepTime || 15,
          calories: 350,
          spiceLevel: 1,
          available: item.available ?? true,
          ingredients: ["Fresh Produce", "Herbs", "Olive Oil"],
        }));
        setItemList(mapped);
      }
    }

    loadMenu();
    const unsubscribe = subscribeToMenuItems(() => loadMenu());
    return () => unsubscribe();
  }, []);

  const list = useMemo(() => {
    return itemList.filter((f) => {
      if (cat !== "all" && f.category !== cat) return false;
      if (vegOnly && !f.veg) return false;
      if (q && !f.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [cat, q, vegOnly, itemList]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <CustomerNav />

      <div className="px-4 md:px-8 max-w-7xl mx-auto pt-6 md:pt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Explore</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">The menu</h1>
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes…" className="pl-9 rounded-full bg-card border" />
            </div>
            <button
              onClick={() => setVegOnly((v) => !v)}
              className={`shrink-0 h-10 rounded-full px-4 text-xs font-semibold border flex items-center gap-2 ${vegOnly ? "gradient-accent text-white border-transparent" : "bg-card"}`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> {vegOnly ? "Veg only" : "All"}
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="mt-6 flex overflow-x-auto no-scrollbar gap-2 pb-2">
          {categories.map((c) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`relative shrink-0 rounded-2xl border px-4 py-3 min-w-[92px] text-sm font-semibold flex flex-col items-center gap-1 ${active ? "text-white border-transparent" : "bg-card"}`}
              >
                {active && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-2xl gradient-primary" />}
                <span className="relative text-lg">{c.icon}</span>
                <span className="relative">{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Combos */}
        <h2 className="font-display text-xl font-bold mt-8 mb-3">Combo offers</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {combos.map((c) => (
            <motion.div key={c.id} whileHover={{ y: -3 }} className="relative overflow-hidden rounded-3xl shadow-float">
              <img src={c.image} className="h-40 w-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                <div className="text-[10px] font-bold uppercase tracking-widest bg-white/20 rounded-full px-2 py-0.5 w-fit">Save ₹{c.save}</div>
                <div className="font-display text-lg font-bold mt-1">{c.name}</div>
                <div className="text-xs opacity-90">{c.desc}</div>
                <div className="mt-1 font-bold">₹{c.price}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Grid */}
        <h2 className="font-display text-xl font-bold mt-10 mb-3">
          {cat === "all" ? "All dishes" : cat} <span className="text-sm text-muted-foreground font-normal">· {list.length} items</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((f) => <FoodCard key={f.id} food={f} />)}
        </div>
        {list.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-2">🍽️</div>
            <div className="font-semibold">No dishes match</div>
            <div className="text-xs text-muted-foreground">Try clearing filters or another category.</div>
          </div>
        )}
      </div>
    </div>
  );
}
