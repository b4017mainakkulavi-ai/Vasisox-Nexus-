import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  NexusAppState,
  Task,
  StudySubject,
  StudyScheduleItem,
  RevisionItem,
  ExamItem,
  FinanceTransaction,
  ChatMessage,
  UserStats,
  SuggestedAction,
} from '../types/index.ts';
import { initialNexusData } from '../data/initialData.ts';
import { useAuth } from './AuthContext.tsx';
import { db, doc, getDoc, setDoc, onSnapshot, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { calculateNextRevisionDate } from '../utils/productivity.ts';

const LOCAL_STORAGE_KEY = 'vasisox_nexus_data_v1';

export type NavTab = 'dashboard' | 'ai' | 'tasks' | 'study' | 'finance' | 'analytics';
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'local';

interface NexusContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  state: NexusAppState;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  aiStatus: { configured: boolean; model: string; mode: 'live' | 'demo' };
  isAiThinking: boolean;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Study Actions
  addSubject: (subject: Omit<StudySubject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<StudySubject>) => void;
  deleteSubject: (id: string) => void;
  toggleSubjectTopic: (subjectId: string, topicId: string) => void;
  addScheduleItem: (item: Omit<StudyScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, updates: Partial<StudyScheduleItem>) => void;
  toggleScheduleCompleted: (id: string) => void;
  deleteScheduleItem: (id: string) => void;
  addRevisionItem: (item: Omit<RevisionItem, 'id' | 'status'>) => void;
  advanceRevisionStage: (id: string) => void;
  deleteRevisionItem: (id: string) => void;
  addExam: (exam: Omit<ExamItem, 'id'>) => void;
  updateExam: (id: string, updates: Partial<ExamItem>) => void;
  deleteExam: (id: string) => void;

  // Finance Actions
  addTransaction: (tx: Omit<FinanceTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (budget: number) => void;
  updateCurrency: (currency: string) => void;

  // Stats & Notes Actions
  logFocusMinutes: (mins: number) => void;
  setEnergyLevel: (level: number) => void;
  setDailyNotes: (notes: string) => void;

  // AI Actions
  sendMessage: (text: string) => Promise<void>;
  applySuggestedAction: (action: SuggestedAction) => void;

  // Data management
  syncNow: () => Promise<void>;
  exportDataAsJSON: () => string;
  importDataFromJSON: (jsonStr: string) => { success: boolean; error?: string };
  resetToSampleData: () => void;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

export const NexusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model: string; mode: 'live' | 'demo' }>({
    configured: false,
    model: 'gemini-3.8-flash',
    mode: 'demo',
  });

  // State initialization: try localStorage, fallback to initialNexusData
  const [state, setState] = useState<NexusAppState>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...initialNexusData,
          ...parsed,
          stats: { ...initialNexusData.stats, ...parsed.stats },
        };
      }
    } catch (e) {
      console.warn('Failed to load local storage state:', e);
    }
    return initialNexusData;
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isIncomingRemoteUpdate = useRef(false);

  // Check AI server health & model mode
  useEffect(() => {
    fetch('/api/ai/status')
      .then((res) => res.json())
      .then((data) => {
        setAiStatus({
          configured: Boolean(data.configured),
          model: data.model || 'gemini-3.8-flash',
          mode: data.mode || (data.configured ? 'live' : 'demo'),
        });
      })
      .catch(() => {
        setAiStatus({ configured: false, model: 'gemini-3.8-flash', mode: 'demo' });
      });
  }, []);

  // Sync to Firestore when authenticated (debounced 1.2s)
  const pushStateToCloud = useCallback(async (appState: NexusAppState) => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      const syncDocRef = doc(db, 'users', user.uid, 'syncState', 'nexus');
      await setDoc(syncDocRef, {
        userId: user.uid,
        tasks: appState.tasks,
        subjects: appState.subjects,
        schedule: appState.schedule,
        revisions: appState.revisions,
        exams: appState.exams,
        transactions: appState.transactions,
        stats: appState.stats,
        updatedAt: new Date().toISOString(),
      });
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/syncState/nexus`);
      setSyncStatus('offline');
    }
  }, [user]);

  // Handle local state updates: persist to LocalStorage, and trigger cloud sync if user logged in
  const updateState = useCallback(
    (updater: (prev: NexusAppState) => NexusAppState) => {
      setState((prev) => {
        const next = updater(prev);
        // Persist to local storage
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.warn('LocalStorage save failed:', e);
        }

        // If authenticated and this wasn't triggered by remote sync listener, debounce cloud sync
        if (user && !isIncomingRemoteUpdate.current) {
          if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
          setSyncStatus('syncing');
          syncTimeoutRef.current = setTimeout(() => {
            pushStateToCloud(next);
          }, 1200);
        } else if (!user) {
          setSyncStatus('local');
        }

        return next;
      });
    },
    [user, pushStateToCloud]
  );

  // Cross-device sync listener: when authenticated, subscribe to Firestore /users/{uid}/syncState/nexus
  useEffect(() => {
    if (!user) {
      setSyncStatus('local');
      return;
    }

    setSyncStatus('syncing');
    const syncDocRef = doc(db, 'users', user.uid, 'syncState', 'nexus');

    // First check if cloud state exists. If not, seed cloud state with local state
    getDoc(syncDocRef)
      .then((snap) => {
        if (!snap.exists()) {
          pushStateToCloud(state);
        }
      })
      .catch((err) => {
        console.warn('Initial cloud fetch issue:', err);
      });

    // Realtime snapshot listener
    const unsubscribe = onSnapshot(
      syncDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data();
          if (cloudData) {
            isIncomingRemoteUpdate.current = true;
            setState((prev) => {
              const merged: NexusAppState = {
                tasks: Array.isArray(cloudData.tasks) ? cloudData.tasks : prev.tasks,
                subjects: Array.isArray(cloudData.subjects) ? cloudData.subjects : prev.subjects,
                schedule: Array.isArray(cloudData.schedule) ? cloudData.schedule : prev.schedule,
                revisions: Array.isArray(cloudData.revisions) ? cloudData.revisions : prev.revisions,
                exams: Array.isArray(cloudData.exams) ? cloudData.exams : prev.exams,
                transactions: Array.isArray(cloudData.transactions) ? cloudData.transactions : prev.transactions,
                messages: prev.messages, // retain current chat history
                stats: cloudData.stats ? { ...prev.stats, ...cloudData.stats } : prev.stats,
              };
              try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
            setTimeout(() => {
              isIncomingRemoteUpdate.current = false;
            }, 200);
            setSyncStatus('synced');
            setLastSyncedAt(new Date());
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}/syncState/nexus`);
        setSyncStatus('offline');
      }
    );

    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [user, pushStateToCloud]);

  // ---------------- Tasks Methods ----------------
  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      tasks: [task, ...prev.tasks],
    }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const deleteTask = (id: string) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  const toggleTaskCompleted = (id: string) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      ),
    }));
  };

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    const subtask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
      title: title.trim(),
      completed: false,
    };
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t
      ),
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
        };
      }),
    }));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) }
          : t
      ),
    }));
  };

  // ---------------- Study Methods ----------------
  const addSubject = (sub: Omit<StudySubject, 'id'>) => {
    const subject: StudySubject = {
      ...sub,
      id: `sub-${Date.now()}`,
    };
    updateState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, subject],
    }));
  };

  const updateSubject = (id: string, updates: Partial<StudySubject>) => {
    updateState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSubject = (id: string) => {
    updateState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
      schedule: prev.schedule.filter((sch) => sch.subjectId !== id),
    }));
  };

  const toggleSubjectTopic = (subjectId: string, topicId: string) => {
    updateState((prev) => {
      const subjects = prev.subjects.map((sub) => {
        if (sub.id !== subjectId) return sub;
        const updatedTopics = sub.topics.map((top) =>
          top.id === topicId ? { ...top, completed: !top.completed } : top
        );
        const completedCount = updatedTopics.filter((t) => t.completed).length;
        const progress = Math.round((completedCount / (updatedTopics.length || 1)) * 100);
        return {
          ...sub,
          topics: updatedTopics,
          syllabusProgress: progress,
        };
      });
      return { ...prev, subjects };
    });
  };

  const addScheduleItem = (item: Omit<StudyScheduleItem, 'id'>) => {
    const scheduleItem: StudyScheduleItem = {
      ...item,
      id: `sch-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
    };
    updateState((prev) => ({
      ...prev,
      schedule: [...prev.schedule, scheduleItem],
    }));
  };

  const updateScheduleItem = (id: string, updates: Partial<StudyScheduleItem>) => {
    updateState((prev) => ({
      ...prev,
      schedule: prev.schedule.map((sch) => (sch.id === id ? { ...sch, ...updates } : sch)),
    }));
  };

  const toggleScheduleCompleted = (id: string) => {
    updateState((prev) => ({
      ...prev,
      schedule: prev.schedule.map((sch) =>
        sch.id === id ? { ...sch, completed: !sch.completed } : sch
      ),
    }));
  };

  const deleteScheduleItem = (id: string) => {
    updateState((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((sch) => sch.id !== id),
    }));
  };

  const addRevisionItem = (item: Omit<RevisionItem, 'id' | 'status'>) => {
    const today = new Date().toISOString().split('T')[0];
    const isDue = item.nextReviewDate <= today;
    const revision: RevisionItem = {
      ...item,
      id: `rev-${Date.now()}`,
      status: isDue ? 'due' : 'upcoming',
    };
    updateState((prev) => ({
      ...prev,
      revisions: [revision, ...prev.revisions],
    }));
  };

  const advanceRevisionStage = (id: string) => {
    updateState((prev) => ({
      ...prev,
      revisions: prev.revisions.map((rev) => {
        if (rev.id !== id) return rev;
        const nextStage = rev.currentStage + 1;
        const today = new Date().toISOString().split('T')[0];
        if (nextStage >= 4) {
          return {
            ...rev,
            currentStage: 4,
            status: 'mastered',
            lastReviewedDate: today,
          };
        }
        const nextDate = calculateNextRevisionDate(today, nextStage);
        return {
          ...rev,
          currentStage: nextStage,
          lastReviewedDate: today,
          nextReviewDate: nextDate,
          status: 'upcoming',
        };
      }),
    }));
  };

  const deleteRevisionItem = (id: string) => {
    updateState((prev) => ({
      ...prev,
      revisions: prev.revisions.filter((r) => r.id !== id),
    }));
  };

  const addExam = (exam: Omit<ExamItem, 'id'>) => {
    const newExam: ExamItem = {
      ...exam,
      id: `exam-${Date.now()}`,
    };
    updateState((prev) => ({
      ...prev,
      exams: [...prev.exams, newExam].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    }));
  };

  const updateExam = (id: string, updates: Partial<ExamItem>) => {
    updateState((prev) => ({
      ...prev,
      exams: prev.exams.map((ex) => (ex.id === id ? { ...ex, ...updates } : ex)),
    }));
  };

  const deleteExam = (id: string) => {
    updateState((prev) => ({
      ...prev,
      exams: prev.exams.filter((ex) => ex.id !== id),
    }));
  };

  // ---------------- Finance Methods ----------------
  const addTransaction = (tx: Omit<FinanceTransaction, 'id'>) => {
    const newTx: FinanceTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    updateState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const deleteTransaction = (id: string) => {
    updateState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((tx) => tx.id !== id),
    }));
  };

  const updateBudget = (monthlyBudget: number) => {
    updateState((prev) => ({
      ...prev,
      stats: { ...prev.stats, monthlyBudget },
    }));
  };

  const updateCurrency = (currency: string) => {
    updateState((prev) => ({
      ...prev,
      stats: { ...prev.stats, currency },
    }));
  };

  // ---------------- Stats & Notes Methods ----------------
  const logFocusMinutes = (mins: number) => {
    updateState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        dailyFocusMinutes: prev.stats.dailyFocusMinutes + mins,
      },
    }));
  };

  const setEnergyLevel = (energyLevel: number) => {
    updateState((prev) => ({
      ...prev,
      stats: { ...prev.stats, energyLevel },
    }));
  };

  const setDailyNotes = (dailyNotes: string) => {
    updateState((prev) => ({
      ...prev,
      stats: { ...prev.stats, dailyNotes },
    }));
  };

  // ---------------- AI Chat Methods ----------------
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    updateState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMsg],
    }));

    setIsAiThinking(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: state.messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content,
          })),
          context: {
            tasksCount: state.tasks.length,
            examsCount: state.exams.length,
            focusMinutes: state.stats.dailyFocusMinutes,
          },
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.text || 'Directive registered.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: data.isDemo,
        action: data.action,
      };

      updateState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMsg],
      }));
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `### ⚡ Nexus Offline Processing\n\nI processed your request using local reasoning. For live Gemini AI, verify internet connectivity or configured credentials in Settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: true,
      };
      updateState((prev) => ({
        ...prev,
        messages: [...prev.messages, fallbackMsg],
      }));
    } finally {
      setIsAiThinking(false);
    }
  };

  const applySuggestedAction = (action: SuggestedAction) => {
    if (action.type === 'create_tasks' && action.tasks) {
      const today = new Date().toISOString().split('T')[0];
      const newTasks: Task[] = action.tasks.map((t, idx) => ({
        id: `task-ai-${Date.now()}-${idx}`,
        title: t.title,
        priority: t.priority,
        category: t.category,
        dueDate: today,
        estimatedMinutes: t.estimatedMinutes || 30,
        completed: false,
        subtasks: [],
        createdAt: new Date().toISOString(),
      }));
      updateState((prev) => ({
        ...prev,
        tasks: [...newTasks, ...prev.tasks],
      }));
    } else if (action.type === 'create_study_plan' && action.scheduleItems) {
      const newItems: StudyScheduleItem[] = action.scheduleItems.map((s, idx) => ({
        id: `sch-ai-${Date.now()}-${idx}`,
        subjectId: `sub-ai-${idx}`,
        subjectName: s.subjectName,
        topicTitle: s.topicTitle,
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime,
        completed: false,
      }));
      updateState((prev) => ({
        ...prev,
        schedule: [...prev.schedule, ...newItems],
      }));
    }
  };

  // ---------------- Data Import/Export/Sync ----------------
  const syncNow = async () => {
    if (!user) {
      setSyncStatus('local');
      return;
    }
    await pushStateToCloud(state);
  };

  const exportDataAsJSON = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importDataFromJSON = (jsonStr: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Invalid JSON structure' };
      }
      const validatedState: NexusAppState = {
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : state.tasks,
        subjects: Array.isArray(parsed.subjects) ? parsed.subjects : state.subjects,
        schedule: Array.isArray(parsed.schedule) ? parsed.schedule : state.schedule,
        revisions: Array.isArray(parsed.revisions) ? parsed.revisions : state.revisions,
        exams: Array.isArray(parsed.exams) ? parsed.exams : state.exams,
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : state.transactions,
        messages: Array.isArray(parsed.messages) ? parsed.messages : state.messages,
        stats: parsed.stats ? { ...state.stats, ...parsed.stats } : state.stats,
      };

      updateState(() => validatedState);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to parse JSON file' };
    }
  };

  const resetToSampleData = () => {
    updateState(() => initialNexusData);
  };

  return (
    <NexusContext.Provider
      value={{
        activeTab,
        setActiveTab,
        state,
        syncStatus,
        lastSyncedAt,
        aiStatus,
        isAiThinking,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompleted,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        addSubject,
        updateSubject,
        deleteSubject,
        toggleSubjectTopic,
        addScheduleItem,
        updateScheduleItem,
        toggleScheduleCompleted,
        deleteScheduleItem,
        addRevisionItem,
        advanceRevisionStage,
        deleteRevisionItem,
        addExam,
        updateExam,
        deleteExam,
        addTransaction,
        deleteTransaction,
        updateBudget,
        updateCurrency,
        logFocusMinutes,
        setEnergyLevel,
        setDailyNotes,
        sendMessage,
        applySuggestedAction,
        syncNow,
        exportDataAsJSON,
        importDataFromJSON,
        resetToSampleData,
      }}
    >
      {children}
    </NexusContext.Provider>
  );
};

export const useNexus = () => {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error('useNexus must be used within a NexusProvider');
  }
  return context;
};
