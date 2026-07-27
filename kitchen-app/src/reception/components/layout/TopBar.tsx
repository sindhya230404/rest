import { SidebarTrigger } from "@/reception/components/ui/sidebar";
import { Button } from "@/reception/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/reception/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/reception/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { useRouterState, useNavigate, Link } from "@tanstack/react-router";
import { signOut } from "@/lib/auth";
import { useReceptionistProfile } from "@/hooks/useReceptionistProfile";

export function TopBar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { profile } = useReceptionistProfile();

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/", replace: true });
  };

  const crumbs = pathname.split("/").filter(Boolean);

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "RC";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="-ml-1" />

      <div className="hidden min-w-0 items-center gap-1.5 text-sm text-muted-foreground md:flex">
        {crumbs.length === 0 ? (
          <span className="text-foreground">Home</span>
        ) : (
          crumbs.map((c, i) => (
            <span key={c + i} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              <span className={i === crumbs.length - 1 ? "font-medium capitalize text-foreground" : "capitalize"}>
                {c.replace(/-/g, " ")}
              </span>
            </span>
          ))
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 pl-1 pr-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-primary to-destructive text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left lg:block">
                <div className="text-xs font-semibold leading-tight">{profile.name}</div>
                <div className="text-[10px] leading-tight text-muted-foreground">Receptionist</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/reception/profile"><User className="mr-2 h-4 w-4" /> Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onSelect={handleSignOut}><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
