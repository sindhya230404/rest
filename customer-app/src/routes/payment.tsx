import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Wallet, Smartphone, CreditCard, Banknote, CheckCircle2, XCircle, Loader2, Download } from "lucide-react";
import { CustomerNav } from "@/components/customer-nav";
import { cart } from "@/lib/cart-store";
import { getOrderById, updateOrderPayment, type DbOrder } from "@/lib/supabase";
import { toast } from "sonner";

const methods = [
  { id: "upi", label: "UPI", icon: Smartphone, sub: "Pay via GPay, PhonePe, Paytm" },
  { id: "card", label: "Card", icon: CreditCard, sub: "Credit / Debit card" },
  { id: "razor", label: "Razorpay", icon: Wallet, sub: "One-tap secure checkout" },
  { id: "cash", label: "Cash", icon: Banknote, sub: "Pay at counter" },
];

export const Route = createFileRoute("/payment")({ component: Payment });

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Payment() {
  const search = useSearch({ strict: false }) as { orderId?: string };
  const activeId = search.orderId || cart.getActiveOrderId();

  const [order, setOrder] = useState<DbOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState("upi");
  const [state, setState] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const nav = useNavigate();

  useEffect(() => {
    async function load() {
      if (!activeId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await getOrderById(activeId);
      setOrder(data);
      setLoading(false);
    }
    load();
  }, [activeId]);

  const pay = async () => {
    const totalAmount = order?.total ?? 1617;
    const orderNum = order?.order_number ?? "#4821";

    if (sel === "cash") {
      setState("processing");
      const payMethodName = "Cash at Counter";
      if (order) {
        await updateOrderPayment(order.id, payMethodName);
        setOrder((prev) => (prev ? { ...prev, payment_status: "paid", payment_method: payMethodName } : null));
      }
      setState("success");
      toast.success("Order marked for cash payment at counter.");
      return;
    }

    // Razorpay Integration
    setState("processing");
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      toast.error("Failed to load Razorpay Payment Gateway. Check your internet connection.");
      setState("failed");
      return;
    }

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TI7XNrxQP5GRTJ";

    const options = {
      key: keyId,
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      name: "Ember & Oak Restaurant",
      description: `Payment for Order ${orderNum}`,
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80",
      handler: async function (response: any) {
        const paymentId = response.razorpay_payment_id || "PAY_" + Date.now();
        const payMethodName = `Razorpay (${sel.toUpperCase()} - ${paymentId})`;

        if (order) {
          await updateOrderPayment(order.id, payMethodName);
          setOrder((prev) => (prev ? { ...prev, payment_status: "paid", payment_method: payMethodName } : null));
        }

        setState("success");
        toast.success(`Payment Successful! Transaction ID: ${paymentId}`);
      },
      prefill: {
        name: "Customer Guest",
        email: "customer@emberandoak.com",
        contact: "9876543210",
      },
      theme: {
        color: "#ea580c",
      },
      modal: {
        ondismiss: function () {
          setState("idle");
          toast.info("Payment window closed");
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        console.error("Razorpay failure:", response);
        setState("failed");
        toast.error(`Payment Failed: ${response.error?.description || "Transaction declined"}`);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setState("failed");
      toast.error("Error opening Razorpay checkout window.");
    }
  };

  const invoiceItems = order?.items || [
    { id: "1", name: "Truffle Mushroom Risotto", qty: 1, price: 480 },
    { id: "2", name: "Wagyu Smash Burger", qty: 1, price: 620 },
    { id: "3", name: "Iced Matcha Latte", qty: 2, price: 220 },
  ];

  const subtotal = order?.subtotal ?? 1540;
  const gst = order?.gst ?? 77;
  const total = order?.total ?? 1617;
  const tableName = order?.table_number ?? "Table 12";
  const orderNum = order?.order_number ?? "#4821";

  return (
    <div className="min-h-screen bg-background pb-32">
      <CustomerNav />
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Checkout</div>
        <h1 className="font-display text-3xl md:text-4xl font-bold">Payment</h1>

        {loading ? (
          <div className="mt-12 text-center py-16 glass rounded-3xl">
            <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-3" />
            <div className="font-semibold text-sm">Loading Order Invoice...</div>
          </div>
        ) : (
          <div className="mt-6 grid md:grid-cols-[1fr_320px] gap-6">
            <div>
              <div className="grid sm:grid-cols-2 gap-3">
                {methods.map((m) => {
                  const on = sel === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSel(m.id)}
                      className={`relative text-left rounded-2xl border p-4 bg-card transition ${on ? "border-primary shadow-float" : ""}`}
                    >
                      {on && <motion.span layoutId="pay-glow" className="absolute inset-0 rounded-2xl ring-2 ring-primary/40 pointer-events-none" />}
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl grid place-items-center ${on ? "gradient-primary text-white" : "bg-muted"}`}>
                          <m.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{m.label}</div>
                          <div className="text-xs text-muted-foreground">{m.sub}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-3xl border bg-card p-5">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Invoice details</div>
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span className="text-muted-foreground">{item.name} × {item.qty}</span>
                    <span>₹{item.price * item.qty}</span>
                  </div>
                ))}
                <div className="h-px bg-border my-3" />
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST 5%</span><span>₹{gst}</span></div>
                <div className="flex justify-between mt-2 font-bold"><span>Total</span><span className="text-gradient font-display text-lg">₹{total}</span></div>
                {order?.payment_status === "paid" && (
                  <div className="mt-3 bg-emerald-500/10 text-emerald-600 rounded-xl p-2.5 text-xs text-center font-semibold">
                    ✓ Paid via {order.payment_method?.toUpperCase() || "ONLINE"}
                  </div>
                )}
                <button className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary">
                  <Download className="h-3.5 w-3.5" /> Download invoice PDF
                </button>
              </div>
            </div>

            <div className="glass rounded-3xl p-5 h-fit shadow-glass sticky top-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Amount</div>
              <div className="text-4xl font-display font-bold text-gradient">₹{total}</div>
              <div className="text-xs text-muted-foreground mt-1">{tableName} · Order {orderNum}</div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={pay}
                disabled={state === "processing" || order?.payment_status === "paid"}
                className="mt-4 w-full rounded-2xl gradient-primary text-white font-semibold py-4 shadow-float disabled:opacity-75"
              >
                {order?.payment_status === "paid"
                  ? "Already Paid"
                  : state === "processing"
                  ? "Processing…"
                  : `Pay ₹${total}`}
              </motion.button>
              <div className="mt-3 text-[10px] text-muted-foreground text-center">Secured with 256-bit encryption</div>
            </div>
          </div>
        )}
      </div>

      {/* Status overlay */}
      <AnimatePresence>
        {state !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass rounded-3xl p-8 text-center max-w-sm w-full shadow-glass"
            >
              {state === "processing" && (
                <>
                  <Loader2 className="h-14 w-14 mx-auto text-primary animate-spin" />
                  <div className="font-display text-xl font-bold mt-4">Processing payment…</div>
                  <div className="text-xs text-muted-foreground">Updating Supabase DB</div>
                </>
              )}
              {state === "success" && (
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-500" />
                  </motion.div>
                  <div className="font-display text-xl font-bold mt-4">Payment successful</div>
                  <div className="text-xs text-muted-foreground mt-1">₹{total} paid via {sel.toUpperCase()}</div>
                  <div className="mt-5 flex gap-2 justify-center">
                    <button onClick={() => nav({ to: "/feedback" })} className="rounded-full gradient-primary text-white text-sm font-semibold px-4 py-2">Rate your meal</button>
                    <button onClick={() => setState("idle")} className="rounded-full border text-sm font-semibold px-4 py-2">Close</button>
                  </div>
                </>
              )}
              {state === "failed" && (
                <>
                  <XCircle className="h-14 w-14 mx-auto text-destructive" />
                  <div className="font-display text-xl font-bold mt-4">Payment failed</div>
                  <div className="text-xs text-muted-foreground mt-1">Please try another method</div>
                  <button onClick={() => setState("idle")} className="mt-5 rounded-full gradient-primary text-white text-sm font-semibold px-6 py-2">Try again</button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
