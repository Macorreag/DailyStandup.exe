
const NAME_POOL = [
  "John Doe", "Jane Smith", "Alex Miller", "Sam Reed", 
  "Casey Wright", "Taylor Morgan", "Jordan Lee", "Chris Jordan",
  "Morgan Bailey", "Riley Quinn", "Parker Ellis", "Hayden Brooks"
];

// Selecciona 4 nombres aleatorios del pool para los nodos por defecto
export const DEFAULT_NAMES = [...NAME_POOL]
  .sort(() => 0.5 - Math.random())
  .slice(0, 4);

export const MAX_TIME_SECONDS = 300; // 5 minutes por defecto

export const TERMINAL_BOOT_LOGS = [
  "Initializing daily_scheduler.sh...",
  "Loading participant kernel...",
  "Establishing secure connection to Standup-Mainframe...",
  "Status: READY. Awaiting run command."
];

export const SYSTEM_MESSAGES = {
  SCANNING: "Scanning candidate pool for available nodes...",
  TARGET_LOCKED: (name: string) => `Target locked: ${name}. Initializing clock.`,
  DEFERRING: (name: string) => `Process deferred: ${name} moved to wait queue.`,
  SKIPPING: (name: string) => `User unreachable: ${name} marked as SKIPPED.`,
  COMPLETING: (name: string) => `Task finished: ${name} reported status successfully.`,
  DAILY_FINISH: "All nodes scanned. System stand-down initiated."
};
