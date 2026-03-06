import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
  type Unsubscribe,
  type Firestore,
} from 'firebase/firestore';
import type { KPI, Decision, FollowUp } from '../types';

// ─── Path Helpers ──────────────────────────────────────────────────────────────

export const userPath = (uid: string) => `users/${uid}`;
export const kpisPath = (uid: string) => `${userPath(uid)}/kpis`;
export const decisionsPath = (uid: string) => `${userPath(uid)}/decisions`;
export const followUpsPath = (uid: string) => `${userPath(uid)}/followups`;

// ─── Seed / Bootstrap ─────────────────────────────────────────────────────────

/**
 * Write initial seed data for a brand-new user (only called if collection is empty).
 */
export async function bootstrapUserData(
  db: Firestore,
  uid: string,
  kpis: KPI[],
  decisions: Decision[],
  followUps: FollowUp[]
): Promise<void> {
  const batch = writeBatch(db);

  kpis.forEach((k) => batch.set(doc(db, kpisPath(uid), k.id), k));
  decisions.forEach((d) => batch.set(doc(db, decisionsPath(uid), d.id), d));
  followUps.forEach((f) => batch.set(doc(db, followUpsPath(uid), f.id), f));

  await batch.commit();
}

/**
 * Check whether a user already has data in Firestore.
 */
export async function userHasData(db: Firestore, uid: string): Promise<boolean> {
  const snap = await getDocs(collection(db, kpisPath(uid)));
  return !snap.empty;
}

// ─── Real-time Listeners ───────────────────────────────────────────────────────

export function subscribeKPIs(
  db: Firestore,
  uid: string,
  onData: (kpis: KPI[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    query(collection(db, kpisPath(uid)), orderBy('createdAt')),
    (snap) => onData(snap.docs.map((d) => d.data() as KPI)),
    onError
  );
}

export function subscribeDecisions(
  db: Firestore,
  uid: string,
  onData: (decisions: Decision[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    query(collection(db, decisionsPath(uid)), orderBy('createdAt')),
    (snap) => onData(snap.docs.map((d) => d.data() as Decision)),
    onError
  );
}

export function subscribeFollowUps(
  db: Firestore,
  uid: string,
  onData: (followUps: FollowUp[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    query(collection(db, followUpsPath(uid)), orderBy('createdAt')),
    (snap) => onData(snap.docs.map((d) => d.data() as FollowUp)),
    onError
  );
}

// ─── Writes ────────────────────────────────────────────────────────────────────

export const saveKPI = (db: Firestore, uid: string, kpi: KPI) =>
  setDoc(doc(db, kpisPath(uid), kpi.id), kpi);

export const removeKPI = (db: Firestore, uid: string, id: string) =>
  deleteDoc(doc(db, kpisPath(uid), id));

export const saveDecision = (db: Firestore, uid: string, decision: Decision) =>
  setDoc(doc(db, decisionsPath(uid), decision.id), decision);

export const removeDecision = (db: Firestore, uid: string, id: string) =>
  deleteDoc(doc(db, decisionsPath(uid), id));

export const saveFollowUp = (db: Firestore, uid: string, followUp: FollowUp) =>
  setDoc(doc(db, followUpsPath(uid), followUp.id), followUp);

export const removeFollowUp = (db: Firestore, uid: string, id: string) =>
  deleteDoc(doc(db, followUpsPath(uid), id));
