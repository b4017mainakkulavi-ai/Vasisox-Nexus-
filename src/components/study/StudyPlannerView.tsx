import React, { useState, useEffect } from 'react';
import { useNexus } from '../../context/NexusContext.tsx';
import {
  StudySubject,
  StudyScheduleItem,
  RevisionItem,
  ExamItem,
} from '../../types/index.ts';
import {
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Sparkles,
  AlarmClock,
  Target,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';

export const StudyPlannerView: React.FC = () => {
  const {
    state,
    addSubject,
    toggleSubjectTopic,
    deleteSubject,
    addScheduleItem,
    toggleScheduleCompleted,
    deleteScheduleItem,
    addRevisionItem,
    advanceRevisionStage,
    deleteRevisionItem,
    addExam,
    deleteExam,
    logFocusMinutes,
  } = useNexus();

  // Active section tabs
  const [plannerTab, setPlannerTab] = useState<'schedule' | 'subjects' | 'revisions' | 'exams' | 'timer'>('schedule');

  // Day filter for schedule
  const daysOfWeek: StudyScheduleItem['day'][] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const [selectedDay, setSelectedDay] = useState<StudyScheduleItem['day']>('Monday');

  // Focus Timer State
  const [timerMode, setTimerMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  // Timer intervals
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isTimerRunning && timerSecondsLeft === 0) {
      // Completed timer block
      setIsTimerRunning(false);
      if (timerMode === 'focus') {
        logFocusMinutes(25);
        setCompletedSessionsCount((c) => c + 1);
        setTimerMode('shortBreak');
        setTimerSecondsLeft(5 * 60);
      } else {
        setTimerMode('focus');
        setTimerSecondsLeft(25 * 60);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft, timerMode, logFocusMinutes]);

  const handleStartTimer = () => setIsTimerRunning(true);
  const handlePauseTimer = () => setIsTimerRunning(false);
  const handleResetTimer = () => {
    setIsTimerRunning(false);
    if (timerMode === 'focus') setTimerSecondsLeft(25 * 60);
    else if (timerMode === 'shortBreak') setTimerSecondsLeft(5 * 60);
    else setTimerSecondsLeft(15 * 60);
  };

  const setMode = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
    setTimerMode(mode);
    setIsTimerRunning(false);
    if (mode === 'focus') setTimerSecondsLeft(25 * 60);
    else if (mode === 'shortBreak') setTimerSecondsLeft(5 * 60);
    else setTimerSecondsLeft(15 * 60);
  };

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  // Form states
  const [schSubjectName, setSchSubjectName] = useState('');
  const [schTopic, setSchTopic] = useState('');
  const [schDay, setSchDay] = useState<StudyScheduleItem['day']>('Monday');
  const [schStart, setSchStart] = useState('09:00');
  const [schEnd, setSchEnd] = useState('11:00');

  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subTargetHours, setSubTargetHours] = useState(10);
  const [subTopicsList, setSubTopicsList] = useState('');

  const [revSubject, setRevSubject] = useState('');
  const [revTopic, setRevTopic] = useState('');

  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState('');
  const [examDate, setExamDate] = useState(new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]);
  const [examTime, setExamTime] = useState('09:00 AM');
  const [examRoom, setExamRoom] = useState('');
  const [examScore, setExamScore] = useState('95%');
  const [examImportance, setExamImportance] = useState<'critical' | 'high' | 'standard'>('high');

  // Submit Schedule Session
  const handleAddScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schSubjectName.trim() || !schTopic.trim()) return;
    addScheduleItem({
      subjectId: `sub-${Date.now()}`,
      subjectName: schSubjectName.trim(),
      topicTitle: schTopic.trim(),
      day: schDay,
      startTime: schStart,
      endTime: schEnd,
      completed: false,
    });
    setSchSubjectName('');
    setSchTopic('');
    setIsScheduleModalOpen(false);
  };

  // Submit Subject
  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subCode.trim()) return;
    const topics = subTopicsList
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((title, idx) => ({
        id: `topic-${Date.now()}-${idx}`,
        title,
        completed: false,
      }));

    addSubject({
      name: subName.trim(),
      code: subCode.trim().toUpperCase(),
      color: '#00F0FF',
      targetWeeklyHours: Number(subTargetHours) || 8,
      completedHours: 0,
      syllabusProgress: 0,
      topics,
    });
    setSubName('');
    setSubCode('');
    setSubTopicsList('');
    setIsSubjectModalOpen(false);
  };

  // Submit Revision Item
  const handleAddRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revSubject.trim() || !revTopic.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    addRevisionItem({
      subjectName: revSubject.trim(),
      topic: revTopic.trim(),
      currentStage: 0,
      nextReviewDate: today,
    });
    setRevSubject('');
    setRevTopic('');
    setIsRevisionModalOpen(false);
  };

  // Submit Exam
  const handleAddExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examDate) return;
    addExam({
      title: examTitle.trim(),
      subject: examSubject.trim() || 'General',
      date: examDate,
      time: examTime,
      room: examRoom,
      targetScore: examScore,
      importance: examImportance,
    });
    setExamTitle('');
    setExamSubject('');
    setIsExamModalOpen(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const daySchedule = state.schedule.filter((s) => s.day === selectedDay);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 md:pb-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0A1128] border border-cyan-500/20 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-cyan-400" />
            <span>Study &amp; Academic Command Deck</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Subject-wise planning, revision cycles, exam countdowns, and Pomodoro focus tracking.
          </p>
        </div>

        {/* Navigation Tabs between features */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-medium self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setPlannerTab('schedule')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              plannerTab === 'schedule'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Timetable
          </button>
          <button
            onClick={() => setPlannerTab('subjects')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              plannerTab === 'subjects'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Subjects
          </button>
          <button
            onClick={() => setPlannerTab('revisions')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              plannerTab === 'revisions'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Revision
          </button>
          <button
            onClick={() => setPlannerTab('exams')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              plannerTab === 'exams'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Exams ({state.exams.length})
          </button>
          <button
            onClick={() => setPlannerTab('timer')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              plannerTab === 'timer'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Focus Timer
          </button>
        </div>
      </div>

      {/* 1. TIMETABLE TAB */}
      {plannerTab === 'schedule' && (
        <div className="space-y-4">
          {/* Day selection bar & Add session button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A1128] border border-cyan-500/20 p-4 rounded-2xl">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                    selectedDay === day
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setSchDay(selectedDay);
                setIsScheduleModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Session</span>
            </button>
          </div>

          {/* Schedule items for selected day */}
          <div className="space-y-3">
            {daySchedule.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0A1128] border border-cyan-500/15">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">
                  No study sessions configured for {selectedDay}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Schedule time blocks for lectures, problem solving, or revision.
                </p>
                <button
                  onClick={() => {
                    setSchDay(selectedDay);
                    setIsScheduleModalOpen(true);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold"
                >
                  + Add {selectedDay} Session
                </button>
              </div>
            ) : (
              daySchedule.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-2xl bg-[#0A1128] border transition flex items-center justify-between ${
                    session.completed
                      ? 'border-slate-800 opacity-60'
                      : 'border-cyan-500/20 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleScheduleCompleted(session.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                        session.completed
                          ? 'bg-cyan-500 border-cyan-400 text-black'
                          : 'border-slate-600 hover:border-cyan-400 bg-slate-900'
                      }`}
                    >
                      {session.completed && <CheckCircle2 className="w-4 h-4 text-black" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {session.startTime} - {session.endTime}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                          {session.subjectName}
                        </span>
                      </div>
                      <h3
                        className={`text-sm font-bold mt-1 ${
                          session.completed ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {session.topicTitle}
                      </h3>
                      {session.notes && (
                        <p className="text-xs text-slate-400 mt-0.5">{session.notes}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteScheduleItem(session.id)}
                    aria-label="Delete schedule item"
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. SUBJECTS TAB */}
      {plannerTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-mono">
              Tracking {state.subjects.length} active syllabus tracks
            </p>
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.subjects.map((sub) => {
              const completedTopics = sub.topics.filter((t) => t.completed).length;
              return (
                <div
                  key={sub.id}
                  className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-500/40 transition space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-bold">
                        {sub.code}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{sub.name}</h3>
                    </div>
                    <button
                      onClick={() => deleteSubject(sub.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-mono">
                      <span className="text-slate-400">Syllabus Progress</span>
                      <span className="text-cyan-400 font-bold">{sub.syllabusProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${sub.syllabusProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                      <span>{completedTopics} / {sub.topics.length} topics mastered</span>
                      <span>Target: {sub.targetWeeklyHours}h/wk</span>
                    </div>
                  </div>

                  {/* Topics Checklist */}
                  <div className="pt-2 border-t border-slate-800 space-y-1.5 max-h-40 overflow-y-auto">
                    <p className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                      Module Topics:
                    </p>
                    {sub.topics.map((t) => (
                      <label
                        key={t.id}
                        className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-1 rounded hover:bg-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => toggleSubjectTopic(sub.id, t.id)}
                          className="w-3.5 h-3.5 rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900"
                        />
                        <span className={t.completed ? 'line-through text-slate-500' : 'text-slate-300'}>
                          {t.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. REVISION TRACKER TAB (Spaced Repetition) */}
      {plannerTab === 'revisions' && (
        <div className="space-y-4">
          <div className="bg-[#0A1128] border border-cyan-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Spaced Repetition Knowledge Engine</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Active recall schedule optimized via forgetting curves: Day 1 &rarr; Day 3 &rarr; Day 7 &rarr; Day 14 &rarr; Permanent Mastery.
              </p>
            </div>
            <button
              onClick={() => setIsRevisionModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Topic for Revision</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.revisions.map((rev) => {
              const isDue = rev.nextReviewDate <= todayStr && rev.status !== 'mastered';
              return (
                <div
                  key={rev.id}
                  className={`p-4 rounded-2xl bg-[#0A1128] border transition space-y-3 ${
                    rev.status === 'mastered'
                      ? 'border-emerald-500/30 bg-emerald-950/10'
                      : isDue
                      ? 'border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        {rev.subjectName}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{rev.topic}</h4>
                    </div>
                    <button
                      onClick={() => deleteRevisionItem(rev.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stage Progress Bar (0 to 4) */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400">
                        {rev.status === 'mastered'
                          ? 'Status: Mastered'
                          : `Stage ${rev.currentStage + 1} of 4`}
                      </span>
                      <span className="text-slate-400">
                        Next: {rev.nextReviewDate}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0, 1, 2, 3].map((stg) => (
                        <div
                          key={stg}
                          className={`h-1.5 rounded-full transition-all ${
                            rev.currentStage > stg || rev.status === 'mastered'
                              ? 'bg-emerald-400'
                              : rev.currentStage === stg
                              ? 'bg-indigo-400 animate-pulse'
                              : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        rev.status === 'mastered'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : isDue
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {rev.status === 'mastered' ? 'Mastered' : isDue ? 'Recall Due Today' : 'Upcoming'}
                    </span>

                    {rev.status !== 'mastered' && (
                      <button
                        onClick={() => advanceRevisionStage(rev.id)}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Log Review Complete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. EXAMINATIONS COUNTDOWN TAB */}
      {plannerTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlarmClock className="w-5 h-5 text-purple-400" />
              <span>Examination Countdown &amp; Milestones</span>
            </h2>
            <button
              onClick={() => setIsExamModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exam</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {state.exams.map((exam) => {
              const daysLeft = Math.ceil(
                (new Date(exam.date).getTime() - new Date(todayStr).getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={exam.id}
                  className="bg-[#0A1128] border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-500/40 transition space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300 font-bold uppercase">
                        {exam.importance} Priority
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{exam.title}</h3>
                      <p className="text-xs text-slate-400">{exam.subject}</p>
                    </div>

                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Countdown number */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <p className="text-3xl font-extrabold font-mono text-cyan-400">
                      {daysLeft > 0 ? daysLeft : 0}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 uppercase mt-0.5">
                      {daysLeft === 1 ? 'Day Remaining' : 'Days Remaining'}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span>{exam.date}</span>
                    </div>
                    {exam.time && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Time:</span>
                        <span>{exam.time}</span>
                      </div>
                    )}
                    {exam.room && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Venue:</span>
                        <span className="truncate">{exam.room}</span>
                      </div>
                    )}
                    {exam.targetScore && (
                      <div className="flex items-center justify-between text-emerald-400 font-bold">
                        <span className="text-slate-500 font-normal">Target:</span>
                        <span>{exam.targetScore}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. FOCUS POMODORO TIMER TAB */}
      {plannerTab === 'timer' && (
        <div className="max-w-md mx-auto bg-[#0A1128] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 text-center space-y-6 cyber-glow-sm">
          {/* Mode Selector */}
          <div className="grid grid-cols-3 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setMode('focus')}
              className={`py-2 rounded-lg transition ${
                timerMode === 'focus'
                  ? 'bg-cyan-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Focus (25m)
            </button>
            <button
              onClick={() => setMode('shortBreak')}
              className={`py-2 rounded-lg transition ${
                timerMode === 'shortBreak'
                  ? 'bg-cyan-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Break (5m)
            </button>
            <button
              onClick={() => setMode('longBreak')}
              className={`py-2 rounded-lg transition ${
                timerMode === 'longBreak'
                  ? 'bg-cyan-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rest (15m)
            </button>
          </div>

          {/* Big Circular Clock Display */}
          <div className="py-8 relative">
            <div className="w-56 h-56 mx-auto rounded-full border-4 border-cyan-500/20 flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-900 to-[#0A1128]">
              <span className="text-5xl font-extrabold font-mono text-white tracking-wider">
                {formatTimer(timerSecondsLeft)}
              </span>
              <span className="text-xs font-mono uppercase text-cyan-400 tracking-widest mt-2">
                {timerMode === 'focus' ? 'Deep Work Cycle' : 'Restoration'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {isTimerRunning ? (
              <button
                onClick={handlePauseTimer}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center gap-2 cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleStartTimer}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 active:scale-95 transition flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Commence Focus</span>
              </button>
            )}

            <button
              onClick={handleResetTimer}
              title="Reset Timer"
              className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            Completed today: <span className="text-cyan-400 font-bold">{completedSessionsCount}</span> Pomodoro blocks (+{completedSessionsCount * 25}m focus time)
          </p>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Add Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0A1128] border border-cyan-500/30 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Add Study Session</h3>
            <form onSubmit={handleAddScheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={schSubjectName}
                  onChange={(e) => setSchSubjectName(e.target.value)}
                  placeholder="e.g. Advanced Calculus"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Topic</label>
                <input
                  type="text"
                  required
                  value={schTopic}
                  onChange={(e) => setSchTopic(e.target.value)}
                  placeholder="e.g. Surface Integrals & Stokes Theorem"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Day</label>
                  <select
                    value={schDay}
                    onChange={(e) => setSchDay(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white outline-none"
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Start</label>
                  <input
                    type="time"
                    required
                    value={schStart}
                    onChange={(e) => setSchStart(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">End</label>
                  <input
                    type="time"
                    required
                    value={schEnd}
                    onChange={(e) => setSchEnd(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs"
                >
                  Add Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0A1128] border border-cyan-500/30 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Add Subject &amp; Syllabus</h3>
            <form onSubmit={handleAddSubjectSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Distributed Systems"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="CS-450"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Weekly Target Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={subTargetHours}
                    onChange={(e) => setSubTargetHours(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Topics / Syllabus Units (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={subTopicsList}
                  onChange={(e) => setSubTopicsList(e.target.value)}
                  placeholder="Consensus Protocols&#10;Vector Clocks&#10;MapReduce"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Revision Modal */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0A1128] border border-cyan-500/30 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Add Spaced Repetition Topic</h3>
            <form onSubmit={handleAddRevisionSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={revSubject}
                  onChange={(e) => setRevSubject(e.target.value)}
                  placeholder="e.g. Physics"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Topic to Master</label>
                <input
                  type="text"
                  required
                  value={revTopic}
                  onChange={(e) => setRevTopic(e.target.value)}
                  placeholder="e.g. Maxwell's Wave Equations"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
                >
                  Enroll in Revision Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Exam Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0A1128] border border-cyan-500/30 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Add Examination</h3>
            <form onSubmit={handleAddExamSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Exam Title</label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. MATH-401 Final Examination"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    placeholder="Mathematics"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Score</label>
                  <input
                    type="text"
                    value={examScore}
                    onChange={(e) => setExamScore(e.target.value)}
                    placeholder="95% or A"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Venue / Room</label>
                <input
                  type="text"
                  value={examRoom}
                  onChange={(e) => setExamRoom(e.target.value)}
                  placeholder="e.g. Hall B, Turing Building"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
