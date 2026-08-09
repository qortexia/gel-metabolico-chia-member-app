import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculateAchievements, calculateStreak } from './achievements';

describe('calculateStreak', () => {
  it('cuenta 0 si hoy no está marcado', () => {
    expect(calculateStreak([], '2026-08-08')).toBe(0);
  });

  it('cuenta los días consecutivos terminando hoy', () => {
    expect(calculateStreak(['2026-08-06', '2026-08-07', '2026-08-08'], '2026-08-08')).toBe(3);
  });

  it('se detiene en el primer hueco', () => {
    expect(calculateStreak(['2026-08-05', '2026-08-07', '2026-08-08'], '2026-08-08')).toBe(2);
  });
});

describe('calculateAchievements', () => {
  const base = {
    checkinDates: [] as string[],
    weightLogs: [] as { peso: number; date: string }[],
    protocolStartDate: '2026-08-08',
    today: '2026-08-08',
  };

  it('sin datos, ninguna conquista está desbloqueada', () => {
    const result = calculateAchievements(base);
    expect(result.every((a) => !a.unlocked)).toBe(true);
    expect(result.map((a) => a.id)).toEqual(['first-day', 'seven-days', 'first-kg', 'halfway', 'complete']);
  });

  it('desbloquea "primer día" con 1 check-in', () => {
    const result = calculateAchievements({ ...base, checkinDates: ['2026-08-08'] });
    expect(result.find((a) => a.id === 'first-day')!.unlocked).toBe(true);
  });

  it('desbloquea "7 días seguidos" con racha de 7', () => {
    const dates = Array.from({ length: 7 }, (_, i) => `2026-08-0${i + 1}`);
    const result = calculateAchievements({ ...base, checkinDates: dates, today: '2026-08-07' });
    expect(result.find((a) => a.id === 'seven-days')!.unlocked).toBe(true);
  });

  it('desbloquea "primer kilo" cuando el peso bajó 1kg o más', () => {
    const result = calculateAchievements({
      ...base,
      weightLogs: [
        { peso: 70, date: '2026-08-01' },
        { peso: 68.5, date: '2026-08-08' },
      ],
    });
    expect(result.find((a) => a.id === 'first-kg')!.unlocked).toBe(true);
  });

  it('no desbloquea "primer kilo" con menos de 1kg de diferencia', () => {
    const result = calculateAchievements({
      ...base,
      weightLogs: [
        { peso: 70, date: '2026-08-01' },
        { peso: 69.5, date: '2026-08-08' },
      ],
    });
    expect(result.find((a) => a.id === 'first-kg')!.unlocked).toBe(false);
  });

  it('desbloquea "14 días" y no "21 días" en el día 14', () => {
    const result = calculateAchievements({ ...base, protocolStartDate: '2026-07-26', today: '2026-08-08' });
    expect(result.find((a) => a.id === 'halfway')!.unlocked).toBe(true);
    expect(result.find((a) => a.id === 'complete')!.unlocked).toBe(false);
  });

  it('desbloquea "21 días" en el día 21', () => {
    const result = calculateAchievements({ ...base, protocolStartDate: '2026-07-19', today: '2026-08-08' });
    expect(result.find((a) => a.id === 'complete')!.unlocked).toBe(true);
  });

  it('sin "today" explícito, usa la fecha de Ciudad de México (no UTC)', () => {
    // 2026-08-10T05:00:00Z es 2026-08-09T23:00:00 en Ciudad de México (día anterior en UTC).
    // Con protocolStartDate 2026-07-28: si usa MX (2026-08-09), van 13 días — "halfway" (>=14) NO
    // desbloqueada. Si usara UTC (2026-08-10) por error, irían 14 días — SÍ desbloqueada. El
    // resultado distingue cuál fecha se usó de verdad.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-08-10T05:00:00Z'));
    const result = calculateAchievements({ ...base, protocolStartDate: '2026-07-28', today: undefined });
    expect(result.find((a) => a.id === 'halfway')!.unlocked).toBe(false);
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
