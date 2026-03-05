import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { FollowUp, FollowUpType, FollowUpPriority, FollowUpStatus, FollowUpChannel } from '../../types';

interface FollowUpFormProps {
  onClose: () => void;
  existing?: FollowUp;
}

const FollowUpForm: React.FC<FollowUpFormProps> = ({ onClose, existing }) => {
  const { addFollowUp, updateFollowUp } = useApp();

  const [form, setForm] = useState({
    title: existing?.title ?? '',
    contactName: existing?.contactName ?? '',
    contactCompany: existing?.contactCompany ?? '',
    contactEmail: existing?.contactEmail ?? '',
    type: (existing?.type ?? 'client') as FollowUpType,
    priority: (existing?.priority ?? 'medium') as FollowUpPriority,
    status: (existing?.status ?? 'pending') as FollowUpStatus,
    channel: (existing?.channel ?? 'email') as FollowUpChannel,
    description: existing?.description ?? '',
    dueDate: existing?.dueDate ? existing.dueDate.slice(0, 10) : '',
  });

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = () => {
    if (!form.title || !form.contactName || !form.dueDate) return;
    const payload = {
      ...form,
      dueDate: new Date(form.dueDate).toISOString(),
      activities: existing?.activities ?? [],
      linkedKPIIds: existing?.linkedKPIIds ?? [],
      linkedDecisionIds: existing?.linkedDecisionIds ?? [],
    };
    if (existing) {
      updateFollowUp(existing.id, payload);
    } else {
      addFollowUp(payload);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal modal-wide">
        <div className="modal-header">
          <h2>{existing ? 'Edit Follow-Up' : 'New Follow-Up'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="form-group">
          <label>Title *</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="What needs to happen?" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Contact Name *</label>
            <input value={form.contactName} onChange={(e) => set('contactName', e.target.value)} placeholder="Full name" />
          </div>
          <div className="form-group">
            <label>Company</label>
            <input value={form.contactCompany} onChange={(e) => set('contactCompany', e.target.value)} placeholder="Company or organisation" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} placeholder="contact@example.com" />
          </div>
          <div className="form-group">
            <label>Contact Type</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option value="client">Client</option>
              <option value="lead">Lead</option>
              <option value="partner">Partner</option>
              <option value="internal">Internal</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Context for this follow-up. What happened last? What needs to happen next?" />
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label>Priority</label>
            <select value={form.priority} onChange={(e) => set('priority', e.target.value)}>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label>Channel</label>
            <select value={form.channel} onChange={(e) => set('channel', e.target.value)}>
              <option value="email">Email</option>
              <option value="call">Call</option>
              <option value="meeting">Meeting</option>
              <option value="message">Message</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Due Date *</label>
          <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} style={{ maxWidth: 220 }} />
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.title || !form.contactName || !form.dueDate}>
            {existing ? 'Save Changes' : 'Create Follow-Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpForm;
