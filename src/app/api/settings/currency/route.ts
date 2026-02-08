import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_COUNTRY } from "@/lib/currency";

export async function GET() {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: "country" },
    });

    return NextResponse.json({
      countryCode: setting?.value || DEFAULT_COUNTRY,
    });
  } catch {
    return NextResponse.json({ countryCode: DEFAULT_COUNTRY });
  }
}
