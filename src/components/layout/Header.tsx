import React from 'react';
import type { ActiveView } from '../../types';
import './Header.css';

interface HeaderProps {
  activeView: ActiveView;
  action?: React.ReactNode;
}

const viewMeta: Record<ActiveView, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Operational overview across all layers' },
  kpis: { title: 'KPI Tracker', subtitle: 'Define metrics, set targets, and track progress' },
  decisions: { title: 'Decision Log', subtitle: 'Record context, rationale, and outcomes' },
  followups: { title: 'Follow-Ups', subtitle: 'Manage contacts, actions, and next steps' },
};

const Header: React.FC<HeaderProps> = ({ activeView, action }) => {
  const meta = viewMeta[activeView];
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="top-header">
      <div className="header-left">
        <h1 className="header-title">{meta.title}</h1>
        <p className="header-subtitle">{meta.subtitle}</p>
      </div>
      <div className="header-right">
        <span className="header-date">{dateStr}</span>
        {action && <div className="header-action">{action}</div>}
      </div>
    </header>
  );
};

export default Header;
