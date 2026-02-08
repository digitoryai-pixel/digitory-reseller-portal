import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [referrals, resellers] = await Promise.all([
    prisma.referral.findMany({ where: { createdAt: { gte: sixMonthsAgo } }, select: { createdAt: true, status: true, dealValue: true } }),
    prisma.reseller.findMany({
      include: { user: { select: { name: true } }, _count: { select: { referrals: true } }, commissions: { select: { commissionAmount: true, status: true } } },
    }),
  ]);

  const monthlyReferrals: Record<string, number> = {};
  const monthlyRevenue: Record<string, number> = {};
  referrals.forEach((r) => {
    const month = r.createdAt.toISOString().slice(0, 7);
    monthlyReferrals[month] = (monthlyReferrals[month] || 0) + 1;
    if (r.dealValue) monthlyRevenue[month] = (monthlyRevenue[month] || 0) + r.dealValue;
  });

  const resellerPerformance = resellers.map((r) => ({
    name: r.user.name, company: r.companyName, tier: r.tier, referrals: r._count.referrals,
    totalCommissions: r.commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
    paidCommissions: r.commissions.filter(c => c.status === "PAID").reduce((sum, c) => sum + c.commissionAmount, 0),
    totalEarnings: r.totalEarnings,
  }));

  const pipeline = await prisma.referral.groupBy({ by: ["status"], _count: { id: true }, _sum: { estimatedValue: true } });

  return NextResponse.json({
    monthlyReferrals: Object.entries(monthlyReferrals).map(([month, count]) => ({ month, count, revenue: monthlyRevenue[month] || 0 })),
    resellerPerformance,
    pipeline: pipeline.map(p => ({ status: p.status, count: p._count.id, value: p._sum.estimatedValue || 0 })),
  });
}
