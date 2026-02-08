import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReferralSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "RESELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resellerId = (session.user as { resellerId?: string })?.resellerId;
  if (!resellerId) return NextResponse.json({ error: "Reseller not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const where: Record<string, unknown> = { resellerId };
  if (status && status !== "all") where.status = status;
  if (search) { where.OR = [{ companyName: { contains: search } }, { contactName: { contains: search } }]; }

  const referrals = await prisma.referral.findMany({ where, include: { commission: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ referrals });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "RESELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resellerId = (session.user as { resellerId?: string })?.resellerId;
  if (!resellerId) return NextResponse.json({ error: "Reseller not found" }, { status: 404 });

  try {
    const body = await request.json();
    const parsed = createReferralSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const referral = await prisma.referral.create({ data: { ...parsed.data, resellerId } });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: { userId: admin.id, title: "New Referral Submitted", message: `${session.user?.name} submitted: ${parsed.data.companyName}`, link: "/admin/referrals" },
      });
    }

    await prisma.activityLog.create({
      data: { userId: session.user?.id || "", action: "REFERRAL_CREATED", entityType: "Referral", entityId: referral.id, metadata: JSON.stringify({ companyName: parsed.data.companyName }) },
    });

    return NextResponse.json({ referral }, { status: 201 });
  } catch (error) {
    console.error("Create referral error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
