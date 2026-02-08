import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  phone: z.string().optional(),
});

export const createResellerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  phone: z.string().optional(),
  commissionRate: z.number().min(0).max(100).default(10),
});

export const updateResellerSchema = z.object({
  companyName: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).optional(),
});

export const createReferralSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().optional(),
  productInterest: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE", "CUSTOM"]).default("STARTER"),
  estimatedValue: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const updateReferralStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
  dealValue: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const updateCommissionStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "PAID", "CANCELLED"]),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  companyName: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export const systemSettingsSchema = z.object({
  defaultCommissionRate: z.number().min(0).max(100).optional(),
  companyName: z.string().optional(),
  companyEmail: z.string().email().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateResellerInput = z.infer<typeof createResellerSchema>;
export type UpdateResellerInput = z.infer<typeof updateResellerSchema>;
export type CreateReferralInput = z.infer<typeof createReferralSchema>;
export type UpdateReferralStatusInput = z.infer<typeof updateReferralStatusSchema>;
export type UpdateCommissionStatusInput = z.infer<typeof updateCommissionStatusSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
