import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProductivityScore,
  calculateCompletionRate,
  calculateFinanceSummary,
  calculateNextRevisionDate,
  formatMinutesToHours,
  validatePasswordStrength,
} from './productivity.ts';
import { Task, FinanceTransaction } from '../types/index.ts';

test('calculateCompletionRate returns correct percentage', () => {
  assert.equal(calculateCompletionRate([]), 0);

  const mockTasks: Partial<Task>[] = [
    { completed: true },
    { completed: false },
    { completed: true },
    { completed: false },
  ];
  assert.equal(calculateCompletionRate(mockTasks as Task[]), 50);
});

test('calculateProductivityScore computes weighted score correctly', () => {
  const tasks: Partial<Task>[] = [
    { completed: true, priority: 'urgent' },
    { completed: true, priority: 'high' },
    { completed: false, priority: 'medium' },
    { completed: false, priority: 'low' },
  ];
  // 50% completion (20 pts), 100% priority tasks resolved (25 pts), 60m focus (10 pts), 3 days streak (6.4 pts) -> ~61
  const score = calculateProductivityScore(tasks as Task[], 60, 3);
  assert.ok(score >= 55 && score <= 68, `Expected score ~61, got ${score}`);
});

test('calculateFinanceSummary computes balances and categories accurately', () => {
  const transactions: Partial<FinanceTransaction>[] = [
    { type: 'income', amount: 3000, category: 'Salary' },
    { type: 'expense', amount: 800, category: 'Housing' },
    { type: 'expense', amount: 200, category: 'Food' },
    { type: 'expense', amount: 150, category: 'Tech' },
  ];

  const summary = calculateFinanceSummary(transactions as FinanceTransaction[], 2000);
  assert.equal(summary.totalIncome, 3000);
  assert.equal(summary.totalExpense, 1150);
  assert.equal(summary.netBalance, 1850);
  assert.equal(summary.remainingBudget, 850);
  assert.equal(summary.categoryBreakdown['Housing'], 800);
  assert.equal(summary.categoryBreakdown['Food'], 200);
});

test('calculateNextRevisionDate advances spaced repetition intervals correctly', () => {
  const base = '2026-11-01';
  // Stage 0 -> +1 day
  assert.equal(calculateNextRevisionDate(base, 0), '2026-11-02');
  // Stage 1 -> +3 days
  assert.equal(calculateNextRevisionDate(base, 1), '2026-11-04');
  // Stage 2 -> +7 days
  assert.equal(calculateNextRevisionDate(base, 2), '2026-11-08');
  // Stage 3 -> +14 days
  assert.equal(calculateNextRevisionDate(base, 3), '2026-11-15');
});

test('formatMinutesToHours formats time strings cleanly', () => {
  assert.equal(formatMinutesToHours(45), '45m');
  assert.equal(formatMinutesToHours(60), '1h');
  assert.equal(formatMinutesToHours(90), '1h 30m');
  assert.equal(formatMinutesToHours(125), '2h 5m');
});

test('validatePasswordStrength enforces robust password policies', () => {
  // Too short
  const shortPass = validatePasswordStrength('Ab1!');
  assert.equal(shortPass.hasMinLength, false);
  assert.equal(shortPass.isValid, false);

  // Strong password
  const strongPass = validatePasswordStrength('Nexus2026$Secure');
  assert.equal(strongPass.hasMinLength, true);
  assert.equal(strongPass.hasUpper, true);
  assert.equal(strongPass.hasLower, true);
  assert.equal(strongPass.hasNumber, true);
  assert.equal(strongPass.hasSpecial, true);
  assert.equal(strongPass.isValid, true);
  assert.equal(strongPass.label, 'Strong');
});
