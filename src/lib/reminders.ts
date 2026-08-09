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
