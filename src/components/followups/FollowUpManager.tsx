import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import FollowUpCard from './FollowUpCard';
import FollowUpForm from './FollowUpForm';
import Header from '../layout/Header';
import type { FollowUp, FollowUpStatus, FollowUpPriority, FollowUpType } from '../../types';
import { isOverdue, priorityOrder } from '../../utils/helpers';
import './FollowUpManager.css';

const FollowUpManager: React.FC = () => {
  const { followUps } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editFollowUp, setEditFollowUp] = useState<FollowUp | null>(null);
  const [filterStatus, setFilterStatus] = useState<FollowUpStatus | 'all' | 'overdue'>('all');
  const [filterType, setFilterType] = useState<FollowUpType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<FollowUpPriority | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = followUps
    .filter((f) => {
      if (filterStatus === 'overdue') return isOverdue(f.dueDate) && f.status !== 'completed' && f.status !== 'cancelled';
      if (filterStatus !== 'all' && f.status !== filterStatus) return false;
      if (filterType !== 'all' && f.type !== filterType) return false;
      if (filterPriority !== 'all' && f.priority !== filterPriority) return false;
      if (search && !f.title.toLowerCase().includes(search.toLowerCase()) && !f.contactName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const overdueA = isOverdue(a.dueDate) ? 1 : 0;
      const overdueB = isOverdue(b.dueDate) ? 1 : 0;
      if (overdueB !== overdueA) return overdueB - overdueA;
      const pDiff = (priorityOrder[b.priority] ?? 0) - (priorityOrder[a.priority] ?? 0);
      if (pDiff !== 0) return pDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const overdueCount = followUps.filter((f) => isOverdue(f.dueDate) && f.status !== 'completed' && f.status !== 'cancelled').length;

  return (
    <div className="followup-manager">
      <Header
        activeView="followups"
        action={
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> New Follow-Up
          </button>
        }
      />

      <div className="followup-manager-body">
        <div className="followup-filters">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search follow-ups…"
            style={{ maxWidth: 240 }}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FollowUpStatus | 'all' | 'overdue')} style={{ width: 'auto', minWidth: 150 }}>
            <option value="all">All statuses</option>
            <option value="overdue">⚠ Overdue ({overdueCount})</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="waiting">Waiting</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as FollowUpType | 'all')} style={{ width: 'auto', minWidth: 140 }}>
            <option value="all">All types</option>
            <option value="client">Client</option>
            <option value="lead">Lead</option>
            <option value="partner">Partner</option>
            <option value="internal">Internal</option>
            <option value="vendor">Vendor</option>
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as FollowUpPriority | 'all')} style={{ width: 'auto', minWidth: 140 }}>
            <option value="all">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <span className="font-mono text-xs text-dim">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <Plus size={32} />
            <p>No follow-ups match your filters. Add your first follow-up to start tracking contacts and actions.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Add First Follow-Up
            </button>
          </div>
        ) : (
          <div className="followups-list">
            {filtered.map((f) => (
              <FollowUpCard key={f.id} followUp={f} onEdit={() => setEditFollowUp(f)} />
            ))}
          </div>
        )}
      </div>

      {showForm && <FollowUpForm onClose={() => setShowForm(false)} />}
      {editFollowUp && <FollowUpForm existing={editFollowUp} onClose={() => setEditFollowUp(null)} />}
    </div>
  );
};

export default FollowUpManager;
