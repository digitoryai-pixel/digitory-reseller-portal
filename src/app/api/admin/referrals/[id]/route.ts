import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateReferralStatusSchema } from "@/lib/validations";
import { formatCurrencyPrecise, DEFAULT_COUNTRY } from "@/lib/currency";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = updateReferralStatusSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const { status, dealValue } = parsed.data;
    const referral = await prisma.referral.findUnique({ where: { id }, include: { reseller: true } });
    if (!referral) return NextResponse.json({ error: "Referral not found" }, { status: 404 });

    const updateData: Record<string, unknown> = { status };
    if (dealValue !== undefined) updateData.dealValue = dealValue;

    const updated = await prisma.referral.update({ where: { id }, data: updateData });

    if (status === "WON" && dealValue && dealValue > 0) {
      const existingCommission = await prisma.commission.findUnique({ where: { referralId: id } });
      if (!existingCommission) {
        const commissionAmount = (dealValue * referral.reseller.commissionRate) / 100;
        await prisma.commission.create({
          data: { referralId: id, resellerId: referral.resellerId, dealValue, commissionRate: referral.reseller.commissionRate, commissionAmount, status: "PENDING" },
        });
        const countrySetting = await prisma.systemSettings.findUnique({ where: { key: "country" } });
        const countryCode = countrySetting?.value || DEFAULT_COUNTRY;
        await prisma.notification.create({
          data: { userId: referral.reseller.userId, title: "Referral Won!", message: `Your referral for ${referral.companyName} has been marked as Won! Commission: ${formatCurrencyPrecise(commissionAmount, countryCode)}`, link: "/reseller/commissions" },
        });
      }
    }

    await prisma.activityLog.create({
      data: { userId: session.user?.id || "", action: "REFERRAL_STATUS_UPDATED", entityType: "Referral", entityId: id, metadata: JSON.stringify({ from: referral.status, to: status }) },
    });

    if (status !== "WON") {
      await prisma.notification.create({
        data: { userId: referral.reseller.userId, title: "Referral Status Updated", message: `Your referral for ${referral.companyName} is now ${status}.`, link: "/reseller/referrals" },
      });
    }

    return NextResponse.json({ referral: updated });
  } catch (error) {
    console.error("Update referral error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
