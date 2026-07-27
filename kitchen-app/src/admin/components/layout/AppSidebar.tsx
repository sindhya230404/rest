import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, ChefHat, Receipt,
  Boxes, UserCog, User, ChevronDown, Sparkles,
} from "lucide-react";
import { useState } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub,
  SidebarMenuSubButton, SidebarMenuSubItem, useSidebar,
} from "@/admin/components/ui/sidebar";
import { restaurantInfo } from "@/admin/lib/mock-data";

type NavItem =
  | { title: string; url: string; icon: React.ComponentType<{ className?: string }> }
  | { title: string; icon: React.ComponentType<{ className?: string }>; children: { title: string; url: string }[] };

const nav: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
      { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
      {
        title: "Menu", icon: UtensilsCrossed, children: [
          { title: "Food Items", url: "/admin/menu/items" },
          { title: "Add Item", url: "/admin/menu/add" },
        ]
      },
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
      { title: "Kitchen", url: "/admin/kds", icon: ChefHat },
      { title: "Employee", url: "/admin/employees", icon: UserCog },
      { title: "Profile", url: "/admin/profile", icon: User },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

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
          <>
            <span className="flex-1 truncate text-left">{item.title}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </>
        )}
      </SidebarMenuButton>
      {open && !collapsed && (
        <SidebarMenuSub>
          {item.children.map((c) => (
            <SidebarMenuSubItem key={c.url}>
              <SidebarMenuSubButton asChild isActive={pathname === c.url}>
                <Link to={c.url}>{c.title}</Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}
