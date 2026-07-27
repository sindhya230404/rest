import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/admin/components/layout/PageHeader";
import { StatusBadge } from "@/admin/components/layout/StatusBadge";
import { Card } from "@/admin/components/ui/card";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Progress } from "@/admin/components/ui/progress";
import { Avatar, AvatarFallback } from "@/admin/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/admin/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/admin/components/ui/dialog";
import { UserCog, Plus, Search, Mail, Phone, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { employees as mockEmployees } from "@/admin/lib/mock-data";
import { useState } from "react";
import { useSupabaseTable, type Employee } from "@/hooks/useSupabaseData";

export const Route = createFileRoute("/admin/_app/employees")({
  head: () => ({ meta: [{ title: "Employees — ScanDine" }, { name: "description", content: "Staff directory, shifts, attendance and performance." }] }),
  component: EmployeesPage,
});

const defaultFormattedEmployees: Employee[] = mockEmployees.map((m) => ({
  id: m.id,
  name: m.name,
  email: m.email,
  phone: m.phone,
  role: (m.role.toLowerCase().includes("reception")
    ? "receptionist"
    : m.role.toLowerCase().includes("kitchen") || m.role.toLowerCase().includes("chef")
    ? "kitchen_staff"
    : "waiter") as Employee["role"],
  address: "San Francisco, CA",
}));

function EmployeesPage() {
  const { data: dbEmployees, addItem, deleteItem } = useSupabaseTable<Employee>("employees", defaultFormattedEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // New staff state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Employee["role"]>("receptionist");
  const [address, setAddress] = useState("");

  const staffList = dbEmployees;

  const filtered = staffList.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      (e.name && e.name.toLowerCase().includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q)) ||
      (e.role && e.role.toLowerCase().includes(q))
    );
  });

  const handleAddStaff = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter staff full name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter staff email");
      return;
    }
    try {
      await addItem({ name: name.trim(), email: email.trim(), phone: phone.trim(), role, address: address.trim() || "Main Branch" });
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setIsOpen(false);
      toast.success("Staff member added successfully!");
    } catch (err) {
      console.error("Failed to add employee:", err);
      toast.error("Failed to add staff member");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      toast.success("Staff member removed successfully!");
    } catch (err) {
      console.error("Failed to delete staff:", err);
      toast.error("Failed to remove staff member");
    }
  };

  return (
    <div>
      <PageHeader
        title="Employees"
        description={`${staffList.length} team members across all roles`}
        icon={<UserCog className="h-5 w-5" />}
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add staff</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStaff} className="space-y-3 mt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Carlos Gomez" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Email</label>
                  <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="carlos@savory.com" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 415 555 0105" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Employee["role"])}
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="receptionist">Receptionist</option>
                    <option value="kitchen_staff">Kitchen Staff</option>
                    <option value="waiter">Waiter</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Staff</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "On duty", value: Math.max(1, staffList.length - 1), tone: "text-success" },
          { label: "Off duty", value: 1, tone: "text-muted-foreground" },
          { label: "On leave", value: 0, tone: "text-warning" },
          { label: "Total staff", value: staffList.length, tone: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className={`mt-1 font-display text-2xl font-bold ${s.tone}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-wrap items-center gap-2">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <div className="relative ml-auto max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search staff…"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((e) => (
              <Card key={e.id} className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12"><AvatarFallback className="bg-gradient-to-br from-primary/20 to-destructive/20 font-display font-bold text-primary">{e.name.split(" ").map(w => w[0]).join("")}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display font-bold">{e.name}</div>
                    <div className="text-xs text-muted-foreground uppercase">{e.role.replace("_", " ")}</div>
                    <div className="mt-1"><StatusBadge status="ready" /></div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(e.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{e.email}</div>
                  <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{e.phone || "+1 415 555 0100"}</div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
