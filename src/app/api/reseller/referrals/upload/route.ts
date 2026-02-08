import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "RESELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resellerId = (session.user as { resellerId?: string })?.resellerId;
  if (!resellerId) return NextResponse.json({ error: "Reseller not found" }, { status: 404 });

  try {
    const body = await request.json();
    const { csvData } = body;
    if (!csvData || typeof csvData !== "string") return NextResponse.json({ error: "CSV data is required" }, { status: 400 });

    const lines = csvData.trim().split("\n");
    if (lines.length < 2) return NextResponse.json({ error: "CSV must have a header and at least one data row" }, { status: 400 });

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const required = ["companyname", "contactname", "contactemail"];
    const missing = required.filter(h => !headers.includes(h));
    if (missing.length > 0) return NextResponse.json({ error: `Missing headers: ${missing.join(", ")}` }, { status: 400 });

    let imported = 0, skipped = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      if (values.length < headers.length) { errors.push({ row: i + 1, message: "Insufficient columns" }); skipped++; continue; }

      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx]; });

      if (!row.companyname || !row.contactname || !row.contactemail) { errors.push({ row: i + 1, message: "Missing required fields" }); skipped++; continue; }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.contactemail)) { errors.push({ row: i + 1, message: "Invalid email" }); skipped++; continue; }

      const validProducts = ["STARTER", "PROFESSIONAL", "ENTERPRISE", "CUSTOM"];
      const productInterest = row.productinterest && validProducts.includes(row.productinterest.toUpperCase()) ? row.productinterest.toUpperCase() : "STARTER";

      try {
        await prisma.referral.create({
          data: { resellerId, companyName: row.companyname, contactName: row.contactname, contactEmail: row.contactemail, contactPhone: row.contactphone || null, productInterest, estimatedValue: row.estimatedvalue ? parseFloat(row.estimatedvalue) : null, notes: row.notes || null },
        });
        imported++;
      } catch { errors.push({ row: i + 1, message: "Database error" }); skipped++; }
    }

    return NextResponse.json({ imported, skipped, errors });
  } catch (error) {
    console.error("CSV upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
