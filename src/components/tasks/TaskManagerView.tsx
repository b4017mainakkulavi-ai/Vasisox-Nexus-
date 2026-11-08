import React, { useState } from 'react';
import { useNexus } from '../../context/NexusContext.tsx';
import { Task, Priority, TaskCategory } from '../../types/index.ts';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  X,
  ListTodo,
} from 'lucide-react';

interface TaskManagerViewProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const TaskManagerView: React.FC<TaskManagerViewProps> = ({
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const {
    state,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useNexus();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'completed'>('all');

  // Edit Task State
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('medium');
  const [formCategory, setFormCategory] = useState<TaskCategory>('Study');
  const [formDueDate, setFormDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueTime, setFormDueTime] = useState('17:00');
  const [formEstimatedMins, setFormEstimatedMins] = useState(45);
  const [formSubtasks, setFormSubtasks] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [isAiBreakingDown, setIsAiBreakingDown] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Open Edit Modal
  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormPriority(task.priority);
    setFormCategory(task.category);
    setFormDueDate(task.dueDate);
    setFormDueTime(task.dueTime || '17:00');
    setFormEstimatedMins(task.estimatedMinutes);
    setFormSubtasks(task.subtasks.map((s) => s.title));
    setFormError(null);
  };

  // Reset & Open Add Modal
  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormPriority('medium');
    setFormCategory('Study');
    setFormDueDate(new Date().toISOString().split('T')[0]);
    setFormDueTime('17:00');
    setFormEstimatedMins(45);
    setFormSubtasks([]);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTask(null);
  };

  // AI Task Breakdown Helper
  const handleAiBreakdown = async () => {
    if (!formTitle.trim()) {
      setFormError('Please enter a task title first before generating AI subtasks.');
      return;
    }
    setFormError(null);
    setIsAiBreakingDown(true);
    try {
      const res = await fetch('/api/ai/breakdown-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formTitle, description: formDescription }),
      });
      const data = await res.json();
      if (Array.isArray(data.subtasks) && data.subtasks.length > 0) {
        setFormSubtasks((prev) => [...prev, ...data.subtasks]);
      }
    } catch (e) {
      console.warn('AI breakdown failed:', e);
      setFormSubtasks((prev) => [
        ...prev,
        'Research core concepts',
        'Draft first working version',
        'Verify results against requirements',
      ]);
    } finally {
      setIsAiBreakingDown(false);
    }
  };

  // Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Task title is required.');
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        priority: formPriority,
        category: formCategory,
        dueDate: formDueDate,
        dueTime: formDueTime,
        estimatedMinutes: Number(formEstimatedMins) || 30,
      });
    } else {
      addTask({
        title: formTitle.trim(),
        description: formDescription.trim(),
        priority: formPriority,
        category: formCategory,
        dueDate: formDueDate,
        dueTime: formDueTime,
        estimatedMinutes: Number(formEstimatedMins) || 30,
        completed: false,
        subtasks: formSubtasks.map((stTitle, idx) => ({
          id: `st-${Date.now()}-${idx}`,
          title: stTitle,
          completed: false,
        })),
      });
    }

    handleCloseModal();
  };

  // Add inline subtask in form
  const handleAddInlineSubtask = () => {
    if (newSubtaskInput.trim()) {
      setFormSubtasks([...formSubtasks, newSubtaskInput.trim()]);
      setNewSubtaskInput('');
    }
  };

  // Filtering
  const filteredTasks = state.tasks.filter((task) => {
    // Search query
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;

    // Priority
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

    // Status
    const matchesStatus =
      statusTab === 'all' ||
      (statusTab === 'active' && !task.completed) ||
      (statusTab === 'completed' && task.completed);

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 md:pb-6">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0A1128] border border-cyan-500/20 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-cyan-400" />
            <span>Task Command Board</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Prioritize and execute high-yield objectives with AI subtask decomposition.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-cyan-500/25 active:scale-95 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Search, Filter & Tabs Bar */}
      <div className="bg-[#0A1128] border border-cyan-500/20 p-4 rounded-2xl space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setStatusTab('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusTab === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({state.tasks.length})
            </button>
            <button
              onClick={() => setStatusTab('active')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusTab === 'active'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active ({state.tasks.filter((t) => !t.completed).length})
            </button>
            <button
              onClick={() => setStatusTab('completed')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusTab === 'completed'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Completed ({state.tasks.filter((t) => t.completed).length})
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing {filteredTasks.length} matching items
          </div>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition"
          >
            <option value="all">All Categories</option>
            <option value="Study">Study</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Finance">Finance</option>
            <option value="Health">Health</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none transition"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0A1128] border border-cyan-500/15">
            <ListTodo className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">No tasks match the filter criteria</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query, or create a new task.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition cursor-pointer"
            >
              + Create New Task
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
            const subtaskProgress =
              task.subtasks.length > 0
                ? Math.round((completedSubtasks / task.subtasks.length) * 100)
                : 0;

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl bg-[#0A1128] border transition ${
                  task.completed
                    ? 'border-slate-800 opacity-70'
                    : 'border-cyan-500/20 hover:border-cyan-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => toggleTaskCompleted(task.id)}
                      aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition cursor-pointer shrink-0 ${
                        task.completed
                          ? 'bg-cyan-500 border-cyan-400 text-black shadow-sm shadow-cyan-500/30'
                          : 'border-slate-600 hover:border-cyan-400 bg-slate-900/60'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4 text-black" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm sm:text-base font-bold ${
                            task.completed ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </h3>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            task.priority === 'urgent'
                              ? 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
                              : task.priority === 'high'
                              ? 'bg-amber-950/80 border border-amber-500/40 text-amber-300'
                              : task.priority === 'medium'
                              ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Category Badge */}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                          {task.category}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks Checklist */}
                      {task.subtasks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-mono text-[11px]">
                              Subtasks ({completedSubtasks}/{task.subtasks.length})
                            </span>
                            <span className="font-mono text-[11px] text-cyan-400">
                              {subtaskProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${subtaskProgress}%` }}
                            />
                          </div>

                          <div className="space-y-1.5 mt-2">
                            {task.subtasks.map((st) => (
                              <div
                                key={st.id}
                                className="flex items-center justify-between text-xs text-slate-300 pl-2 group/st"
                              >
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={st.completed}
                                    onChange={() => toggleSubtask(task.id, st.id)}
                                    className="w-3.5 h-3.5 rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
                                  />
                                  <span
                                    className={
                                      st.completed ? 'line-through text-slate-500' : 'text-slate-300'
                                    }
                                  >
                                    {st.title}
                                  </span>
                                </label>
                                <button
                                  onClick={() => deleteSubtask(task.id, st.id)}
                                  className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover/st:opacity-100 transition"
                                  aria-label="Delete subtask"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Meta footer */}
                      <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400 font-mono flex-wrap">
                        <span className="flex items-center gap-1.5 text-cyan-300">
                          <Calendar className="w-3.5 h-3.5" />
                          Due: {task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          Est: {task.estimatedMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(task)}
                      aria-label={`Edit task ${task.title}`}
                      className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      aria-label={`Delete task ${task.title}`}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {(isAddModalOpen || editingTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0A1128] border border-cyan-500/30 rounded-2xl shadow-2xl p-6 text-slate-100 cyber-glow-sm max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-cyan-400 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-cyan-400" />
              {editingTask ? 'Edit Task Directive' : 'Create New Task Directive'}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Configure parameters, priority rating, and decomposed steps.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Complete Organic Chemistry Problem Set"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description &amp; Objectives
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Additional context, links, or specific criteria..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none resize-none transition"
                />
              </div>

              {/* Priority & Category Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🔵 Medium</option>
                    <option value="low">⚪ Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TaskCategory)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="Study">Study</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Finance">Finance</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
              </div>

              {/* Due Date & Time & Estimated Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={480}
                    value={formEstimatedMins}
                    onChange={(e) => setFormEstimatedMins(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Subtasks Section with AI Breakdown */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-200">
                    Subtasks Checklist ({formSubtasks.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAiBreakdown}
                    disabled={isAiBreakingDown}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/40 hover:bg-cyan-900/60 text-cyan-300 text-[11px] font-mono transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>{isAiBreakingDown ? 'Generating with AI...' : 'AI Breakdown'}</span>
                  </button>
                </div>

                {/* Subtask list */}
                {formSubtasks.length > 0 && (
                  <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto pr-1">
                    {formSubtasks.map((st, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-xs text-slate-200 border border-slate-800"
                      >
                        <span className="truncate">{st}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormSubtasks(formSubtasks.filter((_, i) => i !== idx))
                          }
                          className="text-slate-500 hover:text-red-400 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline add subtask */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInlineSubtask();
                      }
                    }}
                    placeholder="Add a subtask step..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddInlineSubtask}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-medium transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
