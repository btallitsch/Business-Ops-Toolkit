import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import {
  getKPISummary,
  getDecisionSummary,
  getFollowUpSummary,
  computeKPIProgress,
  formatKPIValue,
  formatShortDate,
  getDueDateLabel,
  isOverdue,
  statusColors,
} from '../../utils/helpers';
import type { ActiveView } from '../../types';
import './Dashboard.css';

interface DashboardProps {
  onNavigate: (view: ActiveView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { kpis, decisions, followUps } = useApp();
  const kpiSummary = getKPISummary(kpis);
  const decisionSummary = getDecisionSummary(decisions);
  const followUpSummary = getFollowUpSummary(followUps);

  const urgentFollowUps = followUps
    .filter((f) => f.status !== 'completed' && f.status !== 'cancelled')
    .filter((f) => isOverdue(f.dueDate) || f.priority === 'urgent')
    .slice(0, 4);

  const recentDecisions = [...decisions]
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime())
    .slice(0, 3);

  const topKPIs = kpis.slice(0, 3);

  const trendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp size={14} />;
    if (trend === 'down') return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  return (
    <div className="dashboard">
      {/* Summary Tiles */}
      <div className="summary-grid">
        <div className="summary-tile" onClick={() => onNavigate('kpis')}>
          <div className="tile-header">
            <span className="tile-label">KPIs</span>
            <span className="tile-total">{kpiSummary.total}</span>
          </div>
          <div className="tile-bars">
            <div className="tile-bar">
              <div className="tile-bar-fill" style={{ width: `${(kpiSummary.onTrack / Math.max(kpiSummary.total, 1)) * 100}%`, background: 'var(--green)' }} />
            </div>
          </div>
          <div className="tile-breakdown">
            <span style={{ color: 'var(--green)' }}>{kpiSummary.onTrack} on track</span>
            <span style={{ color: 'var(--orange)' }}>{kpiSummary.atRisk} at risk</span>
            <span style={{ color: 'var(--red)' }}>{kpiSummary.offTrack} off track</span>
          </div>
        </div>

        <div className="summary-tile" onClick={() => onNavigate('decisions')}>
          <div className="tile-header">
            <span className="tile-label">Decisions</span>
            <span className="tile-total">{decisionSummary.total}</span>
          </div>
          <div className="tile-bars">
            <div className="tile-bar">
              <div className="tile-bar-fill" style={{ width: `${(decisionSummary.implemented / Math.max(decisionSummary.total, 1)) * 100}%`, background: 'var(--blue)' }} />
            </div>
          </div>
          <div className="tile-breakdown">
            <span style={{ color: 'var(--blue)' }}>{decisionSummary.implemented} implemented</span>
            <span style={{ color: 'var(--orange)' }}>{decisionSummary.inProgress} in progress</span>
            <span style={{ color: 'var(--text-3)' }}>{decisionSummary.proposed} proposed</span>
          </div>
        </div>

        <div className="summary-tile" onClick={() => onNavigate('followups')}>
          <div className="tile-header">
            <span className="tile-label">Follow-Ups</span>
            <span className="tile-total">{followUpSummary.total}</span>
          </div>
          <div className="tile-bars">
            <div className="tile-bar">
              <div className="tile-bar-fill" style={{ width: `${(followUpSummary.completed / Math.max(followUpSummary.total, 1)) * 100}%`, background: 'var(--green)' }} />
            </div>
          </div>
          <div className="tile-breakdown">
            <span style={{ color: 'var(--red)' }}>{followUpSummary.overdue} overdue</span>
            <span style={{ color: 'var(--orange)' }}>{followUpSummary.dueSoon} due soon</span>
            <span style={{ color: 'var(--green)' }}>{followUpSummary.completed} completed</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* KPI Sparklines */}
        <section className="dash-section kpi-section">
          <div className="section-header">
            <h2>Key Metrics</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('kpis')}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="kpi-list">
            {topKPIs.length === 0 && (
              <div className="empty-state"><p>No KPIs defined yet.</p></div>
            )}
            {topKPIs.map((kpi) => {
              const progress = computeKPIProgress(kpi);
              const chartData = kpi.dataPoints.map((dp) => ({
                date: formatShortDate(dp.date),
                value: dp.value,
              }));
              return (
                <div key={kpi.id} className="dash-kpi-card">
                  <div className="dash-kpi-top">
                    <div>
                      <div className="dash-kpi-name">{kpi.name}</div>
                      <div className="dash-kpi-value">{formatKPIValue(kpi.currentValue, kpi.unit)}</div>
                    </div>
                    <div className="dash-kpi-right">
                      <span className={`trend-chip trend-${kpi.trend}`}>
                        {trendIcon(kpi.trend)}
                      </span>
                      <span
                        className="badge"
                        style={{
                          background: `${statusColors[kpi.status]}18`,
                          color: statusColors[kpi.status],
                          border: `1px solid ${statusColors[kpi.status]}40`,
                        }}
                      >
                        {kpi.status}
                      </span>
                    </div>
                  </div>
                  <div className="progress-track mt-2">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%`, background: statusColors[kpi.status] }}
                    />
                  </div>
                  <div className="dash-kpi-meta">
                    <span>{progress}% to target</span>
                    <span>{formatKPIValue(kpi.targetValue, kpi.unit)}</span>
                  </div>
                  {chartData.length > 1 && (
                    <div className="sparkline">
                      <ResponsiveContainer width="100%" height={50}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id={`grad-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={statusColors[kpi.status]} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={statusColors[kpi.status]} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={statusColors[kpi.status]}
                            strokeWidth={1.5}
                            fill={`url(#grad-${kpi.id})`}
                            dot={false}
                          />
                          <Tooltip
                            contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px' }}
                            labelStyle={{ display: 'none' }}
                            formatter={(val: number) => [formatKPIValue(val, kpi.unit), '']}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="dash-right-col">
          {/* Urgent Follow-Ups */}
          <section className="dash-section">
            <div className="section-header">
              <h2>Needs Attention</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('followups')}>
                View all <ArrowRight size={13} />
              </button>
            </div>
            <div className="urgent-list">
              {urgentFollowUps.length === 0 && (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <CheckCircle2 size={24} />
                  <p>No urgent items. You're on top of things.</p>
                </div>
              )}
              {urgentFollowUps.map((fu) => (
                <div key={fu.id} className="urgent-item">
                  <div className="urgent-indicator">
                    {isOverdue(fu.dueDate) ? (
                      <AlertCircle size={15} color="var(--red)" />
                    ) : (
                      <Clock size={15} color="var(--orange)" />
                    )}
                  </div>
                  <div className="urgent-content">
                    <div className="urgent-title">{fu.title}</div>
                    <div className="urgent-meta">
                      <span>{fu.contactName}</span>
                      <span className="dot">·</span>
                      <span className={isOverdue(fu.dueDate) ? 'overdue-text' : 'soon-text'}>
                        {getDueDateLabel(fu.dueDate)}
                      </span>
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: `${statusColors[fu.priority]}18`,
                      color: statusColors[fu.priority],
                      border: `1px solid ${statusColors[fu.priority]}40`,
                    }}
                  >
                    {fu.priority}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Decisions */}
          <section className="dash-section">
            <div className="section-header">
              <h2>Recent Decisions</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('decisions')}>
                View all <ArrowRight size={13} />
              </button>
            </div>
            <div className="decision-list-dash">
              {recentDecisions.length === 0 && (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <p>No decisions logged yet.</p>
                </div>
              )}
              {recentDecisions.map((d) => (
                <div key={d.id} className="decision-dash-item">
                  <div className="decision-dash-header">
                    <span
                      className="badge"
                      style={{
                        background: `${statusColors[d.status]}18`,
                        color: statusColors[d.status],
                        border: `1px solid ${statusColors[d.status]}40`,
                      }}
                    >
                      {d.status}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: `${statusColors[d.impact]}18`,
                        color: statusColors[d.impact],
                        border: `1px solid ${statusColors[d.impact]}40`,
                      }}
                    >
                      {d.impact} impact
                    </span>
                  </div>
                  <div className="decision-dash-title">{d.title}</div>
                  <div className="decision-dash-owner">{d.owner}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
