/**
 * lib/team-permissions.ts
 *
 * Helper functions for team role-based access control.
 * Used in API routes and server components to check permissions.
 */
import type { TeamRole } from "@prisma/client";

export function canAddExpense(role: TeamRole): boolean {
  return role === "ADMIN" || role === "MEMBER";
}

export function canEditExpense(
  role: TeamRole,
  expenseUserId: string,
  currentUserId: string
): boolean {
  if (role === "ADMIN") return true;
  if (role === "MEMBER") return expenseUserId === currentUserId;
  return false;
}

export function canDeleteExpense(
  role: TeamRole,
  expenseUserId: string,
  currentUserId: string
): boolean {
  if (role === "ADMIN") return true;
  if (role === "MEMBER") return expenseUserId === currentUserId;
  return false;
}

export function canInviteMembers(role: TeamRole): boolean {
  return role === "ADMIN";
}

export function canManageBudgets(role: TeamRole): boolean {
  return role === "ADMIN";
}

export function canManageCategories(role: TeamRole): boolean {
  return role === "ADMIN";
}

export function canManageSettings(role: TeamRole): boolean {
  return role === "ADMIN";
}

export function canRemoveMembers(role: TeamRole): boolean {
  return role === "ADMIN";
}

export function canChangeRoles(role: TeamRole): boolean {
  return role === "ADMIN";
}

export function canApproveExpenses(role: TeamRole): boolean {
  return role === "ADMIN";
}

export function canExportTeamData(role: TeamRole): boolean {
  return role === "ADMIN";
}

export function getRoleBadgeColor(role: TeamRole): string {
  switch (role) {
    case "ADMIN":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "MEMBER":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "VIEWER":
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-600";
  }
}
