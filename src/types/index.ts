export type Role = "ADMIN" | "RESELLER";
export type ResellerTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
export type ResellerStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type ReferralStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
export type CommissionStatus = "PENDING" | "APPROVED" | "PAID" | "CANCELLED";
export type ProductInterest = "STARTER" | "PROFESSIONAL" | "ENTERPRISE" | "CUSTOM";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  resellerId?: string;
}

export interface DashboardStats {
  totalResellers: number;
  activeResellers: number;
  totalReferrals: number;
  wonReferrals: number;
  conversionRate: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
}

export interface ResellerDashboardStats {
  totalReferrals: number;
  wonReferrals: number;
  conversionRate: number;
  totalEarnings: number;
  pendingEarnings: number;
  currentTier: ResellerTier;
  nextTier: ResellerTier | null;
  progressToNextTier: number;
}

export interface MonthlyData {
  month: string;
  count: number;
  value?: number;
}

export interface CSVUploadResult {
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}
