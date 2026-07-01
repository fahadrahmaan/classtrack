import type { IcapLevel } from './types';

export const TRAINER_CHIPS = [
  'Writes on board',
  'Gives real-life example',
  'Asks question and waits',
  'Asks then answers self',
  'Answers learner question',
  'Reads from guide or slide',
  'Instructs app use',
  'Runs group activity',
  'Walks round, checks work',
  'Shows or demonstrates',
  'Leaves classroom',
] as const;

export const LEARNER_CHIPS = [
  'Listening',
  'Off-task',
  'Writing in notebook',
  'Answering question aloud',
  'Answering in chorus',
  'Using phone for lesson',
  'Sharing one phone',
  'Giving own example',
  'Asking a question',
  'Talking with neighbour',
  'Doing group activity',
  'Debating or disagreeing',
] as const;

export const ICAP_MAP: Record<string, IcapLevel> = {
  // Interactive
  'Talking with neighbour': 'Interactive',
  'Doing group activity': 'Interactive',
  'Debating or disagreeing': 'Interactive',
  'Runs group activity': 'Interactive',
  // Constructive
  'Gives real-life example': 'Constructive',
  'Answers learner question': 'Constructive',
  'Giving own example': 'Constructive',
  'Asking a question': 'Constructive',
  // Active
  'Writes on board': 'Active',
  'Asks question and waits': 'Active',
  'Instructs app use': 'Active',
  'Walks round, checks work': 'Active',
  'Shows or demonstrates': 'Active',
  'Writing in notebook': 'Active',
  'Answering question aloud': 'Active',
  'Answering in chorus': 'Active',
  'Using phone for lesson': 'Active',
  'Sharing one phone': 'Active',
  // Passive
  'Reads from guide or slide': 'Passive',
  'Asks then answers self': 'Passive',
  'Listening': 'Passive',
  'Off-task': 'Passive',
  'Leaves classroom': 'Passive',
};

export const ICAP_COLORS: Record<IcapLevel, string> = {
  Interactive: '#4A7C6F',
  Constructive: '#5A7A9A',
  Active: '#A07030',
  Passive: '#7A6555',
};

export const TRAINER_DURATION = 60; // seconds
export const LEARNER_DURATION = 120; // seconds

export const STORAGE_KEY = 'leop_sessions';
