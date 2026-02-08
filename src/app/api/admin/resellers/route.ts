import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createResellerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const tier = searchParams.get("tier");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (tier && tier !== "all") where.tier = tier;
  if (search) {
    where.OR = [
      { companyName: { contains: search } },
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } },
    ];
  }

  const resellers = await prisma.reseller.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } }, _count: { select: { referrals: true, commissions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ resellers });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createResellerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const { name, email, password, companyName, phone, commissionRate } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, role: "RESELLER", reseller: { create: { companyName, phone: phone || null, commissionRate } } },
      include: { reseller: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Create reseller error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
