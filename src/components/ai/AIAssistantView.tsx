import React, { useState, useRef, useEffect } from 'react';
import { useNexus } from '../../context/NexusContext.tsx';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  CheckCircle,
  Plus,
  RefreshCw,
  BookOpen,
  Calendar,
  ListTodo,
  TrendingUp,
} from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const {
    state,
    sendMessage,
    isAiThinking,
    aiStatus,
    applySuggestedAction,
    setActiveTab,
  } = useNexus();

  const [inputMessage, setInputMessage] = useState('');
  const [appliedActionId, setAppliedActionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, isAiThinking]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiThinking) return;
    const text = inputMessage;
    setInputMessage('');
    await sendMessage(text);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  const handleApplyAction = (msgId: string, action: any) => {
    applySuggestedAction(action);
    setAppliedActionId(msgId);
    setTimeout(() => setAppliedActionId(null), 3000);
  };

  const quickPrompts = [
    {
      label: 'Organize Daily Schedule',
      prompt: 'Organize my daily activities into structured high-focus blocks and create my priority tasks.',
      icon: <ListTodo className="w-3.5 h-3.5 text-cyan-400" />,
    },
    {
      label: '7-Day Physics Study Plan',
      prompt: 'Generate an intensive 7-day study plan for Advanced Physics finals with daily spaced practice.',
      icon: <BookOpen className="w-3.5 h-3.5 text-blue-400" />,
    },
    {
      label: 'Productivity Audit',
      prompt: 'Audit my current productivity matrix, identify bottlenecks, and suggest schedule optimization.',
      icon: <TrendingUp className="w-3.5 h-3.5 text-purple-400" />,
    },
    {
      label: 'Exam Prep Breakdown',
      prompt: 'Break down preparing for my upcoming mathematics exam into high-impact subtasks.',
      icon: <Calendar className="w-3.5 h-3.5 text-emerald-400" />,
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto rounded-2xl bg-[#0A1128] border border-cyan-500/25 overflow-hidden shadow-2xl cyber-glow-sm">
      {/* Header with Mode status */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Bot className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Nexus AI Assistant
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                v3.8
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Personalized task planning, schedule generation &amp; academic synthesis
            </p>
          </div>
        </div>

        {/* Clear Mode Indicator */}
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-mono border ${
            aiStatus.mode === 'live'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              aiStatus.mode === 'live' ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'
            }`}
          />
          <span className="font-semibold">
            {aiStatus.mode === 'live'
              ? 'Connected: Gemini 3.8 Flash'
              : 'Demo Mode: Nexus Intelligence'}
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {state.messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-black shadow-sm shadow-cyan-500/30'
                }`}
              >
                {isUser ? 'YOU' : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                {/* Demo / Live label for assistant */}
                {!isUser && msg.isDemo && (
                  <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Demo Mode Simulation</span>
                  </div>
                )}

                {/* Content formatting */}
                <div className="whitespace-pre-line space-y-2 font-normal">
                  {msg.content}
                </div>

                {/* Suggested Action Card (e.g. Add Tasks / Add to Study Plan) */}
                {msg.action && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          Generated Action Items
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {msg.action.tasks?.length || msg.action.scheduleItems?.length || 0} items
                        </span>
                      </div>

                      {/* Preview of items */}
                      <ul className="text-xs text-slate-300 space-y-1 mb-3">
                        {msg.action.tasks?.map((t, i) => (
                          <li key={i} className="flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                            <span className="truncate">{t.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono ml-auto shrink-0">
                              {t.estimatedMinutes}m
                            </span>
                          </li>
                        ))}
                        {msg.action.scheduleItems?.map((s, i) => (
                          <li key={i} className="flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            <span className="truncate">{s.subjectName}: {s.topicTitle}</span>
                            <span className="text-[10px] text-slate-500 font-mono ml-auto shrink-0">
                              {s.day} {s.startTime}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => handleApplyAction(msg.id, msg.action)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                          appliedActionId === msg.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950'
                        }`}
                      >
                        {appliedActionId === msg.id ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Items Applied to Board!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>{msg.action.label}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`mt-1.5 text-[10px] font-mono ${
                    isUser ? 'text-blue-200 text-right' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isAiThinking && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 text-black flex items-center justify-center font-bold text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-300 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="font-mono">Nexus AI synthesizing directives...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] text-slate-400 font-mono shrink-0 uppercase">
          Quick Directives:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickPrompt(qp.prompt)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition cursor-pointer"
          >
            {qp.icon}
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 bg-slate-950/90 border-t border-cyan-500/20">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Instruct Nexus: 'Generate a study timetable for Calculus' or 'Organize my tasks'..."
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isAiThinking}
            aria-label="Send message to AI"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};
