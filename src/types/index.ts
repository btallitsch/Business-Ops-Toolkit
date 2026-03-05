// ─── KPI Types ────────────────────────────────────────────────────────────────

export type KPICategory = 'revenue' | 'growth' | 'retention' | 'operational' | 'custom';
export type KPITrend = 'up' | 'down' | 'stable';
export type KPIStatus = 'on-track' | 'at-risk' | 'off-track' | 'exceeded';

export interface KPIDataPoint {
  date: string; // ISO string
  value: number;
  note?: string;
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  category: KPICategory;
  unit: string; // e.g. '$', '%', 'users', 'days'
  targetValue: number;
  currentValue: number;
  startValue: number;
  startDate: string;
  targetDate: string;
  dataPoints: KPIDataPoint[];
  linkedDecisionIds: string[];
  linkedFollowUpIds: string[];
  status: KPIStatus;
  trend: KPITrend;
  createdAt: string;
  updatedAt: string;
}

// ─── Decision Types ────────────────────────────────────────────────────────────

export type DecisionStatus = 'proposed' | 'approved' | 'in-progress' | 'implemented' | 'reversed';
export type DecisionImpact = 'low' | 'medium' | 'high' | 'critical';

export interface DecisionOutcome {
  date: string;
  description: string;
  measuredImpact?: string;
}

export interface Decision {
  id: string;
  title: string;
  context: string;          // Why was this decision needed?
  options: string[];        // Alternatives considered
  rationale: string;        // Why this option was chosen
  risks: string;
  owner: string;
  status: DecisionStatus;
  impact: DecisionImpact;
  tags: string[];
  linkedKPIIds: string[];
  linkedFollowUpIds: string[];
  outcome?: DecisionOutcome;
  decidedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Follow-Up Types ───────────────────────────────────────────────────────────

export type FollowUpType = 'client' | 'lead' | 'partner' | 'internal' | 'vendor';
export type FollowUpPriority = 'low' | 'medium' | 'high' | 'urgent';
export type FollowUpStatus = 'pending' | 'in-progress' | 'waiting' | 'completed' | 'cancelled';
export type FollowUpChannel = 'email' | 'call' | 'meeting' | 'message' | 'other';

export interface FollowUpActivity {
  id: string;
  date: string;
  note: string;
  channel: FollowUpChannel;
}

export interface FollowUp {
  id: string;
  title: string;
  contactName: string;
  contactCompany?: string;
  contactEmail?: string;
  type: FollowUpType;
  priority: FollowUpPriority;
  status: FollowUpStatus;
  channel: FollowUpChannel;
  description: string;
  dueDate: string;
  activities: FollowUpActivity[];
  linkedKPIIds: string[];
  linkedDecisionIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── App State ─────────────────────────────────────────────────────────────────

export type ActiveView = 'dashboard' | 'kpis' | 'decisions' | 'followups';

export interface AppState {
  kpis: KPI[];
  decisions: Decision[];
  followUps: FollowUp[];
}

// ─── Utility ───────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc';

export interface SelectOption {
  value: string;
  label: string;
}
