import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { isEligibleForReminder, getMexicoCityDate, type ReminderCandidate } from './reminders';

const base: ReminderCandidate = {
  horaDespertar: '06:00',
  remindersEnabled: true,
  lastReminderSentAt: null,
  protocolStartDate: '2026-08-01',
};

describe('getMexicoCityDate', () => {
  it('convierte una fecha UTC a la fecha local de Ciudad de México (UTC-6)', () => {
    // 2026-08-09T12:00:00Z es 2026-08-09T06:00:00 en Ciudad de México
    expect(getMexicoCityDate(new Date('2026-08-09T12:00:00Z'))).toBe('2026-08-09');
    // 2026-08-09T05:00:00Z es 2026-08-08T23:00:00 en Ciudad de México (día anterior)
    expect(getMexicoCityDate(new Date('2026-08-09T05:00:00Z'))).toBe('2026-08-08');
  });
});

describe('isEligibleForReminder', () => {
  it('es elegible exactamente a la hora de hora_despertar', () => {
    expect(isEligibleForReminder(base, new Date('2026-08-09T12:00:00Z'))).toBe(true);
  });

  it('es elegible 14 minutos después de hora_despertar', () => {
    expect(isEligibleForReminder(base, new Date('2026-08-09T12:14:00Z'))).toBe(true);
  });

  it('no es elegible 15 minutos después de hora_despertar (límite de la ventana)', () => {
    expect(isEligibleForReminder(base, new Date('2026-08-09T12:15:00Z'))).toBe(false);
  });

  it('no es elegible 16 minutos después de hora_despertar', () => {
    expect(isEligibleForReminder(base, new Date('2026-08-09T12:16:00Z'))).toBe(false);
  });

  it('no es elegible antes de hora_despertar', () => {
    expect(isEligibleForReminder(base, new Date('2026-08-09T11:55:00Z'))).toBe(false);
  });

  it('maneja el cruce de medianoche: hora_despertar 23:55, 5 minutos después ya es el día siguiente', () => {
    const candidate: ReminderCandidate = { ...base, horaDespertar: '23:55' };
    // 2026-08-10T06:05:00Z es 2026-08-10T00:05:00 en Ciudad de México
    expect(isEligibleForReminder(candidate, new Date('2026-08-10T06:05:00Z'))).toBe(true);
  });

  it('no es elegible si reminders_enabled es false', () => {
    const candidate: ReminderCandidate = { ...base, remindersEnabled: false };
    expect(isEligibleForReminder(candidate, new Date('2026-08-09T12:00:00Z'))).toBe(false);
  });

  it('no es elegible si ya se envió hoy (fecha de Ciudad de México)', () => {
    const candidate: ReminderCandidate = { ...base, lastReminderSentAt: '2026-08-09' };
    expect(isEligibleForReminder(candidate, new Date('2026-08-09T12:00:00Z'))).toBe(false);
  });

  it('es elegible si el último envío fue ayer', () => {
    const candidate: ReminderCandidate = { ...base, lastReminderSentAt: '2026-08-08' };
    expect(isEligibleForReminder(candidate, new Date('2026-08-09T12:00:00Z'))).toBe(true);
  });

  it('es elegible en el día 21 del protocolo', () => {
    // protocolStartDate 2026-07-20 + 20 días = 2026-08-09 → día 21
    const candidate: ReminderCandidate = { ...base, protocolStartDate: '2026-07-20' };
    expect(isEligibleForReminder(candidate, new Date('2026-08-09T12:00:00Z'))).toBe(true);
  });

  it('no es elegible en el día 22 del protocolo', () => {
    // protocolStartDate 2026-07-20 + 21 días = 2026-08-10 → día 22
    const candidate: ReminderCandidate = { ...base, protocolStartDate: '2026-07-20' };
    expect(isEligibleForReminder(candidate, new Date('2026-08-10T12:00:00Z'))).toBe(false);
  });
});

describe('dual-runtime safety', () => {
  it('reminders.ts contains no imports and no Node/browser-only globals', () => {
    // Note: this project's Vitest environment is jsdom, whose global URL resolves
    // relative URLs against jsdom's document location (http://localhost:3000/) rather
    // than the real file path, so `new URL('./reminders.ts', import.meta.url)` would
    // resolve to an http: URL here — use fileURLToPath + path.join instead.
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const fullSource = readFileSync(path.join(dir, 'reminders.ts'), 'utf-8');
    // Strip full-line comments before scanning so the guard doesn't trip on the
    // dual-runtime warning comment itself (which mentions these patterns by name)
    // — the point is to catch actual code violations, not documentation prose.
    const source = fullSource
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');
    expect(source).not.toMatch(/^\s*import\s/m);
    expect(source).not.toMatch(/\brequire\(/);
    expect(source).not.toMatch(/\bprocess\./);
    expect(source).not.toMatch(/@\//);
  });
});
