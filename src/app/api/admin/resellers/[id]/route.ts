import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateResellerSchema } from "@/lib/validations";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const reseller = await prisma.reseller.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
      referrals: { orderBy: { createdAt: "desc" }, take: 20 },
      commissions: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { referrals: true, commissions: true } },
    },
  });

  if (!reseller) return NextResponse.json({ error: "Reseller not found" }, { status: 404 });

  const wonReferrals = await prisma.referral.count({ where: { resellerId: id, status: "WON" } });

  return NextResponse.json({
    reseller,
    wonReferrals,
    conversionRate: reseller._count.referrals > 0 ? Math.round((wonReferrals / reseller._count.referrals) * 100) : 0,
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = updateResellerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const reseller = await prisma.reseller.update({
      where: { id },
      data: parsed.data,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ reseller });
  } catch (error) {
    console.error("Update reseller error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
