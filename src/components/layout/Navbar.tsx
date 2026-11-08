import React, { useState } from 'react';
import { useNexus, NavTab } from '../../context/NexusContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Bot,
  CheckSquare,
  GraduationCap,
  Wallet,
  BarChart3,
  Cloud,
  CloudCheck,
  RefreshCw,
  User as UserIcon,
  LogOut,
  Sparkles,
  HelpCircle,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenDocs }) => {
  const { activeTab, setActiveTab, syncStatus, lastSyncedAt, aiStatus, syncNow } = useNexus();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Assistant', icon: <Bot className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'study', label: 'Study Planner', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'finance', label: 'Finance', icon: <Wallet className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await syncNow();
    setTimeout(() => setIsManualSyncing(false), 500);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050814]/90 backdrop-blur-xl border-b border-cyan-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2.5 focus:outline-none group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition">
                <div className="w-full h-full bg-[#070D1E] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                    VASISOX NEXUS
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:inline">
                  Command &bull; Productivity &bull; Sync
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Status Badges & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* AI Engine Status Badge */}
            <div
              title={
                aiStatus.mode === 'live'
                  ? 'Gemini 3.8 Flash model active via server API'
                  : 'Nexus Simulation Demo mode active'
              }
              className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                aiStatus.mode === 'live'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus.mode === 'live'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-cyan-400'
                }`}
              />
              <span className="font-medium">
                {aiStatus.mode === 'live' ? 'Gemini 3.8 Flash' : 'AI Demo Mode'}
              </span>
            </div>

            {/* Cloud Sync Status Indicator */}
            <button
              onClick={handleManualSync}
              title="Click to force cloud synchronization"
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:border-cyan-500/40 transition cursor-pointer"
            >
              {syncStatus === 'syncing' || isManualSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span className="hidden sm:inline text-cyan-300">Syncing...</span>
                </>
              ) : syncStatus === 'synced' ? (
                <>
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline text-emerald-300">Synced</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline text-slate-400">Local Only</span>
                </>
              )}
            </button>

            {/* Deployment & Help Guide Button */}
            <button
              onClick={onOpenDocs}
              aria-label="View deployment instructions and system guide"
              title="Deployment & User Guide"
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 border border-transparent hover:border-cyan-500/20 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User Auth Controls */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-xs text-white transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-black text-xs">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate font-medium">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0A1128] border border-cyan-500/30 shadow-2xl p-2 text-xs text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-slate-800">
                      <p className="font-semibold text-white truncate">
                        {user.displayName || 'Nexus Commander'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {user.email}
                      </p>
                      <span className="mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                        Cloud Sync Enabled
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleManualSync();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-cyan-300 transition text-left cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Force Sync to Cloud</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenDocs();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-cyan-300 transition text-left cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Run & Deploy Guide</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg hover:bg-red-950/40 text-red-300 hover:text-red-200 transition text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-cyan-500/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800/80 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
