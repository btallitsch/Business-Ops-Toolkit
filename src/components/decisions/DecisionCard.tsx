import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2, CheckSquare, X } from 'lucide-react';
import type { Decision, DecisionOutcome } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatDate, statusColors } from '../../utils/helpers';

interface DecisionCardProps {
  decision: Decision;
  onEdit: () => void;
}

const OutcomeModal: React.FC<{ decision: Decision; onClose: () => void }> = ({ decision, onClose }) => {
  const { addDecisionOutcome } = useApp();
  const [outcome, setOutcome] = useState<DecisionOutcome>({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    measuredImpact: '',
  });

  const handleSave = () => {
    if (!outcome.description) return;
    addDecisionOutcome(decision.id, {
      ...outcome,
      date: new Date(outcome.date).toISOString(),
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2>Record Outcome</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <p className="text-muted text-sm mb-4">{decision.title}</p>
        <div className="form-group">
          <label>Outcome Date</label>
          <input type="date" value={outcome.date} onChange={(e) => setOutcome((p) => ({ ...p, date: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>What happened? *</label>
          <textarea rows={3} value={outcome.description} onChange={(e) => setOutcome((p) => ({ ...p, description: e.target.value }))} placeholder="Describe what actually happened as a result of this decision." />
        </div>
        <div className="form-group">
          <label>Measured Impact (optional)</label>
          <input value={outcome.measuredImpact ?? ''} onChange={(e) => setOutcome((p) => ({ ...p, measuredImpact: e.target.value }))} placeholder="e.g. Churn dropped 0.4%, MRR +$3k" />
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!outcome.description}>Save Outcome</button>
        </div>
      </div>
    </div>
  );
};

const DecisionCard: React.FC<DecisionCardProps> = ({ decision, onEdit }) => {
  const { deleteDecision } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);

  const statusColor = statusColors[decision.status];
  const impactColor = statusColors[decision.impact];

  return (
    <>
      <div className="decision-card">
        <div className="decision-card-header">
          <div className="decision-card-badges">
            <span className="badge" style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40` }}>
              {decision.status}
            </span>
            <span className="badge" style={{ background: `${impactColor}18`, color: impactColor, border: `1px solid ${impactColor}40` }}>
              {decision.impact} impact
            </span>
          </div>
          <div className="decision-card-actions">
            {decision.status !== 'implemented' && decision.status !== 'reversed' && (
              <button className="btn-icon" title="Record outcome" onClick={() => setShowOutcomeModal(true)}>
                <CheckSquare size={15} />
              </button>
            )}
            <button className="btn-icon" onClick={onEdit}><Edit2 size={15} /></button>
            <button className="btn-icon" style={{ color: 'var(--red)' }} onClick={() => deleteDecision(decision.id)}><Trash2 size={15} /></button>
          </div>
        </div>

        <h3 className="decision-title">{decision.title}</h3>

        <div className="decision-meta">
          <span className="decision-owner">{decision.owner}</span>
          <span className="text-dim">·</span>
          <span className="text-dim">{formatDate(decision.decidedAt)}</span>
        </div>

        <p className="decision-context">{decision.context}</p>

        {decision.tags.length > 0 && (
          <div className="decision-tags">
            {decision.tags.map((t) => (
              <span key={t} className="tag-pill">{t}</span>
            ))}
          </div>
        )}

        {decision.outcome && (
          <div className="decision-outcome">
            <div className="outcome-label">Outcome recorded</div>
            <p>{decision.outcome.description}</p>
            {decision.outcome.measuredImpact && (
              <div className="outcome-impact">{decision.outcome.measuredImpact}</div>
            )}
          </div>
        )}

        <button className="expand-btn" onClick={() => setExpanded((p) => !p)}>
          {expanded ? <><ChevronUp size={14} /> Less detail</> : <><ChevronDown size={14} /> Full detail</>}
        </button>

        {expanded && (
          <div className="decision-expanded">
            <div className="divider" />
            {decision.options.length > 0 && (
              <div className="detail-block">
                <div className="detail-label">Options considered</div>
                <ul className="options-list">
                  {decision.options.map((opt, i) => <li key={i}>{opt}</li>)}
                </ul>
              </div>
            )}
            <div className="detail-block">
              <div className="detail-label">Rationale</div>
              <p>{decision.rationale}</p>
            </div>
            {decision.risks && (
              <div className="detail-block">
                <div className="detail-label">Risks & trade-offs</div>
                <p>{decision.risks}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showOutcomeModal && <OutcomeModal decision={decision} onClose={() => setShowOutcomeModal(false)} />}
    </>
  );
};

export default DecisionCard;
