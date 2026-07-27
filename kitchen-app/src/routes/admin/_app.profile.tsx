import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/admin/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/admin/components/ui/card";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { Avatar, AvatarFallback } from "@/admin/components/ui/avatar";
import { User, Save } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { useAdminProfile } from "@/hooks/useAdminProfile";

export const Route = createFileRoute("/admin/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ScanDine" },
      { name: "description", content: "Manage your account profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, saveProfile, initials } = useAdminProfile();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);

  const handleSave = () => {
    saveProfile({ name, email, phone });
    toast.success("Profile updated successfully!");
  };

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage your account details."
        icon={<User className="h-5 w-5" />}
        actions={<Button size="sm" onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save changes</Button>}
      />

      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Account information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 sm:col-span-2">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gradient-to-br from-primary to-destructive text-lg font-semibold text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-display text-lg font-semibold">{name}</div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
          </div>
          <div className="grid gap-2"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="grid gap-2 sm:col-span-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        </CardContent>
      </Card>
    </div>
  );
}