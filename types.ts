
export enum ParticipantStatus {
  PENDING = 'PENDING',
  SPEAKING = 'SPEAKING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export interface Participant {
  id: string;
  name: string;
  status: ParticipantStatus;
  speakingTime: number; // in seconds
}

export enum AppMode {
  SETUP = 'SETUP',
  DAILY = 'DAILY',
  SUMMARY = 'SUMMARY',
  HISTORY = 'HISTORY'
}

export interface DailyHistoryEntry {
  id: string;
  date: string;
  participantsOrder: string[];
  nextOwner: string;
  totalDuration: number;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'SUCCESS' | 'ERROR';
  message: string;
}
