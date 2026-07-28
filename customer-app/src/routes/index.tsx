import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { QrCode, Sparkles, ArrowRight, MapPin, Clock, Star, Utensils, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { restaurant, offers, foods } from "@/lib/mock-data";
import { FoodCard } from "@/components/food-card";
import { tableStore, useTable } from "@/lib/table-store";
import { getOrdersByTable, subscribeToAllOrders, type DbOrder } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  component: Welcome,
  head: () => ({
    meta: [
      { title: "Welcome · Ember & Oak" },
      { name: "description", content: "Scan the QR at your table and dive into a premium ordering experience." },
    ],
  }),
});

function Welcome() {
  const tableNumber = useTable();
  const [activeOrder, setActiveOrder] = useState<DbOrder | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};

    async function loadActiveOrder() {
      const orders = await getOrdersByTable(tableNumber);
      if (orders && orders.length > 0) {
        const latest = orders.find((o) => o.status !== "completed") || orders[0];
        setActiveOrder(latest);
      }

      unsubscribe = subscribeToAllOrders(tableNumber, (updated) => {
        setActiveOrder(updated);
      });
    }

    loadActiveOrder();
    return () => unsubscribe();
  }, [tableNumber]);

  const specials = foods.filter((f) => f.todaysSpecial).slice(0, 3);
  const popular = foods.filter((f) => f.popular).slice(0, 4);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 gradient-hero pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-float pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-float pointer-events-none" />

      <div className="relative">
        {/* Cover */}
        <div className="relative h-[42vh] md:h-[52vh] overflow-hidden">
          <img src={restaurant.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          >
            <div className="glass rounded-full px-4 py-1.5 text-xs font-medium flex items-center gap-2 mb-4">
              <QrCode className="h-3.5 w-3.5 text-primary" /> Verified · {tableNumber}
            </div>
            <div className="text-5xl mb-2">{restaurant.logo}</div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
              {restaurant.name}
            </h1>
            <p className="text-white/85 text-sm md:text-base mt-2">{restaurant.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/85">
              <span className="flex items-center gap-1 glass rounded-full px-3 py-1"><MapPin className="h-3 w-3" />{restaurant.branch}</span>
              <span className="flex items-center gap-1 glass rounded-full px-3 py-1"><Clock className="h-3 w-3" />{restaurant.timings}</span>
              <span className="flex items-center gap-1 glass rounded-full px-3 py-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />4.8 · 2.1k</span>
            </div>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-14 relative pb-32 md:pb-16">
          {/* Quick start card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass shadow-glass rounded-3xl p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Welcome
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold mt-1">
                  {tableNumber} is ready for you.
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse the menu, customise dishes and pay — all from your phone.
                </p>
              </div>
              <Link
                to="/menu"
                className="group inline-flex items-center gap-2 rounded-full gradient-primary text-white font-semibold px-6 py-4 shadow-float"
              >
                Start ordering
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Active Live Order Tracker Widget */}
            {activeOrder && (
              <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-primary/5 rounded-2xl p-4 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl gradient-primary text-white grid place-items-center shrink-0">
                    <Utensils className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-primary uppercase tracking-wider">Live Order Status</div>
                    <div className="font-bold text-sm">
                      Order {activeOrder.order_number} · <span className="capitalize text-emerald-600">{activeOrder.status}</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/track"
                  search={{ orderId: activeOrder.id }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  View Details & Stage Progress <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </motion.div>

          {/* Offers */}
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {offers.map((o) => (
              <motion.div
                key={o.id}
                whileHover={{ y: -2 }}
                className={`${o.color} rounded-2xl p-5 text-white shadow-float relative overflow-hidden`}
              >
                <div className="absolute -right-6 -bottom-6 text-9xl opacity-10">%</div>
                <div className="text-xs font-medium opacity-90">Limited offer</div>
                <div className="font-display text-xl font-bold mt-1">{o.title}</div>
                <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs font-mono">
                  Code · {o.code}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Today's specials */}
          <SectionHeader title="Today's Special" href="/menu" />
          <div className="grid gap-4 md:grid-cols-3">
            {specials.map((f) => <FoodCard key={f.id} food={f} />)}
          </div>

          {/* Popular */}
          <SectionHeader title="Popular now" href="/menu" />
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {popular.map((f) => <FoodCard key={f.id} food={f} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-end justify-between mt-10 mb-4">
      <h3 className="font-display text-xl md:text-2xl font-bold">{title}</h3>
      <Link to={href} className="text-xs font-semibold text-primary flex items-center gap-1">
        See all <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
