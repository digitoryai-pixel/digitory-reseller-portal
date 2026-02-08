import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user?.id || "" }, include: { reseller: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role,
      reseller: user.reseller ? { id: user.reseller.id, companyName: user.reseller.companyName, phone: user.reseller.phone, address: user.reseller.address, commissionRate: user.reseller.commissionRate, tier: user.reseller.tier, status: user.reseller.status, totalEarnings: user.reseller.totalEarnings } : null,
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, companyName, phone, address, currentPassword, newPassword } = body;
    const updateUserData: Record<string, unknown> = {};
    if (name) updateUserData.name = name;

    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      const user = await prisma.user.findUnique({ where: { id: session.user?.id || "" } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      updateUserData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateUserData).length > 0) {
      await prisma.user.update({ where: { id: session.user?.id || "" }, data: updateUserData });
    }

    const resellerId = (session.user as { resellerId?: string })?.resellerId;
    if (resellerId) {
      const updateResellerData: Record<string, unknown> = {};
      if (companyName) updateResellerData.companyName = companyName;
      if (phone !== undefined) updateResellerData.phone = phone || null;
      if (address !== undefined) updateResellerData.address = address || null;
      if (Object.keys(updateResellerData).length > 0) {
        await prisma.reseller.update({ where: { id: resellerId }, data: updateResellerData });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
