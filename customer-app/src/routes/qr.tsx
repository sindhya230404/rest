import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { QrCode, ExternalLink, Printer, Sparkles, Check, Copy, Grid, Layers, ShieldCheck } from "lucide-react";
import { CustomerNav } from "@/components/customer-nav";
import { tableStore } from "@/lib/table-store";
import { toast } from "sonner";

export const Route = createFileRoute("/qr")({
  component: TableQrPage,
});

function TableQrPage() {
  const [totalTables, setTotalTables] = useState(12);
  const [selectedSingleTable, setSelectedSingleTable] = useState(1);
  const [hostUrl, setHostUrl] = useState("http://192.168.31.112:5173");
  const [viewMode, setViewMode] = useState<"all" | "single">("all");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loc = window.location;
      if (loc.hostname !== "localhost" && loc.hostname !== "127.0.0.1") {
        setHostUrl(loc.origin);
      }
    }
  }, []);

  const getTableUrl = (tableNum: number) => {
    const cleanHost = hostUrl.replace(/\/$/, "");
    return `${cleanHost}/?table=${tableNum}`;
  };

  const getQrImageUrl = (url: string) => {
    return `https://quickchart.io/qr?text=${encodeURIComponent(url)}&size=300&margin=2&ecLevel=H`;
  };

  const handleSimulateScan = (tableNum: number) => {
    tableStore.setTableNumber(`Table ${tableNum}`);
    toast.success(`Simulated scan for Table ${tableNum}!`);
    nav({ to: "/", search: { table: tableNum } as any });
  };

  const handleCopy = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    toast.success(`URL copied for Table ${index}!`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hide CustomerNav when printing */}
      <div className="print:hidden">
        <CustomerNav />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        {/* Header - Hidden in Print */}
        <div className="print:hidden">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Restaurant Management</div>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-1">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">Restaurant Table QR Generator</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Separate unique QR codes for every table. Scanning a table's QR opens the customer menu for that exact table.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("all")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2 border ${
                  viewMode === "all" ? "gradient-primary text-white border-primary shadow-float" : "bg-card"
                }`}
              >
                <Grid className="h-4 w-4" /> All Tables ({totalTables})
              </button>
              <button
                onClick={() => setViewMode("single")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2 border ${
                  viewMode === "single" ? "gradient-primary text-white border-primary shadow-float" : "bg-card"
                }`}
              >
                <Layers className="h-4 w-4" /> Single Preview
              </button>
              <button
                onClick={handlePrint}
                className="rounded-xl border bg-card text-sm font-semibold px-4 py-2 flex items-center gap-2 hover:bg-muted"
              >
                <Printer className="h-4 w-4" /> Print QR Cards
              </button>
            </div>
          </div>

          {/* Network Host Input Banner */}
          <div className="mt-6 glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 grid place-items-center text-amber-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Base App URL / IP Address for Mobile Phones</div>
                <div className="text-xs text-muted-foreground">
                  If scanning from mobile phones on Wi-Fi, enter your local IP (e.g. <code>http://192.168.1.15:5173</code>) or deployed domain.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-[280px]">
              <input
                type="text"
                value={hostUrl}
                onChange={(e) => setHostUrl(e.target.value)}
                placeholder="http://192.168.1.X:5173"
                className="flex-1 rounded-xl border bg-background px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Table Count Selector */}
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="text-muted-foreground font-medium">Total Restaurant Tables:</span>
            <div className="flex gap-1.5">
              {[8, 12, 16, 20].map((count) => (
                <button
                  key={count}
                  onClick={() => setTotalTables(count)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                    totalTables === count ? "bg-primary text-white border-primary" : "bg-card"
                  }`}
                >
                  {count} Tables
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PRINTABLE QR GRID FOR ALL TABLES */}
        {viewMode === "all" ? (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
            {Array.from({ length: totalTables }, (_, i) => i + 1).map((tableNum) => {
              const url = getTableUrl(tableNum);
              const qrImg = getQrImageUrl(url);
              return (
                <div
                  key={tableNum}
                  className="bg-white text-slate-900 rounded-3xl p-6 shadow-md border border-slate-200 flex flex-col items-center text-center relative print:break-inside-avoid print:shadow-none print:border-slate-300"
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-0.5 rounded-full mb-1">
                    Ember & Oak · Restaurant
                  </div>

                  <div className="font-display text-3xl font-extrabold text-slate-900 mt-1">
                    TABLE {tableNum}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mb-3">
                    Scan with your camera to view menu & order
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-inner my-1">
                    <img
                      src={qrImg}
                      alt={`QR Code Table ${tableNum}`}
                      className="h-44 w-44 object-contain rounded-lg"
                    />
                  </div>

                  <div className="mt-3 text-[10px] font-mono text-slate-400 truncate max-w-full px-2">
                    {url}
                  </div>

                  {/* Actions (Hidden in Print) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2 w-full justify-center print:hidden">
                    <button
                      onClick={() => handleSimulateScan(tableNum)}
                      className="rounded-xl gradient-primary text-white text-xs font-semibold px-3 py-1.5 shadow-sm flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" /> Scan Table {tableNum}
                    </button>
                    <button
                      onClick={() => handleCopy(url, tableNum)}
                      className="rounded-xl border bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 flex items-center gap-1 hover:bg-slate-200"
                    >
                      {copiedIndex === tableNum ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* SINGLE TABLE PREVIEW */
          <div className="mt-8 grid md:grid-cols-2 gap-6 items-start print:hidden">
            <div className="glass rounded-3xl p-6 shadow-glass">
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Select Specific Table
              </h2>
              <div className="grid grid-cols-4 gap-2.5">
                {Array.from({ length: totalTables }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedSingleTable(num)}
                    className={`rounded-xl py-3 text-center text-sm font-semibold border transition ${
                      selectedSingleTable === num
                        ? "gradient-primary text-white border-primary shadow-float"
                        : "bg-card hover:bg-muted/60"
                    }`}
                  >
                    Table {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full mb-2">
                Ember & Oak · Restaurant
              </div>

              <div className="font-display text-4xl font-extrabold text-slate-900 mt-1">
                TABLE {selectedSingleTable}
              </div>
              <div className="text-xs text-slate-400 font-medium mb-4">
                Scan with smartphone camera to open customer page
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                <img
                  src={getQrImageUrl(getTableUrl(selectedSingleTable))}
                  alt={`QR Code Table ${selectedSingleTable}`}
                  className="h-52 w-52 object-contain rounded-xl"
                />
              </div>

              <div className="mt-4 text-xs font-mono text-slate-400">
                {getTableUrl(selectedSingleTable)}
              </div>

              <button
                onClick={() => handleSimulateScan(selectedSingleTable)}
                className="mt-5 rounded-full gradient-primary text-white text-sm font-semibold px-6 py-3 shadow-float flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" /> Simulate Scan & Open Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
