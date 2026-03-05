import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import KPITracker from './components/kpi/KPITracker';
import DecisionLog from './components/decisions/DecisionLog';
import FollowUpManager from './components/followups/FollowUpManager';
import type { ActiveView } from './types';
import './styles/globals.css';
import './App.css';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="app-main">
        {activeView === 'dashboard' && <Dashboard onNavigate={setActiveView} />}
        {activeView === 'kpis' && <KPITracker />}
        {activeView === 'decisions' && <DecisionLog />}
        {activeView === 'followups' && <FollowUpManager />}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
