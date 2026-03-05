import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, MoreHorizontal, Edit2, Trash2, PlusCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { KPI } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  computeKPIProgress,
  formatKPIValue,
  formatShortDate,
  formatDate,
  statusColors,
} from '../../utils/helpers';

interface KPICardProps {
  kpi: KPI;
  onEdit: () => void;
}

const DataPointModal: React.FC<{ kpi: KPI; onClose: () => void }> = ({ kpi, onClose }) => {
  const { addKPIDataPoint } = useApp();
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleAdd = () => {
    if (!value) return;
    addKPIDataPoint(kpi.id, {
      date: new Date(date).toISOString(),
      value: Number(value),
      note: note || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2>Log Data Point</h2>
          <button className="btn-icon" onClick={onClose}><Minus size={18} /></button>
        </div>
        <p className="text-muted text-sm mb-4">{kpi.name}</p>
        <div className="form-row">
          <div className="form-group">
            <label>Value ({kpi.unit || 'units'})</label>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="New value" autoFocus />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Note (optional)</label>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What changed? What drove this?" />
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={!value}>Log It</button>
        </div>
      </div>
    </div>
  );
};

const KPICard: React.FC<KPICardProps> = ({ kpi, onEdit }) => {
  const { deleteKPI } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  const progress = computeKPIProgress(kpi);
  const chartData = kpi.dataPoints.map((dp) => ({
    date: formatShortDate(dp.date),
    value: dp.value,
  }));

  const trendIcon = kpi.trend === 'up'
    ? <TrendingUp size={14} />
    : kpi.trend === 'down'
    ? <TrendingDown size={14} />
    : <Minus size={14} />;

  const color = statusColors[kpi.status];

  return (
    <>
      <div className="kpi-card">
        <div className="kpi-card-header">
          <div className="kpi-card-meta">
            <span className="kpi-category-tag">{kpi.category}</span>
            <span
              className="badge"
              style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
            >
              {kpi.status}
            </span>
          </div>
          <div className="kpi-card-actions">
            <button className="btn-icon" title="Log data point" onClick={() => setShowDataModal(true)}>
              <PlusCircle size={15} />
            </button>
            <div className="menu-wrap">
              <button className="btn-icon" onClick={() => setMenuOpen((p) => !p)}>
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => { onEdit(); setMenuOpen(false); }}><Edit2 size={13} /> Edit</button>
                  <button className="danger" onClick={() => deleteKPI(kpi.id)}><Trash2 size={13} /> Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="kpi-card-title">{kpi.name}</div>
        {kpi.description && <div className="kpi-card-desc">{kpi.description}</div>}

        <div className="kpi-values">
          <div className="kpi-current">
            <span className="kpi-big">{formatKPIValue(kpi.currentValue, kpi.unit)}</span>
            <span className={`trend-chip trend-${kpi.trend}`}>{trendIcon}</span>
          </div>
          <div className="kpi-target-label">
            Target: {formatKPIValue(kpi.targetValue, kpi.unit)}
          </div>
        </div>

        <div className="progress-track mt-2">
          <div className="progress-fill" style={{ width: `${progress}%`, background: color }} />
        </div>
        <div className="kpi-progress-label">
          <span className="font-mono text-xs text-dim">{progress}% to goal</span>
          <span className="font-mono text-xs text-dim">Target: {formatDate(kpi.targetDate)}</span>
        </div>

        {chartData.length > 1 && (
          <div className="kpi-sparkline">
            <ResponsiveContainer width="100%" height={56}>
              <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`g-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px' }}
                  labelStyle={{ color: 'var(--text-3)', fontSize: '10px' }}
                  formatter={(val: number) => [formatKPIValue(val, kpi.unit), '']}
                />
                <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#g-${kpi.id})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="kpi-footer">
          <span className="font-mono text-xs text-dim">
            {kpi.dataPoints.length} data point{kpi.dataPoints.length !== 1 ? 's' : ''}
          </span>
          {kpi.linkedDecisionIds.length > 0 && (
            <span className="font-mono text-xs text-dim">
              {kpi.linkedDecisionIds.length} linked decision{kpi.linkedDecisionIds.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {showDataModal && <DataPointModal kpi={kpi} onClose={() => setShowDataModal(false)} />}
    </>
  );
};

export default KPICard;
