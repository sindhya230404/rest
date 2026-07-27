import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/admin/components/layout/PageHeader";
import { StatCard } from "@/admin/components/layout/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/admin/components/ui/card";
import { Button } from "@/admin/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/admin/components/ui/tabs";
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  DollarSign, ShoppingBag, Utensils, TrendingUp,
  Sparkles, Plus, Download, Calendar,
} from "lucide-react";
import { kpis, salesTrend, restaurantInfo } from "@/admin/lib/mock-data";
import { useSupabaseTable, type Order, type TableItem, type Customer } from "@/hooks/useSupabaseData";

import { exportToCSV } from "@/admin/lib/exportUtils";

export const Route = createFileRoute("/admin/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ScanDine" },
      { name: "description", content: "Executive dashboard with real-time restaurant KPIs, sales, orders and status." },
    ],
  }),
  component: DashboardPage,
});

const COLORS = ["oklch(0.68 0.19 40)", "oklch(0.62 0.22 25)", "oklch(0.75 0.15 70)", "oklch(0.65 0.16 155)", "oklch(0.55 0.15 260)"];

function DashboardPage() {
  const { data: dbOrders } = useSupabaseTable<Order>("orders");
  const { data: dbTables } = useSupabaseTable<TableItem>("tables");
  const { data: dbCustomers } = useSupabaseTable<Customer>("customers");

  // Calculate dynamic KPIs from Supabase live data with fallback to mock data
  const todaysSales = dbOrders.length > 0
    ? dbOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
    : kpis.todaysSales;

  const totalOrders = dbOrders.length > 0 ? dbOrders.length : kpis.todaysOrders;

  const activeTablesCount = dbTables.length > 0
    ? dbTables.filter((t) => t.status === "occupied").length
    : kpis.activeTables;

  const totalTablesCount = dbTables.length > 0 ? dbTables.length : 24;

  const pendingCount = dbOrders.length > 0 ? dbOrders.filter((o) => o.status === "pending").length : kpis.pending;
  const preparingCount = dbOrders.length > 0 ? dbOrders.filter((o) => o.status === "preparing").length : kpis.preparing;
  const readyCount = dbOrders.length > 0 ? dbOrders.filter((o) => o.status === "ready").length : kpis.ready;
  const completedCount = dbOrders.length > 0 ? dbOrders.filter((o) => o.status === "completed").length : kpis.completed;
  const cancelledCount = dbOrders.length > 0 ? dbOrders.filter((o) => o.status === "cancelled").length : kpis.cancelled;

  const statusPie = [
    { name: "Completed", value: completedCount },
    { name: "Preparing", value: preparingCount },
    { name: "Pending", value: pendingCount },
    { name: "Ready", value: readyCount },
    { name: "Cancelled", value: cancelledCount },
  ];

  const handleExport = () => {
    const summaryData = [
      { Metric: "Today's Sales", Value: `${restaurantInfo.currency}${todaysSales}` },
      { Metric: "Today's Orders", Value: totalOrders },
      { Metric: "Active Tables", Value: `${activeTablesCount}/${totalTablesCount}` },
      { Metric: "Total Customers", Value: dbCustomers.length || 1284 },
      { Metric: "Pending Orders", Value: pendingCount },
      { Metric: "Preparing Orders", Value: preparingCount },
      { Metric: "Ready Orders", Value: readyCount },
      { Metric: "Completed Orders", Value: completedCount },
      { Metric: "Cancelled Orders", Value: cancelledCount },
    ];
    exportToCSV("dashboard_summary", summaryData);
  };

  return (
    <div>
      <PageHeader
        title={`Welcome back, Elena`}
        description={`${restaurantInfo.branch} · Here's what's happening at ScanDine today.`}
        icon={<Sparkles className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" size="sm"><Calendar className="mr-2 h-4 w-4" />Today</Button>
            <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Sales" value={`${restaurantInfo.currency}${todaysSales.toLocaleString()}`} delta={12.4} deltaLabel="vs yesterday" icon={<DollarSign className="h-5 w-5" />} tone="primary" />
        <StatCard label="Today's Orders" value={totalOrders} delta={8.1} icon={<ShoppingBag className="h-5 w-5" />} tone="info" />
        <StatCard label="Active Tables" value={`${activeTablesCount}/${totalTablesCount}`} delta={-2.3} icon={<Utensils className="h-5 w-5" />} tone="warning" />
        <StatCard label="Total Customers" value={dbCustomers.length || 1284} delta={4.6} icon={<TrendingUp className="h-5 w-5" />} tone="success" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MiniStat label="Pending" value={pendingCount} tone="text-warning" />
        <MiniStat label="Preparing" value={preparingCount} tone="text-info" />
        <MiniStat label="Ready" value={readyCount} tone="text-primary" />
        <MiniStat label="Completed" value={completedCount} tone="text-success" />
        <MiniStat label="Cancelled" value={cancelledCount} tone="text-destructive" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Sales & orders</CardTitle>
              <p className="text-xs text-muted-foreground">Last 7 days performance</p>
            </div>
            <Tabs defaultValue="week">
              <TabsList className="h-8">
                <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
                <TabsTrigger value="year" className="text-xs">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.19 40)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.68 0.19 40)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.008 60)" vertical={false} />
                <XAxis dataKey="day" stroke="oklch(0.55 0.02 40)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.55 0.02 40)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 60)", fontSize: 12 }} />
                <Area type="monotone" dataKey="sales" stroke="oklch(0.68 0.19 40)" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Order status</CardTitle>
            <p className="text-xs text-muted-foreground">Distribution today</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPie} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.008 60)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {statusPie.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ml-auto font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Card className="p-3">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-xl font-bold ${tone}`}>{value}</div>
    </Card>
  );
}
