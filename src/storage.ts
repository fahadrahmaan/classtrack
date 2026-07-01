import type { SessionData } from './types';
import { STORAGE_KEY } from './constants';

export function loadSessions(): SessionData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveSession(session: SessionData): void {
  try {
    const existing = loadSessions();
    existing.push(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // storage full or unavailable
  }
}

export function deleteSession(id: string): SessionData[] {
  const existing = loadSessions();
  const filtered = existing.filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
  return filtered;
}
