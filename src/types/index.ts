export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskCategory = 'Study' | 'Work' | 'Personal' | 'Finance' | 'Health';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: TaskCategory;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
  subtasks: Subtask[];
  createdAt: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  completed: boolean;
}

export interface StudySubject {
  id: string;
  name: string;
  code: string;
  color: string; // hex or tailwind class
  targetWeeklyHours: number;
  completedHours: number;
  syllabusProgress: number; // 0 - 100
  topics: StudyTopic[];
}

export interface StudyScheduleItem {
  id: string;
  subjectId: string;
  subjectName: string;
  topicTitle: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  completed: boolean;
  notes?: string;
}

export interface RevisionItem {
  id: string;
  subjectName: string;
  topic: string;
  currentStage: number; // 0 (Day 1), 1 (Day 3), 2 (Day 7), 3 (Day 14)
  lastReviewedDate?: string; // YYYY-MM-DD
  nextReviewDate: string; // YYYY-MM-DD
  status: 'due' | 'upcoming' | 'mastered';
}

export interface ExamItem {
  id: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  room?: string;
  targetScore?: string;
  importance: 'critical' | 'high' | 'standard';
}

export type TransactionType = 'income' | 'expense';
export type ExpenseCategory = 'Education' | 'Housing' | 'Food' | 'Tech' | 'Books' | 'Entertainment' | 'Travel' | 'Other';
export type IncomeCategory = 'Salary' | 'Freelance' | 'Allowance' | 'Scholarship' | 'Investments' | 'Other';
export type TransactionCategory = ExpenseCategory | IncomeCategory;

export interface FinanceTransaction {
  id: string;
  type: TransactionType;
  title: string;
  category: TransactionCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface SuggestedAction {
  type: 'create_tasks' | 'create_study_plan';
  label: string;
  tasks?: Array<{
    title: string;
    priority: Priority;
    category: TaskCategory;
    estimatedMinutes: number;
  }>;
  scheduleItems?: Array<{
    subjectName: string;
    topicTitle: string;
    day: StudyScheduleItem['day'];
    startTime: string;
    endTime: string;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isDemo?: boolean;
  action?: SuggestedAction;
}

export interface UserStats {
  dailyFocusMinutes: number;
  currentStreakDays: number;
  energyLevel: number; // 1 to 5
  dailyNotes: string;
  monthlyBudget: number;
  currency: string;
}

export interface NexusAppState {
  tasks: Task[];
  subjects: StudySubject[];
  schedule: StudyScheduleItem[];
  revisions: RevisionItem[];
  exams: ExamItem[];
  transactions: FinanceTransaction[];
  messages: ChatMessage[];
  stats: UserStats;
}
