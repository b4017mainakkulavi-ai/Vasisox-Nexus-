import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Port resolution: AI Studio container forwards port 3000 (nginx runs on 8080)
let serverPort = 3000;
let serverHost = '0.0.0.0';

// Parse CLI flags (e.g., --port 3000 --host 0.0.0.0)
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--port' && process.argv[i + 1]) {
    serverPort = Number(process.argv[i + 1]);
    i++;
  } else if (process.argv[i]?.startsWith('--port=')) {
    serverPort = Number(process.argv[i].split('=')[1]);
  } else if (process.argv[i] === '--host') {
    if (process.argv[i + 1] && !process.argv[i + 1].startsWith('-')) {
      serverHost = process.argv[i + 1];
      i++;
    } else {
      serverHost = '0.0.0.0';
    }
  } else if (process.argv[i]?.startsWith('--host=')) {
    serverHost = process.argv[i].split('=')[1] || '0.0.0.0';
  }
}

// In production standalone mode, if PORT is set and not 8080, honor it
if (process.env.NODE_ENV === 'production' && process.env.PORT && process.env.PORT !== '8080' && !process.argv.some(a => a.includes('port'))) {
  serverPort = Number(process.env.PORT);
}

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client if GEMINI_API_KEY is available
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 5) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Nexus Gemini AI client successfully initialized with gemini-3.8-flash');
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client, running in demo mode:', err);
  }
} else {
  console.log('No GEMINI_API_KEY configured. Running AI Assistant in Demo Mode.');
}

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Configuration Status
app.get('/api/ai/status', (_req, res) => {
  res.json({
    configured: Boolean(ai),
    model: 'gemini-3.8-flash',
    mode: ai ? 'live' : 'demo',
  });
});

// Demo mode response generator for intelligent offline/preview experience
function generateDemoResponse(prompt: string, context?: any) {
  const p = prompt.toLowerCase();

  if (p.includes('study plan') || p.includes('syllabus') || p.includes('physics') || p.includes('math') || p.includes('exam')) {
    return {
      text: `### 🎯 High-Impact Study Blueprint Generated

Here is an optimized study plan structured for deep conceptual retention and spaced practice:

1. **Phase 1: Foundation Review (Days 1–2)**
   - Core concepts, theorems, formula sheets, and glossary breakdown.
   - 90-minute morning deep work blocks with active recall testing.

2. **Phase 2: Targeted Problem Solving (Days 3–4)**
   - Hard practice sets and past-paper questions under timed conditions.
   - Track recurring error types in your Revision Tracker.

3. **Phase 3: Spaced Revision & Mock Exam (Days 5–6)**
   - Full mock run-through, identifying friction points.
   - Quick flash revision of high-yield formulas.

*Click "Add to Study Timetable" below to integrate these study sessions directly into your Study Planner!*`,
      action: {
        type: 'create_study_plan',
        label: 'Add to Study Timetable',
        scheduleItems: [
          {
            subjectName: 'Advanced Physics',
            topicTitle: 'Thermodynamics & Statistical Mechanics',
            day: 'Monday',
            startTime: '09:00',
            endTime: '11:00',
          },
          {
            subjectName: 'Calculus & Linear Algebra',
            topicTitle: 'Eigenvalues & Vector Spaces Drill',
            day: 'Tuesday',
            startTime: '10:00',
            endTime: '12:00',
          },
          {
            subjectName: 'Computer Architecture',
            topicTitle: 'Pipeline Hazards & Cache Coherence',
            day: 'Wednesday',
            startTime: '14:00',
            endTime: '16:00',
          },
          {
            subjectName: 'Data Structures & Algorithms',
            topicTitle: 'Dynamic Programming & Graph Traversal',
            day: 'Thursday',
            startTime: '09:30',
            endTime: '11:30',
          },
        ],
      },
    };
  }

  if (p.includes('organize') || p.includes('task') || p.includes('routine') || p.includes('todo') || p.includes('schedule today')) {
    return {
      text: `### ⚡ Daily Productivity & Action Matrix

Based on energy curve optimization and high-impact prioritization, here is your proposed action agenda:

- **High-Focus Morning Block:** Tackle the most cognitively demanding problem before notifications.
- **Midday Execution:** Administrative items, follow-ups, and revision drills.
- **Evening Review:** Consolidate notes, record financial expenses, and plan tomorrow's priority 1 task.

*I have converted these recommendations into ready-to-use tasks. Click "Apply Tasks to Task Manager" to load them into your board!*`,
      action: {
        type: 'create_tasks',
        label: 'Apply Tasks to Task Manager',
        tasks: [
          {
            title: 'Deep Work: Complete high-priority assignment module',
            priority: 'urgent',
            category: 'Study',
            estimatedMinutes: 90,
          },
          {
            title: 'Review weekly budget & categorize recent expenses',
            priority: 'medium',
            category: 'Finance',
            estimatedMinutes: 20,
          },
          {
            title: 'Spaced repetition: Review Chapter 4 formulas (Day 3)',
            priority: 'high',
            category: 'Study',
            estimatedMinutes: 30,
          },
          {
            title: 'Health & Focus: 30 min cardio & hydration reset',
            priority: 'low',
            category: 'Health',
            estimatedMinutes: 30,
          },
        ],
      },
    };
  }

  // General productivity assistant response
  return {
    text: `### 🤖 Nexus AI Command Intelligence

Welcome to your Nexus personal command center! I am trained to accelerate your output, structure complex academic workloads, and keep your goals in focus.

Here are a few quick directives you can give me:
1. *"Generate a 5-day study plan for organic chemistry"*
2. *"Organize my day into high-focus blocks and create my tasks"*
3. *"Help me audit my spending and allocate an exam savings buffer"*
4. *"Break down preparing for my final exam into subtasks"*

What objective would you like to conquer right now?`,
    action: {
      type: 'create_tasks',
      label: 'Load Kickstart Tasks',
      tasks: [
        {
          title: 'Define top 3 goals for this academic sprint',
          priority: 'high',
          category: 'Personal',
          estimatedMinutes: 15,
        },
        {
          title: 'Audit exam timetable and add countdown dates',
          priority: 'medium',
          category: 'Study',
          estimatedMinutes: 25,
        },
      ],
    },
  };
}

