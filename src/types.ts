export type InstructionMode = 'Trainer-led' | 'App-led' | 'Mixed';

export type WindowType = 'trainer' | 'learner';

export interface ObservationWindow {
  windowNumber: number;
  type: WindowType;
  timestamp: string;
  chipsSelected: string[];
}

export interface SessionData {
  id: string;
  site: string;
  trainer: string;
  topic: string;
  trade: string;
  learnerCount: number;
  mode: InstructionMode;
  startTime: string;
  endTime: string;
  durationSeconds?: number;
  windows: ObservationWindow[];
}

export interface SessionSetup {
  site: string;
  trainer: string;
  topic: string;
  trade: string;
  learnerCount: number;
  mode: InstructionMode;
}

export interface User {
  username: string;
  role: 'trainer' | 'observer';
}

export type Screen = 'login' | 'observer-dashboard' | 'setup' | 'observation' | 'summary' | 'saved' | 'trainer-dashboard' | 'trainer-selection';

export type IcapLevel = 'Interactive' | 'Constructive' | 'Active' | 'Passive';
