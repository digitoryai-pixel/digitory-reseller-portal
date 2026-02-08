import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrencyPrecise, DEFAULT_COUNTRY } from "@/lib/currency";

export async function GET(request: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;

  const commissions = await prisma.commission.findMany({
    where,
    include: { referral: { select: { companyName: true, contactName: true } }, reseller: { include: { user: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const totals = await prisma.commission.groupBy({ by: ["status"], _sum: { commissionAmount: true }, _count: { id: true } });

  return NextResponse.json({ commissions, totals });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

    const commission = await prisma.commission.findUnique({ where: { id }, include: { reseller: true, referral: true } });
    if (!commission) return NextResponse.json({ error: "Commission not found" }, { status: 404 });

    const updateData: Record<string, unknown> = { status };
    if (status === "PAID") {
      updateData.paidAt = new Date();
      await prisma.reseller.update({ where: { id: commission.resellerId }, data: { totalEarnings: { increment: commission.commissionAmount } } });
    }

    const updated = await prisma.commission.update({ where: { id }, data: updateData });

    const countrySetting = await prisma.systemSettings.findUnique({ where: { key: "country" } });
    const countryCode = countrySetting?.value || DEFAULT_COUNTRY;
    await prisma.notification.create({
      data: { userId: commission.reseller.userId, title: status === "PAID" ? "Commission Paid" : `Commission ${status}`, message: `Your commission of ${formatCurrencyPrecise(commission.commissionAmount, countryCode)} for ${commission.referral.companyName} has been ${status.toLowerCase()}.`, link: "/reseller/commissions" },
    });

    return NextResponse.json({ commission: updated });
  } catch (error) {
    console.error("Update commission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
