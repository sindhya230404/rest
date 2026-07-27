import { createFileRoute, Link } from "@tanstack/react-router";
import { CustomerNav } from "@/components/customer-nav";
import { foods, restaurant } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Heart, History, MapPin, Phone, Clock, Moon, Sun, HelpCircle, Info, Globe, ChevronDown, Utensils, CheckCircle2, Circle } from "lucide-react";
import { tableStore } from "@/lib/table-store";
import { useTheme, themeStore } from "@/lib/theme-store";
import { useLanguage, languageStore, LANGUAGES, type Language } from "@/lib/language-store";
import { getOrdersByTable, subscribeToAllOrders, type DbOrder } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ component: Profile });

const FAQ_ITEMS = [
  {
    q: "How does ordering from QR work?",
    a: "Scanning your table's QR code connects your browser to that table. When you add items to your cart and place an order, it is immediately sent to the kitchen display in real time.",
  },
  {
    q: "How will I know when my food is ready?",
    a: "You can track the live progress under 'My Orders' or the Track tab. When the kitchen updates the status to 'Ready', you will get an instant notification alert on your screen.",
  },
  {
    q: "How do I request a waiter, water, or tissues?",
    a: "Go to the 'Serve' tab in the bottom navigation. Tap any service button like 'Call Waiter' or 'Need Water' to notify staff immediately.",
  },
  {
    q: "Which payment options are supported?",
    a: "We support UPI (GPay, PhonePe, Paytm), Credit & Debit Cards, Razorpay online checkout, and Cash at the counter.",
  },
  {
    q: "How is GST calculated on my bill?",
    a: "A standard 5% GST is applied to food items as per government restaurant guidelines.",
  },
];

