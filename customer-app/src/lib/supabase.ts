import { createClient } from "@supabase/supabase-js";

export type OrderStatus = "pending" | "received" | "accepted" | "preparing" | "ready" | "served" | "completed" | "cancelled";

export type DbOrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
  image?: string;
};

export type DbOrder = {
  id: string;
  order_number: string;
  table_number: string;
  items: DbOrderItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  status: OrderStatus;
  payment_status: "unpaid" | "paid";
  payment_method?: string;
  created_at: string;
  updated_at?: string;
};

export type ServiceRequest = {
  id: string;
  table_number: string;
  service_type: string;
  label: string;
  status: "pending" | "dispatched" | "completed";
  created_at: string;
};

export type DbMenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  veg: boolean;
  available: boolean;
  prepTime?: number;
};

const DEFAULT_URL = "https://bgnupdzekwbphwzqegtl.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbnVwZHpla3dicGh3enFlZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MDY3MDYsImV4cCI6MjEwMDE4MjcwNn0.cWOpseellzyzmbHKeIbdob24TYUnHGVoUOLIgvGl_Lc";

const envUrl = (import.meta.env.VITE_SUPABASE_URL || "").replace(/^['"]|['"]$/g, "").trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").replace(/^['"]|['"]$/g, "").trim();

export const supabaseUrl = (envUrl.length > 0 && !envUrl.includes("your-supabase-project") && !envUrl.includes("placeholder")) ? envUrl : DEFAULT_URL;
export const supabaseAnonKey = (envKey.length > 0 && !envKey.includes("your-supabase-anon-key") && !envKey.includes("placeholder")) ? envKey : DEFAULT_KEY;

export const isSupabaseConfigured = () => true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


const MOCK_ORDERS_KEY = "aura_dine_orders";
const MOCK_SERVICES_KEY = "aura_dine_services";

function getLocalOrders(): DbOrder[] {
  try {
    const raw = localStorage.getItem(MOCK_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: DbOrder[]) {
  try {
    localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error("Failed to save local orders:", err);
  }
}

function getLocalServices(): ServiceRequest[] {
  try {
    const raw = localStorage.getItem(MOCK_SERVICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalServices(services: ServiceRequest[]) {
  try {
    localStorage.setItem(MOCK_SERVICES_KEY, JSON.stringify(services));
  } catch (err) {
    console.error("Failed to save local services:", err);
  }
}

// Helper to convert database row to DbOrder
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRowToDbOrder(row: any): DbOrder {
  const itemsArr: DbOrderItem[] = Array.isArray(row.item)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? row.item.map((it: any) => ({
        id: it.id || it.name,
        name: it.name || "Item",
        price: Number(it.price || 0),
        qty: Number(it.qty || 1),
      }))
    : Array.isArray(row.items)
    ? row.items
    : [];

  return {
    id: row.id || row.order_id,
    order_number: row.order_id || row.order_number || row.id,
    table_number: String(row.table_number || "1"),
    items: itemsArr,
    subtotal: Number(row.total || 0),
    discount: 0,
    gst: 0,
    total: Number(row.total || 0),
    status: (row.status || "pending") as OrderStatus,
    payment_status: row.payment === "paid" || row.payment_status === "paid" ? "paid" : "unpaid",
    payment_method: row.payment_method || "card",
    created_at: row.created_at || row.order_time || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

// Order Functions
export async function createOrder(orderPayload: Omit<DbOrder, "created_at">): Promise<DbOrder> {
  const newOrder: DbOrder = {
    ...orderPayload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const tblNum = parseInt(String(newOrder.table_number).replace(/\D/g, ""), 10) || 1;
      const orderIdStr = newOrder.order_number || newOrder.id;
      const itemsPayload = newOrder.items.map((it) => ({
        name: it.name,
        qty: it.qty,
        price: it.price,
      }));

      const dbPayload = {
        id: newOrder.id,
        order_id: orderIdStr,
        customer: `Table ${tblNum} Customer`,
        table_number: tblNum,
        item: itemsPayload,
        total: Number(newOrder.total),
        status: newOrder.status || "pending",
        payment: newOrder.payment_status === "paid" ? "paid" : "unpaid",
        order_time: newOrder.created_at,
        created_at: newOrder.created_at,
      };

      const { data, error } = await supabase
        .from("orders")
        .insert([dbPayload])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
      } else if (data) {
        console.log("Supabase insert success:", data);
        const mapped = mapRowToDbOrder(data);
        const existing = getLocalOrders();
        saveLocalOrders([mapped, ...existing]);
        return mapped;
      }
    } catch (err) {
      console.error("Supabase exception during insert:", err);
    }
  }

  const existing = getLocalOrders();
  saveLocalOrders([newOrder, ...existing]);
  return newOrder;
}

export async function getOrderById(orderId: string): Promise<DbOrder | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .or(`id.eq.${orderId},order_id.eq.${orderId}`)
        .single();

      if (!error && data) {
        return mapRowToDbOrder(data);
      }
    } catch (err) {
      console.warn("Supabase fetch error:", err);
    }
  }

  const localOrders = getLocalOrders();
  return localOrders.find((o) => o.id === orderId || o.order_number === orderId) || null;
}

export async function getOrdersByTable(tableNumber: string): Promise<DbOrder[]> {
  if (isSupabaseConfigured()) {
    try {
      const tblNum = parseInt(String(tableNumber).replace(/\D/g, ""), 10) || 1;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("table_number", tblNum)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map(mapRowToDbOrder);
      }
    } catch (err) {
      console.warn("Supabase table orders fetch error:", err);
    }
  }

  const localOrders = getLocalOrders();
  return localOrders.filter((o) => o.table_number.toLowerCase() === tableNumber.toLowerCase());
}

export async function updateOrderPayment(orderId: string, paymentMethod: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          payment: "paid",
        })
        .or(`id.eq.${orderId},order_id.eq.${orderId}`);

      if (!error) return true;
    } catch (err) {
      console.warn("Supabase payment update error:", err);
    }
  }

  const localOrders = getLocalOrders();
  const updated = localOrders.map((o) =>
    o.id === orderId ? { ...o, payment_status: "paid" as const, payment_method: paymentMethod } : o
  );
  saveLocalOrders(updated);
  return true;
}

