import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalResellers, activeResellers, totalReferrals, wonReferrals, commissions, recentReferrals, topResellers, monthlyData] = await Promise.all([
    prisma.reseller.count(),
    prisma.reseller.count({ where: { status: "ACTIVE" } }),
    prisma.referral.count(),
    prisma.referral.count({ where: { status: "WON" } }),
    prisma.commission.aggregate({ _sum: { commissionAmount: true }, where: { status: { in: ["APPROVED", "PAID"] } } }),
    prisma.referral.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { reseller: { include: { user: true } } } }),
    prisma.reseller.findMany({ take: 5, orderBy: { totalEarnings: "desc" }, include: { user: true, _count: { select: { referrals: true } } } }),
    prisma.referral.groupBy({ by: ["status"], _count: { id: true } }),
  ]);

  const pendingCommissions = await prisma.commission.aggregate({ _sum: { commissionAmount: true }, where: { status: "PENDING" } });
  const paidCommissions = await prisma.commission.aggregate({ _sum: { commissionAmount: true }, where: { status: "PAID" } });
  const conversionRate = totalReferrals > 0 ? Math.round((wonReferrals / totalReferrals) * 100) : 0;

  return NextResponse.json({
    stats: { totalResellers, activeResellers, totalReferrals, wonReferrals, conversionRate, totalCommissions: commissions._sum.commissionAmount || 0, pendingCommissions: pendingCommissions._sum.commissionAmount || 0, paidCommissions: paidCommissions._sum.commissionAmount || 0 },
    recentReferrals: recentReferrals.map((r) => ({ id: r.id, companyName: r.companyName, contactName: r.contactName, status: r.status, estimatedValue: r.estimatedValue, createdAt: r.createdAt, resellerName: r.reseller.user.name })),
    topResellers: topResellers.map((r) => ({ id: r.id, name: r.user.name, companyName: r.companyName, tier: r.tier, totalEarnings: r.totalEarnings, referralCount: r._count.referrals })),
    referralsByStatus: monthlyData.map((m) => ({ status: m.status, count: m._count.id })),
  });
}
