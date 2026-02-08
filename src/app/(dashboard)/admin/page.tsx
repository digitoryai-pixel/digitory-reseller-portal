"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, DollarSign, TrendingUp, Trophy, ArrowRight } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardData {
  stats: {
    totalResellers: number;
    activeResellers: number;
    totalReferrals: number;
    wonReferrals: number;
    conversionRate: number;
    totalCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
  };
  recentReferrals: {
    id: string;
    companyName: string;
    contactName: string;
    status: string;
    estimatedValue: number | null;
    createdAt: string;
    resellerName: string;
  }[];
  topResellers: {
    id: string;
    name: string;
    companyName: string;
    tier: string;
    totalEarnings: number;
    referralCount: number;
  }[];
  referralsByStatus: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "#F96D00",
  CONTACTED: "#8b5cf6",
  QUALIFIED: "#f59e0b",
  PROPOSAL: "#f97316",
  NEGOTIATION: "#ec4899",
  WON: "#22c55e",
  LOST: "#ef4444",
};

const TIER_COLORS: Record<string, string> = {
  BRONZE: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  SILVER: "bg-slate-400/10 text-slate-400 border-slate-400/20",
  GOLD: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PLATINUM: "bg-orange-400/10 text-orange-400 border-orange-400/20",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const { fc } = useCurrency();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2"><div className="h-4 w-24 bg-muted rounded" /></CardHeader>
              <CardContent><div className="h-8 w-16 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div>Failed to load dashboard data.</div>;

  const { stats, recentReferrals, topResellers, referralsByStatus } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/admin/resellers">View All Resellers <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Resellers"
          value={stats.activeResellers}
          description={`${stats.totalResellers} total resellers`}
          icon={Users}
        />
        <StatCard
          title="Total Referrals"
          value={stats.totalReferrals}
          description={`${stats.wonReferrals} won (${stats.conversionRate}% rate)`}
          icon={FileText}
        />
        <StatCard
          title="Total Commissions"
          value={fc(Number(stats.totalCommissions))}
          description={`${fc(Number(stats.pendingCommissions))} pending`}
          icon={DollarSign}
        />
        <StatCard
          title="Paid Out"
          value={fc(Number(stats.paidCommissions))}
          description="Total paid to resellers"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Referral Pipeline</CardTitle>
            <CardDescription>Referrals by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={referralsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {referralsByStatus.map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLORS[entry.status] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Resellers
            </CardTitle>
            <CardDescription>By total earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topResellers.map((reseller, index) => (
                <div key={reseller.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{reseller.name}</p>
                      <p className="text-xs text-muted-foreground">{reseller.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={TIER_COLORS[reseller.tier]}>
                      {reseller.tier}
                    </Badge>
                    <span className="text-sm font-semibold">
                      ${Number(reseller.totalEarnings).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>Latest referral submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReferrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{referral.companyName}</p>
                  <p className="text-xs text-muted-foreground">
                    by {referral.resellerName} &middot; {referral.contactName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {referral.estimatedValue && (
                    <span className="text-sm text-muted-foreground">
                      ${Number(referral.estimatedValue).toLocaleString()}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    style={{ borderColor: STATUS_COLORS[referral.status], color: STATUS_COLORS[referral.status] }}
                  >
                    {referral.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" asChild className="mt-4 w-full">
            <Link href="/admin/referrals">View All Referrals</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
