import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/reception/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/reception/components/ui/card";
import { Input } from "@/reception/components/ui/input";
import { Label } from "@/reception/components/ui/label";
import { Avatar, AvatarFallback } from "@/reception/components/ui/avatar";
import { User, ShieldCheck } from "lucide-react";
import { useReceptionistProfile } from "@/hooks/useReceptionistProfile";

export const Route = createFileRoute("/reception/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ScanDine" },
      { name: "description", content: "View receptionist account profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile } = useReceptionistProfile();

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "RC";

  return (
    <div>
      <PageHeader
        title="Profile"
        description="View your receptionist account details."
        icon={<User className="h-5 w-5" />}
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Account information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 sm:col-span-2 border-b pb-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gradient-to-br from-primary to-destructive text-lg font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-display text-lg font-semibold">{profile.name}</div>
              <div className="text-xs text-muted-foreground">Receptionist</div>
            </div>
          </div>

          <div className="sm:col-span-2 rounded-xl bg-muted/40 p-3.5 flex items-center gap-3 text-xs text-muted-foreground border border-border/50">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>This account profile is managed by Administrator. Only Admin can edit Receptionist profile information.</span>
          </div>

          <div className="grid gap-2">
            <Label>Full name</Label>
            <Input value={profile.name} readOnly className="bg-muted/30 cursor-not-allowed" />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={profile.email} readOnly className="bg-muted/30 cursor-not-allowed" />
          </div>
          <div className="grid gap-2">
            <Label>Phone</Label>
            <Input value={profile.phone} readOnly className="bg-muted/30 cursor-not-allowed" />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Input value="Receptionist" readOnly className="bg-muted/30 cursor-not-allowed font-medium text-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}