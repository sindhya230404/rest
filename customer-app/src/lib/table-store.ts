import { useSyncExternalStore } from "react";

const TABLE_STORAGE_KEY = "aura_dine_table_number";

let currentTableNumber = ((): string => {
  try {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const paramTable = urlParams.get("table");
      if (paramTable) {
        const formatted = paramTable.toLowerCase().startsWith("table")
          ? paramTable
          : `Table ${paramTable}`;
        localStorage.setItem(TABLE_STORAGE_KEY, formatted);
        return formatted;
      }
      return localStorage.getItem(TABLE_STORAGE_KEY) || "Table 1";
    }
  } catch {}
  return "Table 1";
})();

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const tableStore = {
  getTableNumber(): string {
    return currentTableNumber;
  },
  setTableNumber(table: string) {
    const formatted = table.toLowerCase().startsWith("table") ? table : `Table ${table}`;
    currentTableNumber = formatted;
    try {
      localStorage.setItem(TABLE_STORAGE_KEY, formatted);
    } catch {}
    emit();
  },
  initFromUrl() {
    try {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const paramTable = urlParams.get("table");
        if (paramTable) {
          const formatted = paramTable.toLowerCase().startsWith("table")
            ? paramTable
            : `Table ${paramTable}`;
          currentTableNumber = formatted;
          localStorage.setItem(TABLE_STORAGE_KEY, formatted);
          emit();
        }
      }
    } catch {}
  },
};

export function useTable(): string {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => currentTableNumber,
    () => currentTableNumber
  );
}