export function subscribeToOrder(orderId: string, onUpdate: (order: DbOrder) => void) {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel(`order-updates-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "orders",
      },
      (payload) => {
        if (payload.new) {
          const mapped = mapRowToDbOrder(payload.new);
          if (mapped.id === orderId || mapped.order_number === orderId) {
            onUpdate(mapped);
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToAllOrders(tableNumber: string, onUpdate: (order: DbOrder) => void) {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const tblNum = parseInt(String(tableNumber).replace(/\D/g, ""), 10) || 1;
  const channel = supabase
    .channel(`all-orders-${tableNumber}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      (payload) => {
        if (payload.new) {
          const mapped = mapRowToDbOrder(payload.new);
          if (Number(mapped.table_number) === tblNum) {
            onUpdate(mapped);
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}


// Service Request Functions
export async function sendServiceRequest(tableNumber: string, serviceType: string, label: string): Promise<ServiceRequest> {
  const req: ServiceRequest = {
    id: `srv_${Date.now()}`,
    table_number: tableNumber,
    service_type: serviceType,
    label,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .insert([req])
        .select()
        .single();

      if (!error && data) {
        return data as ServiceRequest;
      }
    } catch (err) {
      console.warn("Supabase service request error:", err);
    }
  }

  const existing = getLocalServices();
  saveLocalServices([req, ...existing]);

  // Simulate auto staff response after 4 seconds
  setTimeout(() => {
    const services = getLocalServices();
    const updated = services.map((s) => (s.id === req.id ? { ...s, status: "dispatched" as const } : s));
    saveLocalServices(updated);
  }, 4000);

  return req;
}

export async function getServiceRequestsByTable(tableNumber: string): Promise<ServiceRequest[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("table_number", tableNumber)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as ServiceRequest[];
      }
    } catch (err) {
      console.warn("Supabase fetch service requests error:", err);
    }
  }

  const local = getLocalServices();
  return local.filter((s) => s.table_number.toLowerCase() === tableNumber.toLowerCase());
}

export function subscribeToServiceRequests(tableNumber: string, onUpdate: (req: ServiceRequest) => void) {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel(`services-${tableNumber}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "service_requests",
        filter: `table_number=eq.${tableNumber}`,
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new as ServiceRequest);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Dynamic Menu Items
export async function fetchDbMenuItems(): Promise<DbMenuItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("available", true);

      if (!error && data && data.length > 0) {
        return data as DbMenuItem[];
      }
    } catch (err) {
      console.warn("Supabase menu fetch error:", err);
    }
  }
  return [];
}

export function subscribeToMenuItems(onUpdate: () => void) {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel("menu-items-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "menu_items",
      },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
