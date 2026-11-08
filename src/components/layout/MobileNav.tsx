import React from 'react';
import { useNexus, NavTab } from '../../context/NexusContext.tsx';
import {
  LayoutDashboard,
  Bot,
  CheckSquare,
  GraduationCap,
  Wallet,
  BarChart3,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useNexus();

  const items: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'ai', label: 'AI', icon: <Bot className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'study', label: 'Study', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'finance', label: 'Finance', icon: <Wallet className="w-5 h-5" /> },
    { id: 'analytics', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050814]/95 backdrop-blur-xl border-t border-cyan-500/20 px-2 py-1 safe-area-pb">
      <div className="grid grid-cols-6 gap-1">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition ${
                isActive
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
