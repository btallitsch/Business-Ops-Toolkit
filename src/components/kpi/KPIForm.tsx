import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { KPI, KPICategory } from '../../types';

interface KPIFormProps {
  onClose: () => void;
  existing?: KPI;
}

const KPIForm: React.FC<KPIFormProps> = ({ onClose, existing }) => {
  const { addKPI, updateKPI } = useApp();

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    description: existing?.description ?? '',
    category: (existing?.category ?? 'custom') as KPICategory,
    unit: existing?.unit ?? '',
    targetValue: existing?.targetValue ?? 0,
    currentValue: existing?.currentValue ?? 0,
    startValue: existing?.startValue ?? 0,
    startDate: existing?.startDate ? existing.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    targetDate: existing?.targetDate ? existing.targetDate.slice(0, 10) : '',
  });

  const set = (field: string, value: string | number) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = () => {
    if (!form.name || !form.targetDate) return;

    if (existing) {
      updateKPI(existing.id, {
        ...form,
        targetValue: Number(form.targetValue),
        currentValue: Number(form.currentValue),
        startValue: Number(form.startValue),
      });
    } else {
      addKPI({
        ...form,
        targetValue: Number(form.targetValue),
        currentValue: Number(form.currentValue),
        startValue: Number(form.startValue),
        dataPoints: [{ date: new Date(form.startDate).toISOString(), value: Number(form.startValue) }],
        linkedDecisionIds: [],
        linkedFollowUpIds: [],
      });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2>{existing ? 'Edit KPI' : 'New KPI'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="form-group">
          <label>Metric Name *</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Monthly Recurring Revenue" />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What does this metric measure and why does it matter?" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="revenue">Revenue</option>
              <option value="growth">Growth</option>
              <option value="retention">Retention</option>
              <option value="operational">Operational</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="form-group">
            <label>Unit</label>
            <input value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="$, %, users, days…" />
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label>Start Value *</label>
            <input type="number" value={form.startValue} onChange={(e) => set('startValue', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Current Value *</label>
            <input type="number" value={form.currentValue} onChange={(e) => set('currentValue', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Target Value *</label>
            <input type="number" value={form.targetValue} onChange={(e) => set('targetValue', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date *</label>
            <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Target Date *</label>
            <input type="date" value={form.targetDate} onChange={(e) => set('targetDate', e.target.value)} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.name || !form.targetDate}>
            {existing ? 'Save Changes' : 'Create KPI'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KPIForm;
