"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

interface ReportData {
  monthlyReferrals: { month: string; count: number; revenue: number }[];
  resellerPerformance: { name: string; company: string; tier: string; referrals: number; totalCommissions: number; paidCommissions: number; totalEarnings: number }[];
  pipeline: { status: string; count: number; value: number }[];
}

const PIPELINE_COLORS: Record<string, string> = {
  NEW: "#F96D00", CONTACTED: "#8b5cf6", QUALIFIED: "#f59e0b",
  PROPOSAL: "#f97316", NEGOTIATION: "#ec4899", WON: "#22c55e", LOST: "#ef4444",
};

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const { fc } = useCurrency();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports").then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    if (!data) return;
    const headers = "Reseller,Company,Tier,Referrals,Total Commissions,Paid Commissions,Total Earnings\n";
    const rows = data.resellerPerformance.map(r =>
      `"${r.name}","${r.company}","${r.tier}",${r.referrals},${r.totalCommissions},${r.paidCommissions},${r.totalEarnings}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `reseller-report-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="space-y-6"><h1 className="text-3xl font-bold">Reports & Analytics</h1><div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div></div>;
  if (!data) return <div>Failed to load report data.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <Button onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Monthly Referrals</CardTitle><CardDescription>Last 6 months</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyReferrals}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="count" fill="#F96D00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Referral Pipeline</CardTitle><CardDescription>Distribution by status</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.pipeline} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ status, count }) => `${status}: ${count}`}>
                  {data.pipeline.map((entry, i) => <Cell key={i} fill={PIPELINE_COLORS[entry.status] || "#6b7280"} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Revenue Trend</CardTitle><CardDescription>Monthly revenue from won referrals</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyReferrals}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Reseller Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.resellerPerformance.sort((a, b) => b.totalEarnings - a.totalEarnings).map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">{i + 1}</span>
                    <div><p className="text-sm font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.company}</p></div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="secondary">{r.referrals} referrals</Badge>
                    <span className="font-semibold">${Number(r.totalEarnings).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
