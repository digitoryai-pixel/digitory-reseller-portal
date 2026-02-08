"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, DollarSign, TrendingUp, Award, PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useCurrency } from "@/lib/currency-context";

interface DashboardData {
  stats: {
    totalReferrals: number;
    wonReferrals: number;
    conversionRate: number;
    totalEarnings: number;
    pendingEarnings: number;
    commissionRate: number;
    currentTier: string;
    nextTier: string | null;
    progressToNextTier: number;
  };
  recentReferrals: {
    id: string;
    companyName: string;
    contactName: string;
    status: string;
    estimatedValue: number | null;
    createdAt: string;
  }[];
  monthlyReferrals: { month: string; count: number }[];
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

export default function ResellerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const { fc } = useCurrency();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reseller/dashboard")
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </div>
    );
  }

  if (!data) return <div>Failed to load dashboard data.</div>;

  const { stats, recentReferrals, monthlyReferrals } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/reseller/referrals/new"><PlusCircle className="mr-2 h-4 w-4" /> New Referral</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Referrals" value={stats.totalReferrals} description={`${stats.wonReferrals} won (${stats.conversionRate}% rate)`} icon={FileText} />
        <StatCard title="Total Earnings" value={fc(Number(stats.totalEarnings))} description={`${fc(Number(stats.pendingEarnings))} pending`} icon={DollarSign} />
        <StatCard title="Commission Rate" value={`${stats.commissionRate}%`} description="Your current rate" icon={TrendingUp} />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tier Status</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={TIER_COLORS[stats.currentTier]}>{stats.currentTier}</Badge>
            </div>
            {stats.nextTier && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress to {stats.nextTier}</span>
                  <span>{stats.progressToNextTier}%</span>
                </div>
                <Progress value={stats.progressToNextTier} className="h-2" />
              </div>
            )}
            {!stats.nextTier && (
              <p className="text-xs text-muted-foreground mt-2">Highest tier reached!</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Referrals</CardTitle>
            <CardDescription>Your referral submissions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyReferrals}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="count" fill="#F96D00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>Your latest submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReferrals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No referrals yet. Submit your first one!</p>
                <Button asChild><Link href="/reseller/referrals/new">Submit Referral</Link></Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReferrals.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{ref.companyName}</p>
                      <p className="text-xs text-muted-foreground">{ref.contactName} &middot; {format(new Date(ref.createdAt), "MMM d")}</p>
                    </div>
                    <Badge variant="outline" className={STATUS_COLORS[ref.status]}>{ref.status}</Badge>
                  </div>
                ))}
                <Button variant="outline" asChild className="w-full mt-2">
                  <Link href="/reseller/referrals">View All Referrals</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
