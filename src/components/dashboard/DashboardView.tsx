import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  calculateProductivityScore,
  calculateCompletionRate,
  calculateFinanceSummary,
  formatMinutesToHours,
  formatCurrency,
} from '../../utils/productivity.ts';
import {
  CheckCircle2,
  CheckSquare,
  Clock,
  Flame,
  Zap,
  Calendar,
  AlertCircle,
  PlusCircle,
  Bot,
  Timer,
  Wallet,
  ArrowRight,
  TrendingUp,
  FileText,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenAddTask: () => void;
  onOpenAddExpense: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddTask,
  onOpenAddExpense,
}) => {
  const {
    state,
    setActiveTab,
    toggleTaskCompleted,
    toggleScheduleCompleted,
    setEnergyLevel,
    setDailyNotes,
    logFocusMinutes,
  } = useNexus();
  const { user } = useAuth();

  const [noteText, setNoteText] = useState(state.stats.dailyNotes);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // Computations
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

  // Filter tasks due today or urgent
  const todayStr = new Date().toISOString().split('T')[0];
  const urgentOrTodayTasks = state.tasks
    .filter((t) => !t.completed && (t.dueDate <= todayStr || t.priority === 'urgent'))
    .slice(0, 4);

  // Day of week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = days[new Date().getDay()] as any;
  const todaysSchedule = state.schedule
    .filter((s) => s.day === currentDayName)
    .slice(0, 4);

  // Nearest exam
  const upcomingExams = [...state.exams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const nextExam = upcomingExams[0];
  const daysUntilNextExam = nextExam
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextExam.date).getTime() - new Date(todayStr).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const handleSaveNotes = () => {
    setDailyNotes(noteText);
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 1500);
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Commander';

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 md:pb-6">
      {/* Top Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A1128] via-[#0E1A38] to-[#0A1128] border border-cyan-500/25 p-6 sm:p-8 cyber-glow-sm">
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>NEXUS PROTOCOL ACTIVE</span>
              <span className="text-slate-500">&bull;</span>
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {displayName}
              </span>
            </h1>

            <p className="text-sm text-slate-300 max-w-xl">
              Your personal intelligence center is synchronized. You have{' '}
              <span className="text-cyan-300 font-semibold">{urgentOrTodayTasks.length} urgent/due tasks</span>{' '}
              and{' '}
              <span className="text-blue-300 font-semibold">{todaysSchedule.length} study sessions</span> scheduled for today.
            </p>
          </div>

          {/* Quick Metrics Badge in Hero */}
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl self-start md:self-auto">
            <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
              <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
              <div>
                <p className="text-[10px] text-slate-400 font-mono uppercase">Streak</p>
                <p className="text-lg font-bold text-white font-mono">{state.stats.currentStreakDays}d</p>
              </div>
            </div>
            <div className="pl-1">
              <p className="text-[10px] text-slate-400 font-mono uppercase">Focus Today</p>
              <p className="text-lg font-bold text-cyan-400 font-mono">
                {formatMinutesToHours(state.stats.dailyFocusMinutes)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Productivity Score Ring */}
        <div className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-500/40 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Productivity Score</p>
              <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">
                {productivityScore}
                <span className="text-xs text-slate-400 font-normal"> / 100</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${productivityScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">Optimal flow state</span> &bull; Task weight &amp; streak
          </p>
        </div>

        {/* Task Completion */}
        <div className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-500/40 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Task Completion</p>
              <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">
                {state.tasks.filter((t) => t.completed).length}
                <span className="text-xs text-slate-400 font-normal"> / {state.tasks.length}</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-950/70 border border-blue-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            {completionRate}% total resolution rate
          </p>
        </div>

        {/* Nearest Exam Countdown */}
        <div className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-500/40 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Next Examination</p>
              <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">
                {daysUntilNextExam !== null ? (
                  <>
                    {daysUntilNextExam}
                    <span className="text-xs text-slate-400 font-normal"> days left</span>
                  </>
                ) : (
                  'No Exams'
                )}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-[11px] text-slate-300 mt-3 truncate font-medium">
            {nextExam ? nextExam.title : 'Schedule upcoming finals'}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            {nextExam ? `${nextExam.date} • ${nextExam.targetScore || 'Target A'}` : 'All caught up'}
          </p>
        </div>

        {/* Financial Budget Health */}
        <div className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-500/40 transition relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Net Balance</p>
              <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">
                {formatCurrency(financeSummary.netBalance, state.stats.currency)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                financeSummary.budgetUsedPercent > 85 ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${financeSummary.budgetUsedPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            {financeSummary.budgetUsedPercent}% of {formatCurrency(state.stats.monthlyBudget, state.stats.currency)} budget used
          </p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={onOpenAddTask}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-semibold whitespace-nowrap transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-cyan-400" />
          <span>New Task</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-300 text-xs font-semibold whitespace-nowrap transition cursor-pointer"
        >
          <Bot className="w-4 h-4 text-blue-400" />
          <span>AI Task Planner</span>
        </button>

        <button
          onClick={() => setActiveTab('study')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-xs font-semibold whitespace-nowrap transition cursor-pointer"
        >
          <Timer className="w-4 h-4 text-purple-400" />
          <span>Focus Timer (25m)</span>
        </button>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-semibold whitespace-nowrap transition cursor-pointer"
        >
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Two Column Layout: Left Column = Today's Priorities & Timetable; Right Column = Energy & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Tasks & Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Task Queue */}
          <div className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Priority Task Queue</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {urgentOrTodayTasks.length}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition cursor-pointer"
              >
                <span>View All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {urgentOrTodayTasks.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-300">No urgent tasks pending!</p>
                <p className="text-xs text-slate-500 mt-1">
                  You are completely on top of your schedule.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgentOrTodayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/30 transition group"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTaskCompleted(task.id)}
                        aria-label={`Toggle task completion: ${task.title}`}
                        className="mt-0.5 w-5 h-5 rounded border border-slate-600 hover:border-cyan-400 flex items-center justify-center transition cursor-pointer"
                      >
                        {task.completed && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </button>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                          <span
                            className={`px-1.5 py-0.2 rounded uppercase font-semibold text-[10px] ${
                              task.priority === 'urgent'
                                ? 'bg-red-950/80 text-red-400 border border-red-500/40'
                                : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span>&bull;</span>
                          <span>{task.category}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            {task.estimatedMinutes}m
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      Due: {task.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Study Sessions */}
          <div className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">
                  Today's Study Timetable ({currentDayName})
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('study')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition cursor-pointer"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaysSchedule.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-900/40 border border-slate-800">
                <p className="text-sm text-slate-400">No scheduled study sessions for today.</p>
                <button
                  onClick={() => setActiveTab('study')}
                  className="mt-2 text-xs text-cyan-400 hover:underline"
                >
                  Configure weekly schedule in Study Planner &rarr;
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {todaysSchedule.map((session) => (
                  <div
                    key={session.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {session.startTime} - {session.endTime}
                        </span>
                        {session.completed && (
                          <span className="text-[10px] bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 px-1.5 rounded">
                            Done
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-1">
                        {session.subjectName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{session.topicTitle}</p>
                    </div>

                    <button
                      onClick={() => toggleScheduleCompleted(session.id)}
                      title="Toggle session completion"
                      className="p-1 rounded text-slate-500 hover:text-cyan-400"
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          session.completed ? 'text-emerald-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Energy Tracker & Quick Scratchpad */}
        <div className="space-y-6">
          {/* Energy & Focus Gauge */}
          <div className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Energy &amp; Focus Index</span>
              </h3>
              <span className="text-xs font-mono font-bold text-cyan-400">
                Level {state.stats.energyLevel}/5
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Calibrate your cognitive battery to optimize AI task recommendations.
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setEnergyLevel(lvl)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    state.stats.energyLevel === lvl
                      ? 'bg-gradient-to-t from-yellow-500 to-amber-400 text-black shadow-md shadow-yellow-500/30'
                      : state.stats.energyLevel > lvl
                      ? 'bg-yellow-950/60 text-yellow-300 border border-yellow-500/30'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
              <span>Low</span>
              <span>Optimal</span>
              <span>Hyper</span>
            </div>
          </div>

          {/* Quick Scratchpad / Daily Reflection Notes */}
          <div className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Daily Scratchpad</span>
              </h3>
              {noteSavedFeedback && (
                <span className="text-[10px] text-emerald-400 font-mono animate-fade-in">
                  Saved!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Transient thoughts, formula snippets, or quick objectives.
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onBlur={handleSaveNotes}
              rows={4}
              placeholder="Jot down notes or priorities..."
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 outline-none resize-none transition"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>

          {/* Spaced Repetition Due Alert */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-cyan-950/30 border border-indigo-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Spaced Repetition Due</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              You have {state.revisions.filter((r) => r.status === 'due').length} topics due for active recall review today.
            </p>
            <button
              onClick={() => setActiveTab('study')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold tracking-wide transition shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Start Recall Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
