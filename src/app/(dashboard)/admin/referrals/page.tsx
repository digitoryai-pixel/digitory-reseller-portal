"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useCurrency } from "@/lib/currency-context";

interface Referral {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  productInterest: string;
  estimatedValue: number | null;
  dealValue: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
  reseller: { companyName: string; user: { name: string } };
  commission: { id: string; commissionAmount: number; status: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  CONTACTED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  QUALIFIED: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  PROPOSAL: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  NEGOTIATION: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  WON: "bg-green-500/10 text-green-500 border-green-500/20",
  LOST: "bg-red-500/10 text-red-500 border-red-500/20",
};

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const { fc } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editDialog, setEditDialog] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchReferrals = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/admin/referrals?${params}`);
    const data = await res.json();
    setReferrals(data.referrals || []);
    setLoading(false);
  };

  useEffect(() => { fetchReferrals(); }, [search, statusFilter]);

  const openStatusDialog = (referral: Referral) => {
    setSelectedReferral(referral);
    setNewStatus(referral.status);
    setDealValue(referral.dealValue?.toString() || referral.estimatedValue?.toString() || "");
    setEditDialog(true);
  };

  const updateStatus = async () => {
    if (!selectedReferral) return;
    setUpdating(true);
    try {
      const body: Record<string, unknown> = { status: newStatus };
      if (newStatus === "WON" && dealValue) {
        body.dealValue = parseFloat(dealValue);
      }
      const res = await fetch(`/api/admin/referrals/${selectedReferral.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        return;
      }
      toast.success("Referral status updated");
      setEditDialog(false);
      fetchReferrals();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Referrals</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search referrals..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No referrals found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Reseller</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell className="font-medium">{referral.companyName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{referral.contactName}</p>
                          <p className="text-xs text-muted-foreground">{referral.contactEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{referral.reseller.user.name}</TableCell>
                      <TableCell><Badge variant="secondary">{referral.productInterest}</Badge></TableCell>
                      <TableCell>
                        {referral.dealValue ? fc(Number(referral.dealValue)) :
                         referral.estimatedValue ? `~${fc(Number(referral.estimatedValue))}` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[referral.status]}>{referral.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(referral.createdAt), "MMM d, yy")}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openStatusDialog(referral)}>
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Referral Status</DialogTitle>
            <DialogDescription>{selectedReferral?.companyName} - {selectedReferral?.contactName}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {newStatus === "WON" && (
              <div className="space-y-2">
                <Label>Deal Value</Label>
                <Input type="number" min={0} value={dealValue} onChange={(e) => setDealValue(e.target.value)} placeholder="Enter actual deal value" />
                <p className="text-xs text-muted-foreground">Required for commission calculation</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={updateStatus} disabled={updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
