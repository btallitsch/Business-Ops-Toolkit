import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DecisionCard from './DecisionCard';
import DecisionForm from './DecisionForm';
import Header from '../layout/Header';
import type { Decision, DecisionStatus, DecisionImpact } from '../../types';
import './DecisionLog.css';

const DecisionLog: React.FC = () => {
  const { decisions } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editDecision, setEditDecision] = useState<Decision | null>(null);
  const [filterStatus, setFilterStatus] = useState<DecisionStatus | 'all'>('all');
  const [filterImpact, setFilterImpact] = useState<DecisionImpact | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = decisions
    .filter((d) => {
      if (filterStatus !== 'all' && d.status !== filterStatus) return false;
      if (filterImpact !== 'all' && d.impact !== filterImpact) return false;
      if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.context.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime());

  return (
    <div className="decision-log">
      <Header
        activeView="decisions"
        action={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Log Decision
          </button>
        }
      />

      <div className="decision-log-body">
        <div className="decision-filters">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decisions…"
            style={{ maxWidth: 260 }}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as DecisionStatus | 'all')} style={{ width: 'auto', minWidth: 150 }}>
            <option value="all">All statuses</option>
            <option value="proposed">Proposed</option>
            <option value="approved">Approved</option>
            <option value="in-progress">In Progress</option>
            <option value="implemented">Implemented</option>
            <option value="reversed">Reversed</option>
          </select>
          <select value={filterImpact} onChange={(e) => setFilterImpact(e.target.value as DecisionImpact | 'all')} style={{ width: 'auto', minWidth: 150 }}>
            <option value="all">All impact levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <span className="font-mono text-xs text-dim">{filtered.length} decision{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <Plus size={32} />
            <p>No decisions logged yet. Record your first strategic decision to start building your operational memory.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Log First Decision
            </button>
          </div>
        ) : (
          <div className="decisions-list">
            {filtered.map((d) => (
              <DecisionCard key={d.id} decision={d} onEdit={() => setEditDecision(d)} />
            ))}
          </div>
        )}
      </div>

      {showForm && <DecisionForm onClose={() => setShowForm(false)} />}
      {editDecision && <DecisionForm existing={editDecision} onClose={() => setEditDecision(null)} />}
    </div>
  );
};

export default DecisionLog;
