import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import KPITracker from './components/kpi/KPITracker';
import DecisionLog from './components/decisions/DecisionLog';
import FollowUpManager from './components/followups/FollowUpManager';
import type { ActiveView } from './types';
import { useAuth } from './context/AuthContext';
import './styles/globals.css';
import './App.css';

const LoadingScreen: React.FC = () => (
  <div className="app-loading">
    <div className="loading-brand">
      <div className="brand-mark" style={{ width: 42, height: 42, fontSize: '1.3rem' }}>B</div>
      <span>Ops Toolkit</span>
    </div>
    <div className="loading-spinner" />
    <p>Connecting to cloud…</p>
  </div>
);

const AppContent: React.FC = () => {
  const { status } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  if (status === 'loading') return <LoadingScreen />;

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="app-main">
        {activeView === 'dashboard'  && <Dashboard onNavigate={setActiveView} />}
        {activeView === 'kpis'       && <KPITracker />}
        {activeView === 'decisions'  && <DecisionLog />}
        {activeView === 'followups'  && <FollowUpManager />}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </AuthProvider>
);

export default App;
