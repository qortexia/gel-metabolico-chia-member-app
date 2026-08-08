export interface Achievement {
  id: string;
  title: string;
  unlocked: boolean;
}

export interface AchievementsInput {
  checkinDates: string[];
  weightLogs: { peso: number; date: string }[];
  protocolStartDate: string;
  today?: string;
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.floor((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86400000);
}

export function calculateStreak(checkinDates: string[], today: string): number {
  const set = new Set(checkinDates);
  let streak = 0;
  let cursor = today;
  while (set.has(cursor)) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }
  return streak;
}

function calculateWeightLoss(weightLogs: { peso: number; date: string }[]): number {
  if (weightLogs.length < 2) return 0;
  const sorted = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
  return sorted[0].peso - sorted[sorted.length - 1].peso;
}

export function calculateAchievements(input: AchievementsInput): Achievement[] {
  const today = input.today ?? new Date().toISOString().slice(0, 10);
  const daysSinceStart = daysBetween(input.protocolStartDate, today) + 1;
  const streak = calculateStreak(input.checkinDates, today);
  const weightLoss = calculateWeightLoss(input.weightLogs);

  return [
    { id: 'first-day', title: 'Primer día completo', unlocked: input.checkinDates.length >= 1 },
    { id: 'seven-days', title: '7 días seguidos', unlocked: streak >= 7 },
    { id: 'first-kg', title: 'Primer kilo eliminado', unlocked: weightLoss >= 1 },
    { id: 'halfway', title: '14 días — mitad del protocolo', unlocked: daysSinceStart >= 14 },
    { id: 'complete', title: '21 días — protocolo completo', unlocked: daysSinceStart >= 21 },
  ];
}
