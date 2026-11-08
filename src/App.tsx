import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { NexusProvider, useNexus } from './context/NexusContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { MobileNav } from './components/layout/MobileNav.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { DeploymentGuideModal } from './components/common/DeploymentGuideModal.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { AIAssistantView } from './components/ai/AIAssistantView.tsx';
import { TaskManagerView } from './components/tasks/TaskManagerView.tsx';
import { StudyPlannerView } from './components/study/StudyPlannerView.tsx';
import { FinanceTrackerView } from './components/finance/FinanceTrackerView.tsx';
import { AnalyticsView } from './components/analytics/AnalyticsView.tsx';

function NexusAppContent() {
  const { activeTab } = useNexus();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-black">
      {/* Background cyber grid & subtle radial glow */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-40 z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenDocs={() => setIsDocsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenAddTask={() => setIsAddTaskModalOpen(true)}
            onOpenAddExpense={() => setIsAddExpenseModalOpen(true)}
          />
        )}
        {activeTab === 'ai' && <AIAssistantView />}
        {activeTab === 'tasks' && (
          <TaskManagerView
            isAddModalOpen={isAddTaskModalOpen}
            setIsAddModalOpen={setIsAddTaskModalOpen}
          />
        )}
        {activeTab === 'study' && <StudyPlannerView />}
        {activeTab === 'finance' && (
          <FinanceTrackerView
            isAddModalOpen={isAddExpenseModalOpen}
            setIsAddModalOpen={setIsAddExpenseModalOpen}
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsView onOpenDocs={() => setIsDocsModalOpen(true)} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <DeploymentGuideModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NexusProvider>
        <NexusAppContent />
      </NexusProvider>
    </AuthProvider>
  );
}
