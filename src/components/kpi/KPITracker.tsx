import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import KPICard from './KPICard';
import KPIForm from './KPIForm';
import Header from '../layout/Header';
import type { KPI, KPIStatus, KPICategory } from '../../types';
import { getKPISummary, statusColors } from '../../utils/helpers';
import './KPITracker.css';

const KPITracker: React.FC = () => {
  const { kpis } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editKPI, setEditKPI] = useState<KPI | null>(null);
  const [filterStatus, setFilterStatus] = useState<KPIStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<KPICategory | 'all'>('all');

  const summary = getKPISummary(kpis);

  const filtered = kpis.filter((k) => {
    if (filterStatus !== 'all' && k.status !== filterStatus) return false;
    if (filterCategory !== 'all' && k.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="kpi-tracker">
      <Header
        activeView="kpis"
        action={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> New KPI
          </button>
        }
      />

      <div className="kpi-tracker-body">
        {/* Summary Bar */}
        <div className="kpi-summary-bar">
          {(['on-track', 'at-risk', 'off-track', 'exceeded'] as KPIStatus[]).map((s) => {
            const count = kpis.filter((k) => k.status === s).length;
            return (
              <button
                key={s}
                className={`summary-status-btn ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
                style={{ '--accent': statusColors[s] } as React.CSSProperties}
              >
                <span className="status-dot" style={{ background: statusColors[s] }} />
                <span>{count}</span>
                <span>{s}</span>
              </button>
            );
          })}
          <div className="summary-total">
            <span className="font-mono text-xs text-dim">{summary.total} total</span>
          </div>
        </div>

        {/* Filters */}
        <div className="kpi-filters">
          <Filter size={13} className="text-dim" />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as KPICategory | 'all')} style={{ width: 'auto', minWidth: 140 }}>
            <option value="all">All categories</option>
            <option value="revenue">Revenue</option>
            <option value="growth">Growth</option>
            <option value="retention">Retention</option>
            <option value="operational">Operational</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Plus size={32} />
            <p>No KPIs match your filters. Add your first metric to start tracking progress.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Add First KPI
            </button>
          </div>
        ) : (
          <div className="kpi-grid">
            {filtered.map((kpi) => (
              <KPICard key={kpi.id} kpi={kpi} onEdit={() => setEditKPI(kpi)} />
            ))}
          </div>
        )}
      </div>

      {showForm && <KPIForm onClose={() => setShowForm(false)} />}
      {editKPI && <KPIForm existing={editKPI} onClose={() => setEditKPI(null)} />}
    </div>
  );
};

export default KPITracker;
