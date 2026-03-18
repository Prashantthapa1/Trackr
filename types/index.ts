/**
 * types/index.ts
 *
 * Shared TypeScript types and interfaces used across the application.
 * We centralize these here so API routes, Server Components, and Client
 * Components all reference the same shapes. Zod schemas for validation
 * live alongside the types they validate.
 */
import { z } from "zod";

// ============================================================
// Expense
// ============================================================

export const createExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(3).max(3),
  category: z.string().min(1, "Category is required").max(50),
  description: z.string().max(500).optional(),
  date: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export interface ExpenseRow {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string | null;
  date: string;
  receiptUrl: string | null;
  tags: string[];
  createdAt: string;
}

// ============================================================
// Usage
// ============================================================

export interface UsageInfo {
  count: number;
  limit: number;
  month: string;
  percentage: number;
}

// ============================================================
// Team
// ============================================================

export const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100),
  avatar: z.string().max(10).optional(),
  description: z.string().max(500).optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const inviteTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>;

export interface TeamMemberRow {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: string;
  joinedAt: string;
}

export interface TeamRow {
  id: string;
  name: string;
  avatar: string | null;
  description: string | null;
  ownerId: string;
  memberCount: number;
  role: string;
  createdAt: string;
}

export interface TeamActivityRow {
  id: string;
  action: string;
  description: string;
  userName: string | null;
  userEmail: string;
  createdAt: string;
}

export interface NotificationRow {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export const createTeamBudgetSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  period: z.enum(["weekly", "monthly", "quarterly", "yearly"]).default("monthly"),
  category: z.string().max(50).optional(),
});

export const createTeamCategorySchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

// ============================================================
// API Response
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================
// Dashboard
// ============================================================

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Health & Medical",
  "Education",
  "Travel",
  "Personal Care",
  "Other",
] as const;

export const FREE_CATEGORIES = EXPENSE_CATEGORIES.slice(0, 3);

export function getCategoriesForPlan(plan: string): readonly string[] {
  return plan === "FREE" ? FREE_CATEGORIES : EXPENSE_CATEGORIES;
}

// ============================================================
// Reports
// ============================================================

export interface MonthlyData {
  month: string;
  total: number;
}

export interface CategoryData {
  category: string;
  total: number;
  count: number;
}

// ============================================================
// Admin
// ============================================================

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  subscriptionId: string | null;
  createdAt: string;
  _count: {
    expenses: number;
  };
}

export const overridePlanSchema = z.object({
  userId: z.string().cuid(),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
});

// ============================================================
// Budget
// ============================================================

export const createBudgetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  amount: z.number().positive("Amount must be positive"),
  period: z.enum(["weekly", "monthly", "quarterly", "yearly"]).default("monthly"),
  category: z.string().max(50).optional(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

export interface BudgetRow {
  id: string;
  name: string;
  amount: number;
  period: string;
  category: string | null;
  startDate: string;
  createdAt: string;
}

// ============================================================
// Category (Custom)
// ============================================================

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be hex color").optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// ============================================================
// Settings
// ============================================================

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  monthlyBudget: z.number().positive().optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
