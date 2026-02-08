"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Loader2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useCurrency } from "@/lib/currency-context";

interface Reseller {
  id: string;
  companyName: string;
  commissionRate: number;
  tier: string;
  status: string;
  totalEarnings: number;
  user: { id: string; name: string; email: string };
  _count: { referrals: number; commissions: number };
}

const TIER_COLORS: Record<string, string> = {
  BRONZE: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  SILVER: "bg-slate-400/10 text-slate-400 border-slate-400/20",
  GOLD: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PLATINUM: "bg-orange-400/10 text-orange-400 border-orange-400/20",
};

const STATUS_VARIANTS: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-500 border-green-500/20",
  INACTIVE: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  SUSPENDED: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function ResellersPage() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const { fc } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", companyName: "", phone: "", commissionRate: 10,
  });
  const [editForm, setEditForm] = useState({
    commissionRate: 10, status: "ACTIVE", tier: "BRONZE",
  });

  const fetchResellers = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (tierFilter) params.set("tier", tierFilter);

    const res = await fetch(`/api/admin/resellers?${params}`);
    const data = await res.json();
    setResellers(data.resellers || []);
    setLoading(false);
  };

  useEffect(() => { fetchResellers(); }, [search, statusFilter, tierFilter]);

  const handleCreate = async () => {
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/resellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create reseller");
        return;
      }
      toast.success("Reseller created successfully");
      setDialogOpen(false);
      setForm({ name: "", email: "", password: "", companyName: "", phone: "", commissionRate: 10 });
      fetchResellers();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingReseller) return;
    setFormLoading(true);
    try {
      const res = await fetch(`/api/admin/resellers/${editingReseller.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update reseller");
        return;
      }
      toast.success("Reseller updated successfully");
      setEditDialogOpen(false);
      fetchResellers();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  const openEditDialog = (reseller: Reseller) => {
    setEditingReseller(reseller);
    setEditForm({
      commissionRate: reseller.commissionRate,
      status: reseller.status,
      tier: reseller.tier,
    });
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resellers</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Reseller</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Reseller</DialogTitle>
              <DialogDescription>Create a new reseller account with custom commission rate.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input value={form.companyName} onChange={(e) => setForm(p => ({ ...p, companyName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Commission Rate (%)</Label>
                <Input type="number" min={0} max={100} value={form.commissionRate} onChange={(e) => setForm(p => ({ ...p, commissionRate: Number(e.target.value) }))} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Reseller
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search resellers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="BRONZE">Bronze</SelectItem>
                  <SelectItem value="SILVER">Silver</SelectItem>
                  <SelectItem value="GOLD">Gold</SelectItem>
                  <SelectItem value="PLATINUM">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : resellers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No resellers found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reseller</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resellers.map((reseller) => (
                  <TableRow key={reseller.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reseller.user.name}</p>
                        <p className="text-xs text-muted-foreground">{reseller.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{reseller.companyName}</TableCell>
                    <TableCell className="font-semibold">{reseller.commissionRate}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={TIER_COLORS[reseller.tier]}>{reseller.tier}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_VARIANTS[reseller.status]}>{reseller.status}</Badge>
                    </TableCell>
                    <TableCell>{reseller._count.referrals}</TableCell>
                    <TableCell>${Number(reseller.totalEarnings).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(reseller)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/resellers/${reseller.id}`}>View</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reseller</DialogTitle>
            <DialogDescription>
              Update {editingReseller?.user.name}&apos;s settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Commission Rate (%)</Label>
              <Input type="number" min={0} max={100} value={editForm.commissionRate} onChange={(e) => setEditForm(p => ({ ...p, commissionRate: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tier</Label>
              <Select value={editForm.tier} onValueChange={(v) => setEditForm(p => ({ ...p, tier: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRONZE">Bronze</SelectItem>
                  <SelectItem value="SILVER">Silver</SelectItem>
                  <SelectItem value="GOLD">Gold</SelectItem>
                  <SelectItem value="PLATINUM">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEdit} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
