"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileText, DollarSign, TrendingUp, Percent, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useCurrency } from "@/lib/currency-context";

interface ResellerDetail {
  reseller: {
    id: string;
    companyName: string;
    phone: string | null;
    address: string | null;
    commissionRate: number;
    tier: string;
    status: string;
    totalEarnings: number;
    createdAt: string;
    user: { id: string; name: string; email: string; createdAt: string };
    referrals: { id: string; companyName: string; contactName: string; status: string; estimatedValue: number | null; dealValue: number | null; createdAt: string }[];
    commissions: { id: string; dealValue: number; commissionAmount: number; status: string; createdAt: string }[];
    _count: { referrals: number; commissions: number };
  };
  wonReferrals: number;
  conversionRate: number;
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

const TIER_COLORS: Record<string, string> = {
  BRONZE: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  SILVER: "bg-slate-400/10 text-slate-400 border-slate-400/20",
  GOLD: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PLATINUM: "bg-orange-400/10 text-orange-400 border-orange-400/20",
};

export default function ResellerDetailPage() {
  const params = useParams();
  const [data, setData] = useState<ResellerDetail | null>(null);
  const { fc } = useCurrency();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/resellers/${params.id}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!data?.reseller) {
    return <div className="text-center py-12 text-muted-foreground">Reseller not found.</div>;
  }

  const { reseller, wonReferrals, conversionRate } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/resellers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{reseller.user.name}</h1>
          <p className="text-muted-foreground">{reseller.companyName} &middot; {reseller.user.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Badge variant="outline" className={TIER_COLORS[reseller.tier]}>{reseller.tier}</Badge>
          <Badge variant="outline" className={reseller.status === "ACTIVE" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
            {reseller.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Referrals" value={reseller._count.referrals} icon={FileText} description={`${wonReferrals} won`} />
        <StatCard title="Conversion Rate" value={`${conversionRate}%`} icon={TrendingUp} />
        <StatCard title="Commission Rate" value={`${reseller.commissionRate}%`} icon={Percent} />
        <StatCard title="Total Earnings" value={fc(Number(reseller.totalEarnings))} icon={DollarSign} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>{reseller._count.referrals} total referrals</CardDescription>
          </CardHeader>
          <CardContent>
            {reseller.referrals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No referrals yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reseller.referrals.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell className="font-medium">{ref.companyName}</TableCell>
                      <TableCell><Badge variant="outline" className={STATUS_COLORS[ref.status]}>{ref.status}</Badge></TableCell>
                      <TableCell>{ref.dealValue ? fc(Number(ref.dealValue)) : ref.estimatedValue ? `~${fc(Number(ref.estimatedValue))}` : "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(ref.createdAt), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commissions</CardTitle>
            <CardDescription>{reseller._count.commissions} total commissions</CardDescription>
          </CardHeader>
          <CardContent>
            {reseller.commissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No commissions yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Value</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reseller.commissions.map((com) => (
                    <TableRow key={com.id}>
                      <TableCell>${Number(com.dealValue).toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">${Number(com.commissionAmount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          com.status === "PAID" ? "bg-green-500/10 text-green-500" :
                          com.status === "APPROVED" ? "bg-orange-500/10 text-orange-500" :
                          "bg-amber-500/10 text-amber-500"
                        }>{com.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(com.createdAt), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-muted-foreground">Phone</dt><dd>{reseller.phone || "Not provided"}</dd></div>
            <div><dt className="text-muted-foreground">Address</dt><dd>{reseller.address || "Not provided"}</dd></div>
            <div><dt className="text-muted-foreground">Member Since</dt><dd>{format(new Date(reseller.createdAt), "MMMM d, yyyy")}</dd></div>
            <div><dt className="text-muted-foreground">Commission Rate</dt><dd>{reseller.commissionRate}%</dd></div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
