import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@digitory.com" },
    update: {},
    create: {
      email: "admin@digitory.com",
      name: "Digitory Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin created:", admin.email);

  // Create sample resellers
  const resellerPassword = await bcrypt.hash("reseller123", 10);

  const reseller1User = await prisma.user.upsert({
    where: { email: "john@techpartners.com" },
    update: {},
    create: {
      email: "john@techpartners.com",
      name: "John Smith",
      passwordHash: resellerPassword,
      role: "RESELLER",
    },
  });

  const reseller1 = await prisma.reseller.upsert({
    where: { userId: reseller1User.id },
    update: {},
    create: {
      userId: reseller1User.id,
      companyName: "Tech Partners Inc",
      phone: "+1-555-0101",
      commissionRate: 15,
      tier: "GOLD",
      status: "ACTIVE",
      totalEarnings: 45000,
    },
  });

  const reseller2User = await prisma.user.upsert({
    where: { email: "sarah@digitalagency.com" },
    update: {},
    create: {
      email: "sarah@digitalagency.com",
      name: "Sarah Johnson",
      passwordHash: resellerPassword,
      role: "RESELLER",
    },
  });

  const reseller2 = await prisma.reseller.upsert({
    where: { userId: reseller2User.id },
    update: {},
    create: {
      userId: reseller2User.id,
      companyName: "Digital Agency Co",
      phone: "+1-555-0102",
      commissionRate: 12,
      tier: "SILVER",
      status: "ACTIVE",
      totalEarnings: 18000,
    },
  });

  const reseller3User = await prisma.user.upsert({
    where: { email: "mike@cloudresellers.com" },
    update: {},
    create: {
      email: "mike@cloudresellers.com",
      name: "Mike Chen",
      passwordHash: resellerPassword,
      role: "RESELLER",
    },
  });

  const reseller3 = await prisma.reseller.upsert({
    where: { userId: reseller3User.id },
    update: {},
    create: {
      userId: reseller3User.id,
      companyName: "Cloud Resellers LLC",
      phone: "+1-555-0103",
      commissionRate: 10,
      tier: "BRONZE",
      status: "ACTIVE",
      totalEarnings: 5000,
    },
  });

  // Create sample referrals
  const referrals = await Promise.all([
    prisma.referral.create({
      data: {
        resellerId: reseller1.id,
        companyName: "Acme Corporation",
        contactName: "Bob Williams",
        contactEmail: "bob@acme.com",
        contactPhone: "+1-555-1001",
        productInterest: "ENTERPRISE",
        estimatedValue: 50000,
        dealValue: 48000,
        status: "WON",
      },
    }),
    prisma.referral.create({
      data: {
        resellerId: reseller1.id,
        companyName: "Global Tech Ltd",
        contactName: "Alice Brown",
        contactEmail: "alice@globaltech.com",
        productInterest: "PROFESSIONAL",
        estimatedValue: 25000,
        status: "PROPOSAL",
      },
    }),
    prisma.referral.create({
      data: {
        resellerId: reseller1.id,
        companyName: "StartupXYZ",
        contactName: "Dave Lee",
        contactEmail: "dave@startupxyz.com",
        productInterest: "STARTER",
        estimatedValue: 5000,
        status: "CONTACTED",
      },
    }),
    prisma.referral.create({
      data: {
        resellerId: reseller2.id,
        companyName: "MegaCorp Industries",
        contactName: "Emma Davis",
        contactEmail: "emma@megacorp.com",
        contactPhone: "+1-555-1004",
        productInterest: "ENTERPRISE",
        estimatedValue: 80000,
        dealValue: 75000,
        status: "WON",
      },
    }),
    prisma.referral.create({
      data: {
        resellerId: reseller2.id,
        companyName: "Innovation Labs",
        contactName: "Frank Garcia",
        contactEmail: "frank@innovationlabs.com",
        productInterest: "PROFESSIONAL",
        estimatedValue: 30000,
        status: "QUALIFIED",
      },
    }),
    prisma.referral.create({
      data: {
        resellerId: reseller3.id,
        companyName: "SmallBiz Solutions",
        contactName: "Grace Kim",
        contactEmail: "grace@smallbiz.com",
        productInterest: "STARTER",
        estimatedValue: 8000,
        dealValue: 8000,
        status: "WON",
      },
    }),
    prisma.referral.create({
      data: {
        resellerId: reseller3.id,
        companyName: "RetailMax",
        contactName: "Henry Taylor",
        contactEmail: "henry@retailmax.com",
        productInterest: "PROFESSIONAL",
        estimatedValue: 20000,
        status: "NEW",
      },
    }),
    prisma.referral.create({
      data: {
        resellerId: reseller1.id,
        companyName: "DataFlow Inc",
        contactName: "Ivy Zhang",
        contactEmail: "ivy@dataflow.com",
        productInterest: "ENTERPRISE",
        estimatedValue: 60000,
        status: "NEGOTIATION",
      },
    }),
  ]);

  // Create commissions for won referrals
  const wonReferrals = referrals.filter((r) => r.status === "WON");
  for (const referral of wonReferrals) {
    const reseller = [reseller1, reseller2, reseller3].find(
      (r) => r.id === referral.resellerId
    )!;
    const commissionAmount =
      (Number(referral.dealValue) * Number(reseller.commissionRate)) / 100;

    await prisma.commission.create({
      data: {
        referralId: referral.id,
        resellerId: reseller.id,
        dealValue: referral.dealValue!,
        commissionRate: reseller.commissionRate,
        commissionAmount,
        status: referral.resellerId === reseller1.id ? "PAID" : "APPROVED",
        paidAt: referral.resellerId === reseller1.id ? new Date() : null,
      },
    });
  }

  // Create tier configs
  await Promise.all([
    prisma.tierConfig.upsert({
      where: { tier: "BRONZE" },
      update: {},
      create: { tier: "BRONZE", minReferrals: 0, minRevenue: 0, bonusRate: 0 },
    }),
    prisma.tierConfig.upsert({
      where: { tier: "SILVER" },
      update: {},
      create: { tier: "SILVER", minReferrals: 10, minRevenue: 50000, bonusRate: 2 },
    }),
    prisma.tierConfig.upsert({
      where: { tier: "GOLD" },
      update: {},
      create: { tier: "GOLD", minReferrals: 25, minRevenue: 150000, bonusRate: 5 },
    }),
    prisma.tierConfig.upsert({
      where: { tier: "PLATINUM" },
      update: {},
      create: { tier: "PLATINUM", minReferrals: 50, minRevenue: 500000, bonusRate: 8 },
    }),
  ]);

  // Create system settings
  await Promise.all([
    prisma.systemSettings.upsert({
      where: { key: "defaultCommissionRate" },
      update: {},
      create: { key: "defaultCommissionRate", value: "10" },
    }),
    prisma.systemSettings.upsert({
      where: { key: "companyName" },
      update: {},
      create: { key: "companyName", value: "Digitory" },
    }),
    prisma.systemSettings.upsert({
      where: { key: "companyEmail" },
      update: {},
      create: { key: "companyEmail", value: "contact@digitory.com" },
    }),
    prisma.systemSettings.upsert({
      where: { key: "country" },
      update: {},
      create: { key: "country", value: "US" },
    }),
  ]);

  // Create sample notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: admin.id,
        title: "New Referral Submitted",
        message: "John Smith submitted a new referral: DataFlow Inc",
        link: "/admin/referrals",
      },
    }),
    prisma.notification.create({
      data: {
        userId: reseller1User.id,
        title: "Referral Status Updated",
        message: "Your referral for Acme Corporation has been marked as Won!",
        link: "/reseller/referrals",
      },
    }),
    prisma.notification.create({
      data: {
        userId: reseller1User.id,
        title: "Commission Paid",
        message: "Your commission of $7,200 for Acme Corporation has been paid.",
        link: "/reseller/commissions",
        read: true,
      },
    }),
  ]);

  // Create activity logs
  await Promise.all([
    prisma.activityLog.create({
      data: {
        userId: admin.id,
        action: "REFERRAL_STATUS_UPDATED",
        entityType: "Referral",
        entityId: referrals[0].id,
        metadata: JSON.stringify({ from: "PROPOSAL", to: "WON", referralCompany: "Acme Corporation" }),
      },
    }),
    prisma.activityLog.create({
      data: {
        userId: admin.id,
        action: "COMMISSION_PAID",
        entityType: "Commission",
        entityId: reseller1.id,
        metadata: JSON.stringify({ amount: 7200, resellerName: "John Smith" }),
      },
    }),
  ]);

  console.log("Seed completed successfully!");
  console.log("---");
  console.log("Admin login: admin@digitory.com / admin123");
  console.log("Reseller login: john@techpartners.com / reseller123");
  console.log("Reseller login: sarah@digitalagency.com / reseller123");
  console.log("Reseller login: mike@cloudresellers.com / reseller123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
