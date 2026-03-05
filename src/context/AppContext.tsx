import React, { createContext, useContext, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { seedKPIs, seedDecisions, seedFollowUps } from '../utils/seedData';
import { computeKPIStatus } from '../utils/helpers';
import type {
  KPI,
  Decision,
  FollowUp,
  FollowUpActivity,
  KPIDataPoint,
  DecisionOutcome,
} from '../types';

// ─── Context Shape ─────────────────────────────────────────────────────────────

interface AppContextValue {
  // Data
  kpis: KPI[];
  decisions: Decision[];
  followUps: FollowUp[];

  // KPI Actions
  addKPI: (kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'trend'>) => KPI;
  updateKPI: (id: string, updates: Partial<KPI>) => void;
  deleteKPI: (id: string) => void;
  addKPIDataPoint: (kpiId: string, point: Omit<KPIDataPoint, never>) => void;

  // Decision Actions
  addDecision: (decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>) => Decision;
  updateDecision: (id: string, updates: Partial<Decision>) => void;
  deleteDecision: (id: string) => void;
  addDecisionOutcome: (decisionId: string, outcome: DecisionOutcome) => void;

  // Follow-Up Actions
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>) => FollowUp;
  updateFollowUp: (id: string, updates: Partial<FollowUp>) => void;
  deleteFollowUp: (id: string) => void;
  addFollowUpActivity: (followUpId: string, activity: Omit<FollowUpActivity, 'id'>) => void;

  // Linking Actions
  linkKPIToDecision: (kpiId: string, decisionId: string) => void;
  linkFollowUpToKPI: (followUpId: string, kpiId: string) => void;
  linkFollowUpToDecision: (followUpId: string, decisionId: string) => void;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

// ─── Provider ──────────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kpis, setKPIs] = useLocalStorage<KPI[]>('bot:kpis', seedKPIs);
  const [decisions, setDecisions] = useLocalStorage<Decision[]>('bot:decisions', seedDecisions);
  const [followUps, setFollowUps] = useLocalStorage<FollowUp[]>('bot:followups', seedFollowUps);

  const now = () => new Date().toISOString();

  // ── KPI ────────────────────────────────────────────────────────────────────

  const addKPI = useCallback(
    (kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'trend'>): KPI => {
      const newKPI: KPI = {
        ...kpi,
        id: uuid(),
        status: 'on-track',
        trend: 'stable',
        createdAt: now(),
        updatedAt: now(),
      };
      newKPI.status = computeKPIStatus(newKPI);
      setKPIs((prev) => [...prev, newKPI]);
      return newKPI;
    },
    [setKPIs]
  );

  const updateKPI = useCallback(
    (id: string, updates: Partial<KPI>) => {
      setKPIs((prev) =>
        prev.map((k) => {
          if (k.id !== id) return k;
          const updated = { ...k, ...updates, updatedAt: now() };
          updated.status = computeKPIStatus(updated);
          return updated;
        })
      );
    },
    [setKPIs]
  );

  const deleteKPI = useCallback(
    (id: string) => {
      setKPIs((prev) => prev.filter((k) => k.id !== id));
    },
    [setKPIs]
  );

  const addKPIDataPoint = useCallback(
    (kpiId: string, point: KPIDataPoint) => {
      setKPIs((prev) =>
        prev.map((k) => {
          if (k.id !== kpiId) return k;
          const dataPoints = [...k.dataPoints, point].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          const updated = { ...k, dataPoints, currentValue: point.value, updatedAt: now() };
          updated.status = computeKPIStatus(updated);
          updated.trend =
            dataPoints.length < 2
              ? 'stable'
              : point.value > dataPoints[dataPoints.length - 2].value
              ? 'up'
              : point.value < dataPoints[dataPoints.length - 2].value
              ? 'down'
              : 'stable';
          return updated;
        })
      );
    },
    [setKPIs]
  );

  // ── Decision ───────────────────────────────────────────────────────────────

  const addDecision = useCallback(
    (decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>): Decision => {
      const newDecision: Decision = {
        ...decision,
        id: uuid(),
        createdAt: now(),
        updatedAt: now(),
      };
      setDecisions((prev) => [...prev, newDecision]);
      return newDecision;
    },
    [setDecisions]
  );

  const updateDecision = useCallback(
    (id: string, updates: Partial<Decision>) => {
      setDecisions((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: now() } : d))
      );
    },
    [setDecisions]
  );

  const deleteDecision = useCallback(
    (id: string) => {
      setDecisions((prev) => prev.filter((d) => d.id !== id));
    },
    [setDecisions]
  );

  const addDecisionOutcome = useCallback(
    (decisionId: string, outcome: DecisionOutcome) => {
      setDecisions((prev) =>
        prev.map((d) =>
          d.id === decisionId ? { ...d, outcome, status: 'implemented', updatedAt: now() } : d
        )
      );
    },
    [setDecisions]
  );

  // ── Follow-Up ──────────────────────────────────────────────────────────────

  const addFollowUp = useCallback(
    (followUp: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>): FollowUp => {
      const newFollowUp: FollowUp = {
        ...followUp,
        id: uuid(),
        createdAt: now(),
        updatedAt: now(),
      };
      setFollowUps((prev) => [...prev, newFollowUp]);
      return newFollowUp;
    },
    [setFollowUps]
  );

  const updateFollowUp = useCallback(
    (id: string, updates: Partial<FollowUp>) => {
      setFollowUps((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: now() } : f))
      );
    },
    [setFollowUps]
  );

  const deleteFollowUp = useCallback(
    (id: string) => {
      setFollowUps((prev) => prev.filter((f) => f.id !== id));
    },
    [setFollowUps]
  );

  const addFollowUpActivity = useCallback(
    (followUpId: string, activity: Omit<FollowUpActivity, 'id'>) => {
      const newActivity: FollowUpActivity = { ...activity, id: uuid() };
      setFollowUps((prev) =>
        prev.map((f) =>
          f.id === followUpId
            ? { ...f, activities: [...f.activities, newActivity], updatedAt: now() }
            : f
        )
      );
    },
    [setFollowUps]
  );

  // ── Linking ────────────────────────────────────────────────────────────────

  const linkKPIToDecision = useCallback(
    (kpiId: string, decisionId: string) => {
      setKPIs((prev) =>
        prev.map((k) =>
          k.id === kpiId && !k.linkedDecisionIds.includes(decisionId)
            ? { ...k, linkedDecisionIds: [...k.linkedDecisionIds, decisionId] }
            : k
        )
      );
      setDecisions((prev) =>
        prev.map((d) =>
          d.id === decisionId && !d.linkedKPIIds.includes(kpiId)
            ? { ...d, linkedKPIIds: [...d.linkedKPIIds, kpiId] }
            : d
        )
      );
    },
    [setKPIs, setDecisions]
  );

  const linkFollowUpToKPI = useCallback(
    (followUpId: string, kpiId: string) => {
      setFollowUps((prev) =>
        prev.map((f) =>
          f.id === followUpId && !f.linkedKPIIds.includes(kpiId)
            ? { ...f, linkedKPIIds: [...f.linkedKPIIds, kpiId] }
            : f
        )
      );
      setKPIs((prev) =>
        prev.map((k) =>
          k.id === kpiId && !k.linkedFollowUpIds.includes(followUpId)
            ? { ...k, linkedFollowUpIds: [...k.linkedFollowUpIds, followUpId] }
            : k
        )
      );
    },
    [setFollowUps, setKPIs]
  );

  const linkFollowUpToDecision = useCallback(
    (followUpId: string, decisionId: string) => {
      setFollowUps((prev) =>
        prev.map((f) =>
          f.id === followUpId && !f.linkedDecisionIds.includes(decisionId)
            ? { ...f, linkedDecisionIds: [...f.linkedDecisionIds, decisionId] }
            : f
        )
      );
      setDecisions((prev) =>
        prev.map((d) =>
          d.id === decisionId && !d.linkedFollowUpIds.includes(followUpId)
            ? { ...d, linkedFollowUpIds: [...d.linkedFollowUpIds, followUpId] }
            : d
        )
      );
    },
    [setFollowUps, setDecisions]
  );

  return (
    <AppContext.Provider
      value={{
        kpis,
        decisions,
        followUps,
        addKPI,
        updateKPI,
        deleteKPI,
        addKPIDataPoint,
        addDecision,
        updateDecision,
        deleteDecision,
        addDecisionOutcome,
        addFollowUp,
        updateFollowUp,
        deleteFollowUp,
        addFollowUpActivity,
        linkKPIToDecision,
        linkFollowUpToKPI,
        linkFollowUpToDecision,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
