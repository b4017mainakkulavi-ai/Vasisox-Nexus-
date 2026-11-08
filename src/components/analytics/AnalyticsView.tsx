import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext.tsx';
import {
  calculateProductivityScore,
  calculateCompletionRate,
  calculateFinanceSummary,
  formatCurrency,
  formatMinutesToHours,
} from '../../utils/productivity.ts';
import {
  BarChart3,
  TrendingUp,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  PieChart,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileJson,
  HelpCircle,
  Check,
} from 'lucide-react';

interface AnalyticsViewProps {
  onOpenDocs: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onOpenDocs }) => {
  const {
    state,
    exportDataAsJSON,
    importDataFromJSON,
    resetToSampleData,
  } = useNexus();

  const [importJsonText, setImportJsonText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{ error?: string; success?: boolean } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  const productivityScore = calculateProductivityScore(
    state.tasks,
    state.stats.dailyFocusMinutes,
    state.stats.currentStreakDays
  );
  const completionRate = calculateCompletionRate(state.tasks);
  const financeSummary = calculateFinanceSummary(
    state.transactions,
    state.stats.monthlyBudget
  );

  // Category counts
  const tasksByCategory: Record<string, { total: number; completed: number }> = {};
  state.tasks.forEach((t) => {
    if (!tasksByCategory[t.category]) {
      tasksByCategory[t.category] = { total: 0, completed: 0 };
    }
    tasksByCategory[t.category].total += 1;
    if (t.completed) tasksByCategory[t.category].completed += 1;
  });

  // Export JSON download
  const handleExportDownload = () => {
    const jsonStr = exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vasisox-nexus-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = () => {
    const jsonStr = exportDataAsJSON();
    navigator.clipboard.writeText(jsonStr);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportStatus(null);
    const res = importDataFromJSON(importJsonText);
    if (res.success) {
      setImportStatus({ success: true });
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportStatus(null);
        setImportJsonText('');
      }, 1200);
    } else {
      setImportStatus({ error: res.error || 'Failed to import JSON data.' });
    }
  };

  // Mock 7-day productivity sparkline values
  const weeklyTrends = [
    { day: 'Mon', score: 68, focus: 90 },
    { day: 'Tue', score: 74, focus: 110 },
    { day: 'Wed', score: 82, focus: 130 },
    { day: 'Thu', score: 79, focus: 95 },
    { day: 'Fri', score: 88, focus: 140 },
    { day: 'Sat', score: 92, focus: 150 },
    { day: 'Sun', score: productivityScore, focus: state.stats.dailyFocusMinutes },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0A1128] border border-cyan-500/20 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Productivity Analytics &amp; Backups</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Weekly throughput, cognitive efficiency ratings, category heatmaps, and JSON portability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDocs}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Deployment Guide</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Weekly Productivity Trend Bar Chart */}
        <div className="bg-[#0A1128] border border-cyan-500/20 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-slate-400">7-Day Momentum</p>
              <h3 className="text-lg font-bold text-white mt-0.5">Productivity Velocity</h3>
            </div>
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="h-40 flex items-end justify-between gap-2 pt-6">
            {weeklyTrends.map((w, idx) => {
              const heightPct = Math.min(Math.max(w.score, 15), 100);
              const isToday = idx === 6;
              return (
                <div key={w.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-mono text-slate-400">{w.score}%</span>
                  <div className="w-full bg-slate-800 rounded-t-lg h-full max-h-28 flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-cyan-500 to-blue-400'
                          : 'bg-slate-700 hover:bg-cyan-500/50'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-mono ${
                      isToday ? 'text-cyan-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {w.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Completion by Category Breakdown */}
        <div className="bg-[#0A1128] border border-cyan-500/20 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-slate-400">Category Breakdown</p>
              <h3 className="text-lg font-bold text-white mt-0.5">Execution by Domain</h3>
            </div>
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
          </div>

          <div className="space-y-2.5 pt-2">
            {Object.entries(tasksByCategory).map(([cat, data]) => {
              const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat}</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {data.completed}/{data.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Study Subject Allocation */}
        <div className="bg-[#0A1128] border border-cyan-500/20 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-slate-400">Syllabus Density</p>
              <h3 className="text-lg font-bold text-white mt-0.5">Academic Progress</h3>
            </div>
            <BookOpen className="w-5 h-5 text-purple-400" />
          </div>

          <div className="space-y-3 pt-2">
            {state.subjects.map((sub) => (
              <div key={sub.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-200 truncate max-w-[180px] font-medium">
                    {sub.name}
                  </span>
                  <span className="font-mono text-purple-400 font-bold">
                    {sub.syllabusProgress}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full"
                    style={{ width: `${sub.syllabusProgress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Portability & Backup Center */}
      <div className="bg-[#0A1128] border border-cyan-500/25 p-6 rounded-2xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileJson className="w-5 h-5 text-cyan-400" />
            <span>Data Sovereignty &amp; Local Persistence</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            All your tasks, academic calendars, revision intervals, and financial logs are stored in your device&apos;s LocalStorage and automatically synced to Google Cloud Firestore when signed in.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export JSON Download */}
          <button
            onClick={handleExportDownload}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON Backup</span>
          </button>

          {/* Copy JSON */}
          <button
            onClick={handleCopyJSON}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            {copiedExport ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{copiedExport ? 'Copied to Clipboard!' : 'Copy Raw JSON'}</span>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => {
              setImportJsonText('');
              setImportStatus(null);
              setIsImportModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import from JSON</span>
          </button>

          {/* Reset to Sample Data */}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 text-xs font-semibold transition flex items-center gap-2 ml-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reset to Sample Data</span>
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0A1128] border border-cyan-500/30 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Import Nexus State JSON</h3>
            <p className="text-xs text-slate-400 mb-4">
              Paste the exported JSON content below to restore all tasks, study timetables, and transactions.
            </p>

            {importStatus?.error && (
              <div className="mb-3 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{importStatus.error}</span>
              </div>
            )}

            {importStatus?.success && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Data imported and synchronized successfully!</span>
              </div>
            )}

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <textarea
                rows={8}
                required
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{ "tasks": [...], "subjects": [...], "transactions": [...] }'
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono outline-none resize-none focus:border-cyan-400"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold rounded-xl text-xs"
                >
                  Verify &amp; Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0A1128] border border-rose-500/30 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-400" />
              <span>Reset to Sample Data?</span>
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              This will reinitialize your tasks, study subjects, and transactions with the default showcase dataset. Make sure you have exported a backup if you need your current records.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToSampleData();
                  setIsResetConfirmOpen(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
