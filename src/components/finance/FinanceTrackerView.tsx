import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext.tsx';
import {
  FinanceTransaction,
  TransactionType,
  TransactionCategory,
} from '../../types/index.ts';
import {
  calculateFinanceSummary,
  formatCurrency,
} from '../../utils/productivity.ts';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
  DollarSign,
  PieChart,
  Tag,
  Search,
  Sliders,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

interface FinanceTrackerViewProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const FinanceTrackerView: React.FC<FinanceTrackerViewProps> = ({
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const {
    state,
    addTransaction,
    deleteTransaction,
    updateBudget,
    updateCurrency,
  } = useNexus();

  // Filter state
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Budget edit state
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetVal, setNewBudgetVal] = useState(state.stats.monthlyBudget);

  // Add Transaction Form state
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<TransactionCategory>('Food');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');

  const summary = calculateFinanceSummary(
    state.transactions,
    state.stats.monthlyBudget
  );

  const expenseCategories: TransactionCategory[] = [
    'Education',
    'Housing',
    'Food',
    'Tech',
    'Books',
    'Entertainment',
    'Travel',
    'Other',
  ];

  const incomeCategories: TransactionCategory[] = [
    'Salary',
    'Freelance',
    'Allowance',
    'Scholarship',
    'Investments',
    'Other',
  ];

  const handleOpenAdd = () => {
    setFormType('expense');
    setFormTitle('');
    setFormCategory('Food');
    setFormAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount);
    if (!formTitle.trim() || isNaN(amountNum) || amountNum <= 0) return;

    addTransaction({
      type: formType,
      title: formTitle.trim(),
      category: formCategory,
      amount: amountNum,
      date: formDate,
      notes: formNotes.trim(),
    });

    setIsAddModalOpen(false);
  };

  const handleSaveBudget = () => {
    updateBudget(Number(newBudgetVal) || 2000);
    setIsEditingBudget(false);
  };

  // Filtered transactions
  const filteredTransactions = state.transactions.filter((tx) => {
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesCategory && matchesSearch;
  });

  const currencies = ['$', '€', '£', '₹', '¥', 'C$'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0A1128] border border-cyan-500/20 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span>Finance &amp; Budget Command</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Record cashflow, categorize student and professional expenses, and monitor monthly burn rate.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Currency dropdown */}
          <select
            value={state.stats.currency}
            onChange={(e) => updateCurrency(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-cyan-300 rounded-xl px-2.5 py-2 outline-none"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                Currency: {c}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-emerald-500/20 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance */}
        <div className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-500/40 transition">
          <p className="text-xs font-mono uppercase text-slate-400">Total Net Balance</p>
          <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">
            {formatCurrency(summary.netBalance, state.stats.currency)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Cumulative income minus expenditure
          </p>
        </div>

        {/* Total Income */}
        <div className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase text-slate-400">Monthly Inflow</p>
            <span className="p-1 rounded-lg bg-emerald-950 text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
            {formatCurrency(summary.totalIncome, state.stats.currency)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Stipends, contracts &amp; allowances
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase text-slate-400">Monthly Outflow</p>
            <span className="p-1 rounded-lg bg-rose-950 text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">
            {formatCurrency(summary.totalExpense, state.stats.currency)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Housing, tools, books &amp; living
          </p>
        </div>

        {/* Budget Limit Card */}
        <div className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase text-slate-400">Monthly Budget Cap</p>
            <button
              onClick={() => setIsEditingBudget(!isEditingBudget)}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              {isEditingBudget ? 'Cancel' : 'Edit Cap'}
            </button>
          </div>

          {isEditingBudget ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={newBudgetVal}
                onChange={(e) => setNewBudgetVal(Number(e.target.value))}
                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white font-mono"
              />
              <button
                onClick={handleSaveBudget}
                className="px-2.5 py-1 bg-cyan-500 text-black rounded-lg text-xs font-bold"
              >
                Set
              </button>
            </div>
          ) : (
            <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">
              {formatCurrency(state.stats.monthlyBudget, state.stats.currency)}
            </h3>
          )}

          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                summary.budgetUsedPercent > 80 ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${summary.budgetUsedPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            {formatCurrency(summary.remainingBudget, state.stats.currency)} remaining
          </p>
        </div>
      </div>

      {/* Spending Breakdown by Category */}
      <div className="bg-[#0A1128] border border-cyan-500/20 p-5 rounded-2xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase">
          <PieChart className="w-4 h-4 text-cyan-400" />
          <span>Expense Distribution by Category</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(summary.categoryBreakdown).map(([cat, amount]) => {
            const pct =
              summary.totalExpense > 0
                ? Math.round((amount / summary.totalExpense) * 100)
                : 0;

            return (
              <div
                key={cat}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{cat}</span>
                  <span className="font-mono text-cyan-400 font-bold">{pct}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-1.5 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  {formatCurrency(amount, state.stats.currency)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="bg-[#0A1128] border border-cyan-500/20 p-5 rounded-2xl space-y-4">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                typeFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg transition ${
                typeFilter === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg transition ${
                typeFilter === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expenses
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none"
            >
              <option value="all">All Categories</option>
              {expenseCategories.concat(incomeCategories).map((c, i) => (
                <option key={`${c}-${i}`} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transaction Table / Items */}
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800">
              <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No transactions recorded</p>
              <p className="text-xs text-slate-500 mt-1">
                Record your first income or expense to generate financial analytics.
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400'
                        : 'bg-rose-950/70 border border-rose-500/40 text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white">{tx.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span className="text-cyan-400">{tx.category}</span>
                      <span>&bull;</span>
                      <span>{tx.date}</span>
                      {tx.notes && (
                        <>
                          <span>&bull;</span>
                          <span className="text-slate-500 truncate max-w-[200px]">{tx.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-extrabold font-mono ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, state.stats.currency)}
                  </span>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    aria-label={`Delete transaction ${tx.title}`}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0A1128] border border-cyan-500/30 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Record Financial Transaction</h3>

            {/* Type selector */}
            <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold mb-4">
              <button
                type="button"
                onClick={() => {
                  setFormType('expense');
                  setFormCategory('Food');
                }}
                className={`py-2 rounded-lg transition ${
                  formType === 'expense'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expense Outflow
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormType('income');
                  setFormCategory('Salary');
                }}
                className={`py-2 rounded-lg transition ${
                  formType === 'income'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Income Inflow
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Transaction Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={formType === 'expense' ? 'e.g. Campus textbooks' : 'e.g. Research stipend'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Amount ({state.stats.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="120.00"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {(formType === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Additional memo or reference..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 font-bold rounded-xl text-xs transition ${
                    formType === 'income'
                      ? 'bg-emerald-400 hover:bg-emerald-300 text-black'
                      : 'bg-rose-500 hover:bg-rose-400 text-white'
                  }`}
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
