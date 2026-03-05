import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2, PlusCircle, Mail, Phone, Video, MessageSquare, X, Check } from 'lucide-react';
import type { FollowUp, FollowUpChannel } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatDateTime, getDueDateLabel, isOverdue, statusColors } from '../../utils/helpers';

interface FollowUpCardProps {
  followUp: FollowUp;
  onEdit: () => void;
}

const channelIcon = (channel: FollowUpChannel, size = 13) => {
  switch (channel) {
    case 'email': return <Mail size={size} />;
    case 'call': return <Phone size={size} />;
    case 'meeting': return <Video size={size} />;
    case 'message': return <MessageSquare size={size} />;
    default: return null;
  }
};

const ActivityModal: React.FC<{ followUp: FollowUp; onClose: () => void }> = ({ followUp, onClose }) => {
  const { addFollowUpActivity } = useApp();
  const [note, setNote] = useState('');
  const [channel, setChannel] = useState<FollowUpChannel>('email');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleAdd = () => {
    if (!note) return;
    addFollowUpActivity(followUp.id, {
      date: new Date(date).toISOString(),
      note,
      channel,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2>Log Activity</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <p className="text-muted text-sm mb-4">{followUp.contactName} · {followUp.contactCompany}</p>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Channel</label>
            <select value={channel} onChange={(e) => setChannel(e.target.value as FollowUpChannel)}>
              <option value="email">Email</option>
              <option value="call">Call</option>
              <option value="meeting">Meeting</option>
              <option value="message">Message</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Note *</label>
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What happened? What was discussed? What's the next step?" autoFocus />
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={!note}>Log Activity</button>
        </div>
      </div>
    </div>
  );
};

const FollowUpCard: React.FC<FollowUpCardProps> = ({ followUp, onEdit }) => {
  const { deleteFollowUp, updateFollowUp } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const overdue = isOverdue(followUp.dueDate) && followUp.status !== 'completed' && followUp.status !== 'cancelled';
  const statusColor = statusColors[followUp.status];
  const priorityColor = statusColors[followUp.priority];

  const markComplete = () => {
    updateFollowUp(followUp.id, { status: 'completed' });
  };

  return (
    <>
      <div className={`followup-card ${overdue ? 'overdue' : ''} ${followUp.status === 'completed' ? 'completed' : ''}`}>
        <div className="followup-card-header">
          <div className="followup-badges">
            <span className="badge" style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40` }}>
              {followUp.status}
            </span>
            <span className="badge" style={{ background: `${priorityColor}18`, color: priorityColor, border: `1px solid ${priorityColor}40` }}>
              {followUp.priority}
            </span>
            <span className="type-tag">{followUp.type}</span>
          </div>
          <div className="followup-actions">
            {followUp.status !== 'completed' && followUp.status !== 'cancelled' && (
              <button className="btn-icon" title="Mark complete" onClick={markComplete} style={{ color: 'var(--green)' }}>
                <Check size={15} />
              </button>
            )}
            <button className="btn-icon" title="Log activity" onClick={() => setShowActivityModal(true)}>
              <PlusCircle size={15} />
            </button>
            <button className="btn-icon" onClick={onEdit}><Edit2 size={15} /></button>
            <button className="btn-icon" style={{ color: 'var(--red)' }} onClick={() => deleteFollowUp(followUp.id)}><Trash2 size={15} /></button>
          </div>
        </div>

        <div className="followup-title">{followUp.title}</div>

        <div className="followup-contact">
          <span className="contact-name">{followUp.contactName}</span>
          {followUp.contactCompany && <><span className="text-dim">·</span><span className="contact-company">{followUp.contactCompany}</span></>}
          {followUp.contactEmail && (
            <a href={`mailto:${followUp.contactEmail}`} className="contact-email" onClick={(e) => e.stopPropagation()}>
              <Mail size={11} /> {followUp.contactEmail}
            </a>
          )}
        </div>

        <div className="followup-due">
          {channelIcon(followUp.channel)}
          <span className={overdue ? 'overdue-text' : ''}>{getDueDateLabel(followUp.dueDate)}</span>
        </div>

        {followUp.description && (
          <p className="followup-description">{followUp.description}</p>
        )}

        {followUp.activities.length > 0 && (
          <>
            <button className="expand-btn" onClick={() => setExpanded((p) => !p)}>
              {expanded ? <><ChevronUp size={14} /> Hide activity log</> : <><ChevronDown size={14} /> {followUp.activities.length} activit{followUp.activities.length !== 1 ? 'ies' : 'y'}</>}
            </button>

            {expanded && (
              <div className="activity-log">
                {[...followUp.activities]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((act) => (
                    <div key={act.id} className="activity-item">
                      <div className="activity-channel">{channelIcon(act.channel, 12)}</div>
                      <div className="activity-body">
                        <div className="activity-note">{act.note}</div>
                        <div className="activity-date">{formatDateTime(act.date)}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {showActivityModal && <ActivityModal followUp={followUp} onClose={() => setShowActivityModal(false)} />}
    </>
  );
};

export default FollowUpCard;