// AI Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { message, history, context } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // If Gemini AI client is configured, call Gemini 3.8 Flash model
  if (ai) {
    try {
      const systemInstruction = `You are Vasisox Nexus AI, an elite, futuristic personal productivity, study management, and financial optimization intelligence.
Your tone is sleek, confident, encouraging, ultra-crisp, and highly practical.
You help users organise their daily schedule, study for examinations, prioritize tasks with time management principles (Pomodoro, Eisenhower matrix, active recall, spaced repetition), and balance their finances.

When relevant, suggest concrete actionable tasks or study schedules.
Always format your answers in clear, clean Markdown with bullet points or numbered steps. Keep responses focused and readable.`;

      // Build conversation contents
      const conversationContents: any[] = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          conversationContents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content || item.text || '' }],
          });
        }
      }

      let promptWithContext = message;
      if (context) {
        promptWithContext += `\n\n[User Context: Current Tasks Count: ${context.tasksCount || 0}, Pending Exams: ${context.examsCount || 0}, Daily Focus: ${context.focusMinutes || 0}m]`;
      }

      conversationContents.push({
        role: 'user',
        parts: [{ text: promptWithContext }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: conversationContents,
        config: {
          systemInstruction,
        },
      });

      const responseText = response.text || 'Task processed successfully.';

      // Determine if response suggests tasks or study plans to provide interactive action buttons
      let action: any = null;
      const lower = message.toLowerCase();
      if (lower.includes('task') || lower.includes('todo') || lower.includes('organize') || lower.includes('routine')) {
        action = {
          type: 'create_tasks',
          label: 'Apply Suggested Tasks to Board',
          tasks: [
            {
              title: `Execute: ${message.slice(0, 40)}`,
              priority: 'high',
              category: 'Study',
              estimatedMinutes: 45,
            },
            {
              title: 'Review notes and update revision stage',
              priority: 'medium',
              category: 'Study',
              estimatedMinutes: 20,
            },
          ],
        };
      } else if (lower.includes('study plan') || lower.includes('exam') || lower.includes('schedule')) {
        action = {
          type: 'create_study_plan',
          label: 'Add to Study Timetable',
          scheduleItems: [
            {
              subjectName: 'Target Subject Focus',
              topicTitle: 'Core Concept Mastery & Drill',
              day: 'Monday',
              startTime: '10:00',
              endTime: '12:00',
            },
            {
              subjectName: 'Target Subject Focus',
              topicTitle: 'Past Paper Practice & Error Log',
              day: 'Wednesday',
              startTime: '14:00',
              endTime: '16:00',
            },
          ],
        };
      }

      return res.json({
        text: responseText,
        isDemo: false,
        action,
      });
    } catch (err: any) {
      console.error('Error invoking Gemini 3.8 Flash model, using demo fallback:', err?.message || err);
      const demoFallback = generateDemoResponse(message, context);
      return res.json({
        ...demoFallback,
        isDemo: true,
        note: 'Switched to Demo Engine due to API connection state.',
      });
    }
  }

  // Demo mode
  const demoResult = generateDemoResponse(message, context);
  return res.json({
    ...demoResult,
    isDemo: true,
  });
});

// AI Task Breakdown Endpoint
app.post('/api/ai/breakdown-task', async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  if (ai) {
    try {
      const prompt = `Break down this task into 3 to 5 clear, concrete subtasks: "${title}". Description: "${description || ''}". Return only the list of subtask titles.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const lines = (response.text || '')
        .split('\n')
        .map((l) => l.replace(/^[-*0-9.)\s]+/, '').trim())
        .filter((l) => l.length > 2)
        .slice(0, 5);

      if (lines.length > 0) {
        return res.json({ subtasks: lines });
      }
    } catch (e) {
      console.warn('AI breakdown failed, using default breakdown:', e);
    }
  }

  // Fallback breakdown
  const defaultSubtasks = [
    `Gather materials & research background for "${title}"`,
    'Execute first working draft / core implementation',
    'Review against acceptance criteria and polish details',
    'Final verification and mark complete',
  ];
  return res.json({ subtasks: defaultSubtasks, isDemo: true });
});

// Setup Vite middleware for development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(serverPort, serverHost, () => {
    console.log(`Vasisox Nexus AI Server running on http://${serverHost}:${serverPort}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
