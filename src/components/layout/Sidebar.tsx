import React from 'react';
import { LayoutDashboard, TrendingUp, BookOpen, Bell, ChevronRight } from 'lucide-react';
import type { ActiveView } from '../../types';
import { useApp } from '../../context/AppContext';
import { getFollowUpSummary, isOverdue } from '../../utils/helpers';
import SyncStatusBar from './SyncStatus';
import './Sidebar.css';

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

const navItems: { id: ActiveView; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, description: 'Overview' },
  { id: 'kpis', label: 'KPI Tracker', icon: <TrendingUp size={18} />, description: 'Metrics & goals' },
  { id: 'decisions', label: 'Decision Log', icon: <BookOpen size={18} />, description: 'Choices & context' },
  { id: 'followups', label: 'Follow-Ups', icon: <Bell size={18} />, description: 'Actions & contacts' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const { followUps } = useApp();
  const summary = getFollowUpSummary(followUps);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">B</div>
        <div>
          <div className="brand-name">Ops Toolkit</div>
          <div className="brand-tagline">Business Intelligence</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Workspace</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-content">
              <span className="nav-label-text">{item.label}</span>
              <span className="nav-description">{item.description}</span>
            </span>
            {item.id === 'followups' && summary.overdue > 0 && (
              <span className="nav-badge overdue">{summary.overdue}</span>
            )}
            {item.id === 'followups' && summary.overdue === 0 && summary.dueSoon > 0 && (
              <span className="nav-badge soon">{summary.dueSoon}</span>
            )}
            <ChevronRight size={14} className="nav-chevron" />
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-stats">
          <div className="stat-pill">
            <span className="stat-dot green" />
            <span>{followUps.filter((f) => f.status === 'completed').length} done</span>
          </div>
          <div className="stat-pill">
            <span className="stat-dot orange" />
            <span>
              {followUps.filter((f) => isOverdue(f.dueDate) && f.status !== 'completed' && f.status !== 'cancelled').length} overdue
            </span>
          </div>
        </div>
      </div>
      <SyncStatusBar />
    </aside>
  );
};

export default Sidebar;
