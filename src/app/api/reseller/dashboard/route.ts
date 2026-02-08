import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "RESELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resellerId = (session.user as { resellerId?: string })?.resellerId;
  if (!resellerId) return NextResponse.json({ error: "Reseller not found" }, { status: 404 });

  const reseller = await prisma.reseller.findUnique({ where: { id: resellerId } });
  if (!reseller) return NextResponse.json({ error: "Reseller not found" }, { status: 404 });

  const [totalReferrals, wonReferrals, pendingEarnings, recentReferrals, tierConfigs] = await Promise.all([
    prisma.referral.count({ where: { resellerId } }),
    prisma.referral.count({ where: { resellerId, status: "WON" } }),
    prisma.commission.aggregate({ where: { resellerId, status: "PENDING" }, _sum: { commissionAmount: true } }),
    prisma.referral.findMany({ where: { resellerId }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.tierConfig.findMany({ orderBy: { minReferrals: "asc" } }),
  ]);

  const conversionRate = totalReferrals > 0 ? Math.round((wonReferrals / totalReferrals) * 100) : 0;

  const tierOrder = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];
  const currentTierIndex = tierOrder.indexOf(reseller.tier);
  const nextTier = currentTierIndex < tierOrder.length - 1 ? tierOrder[currentTierIndex + 1] : null;
  const nextTierConfig = nextTier ? tierConfigs.find(t => t.tier === nextTier) : null;

  let progressToNextTier = 100;
  if (nextTierConfig) {
    const referralProgress = nextTierConfig.minReferrals > 0 ? Math.min(100, (totalReferrals / nextTierConfig.minReferrals) * 100) : 100;
    const revenueProgress = nextTierConfig.minRevenue > 0 ? Math.min(100, (reseller.totalEarnings / nextTierConfig.minRevenue) * 100) : 100;
    progressToNextTier = Math.round((referralProgress + revenueProgress) / 2);
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyRefs = await prisma.referral.findMany({ where: { resellerId, createdAt: { gte: sixMonthsAgo } }, select: { createdAt: true } });

  const monthlyData: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); monthlyData[d.toISOString().slice(0, 7)] = 0; }
  monthlyRefs.forEach(r => { const key = r.createdAt.toISOString().slice(0, 7); if (monthlyData[key] !== undefined) monthlyData[key]++; });

  return NextResponse.json({
    stats: { totalReferrals, wonReferrals, conversionRate, totalEarnings: reseller.totalEarnings, pendingEarnings: pendingEarnings._sum.commissionAmount || 0, commissionRate: reseller.commissionRate, currentTier: reseller.tier, nextTier, progressToNextTier },
    recentReferrals,
    monthlyReferrals: Object.entries(monthlyData).map(([month, count]) => ({ month, count })),
  });
}
