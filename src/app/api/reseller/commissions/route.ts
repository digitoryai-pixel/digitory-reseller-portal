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

  const commissions = await prisma.commission.findMany({
    where: { resellerId },
    include: { referral: { select: { companyName: true, contactName: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totals = await prisma.commission.groupBy({ by: ["status"], where: { resellerId }, _sum: { commissionAmount: true }, _count: { id: true } });

  return NextResponse.json({ commissions, totals });
}
