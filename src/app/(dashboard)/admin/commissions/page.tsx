"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DollarSign, Clock, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useCurrency } from "@/lib/currency-context";

interface Commission {
  id: string;
  dealValue: number;
  commissionRate: number;
  commissionAmount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  referral: { companyName: string; contactName: string };
  reseller: { companyName: string; user: { name: string; email: string } };
}

interface Totals {
  status: string;
  _sum: { commissionAmount: number | null };
  _count: { id: number };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  APPROVED: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  PAID: "bg-green-500/10 text-green-500 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const { fc } = useCurrency();
  const [totals, setTotals] = useState<Totals[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchCommissions = async () => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/admin/commissions?${params}`);
    const data = await res.json();
    setCommissions(data.commissions || []);
    setTotals(data.totals || []);
    setLoading(false);
  };

  useEffect(() => { fetchCommissions(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/commissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        toast.error("Failed to update commission");
        return;
      }
      toast.success(`Commission ${status.toLowerCase()}`);
      fetchCommissions();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdating(null);
    }
  };

  const getTotal = (status: string) => {
    const t = totals.find(t => t.status === status);
    return t?._sum?.commissionAmount || 0;
  };

  const getCount = (status: string) => {
    const t = totals.find(t => t.status === status);
    return t?._count?.id || 0;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Commissions</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Pending" value={fc(Number(getTotal("PENDING")))} description={`${getCount("PENDING")} commissions`} icon={Clock} />
        <StatCard title="Approved" value={fc(Number(getTotal("APPROVED")))} description={`${getCount("APPROVED")} commissions`} icon={CheckCircle} />
        <StatCard title="Paid" value={fc(Number(getTotal("PAID")))} description={`${getCount("PAID")} commissions`} icon={DollarSign} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Commissions</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No commissions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reseller</TableHead>
                    <TableHead>Referral</TableHead>
                    <TableHead>Deal Value</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{c.reseller.user.name}</p>
                          <p className="text-xs text-muted-foreground">{c.reseller.companyName}</p>
                        </div>
                      </TableCell>
                      <TableCell>{c.referral.companyName}</TableCell>
                      <TableCell>${Number(c.dealValue).toLocaleString()}</TableCell>
                      <TableCell>{c.commissionRate}%</TableCell>
                      <TableCell className="font-semibold">${Number(c.commissionAmount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[c.status]}>{c.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(c.createdAt), "MMM d, yy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {c.status === "PENDING" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "APPROVED")} disabled={updating === c.id}>
                              {updating === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                            </Button>
                          )}
                          {c.status === "APPROVED" && (
                            <Button size="sm" onClick={() => updateStatus(c.id, "PAID")} disabled={updating === c.id}>
                              {updating === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark Paid"}
                            </Button>
                          )}
                          {(c.status === "PENDING" || c.status === "APPROVED") && (
                            <Button size="sm" variant="destructive" onClick={() => updateStatus(c.id, "CANCELLED")} disabled={updating === c.id}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
