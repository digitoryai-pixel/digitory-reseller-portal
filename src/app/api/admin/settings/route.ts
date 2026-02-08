import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.systemSettings.findMany();
  const tierConfigs = await prisma.tierConfig.findMany({ orderBy: { minReferrals: "asc" } });
  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => { settingsMap[s.key] = s.value; });

  return NextResponse.json({ settings: settingsMap, tierConfigs });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { settings, tierConfigs } = body;

    if (settings) {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.systemSettings.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } });
      }
    }

    if (tierConfigs && Array.isArray(tierConfigs)) {
      for (const config of tierConfigs) {
        await prisma.tierConfig.upsert({
          where: { tier: config.tier },
          update: { minReferrals: config.minReferrals, minRevenue: config.minRevenue, bonusRate: config.bonusRate },
          create: config,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
