import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { db } from '../firebase/config';
import {
  subscribeKPIs,
  subscribeDecisions,
  subscribeFollowUps,
  saveKPI,
  removeKPI,
  saveDecision,
  removeDecision,
  saveFollowUp,
  removeFollowUp,
  bootstrapUserData,
  userHasData,
} from '../firebase/db';
import { useAuth } from './AuthContext';
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

export type SyncStatus = 'loading' | 'synced' | 'syncing' | 'offline' | 'error';

interface AppContextValue {
  kpis: KPI[];
  decisions: Decision[];
  followUps: FollowUp[];
  syncStatus: SyncStatus;
  syncError: string | null;
  addKPI: (kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'trend'>) => KPI;
  updateKPI: (id: string, updates: Partial<KPI>) => void;
  deleteKPI: (id: string) => void;
  addKPIDataPoint: (kpiId: string, point: KPIDataPoint) => void;
  addDecision: (decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>) => Decision;
  updateDecision: (id: string, updates: Partial<Decision>) => void;
  deleteDecision: (id: string) => void;
  addDecisionOutcome: (decisionId: string, outcome: DecisionOutcome) => void;
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>) => FollowUp;
  updateFollowUp: (id: string, updates: Partial<FollowUp>) => void;
  deleteFollowUp: (id: string) => void;
  addFollowUpActivity: (followUpId: string, activity: Omit<FollowUpActivity, 'id'>) => void;
  linkKPIToDecision: (kpiId: string, decisionId: string) => void;
  linkFollowUpToKPI: (followUpId: string, kpiId: string) => void;
  linkFollowUpToDecision: (followUpId: string, decisionId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [kpis, setKPIs] = useState<KPI[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const [syncError, setSyncError] = useState<string | null>(null);
  const pendingWrites = useRef(0);

  const markSyncing = () => { pendingWrites.current += 1; setSyncStatus('syncing'); };
  const markSynced  = () => { pendingWrites.current = Math.max(0, pendingWrites.current - 1); if (pendingWrites.current === 0) setSyncStatus('synced'); };
  const markError   = (msg: string) => { pendingWrites.current = 0; setSyncStatus('error'); setSyncError(msg); };

  const fireWrite = async (fn: () => Promise<void>) => {
    markSyncing();
    try {
      await fn();
      markSynced();
    } catch (err) {
      const msg = (err as Error)?.message ?? 'Write failed';
      if (msg.toLowerCase().includes('offline') || msg.toLowerCase().includes('network')) {
        setSyncStatus('offline'); markSynced();
      } else {
        markError(msg);
      }
    }
  };

  const now = () => new Date().toISOString();

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    setSyncStatus('loading');
    let initialised = false;

    const bootstrap = async () => {
      const hasData = await userHasData(db, uid);
      if (!hasData) await bootstrapUserData(db, uid, seedKPIs, seedDecisions, seedFollowUps);
      initialised = true;
    };
    bootstrap().catch((err) => markError(err.message));

    const onError = (err: Error) => {
      if (err.message.toLowerCase().includes('offline') || err.message.toLowerCase().includes('network')) {
        setSyncStatus('offline');
      } else { markError(err.message); }
    };

    const unsubKPIs      = subscribeKPIs(db, uid, (data) => { setKPIs(data); if (initialised) setSyncStatus((s) => s === 'syncing' ? s : 'synced'); }, onError);
    const unsubDecisions = subscribeDecisions(db, uid, (data) => { setDecisions(data); if (initialised) setSyncStatus((s) => s === 'syncing' ? s : 'synced'); }, onError);
    const unsubFollowUps = subscribeFollowUps(db, uid, (data) => { setFollowUps(data); if (initialised) setSyncStatus((s) => s === 'syncing' ? s : 'synced'); }, onError);

    return () => { unsubKPIs(); unsubDecisions(); unsubFollowUps(); };
  }, [user]);

  const addKPI = useCallback((kpi: Omit<KPI, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'trend'>): KPI => {
    const newKPI: KPI = { ...kpi, id: uuid(), status: 'on-track', trend: 'stable', createdAt: now(), updatedAt: now() };
    newKPI.status = computeKPIStatus(newKPI);
    setKPIs((p) => [...p, newKPI]);
    if (user) fireWrite(() => saveKPI(db, user.uid, newKPI));
    return newKPI;
  }, [user]);

  const updateKPI = useCallback((id: string, updates: Partial<KPI>) => {
    let updated: KPI | undefined;
    setKPIs((p) => p.map((k) => { if (k.id !== id) return k; updated = { ...k, ...updates, updatedAt: now() }; updated.status = computeKPIStatus(updated); return updated; }));
    if (user && updated) fireWrite(() => saveKPI(db, user.uid, updated!));
  }, [user]);

  const deleteKPI = useCallback((id: string) => {
    setKPIs((p) => p.filter((k) => k.id !== id));
    if (user) fireWrite(() => removeKPI(db, user.uid, id));
  }, [user]);

  const addKPIDataPoint = useCallback((kpiId: string, point: KPIDataPoint) => {
    let updated: KPI | undefined;
    setKPIs((p) => p.map((k) => {
      if (k.id !== kpiId) return k;
      const dataPoints = [...k.dataPoints, point].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      updated = { ...k, dataPoints, currentValue: point.value, updatedAt: now(), trend: dataPoints.length < 2 ? 'stable' : point.value > dataPoints[dataPoints.length - 2].value ? 'up' : point.value < dataPoints[dataPoints.length - 2].value ? 'down' : 'stable' };
      updated.status = computeKPIStatus(updated);
      return updated;
    }));
    if (user && updated) fireWrite(() => saveKPI(db, user.uid, updated!));
  }, [user]);

  const addDecision = useCallback((decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>): Decision => {
    const newDecision: Decision = { ...decision, id: uuid(), createdAt: now(), updatedAt: now() };
    setDecisions((p) => [...p, newDecision]);
    if (user) fireWrite(() => saveDecision(db, user.uid, newDecision));
    return newDecision;
  }, [user]);

  const updateDecision = useCallback((id: string, updates: Partial<Decision>) => {
    let updated: Decision | undefined;
    setDecisions((p) => p.map((d) => { if (d.id !== id) return d; updated = { ...d, ...updates, updatedAt: now() }; return updated; }));
    if (user && updated) fireWrite(() => saveDecision(db, user.uid, updated!));
  }, [user]);

  const deleteDecision = useCallback((id: string) => {
    setDecisions((p) => p.filter((d) => d.id !== id));
    if (user) fireWrite(() => removeDecision(db, user.uid, id));
  }, [user]);

  const addDecisionOutcome = useCallback((decisionId: string, outcome: DecisionOutcome) => {
    let updated: Decision | undefined;
    setDecisions((p) => p.map((d) => { if (d.id !== decisionId) return d; updated = { ...d, outcome, status: 'implemented', updatedAt: now() }; return updated; }));
    if (user && updated) fireWrite(() => saveDecision(db, user.uid, updated!));
  }, [user]);

  const addFollowUp = useCallback((followUp: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>): FollowUp => {
    const newFollowUp: FollowUp = { ...followUp, id: uuid(), createdAt: now(), updatedAt: now() };
    setFollowUps((p) => [...p, newFollowUp]);
    if (user) fireWrite(() => saveFollowUp(db, user.uid, newFollowUp));
    return newFollowUp;
  }, [user]);

  const updateFollowUp = useCallback((id: string, updates: Partial<FollowUp>) => {
    let updated: FollowUp | undefined;
    setFollowUps((p) => p.map((f) => { if (f.id !== id) return f; updated = { ...f, ...updates, updatedAt: now() }; return updated; }));
    if (user && updated) fireWrite(() => saveFollowUp(db, user.uid, updated!));
  }, [user]);

  const deleteFollowUp = useCallback((id: string) => {
    setFollowUps((p) => p.filter((f) => f.id !== id));
    if (user) fireWrite(() => removeFollowUp(db, user.uid, id));
  }, [user]);

  const addFollowUpActivity = useCallback((followUpId: string, activity: Omit<FollowUpActivity, 'id'>) => {
    const newActivity: FollowUpActivity = { ...activity, id: uuid() };
    let updated: FollowUp | undefined;
    setFollowUps((p) => p.map((f) => { if (f.id !== followUpId) return f; updated = { ...f, activities: [...f.activities, newActivity], updatedAt: now() }; return updated; }));
    if (user && updated) fireWrite(() => saveFollowUp(db, user.uid, updated!));
  }, [user]);

  const linkKPIToDecision = useCallback((kpiId: string, decisionId: string) => {
    let uk: KPI | undefined; let ud: Decision | undefined;
    setKPIs((p) => p.map((k) => { if (k.id !== kpiId || k.linkedDecisionIds.includes(decisionId)) return k; uk = { ...k, linkedDecisionIds: [...k.linkedDecisionIds, decisionId] }; return uk; }));
    setDecisions((p) => p.map((d) => { if (d.id !== decisionId || d.linkedKPIIds.includes(kpiId)) return d; ud = { ...d, linkedKPIIds: [...d.linkedKPIIds, kpiId] }; return ud; }));
    if (user) { if (uk) fireWrite(() => saveKPI(db, user.uid, uk!)); if (ud) fireWrite(() => saveDecision(db, user.uid, ud!)); }
  }, [user]);

  const linkFollowUpToKPI = useCallback((followUpId: string, kpiId: string) => {
    let uf: FollowUp | undefined; let uk: KPI | undefined;
    setFollowUps((p) => p.map((f) => { if (f.id !== followUpId || f.linkedKPIIds.includes(kpiId)) return f; uf = { ...f, linkedKPIIds: [...f.linkedKPIIds, kpiId] }; return uf; }));
    setKPIs((p) => p.map((k) => { if (k.id !== kpiId || k.linkedFollowUpIds.includes(followUpId)) return k; uk = { ...k, linkedFollowUpIds: [...k.linkedFollowUpIds, followUpId] }; return uk; }));
    if (user) { if (uf) fireWrite(() => saveFollowUp(db, user.uid, uf!)); if (uk) fireWrite(() => saveKPI(db, user.uid, uk!)); }
  }, [user]);

  const linkFollowUpToDecision = useCallback((followUpId: string, decisionId: string) => {
    let uf: FollowUp | undefined; let ud: Decision | undefined;
    setFollowUps((p) => p.map((f) => { if (f.id !== followUpId || f.linkedDecisionIds.includes(decisionId)) return f; uf = { ...f, linkedDecisionIds: [...f.linkedDecisionIds, decisionId] }; return uf; }));
    setDecisions((p) => p.map((d) => { if (d.id !== decisionId || d.linkedFollowUpIds.includes(followUpId)) return d; ud = { ...d, linkedFollowUpIds: [...d.linkedFollowUpIds, followUpId] }; return ud; }));
    if (user) { if (uf) fireWrite(() => saveFollowUp(db, user.uid, uf!)); if (ud) fireWrite(() => saveDecision(db, user.uid, ud!)); }
  }, [user]);

  return (
    <AppContext.Provider value={{ kpis, decisions, followUps, syncStatus, syncError, addKPI, updateKPI, deleteKPI, addKPIDataPoint, addDecision, updateDecision, deleteDecision, addDecisionOutcome, addFollowUp, updateFollowUp, deleteFollowUp, addFollowUpActivity, linkKPIToDecision, linkFollowUpToKPI, linkFollowUpToDecision }}>
      {children}
    </AppContext.Provider>
  );
};
