"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DollarSign, Clock, CheckCircle, Loader2 } from "lucide-react";
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

export default function ResellerCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const { fc } = useCurrency();
  const [totals, setTotals] = useState<Totals[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reseller/commissions")
      .then((res) => res.json())
      .then((data) => {
        setCommissions(data.commissions || []);
        setTotals(data.totals || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
      <h1 className="text-3xl font-bold">My Commissions</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Pending" value={fc(Number(getTotal("PENDING")))} description={`${getCount("PENDING")} pending`} icon={Clock} />
        <StatCard title="Approved" value={fc(Number(getTotal("APPROVED")))} description={`${getCount("APPROVED")} approved`} icon={CheckCircle} />
        <StatCard title="Paid" value={fc(Number(getTotal("PAID")))} description={`${getCount("PAID")} paid`} icon={DollarSign} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No commissions yet. Your commissions will appear here when your referrals are won.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referral</TableHead>
                  <TableHead>Deal Value</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{c.referral.companyName}</p>
                        <p className="text-xs text-muted-foreground">{c.referral.contactName}</p>
                      </div>
                    </TableCell>
                    <TableCell>${Number(c.dealValue).toLocaleString()}</TableCell>
                    <TableCell>{c.commissionRate}%</TableCell>
                    <TableCell className="font-semibold">${Number(c.commissionAmount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[c.status]}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.paidAt ? format(new Date(c.paidAt), "MMM d, yyyy") : format(new Date(c.createdAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
