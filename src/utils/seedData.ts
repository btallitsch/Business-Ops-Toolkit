import { v4 as uuid } from 'uuid';
import type { KPI, Decision, FollowUp } from '../types';

const now = new Date().toISOString();
const d = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString();
};

export const seedKPIs: KPI[] = [
  {
    id: uuid(),
    name: 'Monthly Recurring Revenue',
    description: 'Total predictable monthly revenue from all active subscriptions',
    category: 'revenue',
    unit: '$',
    targetValue: 50000,
    currentValue: 31200,
    startValue: 18000,
    startDate: d(-90),
    targetDate: d(90),
    dataPoints: [
      { date: d(-90), value: 18000 },
      { date: d(-75), value: 21500 },
      { date: d(-60), value: 24800 },
      { date: d(-45), value: 27100 },
      { date: d(-30), value: 29300 },
      { date: d(-15), value: 30100 },
      { date: d(0), value: 31200 },
    ],
    linkedDecisionIds: [],
    linkedFollowUpIds: [],
    status: 'on-track',
    trend: 'up',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuid(),
    name: 'Customer Churn Rate',
    description: 'Percentage of customers who cancel per month',
    category: 'retention',
    unit: '%',
    targetValue: 2,
    currentValue: 4.1,
    startValue: 6.5,
    startDate: d(-90),
    targetDate: d(60),
    dataPoints: [
      { date: d(-90), value: 6.5 },
      { date: d(-75), value: 6.0 },
      { date: d(-60), value: 5.4 },
      { date: d(-45), value: 5.1 },
      { date: d(-30), value: 4.7 },
      { date: d(-15), value: 4.3 },
      { date: d(0), value: 4.1 },
    ],
    linkedDecisionIds: [],
    linkedFollowUpIds: [],
    status: 'at-risk',
    trend: 'down',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuid(),
    name: 'Net Promoter Score',
    description: 'Customer satisfaction and likelihood to recommend',
    category: 'retention',
    unit: '',
    targetValue: 60,
    currentValue: 42,
    startValue: 28,
    startDate: d(-120),
    targetDate: d(60),
    dataPoints: [
      { date: d(-120), value: 28 },
      { date: d(-90), value: 33 },
      { date: d(-60), value: 38 },
      { date: d(-30), value: 40 },
      { date: d(0), value: 42 },
    ],
    linkedDecisionIds: [],
    linkedFollowUpIds: [],
    status: 'on-track',
    trend: 'up',
    createdAt: now,
    updatedAt: now,
  },
];

export const seedDecisions: Decision[] = [
  {
    id: uuid(),
    title: 'Shift primary acquisition channel to content marketing',
    context:
      'Paid acquisition CAC has risen 38% over the past two quarters while organic traffic remains underutilised. We need a more sustainable lead-gen engine.',
    options: [
      'Double down on paid ads with tighter targeting',
      'Invest in content marketing and SEO',
      'Partnership and referral program',
    ],
    rationale:
      'Content marketing has a compounding return and aligns with our positioning as a thought-leader. Lower CAC over 12+ month horizon. Referrals were ruled out due to small existing customer base.',
    risks: 'Takes 4–6 months to see meaningful traffic. Requires consistent execution. Team has limited SEO expertise.',
    owner: 'Marketing Lead',
    status: 'in-progress',
    impact: 'high',
    tags: ['marketing', 'acquisition', 'CAC'],
    linkedKPIIds: [],
    linkedFollowUpIds: [],
    decidedAt: d(-30),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuid(),
    title: 'Introduce quarterly business reviews for enterprise accounts',
    context:
      'Churn among accounts spending $2k+/mo has been disproportionately high. Post-mortems indicate lack of perceived value and proactive engagement as primary drivers.',
    options: [
      'Automated email health-score reports',
      'Quarterly Business Reviews (QBRs) with dedicated CSM',
      'In-app success milestones and gamification',
    ],
    rationale:
      'QBRs create a forcing function for ROI conversations and deepen relationships. Automated reports were insufficient for high-touch segment.',
    risks: 'Resource-intensive. Requires CSM capacity and structured playbook.',
    owner: 'Customer Success',
    status: 'implemented',
    impact: 'high',
    tags: ['retention', 'enterprise', 'customer-success'],
    linkedKPIIds: [],
    linkedFollowUpIds: [],
    outcome: {
      date: d(-10),
      description: 'First QBR cycle completed for 8 accounts. Early signal: 0 churns from QBR cohort vs 2 from non-QBR in same period.',
      measuredImpact: 'Churn down 0.4% in first measurement period',
    },
    decidedAt: d(-75),
    createdAt: now,
    updatedAt: now,
  },
];

export const seedFollowUps: FollowUp[] = [
  {
    id: uuid(),
    title: 'Send revised proposal to Meridian Co.',
    contactName: 'Sarah Chen',
    contactCompany: 'Meridian Co.',
    contactEmail: 'schen@meridian.co',
    type: 'lead',
    priority: 'high',
    status: 'pending',
    channel: 'email',
    description:
      'Sarah asked for a revised proposal reflecting the reduced seat count (12 → 8) and a 12-month payment option. Include case study from similar SaaS migration.',
    dueDate: d(2),
    activities: [
      {
        id: uuid(),
        date: d(-5),
        note: 'Discovery call completed. Good fit. Budget confirmed. Needs revised proposal.',
        channel: 'call',
      },
    ],
    linkedKPIIds: [],
    linkedDecisionIds: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuid(),
    title: 'Schedule onboarding kick-off with Apex Logistics',
    contactName: 'Marcus Williams',
    contactCompany: 'Apex Logistics',
    contactEmail: 'mwilliams@apexlogistics.com',
    type: 'client',
    priority: 'urgent',
    status: 'in-progress',
    channel: 'meeting',
    description:
      'Apex signed last week. Need to schedule kick-off session, assign CSM, and send pre-work. They have a hard go-live deadline of end of month.',
    dueDate: d(-1),
    activities: [
      {
        id: uuid(),
        date: d(-7),
        note: 'Contract signed. Sent welcome email. Awaiting calendar availability.',
        channel: 'email',
      },
      {
        id: uuid(),
        date: d(-3),
        note: 'No response to calendar invite. Sent follow-up. Left voicemail.',
        channel: 'call',
      },
    ],
    linkedKPIIds: [],
    linkedDecisionIds: [],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuid(),
    title: 'Check in with TechVenture Partners re: integration timeline',
    contactName: 'Priya Patel',
    contactCompany: 'TechVenture Partners',
    type: 'partner',
    priority: 'medium',
    status: 'waiting',
    channel: 'email',
    description:
      'Waiting on their engineering team to confirm API access timeline. Partnership announcement is contingent on this.',
    dueDate: d(7),
    activities: [
      {
        id: uuid(),
        date: d(-14),
        note: 'Partnership terms agreed. Technical handoff email sent to their CTO.',
        channel: 'email',
      },
    ],
    linkedKPIIds: [],
    linkedDecisionIds: [],
    createdAt: now,
    updatedAt: now,
  },
];
