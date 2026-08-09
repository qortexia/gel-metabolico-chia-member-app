// IMPORTANT: this file is imported by TWO runtimes — this project's normal Node/Vitest
// toolchain (see reminders.test.ts) AND the Deno Edge Function at
// supabase/functions/send-daily-reminders/index.ts (via a relative import with an
// explicit .ts extension — Deno resolves local TS files natively, no bundler).
// Keep this file free of ANY imports, Node-only APIs (process.*, Buffer, etc.), and
// Next.js/browser-only APIs. Only built-in Intl/Date/Math/String are safe here.
// tsc and Vitest do NOT catch a violation of this — supabase/functions is excluded
// from tsconfig.json, and there is no Deno test runner in this repo.
export interface ReminderCandidate {
  horaDespertar: string;
  remindersEnabled: boolean;
  lastReminderSentAt: string | null;
  protocolStartDate: string;
}

const TIMEZONE = 'America/Mexico_City';

function mexicoCityParts(nowUtc: Date): { dateIso: string; hhmm: string } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(nowUtc);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return { dateIso: `${get('year')}-${get('month')}-${get('day')}`, hhmm: `${get('hour')}:${get('minute')}` };
}

export function getMexicoCityDate(nowUtc: Date): string {
  return mexicoCityParts(nowUtc).dateIso;
}

function minutesSinceMidnight(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.floor((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86400000);
}

export function isEligibleForReminder(profile: ReminderCandidate, nowUtc: Date): boolean {
  if (!profile.remindersEnabled) return false;

  const { dateIso: todayMx, hhmm: nowHhmm } = mexicoCityParts(nowUtc);

  if (profile.lastReminderSentAt === todayMx) return false;

  const daysSinceStart = daysBetween(profile.protocolStartDate, todayMx) + 1;
  if (daysSinceStart > 21) return false;

  const nowMinutes = minutesSinceMidnight(nowHhmm);
  const targetMinutes = minutesSinceMidnight(profile.horaDespertar);
  const diff = (((nowMinutes - targetMinutes) % 1440) + 1440) % 1440;
  return diff < 15;
}
