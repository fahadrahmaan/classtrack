import type { ObservationWindow, IcapLevel } from './types';
import { ICAP_MAP, ICAP_COLORS } from './constants';

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calcTotalDuration(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000);
}

export interface IcapResult {
  level: IcapLevel;
  count: number;
  percentage: number;
  color: string;
}

export function calculateIcap(windows: ObservationWindow[]): Record<IcapLevel, IcapResult> {
  const counts: Record<IcapLevel, number> = {
    Interactive: 0,
    Constructive: 0,
    Active: 0,
    Passive: 0,
  };

  let totalChips = 0;

  for (const w of windows) {
    for (const chip of w.chipsSelected) {
      const level = ICAP_MAP[chip];
      if (level) {
        counts[level]++;
        totalChips++;
      }
    }
  }

  const levels: IcapLevel[] = ['Interactive', 'Constructive', 'Active', 'Passive'];

  const result = {} as Record<IcapLevel, IcapResult>;
  for (const level of levels) {
    const count = counts[level];
    const percentage = totalChips > 0 ? (count / totalChips) * 100 : 0;
    result[level] = {
      level,
      count,
      percentage,
      color: ICAP_COLORS[level],
    };
  }

  return result;
}

export function getDominantLevel(w: ObservationWindow): IcapLevel | null {
  const counts: Record<IcapLevel, number> = {
    Interactive: 0,
    Constructive: 0,
    Active: 0,
    Passive: 0,
  };

  for (const chip of w.chipsSelected) {
    const level = ICAP_MAP[chip];
    if (level) counts[level]++;
  }

  let max = 0;
  let dominant: IcapLevel | null = null;
  for (const level of ['Interactive', 'Constructive', 'Active', 'Passive'] as IcapLevel[]) {
    if (counts[level] > max) {
      max = counts[level];
      dominant = level;
    }
  }

  return dominant;
}

export function groupWindowsByICAP(
  windowLog: ObservationWindow[], 
  getICAPForWindow: (win: ObservationWindow) => IcapLevel | null
) {
  const groups: { icap: IcapLevel | null, windows: ObservationWindow[] }[] = [];
  windowLog.forEach((win) => {
    const icap = getICAPForWindow(win);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.icap === icap) {
      lastGroup.windows.push(win);
    } else {
      groups.push({ icap, windows: [win] });
    }
  });
  return groups;
}

