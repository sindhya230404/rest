import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/kitchen/components/layout/PageHeader";
import { StatusBadge } from "@/kitchen/components/layout/StatusBadge";
import { Card } from "@/kitchen/components/ui/card";
import { Button } from "@/kitchen/components/ui/button";
import { Checkbox } from "@/kitchen/components/ui/checkbox";
import { ChefHat, Clock, Timer, Flame, CheckCircle2 } from "lucide-react";
import { orders as mockOrders } from "@/kitchen/lib/mock-data";
import { useState, useCallback } from "react";
import { useSupabaseTable, type Order } from "@/hooks/useSupabaseData";
import { useRealtimeTable } from "@/hooks/useRealtime";

export const Route = createFileRoute("/kitchen/_app/kds")({
  head: () => ({ meta: [{ title: "Kitchen Display — ScanDine" }, { name: "description", content: "Kitchen Display System for real-time order preparation." }] }),
  component: KdsPage,
});

function KdsPage() {
  const { data: dbOrders, updateItem, fetchData } = useSupabaseTable<Order>("orders");

  const handleRealtimePayload = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useRealtimeTable("orders", handleRealtimePayload);

  const displayOrders = dbOrders.length > 0
    ? dbOrders
    : mockOrders.map((m) => ({
        id: m.id,
        order_id: m.id,
        customer: m.customer,
        table_number: m.table,
        item: m.items,
        total: m.total,
        status: m.status as Order["status"],
        payment: m.payment as Order["payment"],
        order_time: m.placedAt,
      }));

  const kitchenOrders = displayOrders.filter((o) => ["pending", "preparing", "ready"].includes(o.status));

  const handleAdvanceStatus = async (id: string, currentStatus: Order["status"]) => {
    let nextStatus: Order["status"] = "preparing";
    if (currentStatus === "pending") nextStatus = "preparing";
    else if (currentStatus === "preparing") nextStatus = "ready";
    else if (currentStatus === "ready") nextStatus = "completed";

    try {
      await updateItem(id, { status: nextStatus });
    } catch (err) {
      console.error("Failed to advance order status:", err);
    }
  };

  return (
    <div>
      <PageHeader
        title="Kitchen display"
        description="Live cooking queue with timers and priority flags."
        icon={<ChefHat className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" size="sm">Full screen</Button>
            <Button variant="outline" size="sm">Sound on</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Active orders", value: kitchenOrders.length, icon: <ChefHat className="h-4 w-4" />, tone: "text-primary" },
          { label: "Avg prep time", value: "14 min", icon: <Timer className="h-4 w-4" />, tone: "text-info" },
          { label: "Longest wait", value: "22 min", icon: <Clock className="h-4 w-4" />, tone: "text-warning" },
          { label: "Priority", value: kitchenOrders.filter(o => o.status === "pending").length, icon: <Flame className="h-4 w-4" />, tone: "text-destructive" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
              {s.label}
              <span className={s.tone}>{s.icon}</span>
            </div>
            <div className={`mt-1 font-display text-2xl font-bold ${s.tone}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kitchenOrders.map((o) => {
          const tone = o.status === "pending" ? "border-warning bg-warning/5" : o.status === "preparing" ? "border-info bg-info/5" : "border-primary bg-primary/5";
          const itemsArr = Array.isArray(o.item) ? o.item : [];
          return (
            <Card key={o.id} className={`overflow-hidden border-l-4 p-4 ${tone}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-display text-lg font-bold">T-{o.table_number}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{o.order_id || o.id} · {o.customer}</div>
                </div>
                <div className="text-right">
                  <StatusBadge status={o.status} />
                </div>
              </div>

              <div className="mt-3 space-y-1.5 border-t pt-3">
                {itemsArr.map((it, j) => (
                  <label key={j} className="flex items-start gap-2 rounded-lg p-1.5 text-sm transition-colors hover:bg-background">
                    <Checkbox className="mt-0.5" />
                    <span className="flex-1">
                      <span className="mr-1 font-semibold text-primary">{it.qty}×</span>
                      {it.name}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-3 flex gap-1.5 border-t pt-3">
                <Button size="sm" className="w-full text-xs" onClick={() => handleAdvanceStatus(o.id, o.status)}>
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  {o.status === "pending" ? "Start Preparing" : o.status === "preparing" ? "Mark Ready" : "Complete & Serve"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
