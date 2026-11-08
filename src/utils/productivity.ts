import { Task, FinanceTransaction, Priority } from '../types/index.ts';

/**
 * Calculates a comprehensive productivity score between 0 and 100.
 * Factors in:
 * - Task completion percentage (weight 40%)
 * - High/Urgent priority tasks resolved (weight 25%)
 * - Daily focus minutes (weight 20%, target 120 mins)
 * - Streak momentum (weight 15%, max 7 days capped contribution)
 */
export function calculateProductivityScore(
  tasks: Task[],
  dailyFocusMinutes: number = 0,
  streakDays: number = 0
): number {
  if (!tasks || tasks.length === 0) {
    const focusFactor = Math.min(dailyFocusMinutes / 120, 1) * 35;
    const streakFactor = Math.min(streakDays / 7, 1) * 15;
    return Math.round(focusFactor + streakFactor);
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = completedTasks / totalTasks; // 0 to 1

  // Priority bonus: completing high or urgent tasks grants bonus weighting
  const priorityTasks = tasks.filter((t) => t.priority === 'urgent' || t.priority === 'high');
  let priorityScore = 1;
  if (priorityTasks.length > 0) {
    const completedPriority = priorityTasks.filter((t) => t.completed).length;
    priorityScore = completedPriority / priorityTasks.length;
  }

  const focusFactor = Math.min(dailyFocusMinutes / 120, 1);
  const streakFactor = Math.min(streakDays / 7, 1);

  const rawScore =
    completionRate * 40 +
    priorityScore * 25 +
    focusFactor * 20 +
    streakFactor * 15;

  return Math.min(Math.max(Math.round(rawScore), 0), 100);
}

/**
 * Calculates the percentage of completed tasks (0 - 100)
 */
export function calculateCompletionRate(tasks: Task[]): number {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
}

export interface FinanceSummaryResult {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  remainingBudget: number;
  budgetUsedPercent: number;
  categoryBreakdown: Record<string, number>;
}

/**
 * Computes financial breakdown metrics
 */
export function calculateFinanceSummary(
  transactions: FinanceTransaction[],
  monthlyBudget: number = 0
): FinanceSummaryResult {
  let totalIncome = 0;
  let totalExpense = 0;
  const categoryBreakdown: Record<string, number> = {};

  for (const tx of transactions) {
    const amount = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      totalIncome += amount;
    } else {
      totalExpense += amount;
      categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + amount;
    }
  }

  const netBalance = totalIncome - totalExpense;
  const remainingBudget = monthlyBudget > 0 ? monthlyBudget - totalExpense : 0;
  const budgetUsedPercent =
    monthlyBudget > 0 ? Math.min(Math.round((totalExpense / monthlyBudget) * 100), 100) : 0;

  return {
    totalIncome,
    totalExpense,
    netBalance,
    remainingBudget,
    budgetUsedPercent,
    categoryBreakdown,
  };
}

/**
 * Spaced Repetition calculation for revision tracking.
 * Stage 0: 1 day
 * Stage 1: 3 days
 * Stage 2: 7 days
 * Stage 3: 14 days
 */
export function calculateNextRevisionDate(baseDateStr: string, stage: number): string {
  const intervals = [1, 3, 7, 14];
  const daysToAdd = intervals[Math.min(stage, intervals.length - 1)] || 1;

  const baseDate = new Date(baseDateStr);
  if (isNaN(baseDate.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + daysToAdd);
    return fallback.toISOString().split('T')[0];
  }

  baseDate.setDate(baseDate.getDate() + daysToAdd);
  return baseDate.toISOString().split('T')[0];
}

/**
 * Format minutes into readable "Xh Ym" or "X mins"
 */
export function formatMinutesToHours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

/**
 * Formats currency safely
 */
export function formatCurrency(amount: number, currency: string = '$'): string {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${currency}${formatted}` : `${currency}${formatted}`;
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
}

/**
 * Evaluates password security against commercial best practices
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let passedCriteria = 0;
  if (hasMinLength) passedCriteria++;
  if (hasUpper && hasLower) passedCriteria++;
  if (hasNumber) passedCriteria++;
  if (hasSpecial) passedCriteria++;

  let label: PasswordStrengthResult['label'] = 'Weak';
  if (passedCriteria === 4 && password.length >= 10) {
    label = 'Strong';
  } else if (passedCriteria >= 3) {
    label = 'Good';
  } else if (passedCriteria >= 2) {
    label = 'Fair';
  }

  // Valid if minimum length and has at least numbers or special characters plus letters
  const isValid = hasMinLength && (hasNumber || hasSpecial) && (hasUpper || hasLower);

  return {
    score: passedCriteria,
    label,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isValid,
  };
}
