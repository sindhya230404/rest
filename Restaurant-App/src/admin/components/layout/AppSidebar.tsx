import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, ChefHat, Receipt,
  UserCog, Sparkles, QrCode, LogOut
} from "lucide-react";
import { useState } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/admin/components/ui/sidebar";
import { restaurantInfo } from "@/admin/lib/mock-data";
import { signOut } from "@/lib/auth";

type NavItem =
  | { title: string; url: string; icon: React.ComponentType<{ className?: string }> }
  | { title: string; icon: React.ComponentType<{ className?: string }>; children: { title: string; url: string }[] };

const nav: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
      { title: "Menu Items", url: "/admin/menu/items", icon: UtensilsCrossed },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        title: "Billing", icon: Receipt, children: [
          { title: "Invoices", url: "/admin/billing/invoices" },
          { title: "Payments", url: "/admin/billing/payments" },
        ]
      },
      { title: "Table QR Generator", url: "/admin/qr", icon: QrCode },
      { title: "Kitchen", url: "/admin/kds", icon: ChefHat },
      { title: "Employee", url: "/admin/employees", icon: UserCog },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-4 py-4">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-destructive text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate font-display text-base font-bold leading-tight">{restaurantInfo.name}</div>
              <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">Restaurant OS</div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {nav.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if ("children" in item) {
                    return <SidebarSubMenu key={item.title} item={item} pathname={pathname} collapsed={collapsed} />;
                  }
                  const active = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link to={item.url} className="flex items-center gap-2.5">
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Sticky bottom-left Footer containing ONLY Sign Out button */}
      <SidebarFooter className="sticky bottom-0 z-10 border-t bg-sidebar p-2 shadow-xs">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sign Out"
              className="flex items-center gap-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate font-semibold">Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarSubMenu({
  item, pathname, collapsed,
}: {
  item: { title: string; icon: React.ComponentType<{ className?: string }>; children: { title: string; url: string }[] };
  pathname: string;
  collapsed: boolean;
}) {
  const isChildActive = item.children.some((c) => pathname === c.url);
  const [open, setOpen] = useState(isChildActive);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setOpen(!open)}
        isActive={isChildActive}
        tooltip={item.title}
        className="flex items-center gap-2.5"
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <span className="flex-1 truncate text-left">{item.title}</span>
        )}
      </SidebarMenuButton>
      {open && !collapsed && (
        <div className="ml-6 flex flex-col space-y-1 border-l pl-2 py-1">
          {item.children.map((c) => (
            <Link
              key={c.url}
              to={c.url}
              className={`rounded-md px-2 py-1 text-xs transition-colors ${
                pathname === c.url ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {c.title}
            </Link>
          ))}
        </div>
      )}
    </SidebarMenuItem>
  );
}