function Profile() {
  const tableNumber = tableStore.getTableNumber();
  const theme = useTheme();
  const lang = useLanguage();

  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [langModalOpen, setLangModalOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};

    async function loadTableOrders() {
      setLoadingOrders(true);
      const data = await getOrdersByTable(tableNumber);
      setOrders(data);
      setLoadingOrders(false);

      unsubscribe = subscribeToAllOrders(tableNumber, (updatedOrder) => {
        setOrders((prev) => {
          const exists = prev.some((o) => o.id === updatedOrder.id);
          if (exists) {
            return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
          }
          return [updatedOrder, ...prev];
        });
      });
    }

    loadTableOrders();
    return () => unsubscribe();
  }, [tableNumber]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <CustomerNav />
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6">
        {/* Header Profile Card */}
        <div className="glass rounded-3xl p-6 shadow-glass flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl gradient-accent grid place-items-center text-white text-2xl font-bold">
            {tableNumber.replace(/\D/g, "") || "1"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl font-bold">{tableNumber} Guest</div>
            <div className="text-xs text-muted-foreground">Dining at {restaurant.name} · {restaurant.branch}</div>
          </div>
          <button
            onClick={() => themeStore.toggleTheme()}
            className="rounded-full border p-2.5 text-xs font-semibold hover:bg-muted"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
        </div>

        {/* Live My Orders Stage Tracker */}
        <Section title="My Orders & Live Kitchen Status" icon={<Utensils className="h-4 w-4" />}>
          {loadingOrders ? (
            <div className="text-center py-6 glass rounded-2xl text-xs text-muted-foreground">
              Syncing active table orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 glass rounded-2xl border">
              <Utensils className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
              <div className="font-semibold text-sm">No active orders yet</div>
              <div className="text-xs text-muted-foreground mt-0.5">Explore the menu and place your first order!</div>
              <Link to="/menu" className="mt-3 inline-flex rounded-full gradient-primary text-white text-xs font-semibold px-4 py-2">
                View Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="glass rounded-2xl p-4 border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">Order {o.order_number}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.items.length} items · ₹{o.total} · {o.payment_status === "paid" ? "✓ Paid" : "Unpaid"}
                      </div>
                    </div>
                    <Link
                      to="/track"
                      search={{ orderId: o.id }}
                      className="rounded-full gradient-primary text-white text-xs font-semibold px-3 py-1.5 shadow-sm"
                    >
                      Track Live
                    </Link>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="pt-2 border-t flex items-center justify-between text-[11px]">
                    {[
                      { key: "pending", label: "Received" },
                      { key: "preparing", label: "Preparing" },
                      { key: "ready", label: "Ready" },
                      { key: "completed", label: "Served" },
                    ].map((step, idx) => {
                      const stages = ["pending", "received", "accepted", "preparing", "ready", "served", "completed"];
                      const currentIdx = stages.indexOf(o.status);
                      const stepIdx = stages.indexOf(step.key);
                      const isDone = currentIdx >= stepIdx;

                      return (
                        <div key={step.key} className="flex flex-col items-center gap-1 text-center">
                          <div
                            className={`h-6 w-6 rounded-full grid place-items-center text-xs ${
                              isDone ? "gradient-primary text-white font-bold" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isDone ? "✓" : idx + 1}
                          </div>
                          <span className={`text-[10px] ${isDone ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Preferences: Language, Theme, FAQ */}
        <Section title="Preferences & Help" icon={<Globe className="h-4 w-4" />}>
          <div className="grid gap-2">
            <button
              onClick={() => setLangModalOpen(true)}
              className="w-full text-left rounded-2xl border bg-card p-4 flex items-center gap-3 text-sm hover:border-primary/40 transition"
            >
              <Globe className="h-4 w-4 text-primary" />
              <span className="flex-1">Language · {lang.flag} {lang.name}</span>
              <span className="text-xs font-semibold text-primary">Change</span>
            </button>

            <button
              onClick={() => themeStore.toggleTheme()}
              className="w-full text-left rounded-2xl border bg-card p-4 flex items-center gap-3 text-sm hover:border-primary/40 transition"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-primary" />}
              <span className="flex-1">Theme Mode</span>
              <span className="text-xs font-semibold capitalize bg-muted px-3 py-1 rounded-full">{theme}</span>
            </button>

            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="p-4 flex items-center gap-3 text-sm font-semibold border-b bg-muted/30">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span>Help & Frequently Asked Questions</span>
              </div>
              <div className="divide-y">
                {FAQ_ITEMS.map((item, idx) => {
                  const open = faqOpen === idx;
                  return (
                    <div key={idx} className="p-3.5">
                      <button
                        onClick={() => setFaqOpen(open ? null : idx)}
                        className="w-full text-left flex items-center justify-between text-xs font-semibold"
                      >
                        <span>{item.q}</span>
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180 text-primary" : ""}`} />
                      </button>
                      {open && <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.a}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* Restaurant Info */}
        <Section title="About Restaurant" icon={<Info className="h-4 w-4" />}>
          <div className="grid gap-2">
            <Item icon={<MapPin className="h-4 w-4" />} label={restaurant.address} />
            <Item icon={<Clock className="h-4 w-4" />} label={restaurant.timings} />
            <Item icon={<Phone className="h-4 w-4" />} label={restaurant.phone} />
          </div>
        </Section>
      </div>

      {/* Language Selection Modal */}
      <AnimatePresence>
        {langModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass rounded-3xl p-6 max-w-sm w-full shadow-glass"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="font-display text-lg font-bold">Select Language</div>
                <button onClick={() => setLangModalOpen(false)} className="text-xs font-semibold text-muted-foreground">Close</button>
              </div>

              <div className="space-y-2">
                {LANGUAGES.map((l) => {
                  const isSel = lang.code === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => {
                        languageStore.setLanguage(l.code);
                        toast.success(`Language set to ${l.name}`);
                        setLangModalOpen(false);
                      }}
                      className={`w-full text-left rounded-2xl p-3 flex items-center justify-between border transition ${
                        isSel ? "border-primary bg-primary/10 font-bold" : "bg-card hover:bg-muted"
                      }`}
                    >
                      <span className="text-sm">{l.flag} {l.name} ({l.native})</span>
                      {isSel && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg gradient-primary text-white grid place-items-center">{icon}</div>
        <div className="font-display font-bold text-lg">{title}</div>
      </div>
      {children}
    </div>
  );
}

function Item({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 flex items-center gap-3 text-sm">
      <span className="text-primary">{icon}</span>
      <span className="flex-1">{label}</span>
    </div>
  );
}
