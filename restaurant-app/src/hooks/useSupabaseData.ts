import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  created_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  role: "receptionist" | "kitchen_staff" | "waiter" | "owner" | "manager" | "cashier";
  created_at?: string;
}

export interface Ingredient {
  id: string;
  ingredient: string;
  supplier: string;
  stock: number;
  level: string;
  expiry_status: string;
  created_at?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  sku_count?: number;
  vendor_status?: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: number;
  total: number;
  date: string;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  created_at?: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  order_id: string;
  customer: string;
  table_number: number;
  item: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  payment: "paid" | "unpaid" | "refunded" | "pending";
  order_time: string;
  created_at?: string;
}

export interface TableItem {
  id: string;
  table_number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  location: string;
}

export interface Invoice {
  id: string;
  transition: string;
  invoice: string;
  customer: string;
  method: string;
  date: string;
  amount: number;
  status: "paid" | "unpaid" | "partial";
}

export interface MenuItem {
  id: string;
  category_id?: string;
  category?: string;
  name: string;
  description: string;
  image: string;
  price: number;
  available: boolean;
  preparation_time: number;
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at?: string;
}

// Clean payload to match Supabase database column schema for all tables
function cleanPayloadForSupabase(tableName: string, payload: Record<string, unknown>): Record<string, unknown> {
  const cleaned = { ...payload };

  if (tableName === "menu_items") {
    // If category string exists without category_id, delete category string so PostgREST error 42703 does not occur
    if (cleaned.category && !cleaned.category_id) {
      delete cleaned.category;
    }
  } else if (tableName === "customers") {
    // Remove extra client fields if present (visits/spent/tier from mock data)
    delete cleaned.visits;
    delete cleaned.spent;
    delete cleaned.tier;
    delete cleaned.avatar;
  } else if (tableName === "suppliers") {
    delete cleaned.items;
  }

  return cleaned;
}

// Generic Hook for managing Supabase Table CRUD with state
export function useSupabaseTable<T extends { id: string }>(
  tableName: string,
  initialData: T[] = [],
) {
  const storageKey = `mock_table_${tableName}`;

  const [data, setData] = useState<T[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
      if (initialData.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(initialData));
        return initialData;
      }
    } catch (e) {
      console.error(e);
    }
    return initialData;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Broadcast and sync to local storage for instant reactive UI updates
  const updateLocalData = useCallback((newVal: T[] | ((prev: T[]) => T[])) => {
    setData((prev) => {
      const updated = typeof newVal === "function" ? newVal(prev) : newVal;
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("local-table-updated", { detail: { tableName } }));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, [tableName, storageKey]);

  const fetchData = useCallback(async () => {
    // Check local storage first
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setData(JSON.parse(saved));
      } else if (initialData.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(initialData));
        setData(initialData);
      }
    } catch (e) {
      console.error(e);
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: rows, error: fetchErr } = await supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) {
        console.warn(`Supabase fetch notice for ${tableName}:`, fetchErr.message);
        if (fetchErr.message.toLowerCase().includes("created_at") || fetchErr.code === "42703") {
          const { data: rows2, error: fetchErr2 } = await supabase
            .from(tableName)
            .select("*");
          if (!fetchErr2 && rows2 && rows2.length > 0) {
            updateLocalData(rows2 as T[]);
          }
        }
      } else if (rows) {
        updateLocalData(rows as T[]);
      }

    } catch (err) {
      console.warn(`Supabase fetch notice for ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [tableName, storageKey, updateLocalData]);

  useEffect(() => {
    fetchData();

    const handleLocalUpdate = (e: Event) => {
      const customEv = e as CustomEvent;
      if (!customEv.detail || customEv.detail.tableName === tableName) {
        fetchData();
      }
    };


    window.addEventListener("local-table-updated", handleLocalUpdate);
    window.addEventListener("storage", handleLocalUpdate);
    return () => {
      window.removeEventListener("local-table-updated", handleLocalUpdate);
      window.removeEventListener("storage", handleLocalUpdate);
    };
  }, [fetchData, tableName, storageKey]);

  // CREATE
  const addItem = async (newItem: Omit<T, "id"> & Partial<Pick<T, "id">>) => {
    const created = {
      ...newItem,
      id: newItem.id || `${tableName}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    } as unknown as T;

    // Optimistically update local state & local storage immediately
    updateLocalData((prev) => [created, ...prev]);

    if (isSupabaseConfigured) {
      try {
        const payload = cleanPayloadForSupabase(tableName, created as unknown as Record<string, unknown>);
        const { data: inserted, error: insertErr } = await supabase
          .from(tableName)
          .insert([payload])
          .select()
          .single();

        if (insertErr) {
          console.error(`[Supabase Insert Error on ${tableName}]:`, insertErr.message, insertErr);
        } else if (inserted) {
          console.log(`[Supabase Insert Success on ${tableName}]:`, inserted);
          updateLocalData((prev) =>
            prev.map((item) => (item.id === created.id ? (inserted as T) : item)),
          );
          return inserted as T;
        }
      } catch (err) {
        console.error(`Supabase insert exception for ${tableName}:`, err);
      }
    }
    return created;
  };

  // UPDATE
  const updateItem = async (id: string, updates: Partial<T>) => {
    // Optimistically update local state & local storage immediately
    updateLocalData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );

    if (isSupabaseConfigured) {
      try {
        const payload = cleanPayloadForSupabase(tableName, updates as unknown as Record<string, unknown>);
        const { error: updateErr } = await supabase
          .from(tableName)
          .update(payload)
          .eq("id", id);

        if (updateErr) {
          console.error(`[Supabase Update Error on ${tableName}]:`, updateErr.message, updateErr);
        } else {
          console.log(`[Supabase Update Success on ${tableName}]: id=${id}`);
        }
      } catch (err) {
        console.error(`Supabase update exception for ${tableName}:`, err);
      }
    }
  };

  // DELETE
  const deleteItem = async (id: string) => {
    // Optimistically update local state & local storage immediately
    updateLocalData((prev) => prev.filter((item) => item.id !== id));

    if (isSupabaseConfigured) {
      try {
        const { error: deleteErr } = await supabase
          .from(tableName)
          .delete()
          .eq("id", id);

        if (deleteErr) {
          console.error(`[Supabase Delete Error on ${tableName}]:`, deleteErr.message, deleteErr);
        } else {
          console.log(`[Supabase Delete Success on ${tableName}]: id=${id}`);
        }
      } catch (err) {
        console.error(`Supabase delete exception for ${tableName}:`, err);
      }
    }
  };

  return {
    data,
    setData: updateLocalData,
    loading,
    error,
    fetchData,
    addItem,
    updateItem,
    deleteItem,
  };
}
