import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Decision, DecisionStatus, DecisionImpact } from '../../types';

interface DecisionFormProps {
  onClose: () => void;
  existing?: Decision;
}

const DecisionForm: React.FC<DecisionFormProps> = ({ onClose, existing }) => {
  const { addDecision, updateDecision } = useApp();

  const [form, setForm] = useState({
    title: existing?.title ?? '',
    context: existing?.context ?? '',
    rationale: existing?.rationale ?? '',
    risks: existing?.risks ?? '',
    owner: existing?.owner ?? '',
    status: (existing?.status ?? 'proposed') as DecisionStatus,
    impact: (existing?.impact ?? 'medium') as DecisionImpact,
    decidedAt: existing?.decidedAt ? existing.decidedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
  });

  const [options, setOptions] = useState<string[]>(existing?.options ?? ['', '']);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const addOption = () => setOptions((p) => [...p, '']);
  const setOption = (i: number, v: string) => setOptions((p) => p.map((o, idx) => idx === i ? v : o));
  const removeOption = (i: number) => setOptions((p) => p.filter((_, idx) => idx !== i));

  const handleTagKey = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags((p) => [...p, tagInput.trim()]);
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags((p) => p.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    if (!form.title) return;
    const payload = {
      ...form,
      options: options.filter(Boolean),
      tags,
      decidedAt: new Date(form.decidedAt).toISOString(),
      linkedKPIIds: existing?.linkedKPIIds ?? [],
      linkedFollowUpIds: existing?.linkedFollowUpIds ?? [],
    };
    if (existing) {
      updateDecision(existing.id, payload);
    } else {
      addDecision(payload);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal modal-wide">
        <div className="modal-header">
          <h2>{existing ? 'Edit Decision' : 'Log a Decision'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="form-group">
          <label>Decision Title *</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="A clear, action-oriented title for this decision" />
        </div>

        <div className="form-group">
          <label>Context & Problem Statement *</label>
          <textarea rows={3} value={form.context} onChange={(e) => set('context', e.target.value)} placeholder="Why was this decision needed? What situation or problem prompted it?" />
        </div>

        <div className="form-group">
          <label>Options Considered</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                />
                {options.length > 1 && (
                  <button className="btn-icon" onClick={() => removeOption(i)} style={{ flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={addOption} style={{ width: 'fit-content' }}>
              <Plus size={13} /> Add Option
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Rationale *</label>
          <textarea rows={3} value={form.rationale} onChange={(e) => set('rationale', e.target.value)} placeholder="Why was this option chosen? What evidence or reasoning supports it?" />
        </div>

        <div className="form-group">
          <label>Risks & Trade-offs</label>
          <textarea rows={2} value={form.risks} onChange={(e) => set('risks', e.target.value)} placeholder="What could go wrong? What are we trading off?" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Owner</label>
            <input value={form.owner} onChange={(e) => set('owner', e.target.value)} placeholder="Who owns this decision?" />
          </div>
          <div className="form-group">
            <label>Decision Date</label>
            <input type="date" value={form.decidedAt} onChange={(e) => set('decidedAt', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="proposed">Proposed</option>
              <option value="approved">Approved</option>
              <option value="in-progress">In Progress</option>
              <option value="implemented">Implemented</option>
              <option value="reversed">Reversed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Impact Level</label>
            <select value={form.impact} onChange={(e) => set('impact', e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <div className="tags-container" onClick={() => document.getElementById('tag-input')?.focus()}>
            {tags.map((t) => (
              <span key={t} className="tag-item">
                {t}
                <button onClick={() => setTags((p) => p.filter((x) => x !== t))}>×</button>
              </span>
            ))}
            <input
              id="tag-input"
              className="tag-input-inner"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              placeholder={tags.length === 0 ? 'Add tags (press Enter)…' : ''}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.title}>
            {existing ? 'Save Changes' : 'Log Decision'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionForm;
