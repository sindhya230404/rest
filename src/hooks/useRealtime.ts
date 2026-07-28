import { useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

export function playOrderAlertSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First chime (E5 ~ 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Second chime (A5 ~ 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.5);
  } catch (err) {
    console.warn("Audio chime play error:", err);
  }
}

export function useRealtimeTable(
  tableName: string,
  onPayload: (payload: { eventType: string; new: unknown; old: unknown }) => void,
) {
  // Keep a ref to the latest callback so the effect doesn't need it as a dependency
  const callbackRef = useRef(onPayload);
  useEffect(() => {
    callbackRef.current = onPayload;
  }, [onPayload]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel(`realtime_${tableName}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: tableName },
        (payload) => {
          if (tableName === "orders" && payload.eventType === "INSERT") {
            playOrderAlertSound();
            const orderData = payload.new as { table_number?: string | number; order_number?: string; id?: string };
            const tableNum = orderData?.table_number ? `Table ${orderData.table_number}` : "";
            const orderId = orderData?.order_number || orderData?.id || "";
            toast.success(`🔔 New Order Received! ${orderId} (${tableNum})`, {
              duration: 5000,
            });
          }

          // Dispatch local update event so useSupabaseTable re-fetches immediately
          window.dispatchEvent(new CustomEvent("local-table-updated", { detail: { tableName } }));

          // Always call the latest version of the callback via ref
          callbackRef.current({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
          });
        },

      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName]); // Only re-subscribe when tableName changes
}
