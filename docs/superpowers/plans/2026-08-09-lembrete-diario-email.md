# Lembrete Diário por Email (Fase 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send each user a daily email reminder at their chosen `hora_despertar`, for the first 21 days of their protocol, with an opt-out toggle in the app — closing out the Fase 4 spec.

**Architecture:** A pure, dependency-free TypeScript function (`src/lib/reminders.ts`) decides who's eligible for today's reminder (timezone conversion + all the filtering rules) and is unit-tested with Vitest like every other `src/lib/*` module in this codebase. A Supabase Edge Function (Deno) imports that exact same file via a relative path — no duplication — queries `profiles` with the service role key, calls it per row, and sends through Resend for anyone eligible. `pg_cron` triggers the function every 15 minutes. A new `RemindersToggle` client component (same pattern as `ResetProtocolButton`) lets the user opt out from the Início tab.

**Tech Stack:** Next.js 14 App Router + TypeScript (existing) + Vitest + Testing Library (existing) + Supabase Edge Functions (Deno, new to this project) + `pg_cron` / `pg_net` / Supabase Vault (Postgres extensions, new) + Resend HTTP API (no SDK — plain `fetch`).

## Global Constraints

- Product language: **Spanish (ES-MX)** only. Every user-facing string below (email copy, toggle labels) is already final — use it verbatim.
- Existing Tailwind tokens (do not invent new ones): `bg-background` (#FAF6EE), `text-foreground` (#2B2013), `bg-brand` / `text-brand` (#C9A227), `bg-danger`/`text-danger` (#EF4444), `rounded-card` (20px).
- Timezone for all reminder-timing logic: **fixed `America/Mexico_City`** (no per-user timezone; see spec for rationale).
- Client Components start with `'use client'` only when they need interactivity/hooks.
- Test files are colocated (`Component.test.tsx` next to `Component.tsx`), Vitest + Testing Library, same mocking patterns already used in this repo: `vi.mock('@/lib/supabase/client', ...)` / `vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }))`.
- `RESEND_API_KEY` and the Supabase **service role key** are Edge Function secrets (set via `supabase secrets set`, or already provided as `SUPABASE_SERVICE_ROLE_KEY` in every Edge Function's environment automatically) — **never** added to the Next.js app's `.env`/Vercel config. They are not read by any code under `src/`.
- Migrations are SQL files under `supabase/migrations/`, written by the implementer, but **running them against the live Supabase project is a manual step for the human partner** — this repo has no Supabase DB/API access from the agent side. Say so explicitly in the task's report; do not attempt to run it yourself. The same is true for `supabase secrets set` and enabling Postgres extensions — all manual, human-side steps.
- Never use `npm run build` to verify — use `npx tsc --noEmit` + `npm test`.
- Commit after every task.

---

### Task 1: Migration — `reminders_enabled` column

**Files:**
- Create: `supabase/migrations/0003_reminders_enabled.sql`

**Interfaces:**
- Produces: `public.profiles.reminders_enabled` (boolean, not null, default `true`). Tasks 3 and 4 read/write this column through the existing `profiles` RLS policies (`auth.uid() = id`) — no new policy needed, the column lives on an already-RLS-protected table.
- This task has **no tests** — it is SQL, not application code, matching the convention already used for `0001_profiles.sql` and `0002_checkins_weight_logs_photos.sql`.

- [ ] **Step 1: Write the migration**

`supabase/migrations/0003_reminders_enabled.sql`:
```sql
alter table public.profiles
  add column if not exists reminders_enabled boolean not null default true;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0003_reminders_enabled.sql
git commit -m "feat: add reminders_enabled column to profiles"
```

Report to the human partner: this SQL must be run manually in the Supabase SQL Editor for the live project before the opt-out toggle (Task 3/4) has anything real to read/write — until then, `profiles.reminders_enabled` doesn't exist in the live database.

---

### Task 2: Reminder eligibility logic (pure function)

**Files:**
- Create: `src/lib/reminders.ts`
- Test: `src/lib/reminders.test.ts`

**Interfaces:**
- Produces: `isEligibleForReminder(profile: ReminderCandidate, nowUtc: Date): boolean` and `getMexicoCityDate(nowUtc: Date): string` (both exported — the second is reused directly by the Edge Function in Task 5 to compute the value it writes to `last_reminder_sent_at`, so the "what day is it in Mexico City" logic exists in exactly one place). `ReminderCandidate = { horaDespertar: string; remindersEnabled: boolean; lastReminderSentAt: string | null; protocolStartDate: string }`. All date strings are ISO `YYYY-MM-DD`; `horaDespertar` is `HH:MM` (24h), matching `profiles.hora_despertar`'s existing format.
- This file must have **zero imports** — no Next.js, no Node-only APIs, only `Intl`/`Date`/`Math`/`String`. Task 5's Edge Function (Deno) imports this exact file via a relative path (`../../../src/lib/reminders.ts`) — any Node- or browser-only API used here would break under Deno.

- [ ] **Step 1: Write the failing test**

`src/lib/reminders.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- reminders.test.ts`
Expected: FAIL with "Cannot find module './reminders'".

- [ ] **Step 3: Implement**

`src/lib/reminders.ts`:
```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- reminders.test.ts`
Expected: PASS (13 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/reminders.ts src/lib/reminders.test.ts
git commit -m "feat: add reminder eligibility logic (timezone-aware, pure function)"
```

---

### Task 3: RemindersToggle component

**Files:**
- Create: `src/components/app/RemindersToggle.tsx`
- Test: `src/components/app/RemindersToggle.test.tsx`

**Interfaces:**
- Produces: `<RemindersToggle userId={string} enabled={boolean} />`. Used by the Início page in Task 4.
- Consumes: `createClient` from `@/lib/supabase/client` (existing), `useRouter` from `next/navigation`.

- [ ] **Step 1: Write the failing test**

`src/components/app/RemindersToggle.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RemindersToggle } from './RemindersToggle';

const update = vi.fn();
const eq = vi.fn();
const refresh = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      update: (...args: unknown[]) => {
        update(...args);
        return { eq: (...eqArgs: unknown[]) => eq(...eqArgs) };
      },
    }),
  }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

describe('RemindersToggle', () => {
  beforeEach(() => {
    update.mockReset();
    eq.mockReset();
    refresh.mockReset();
  });

  it('muestra "activado" cuando enabled es true', () => {
    render(<RemindersToggle userId="user-1" enabled />);
    expect(screen.getByText('🔔 Recordatorio activado')).toBeInTheDocument();
  });

  it('muestra "desactivado" cuando enabled es false', () => {
    render(<RemindersToggle userId="user-1" enabled={false} />);
    expect(screen.getByText('🔕 Recordatorio desactivado')).toBeInTheDocument();
  });

  it('al hacer clic con enabled=true, guarda reminders_enabled=false y refresca', async () => {
    eq.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<RemindersToggle userId="user-1" enabled />);
    await user.click(screen.getByText('🔔 Recordatorio activado'));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(update).toHaveBeenCalledWith({ reminders_enabled: false });
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
  });

  it('al hacer clic con enabled=false, guarda reminders_enabled=true', async () => {
    eq.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<RemindersToggle userId="user-1" enabled={false} />);
    await user.click(screen.getByText('🔕 Recordatorio desactivado'));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(update).toHaveBeenCalledWith({ reminders_enabled: true });
  });

  it('si falla el guardado, muestra un mensaje de error y no refresca', async () => {
    eq.mockResolvedValue({ error: { message: 'fail' } });
    const user = userEvent.setup();
    render(<RemindersToggle userId="user-1" enabled />);
    await user.click(screen.getByText('🔔 Recordatorio activado'));

    expect(await screen.findByText('No pudimos guardar el cambio.')).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- RemindersToggle.test.tsx`
Expected: FAIL with "Cannot find module './RemindersToggle'".

- [ ] **Step 3: Implement**

`src/components/app/RemindersToggle.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type RemindersToggleProps = {
  userId: string;
  enabled: boolean;
};

export function RemindersToggle({ userId, enabled }: RemindersToggleProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function handleToggle() {
    setSaving(true);
    setError(false);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ reminders_enabled: !enabled })
      .eq('id', userId);
    setSaving(false);
    if (updateError) {
      setError(true);
      return;
    }
    router.refresh();
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={handleToggle}
        disabled={saving}
        className="text-sm text-neutral-500 disabled:opacity-40"
      >
        {enabled ? '🔔 Recordatorio activado' : '🔕 Recordatorio desactivado'}
      </button>
      {error ? <p className="mt-1 text-xs text-danger">No pudimos guardar el cambio.</p> : null}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- RemindersToggle.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/app/RemindersToggle.tsx src/components/app/RemindersToggle.test.tsx
git commit -m "feat: add reminders opt-out toggle"
```

---

### Task 4: Wire RemindersToggle into the Início page

**Files:**
- Modify: `src/types/profile.ts`
- Modify: `src/app/app/page.tsx`
- Modify: `src/app/app/page.test.tsx`

**Interfaces:**
- Consumes: `RemindersToggle` (Task 3).
- Produces: `Profile.reminders_enabled: boolean` — no other task depends on this type change, but it must exist for `getCurrentProfile()` (which does `select('*')`) to type correctly.

- [ ] **Step 1: Add the field to the Profile type**

In `src/types/profile.ts`, add `reminders_enabled: boolean;` to the `Profile` interface (after `last_reminder_sent_at`):
```ts
export interface Profile {
  id: string;
  nombre: string | null;
  peso: number;
  estatura: number;
  edad: number;
  horario_hambre: string | null;
  antojo_dulce: number;
  meta_peso: string | null;
  hora_despertar: string;
  protocol_start_date: string;
  last_reminder_sent_at: string | null;
  reminders_enabled: boolean;
  created_at: string;
}
```

- [ ] **Step 2: Write the failing test**

Modify `src/app/app/page.test.tsx`: add `reminders_enabled: true` to the mocked profile, mock `RemindersToggle`, and add one assertion. Replace the file with:
```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppPage from './page';

vi.mock('@/lib/profile', () => ({
  getCurrentProfile: () =>
    Promise.resolve({
      id: 'user-1',
      nombre: 'Ana',
      peso: 70,
      antojo_dulce: 3,
      edad: 30,
      hora_despertar: '07:00',
      protocol_start_date: '2026-08-01',
      reminders_enabled: true,
    }),
}));

const select = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => select(),
      }),
    }),
  }),
}));

vi.mock('@/components/app/CheckinButton', () => ({
  CheckinButton: ({ alreadyCheckedInToday }: { alreadyCheckedInToday: boolean }) => (
    <div data-testid="checkin-button">{alreadyCheckedInToday ? 'hecho' : 'pendiente'}</div>
  ),
}));

vi.mock('@/components/app/MonthCalendar', () => ({
  MonthCalendar: () => <div data-testid="calendar" />,
}));

vi.mock('@/components/app/ResetProtocolButton', () => ({
  ResetProtocolButton: () => <button type="button">↺ Recomenzar protocolo</button>,
}));

vi.mock('@/components/app/RemindersToggle', () => ({
  RemindersToggle: ({ enabled }: { enabled: boolean }) => (
    <div data-testid="reminders-toggle">{enabled ? 'activado' : 'desactivado'}</div>
  ),
}));

describe('AppPage (Início)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-08-08T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el saludo, el día actual y el resumen de check-ins', async () => {
    select.mockResolvedValue({ data: [{ date: '2026-08-01' }, { date: '2026-08-02' }] });
    render(await AppPage());
    expect(screen.getByText(/Hola, Ana/)).toBeInTheDocument();
    expect(screen.getByText(/Día 8 de 21/)).toBeInTheDocument();
    expect(screen.getByText(/2\/21 check-ins/)).toBeInTheDocument();
  });

  it('muestra la tarjeta de receta de hoy con el horario', async () => {
    select.mockResolvedValue({ data: [] });
    render(await AppPage());
    expect(screen.getByText(/07:00/)).toBeInTheDocument();
  });

  it('pasa alreadyCheckedInToday=true al CheckinButton si hoy ya está en checkins', async () => {
    vi.setSystemTime(new Date('2026-08-08T12:00:00Z'));
    select.mockResolvedValue({ data: [{ date: '2026-08-08' }] });
    render(await AppPage());
    expect(screen.getByTestId('checkin-button')).toHaveTextContent('hecho');
    vi.useRealTimers();
  });

  it('pasa enabled=true al RemindersToggle según el perfil', async () => {
    select.mockResolvedValue({ data: [] });
    render(await AppPage());
    expect(screen.getByTestId('reminders-toggle')).toHaveTextContent('activado');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/app/app/page.test.tsx`
Expected: FAIL — `RemindersToggle` isn't rendered yet, so the new test can't find `reminders-toggle`.

- [ ] **Step 4: Implement**

In `src/app/app/page.tsx`, add the import and render `RemindersToggle` next to `ResetProtocolButton`:
```tsx
import { getCurrentProfile } from '@/lib/profile';
import { createClient } from '@/lib/supabase/server';
import { calculateStreak } from '@/lib/achievements';
import { CheckinButton } from '@/components/app/CheckinButton';
import { MonthCalendar } from '@/components/app/MonthCalendar';
import { ResetProtocolButton } from '@/components/app/ResetProtocolButton';
import { RemindersToggle } from '@/components/app/RemindersToggle';

export default async function AppPage() {
  const profile = await getCurrentProfile();
  const supabase = createClient();
  const { data: checkins } = await supabase.from('checkins').select('date').eq('user_id', profile.id);
  const checkinDates = (checkins ?? []).map((c: { date: string }) => c.date);

  const today = new Date().toISOString().slice(0, 10);
  const daysSinceStart = Math.floor((Date.parse(today) - Date.parse(profile.protocol_start_date)) / 86400000) + 1;
  const dayNumber = Math.min(daysSinceStart, 21);
  const streak = calculateStreak(checkinDates, today);
  const progressPercent = Math.round((checkinDates.length / 21) * 100);
  const initial = (profile.nombre ?? '?').charAt(0).toUpperCase();

  return (
    <div className="px-4 pb-24 pt-6">
      <div className="flex items-center justify-end gap-3">
        <RemindersToggle userId={profile.id} enabled={profile.reminders_enabled} />
        <ResetProtocolButton />
      </div>

      <div className="mt-2 flex items-center gap-3 rounded-card bg-white p-4 shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-bold text-foreground">
          {initial}
        </span>
        <div>
          <p className="font-bold text-foreground">Hola, {profile.nombre ?? ''}</p>
          <p className="text-sm text-neutral-600">Día {dayNumber} de 21</p>
        </div>
      </div>

      <div className="mt-4 rounded-card bg-white p-4 text-center shadow-sm">
        <p className="text-2xl font-bold text-brand">{progressPercent}%</p>
        <p className="text-sm text-neutral-600">{checkinDates.length}/21 check-ins — marcados como hechos</p>
        {streak > 0 ? <p className="mt-1 text-sm text-warning">🔥 {streak} días seguidos</p> : null}
      </div>

      <div className="mt-4 rounded-card bg-white p-4 shadow-sm">
        <p className="font-bold text-foreground">Receta de hoy</p>
        <p className="mt-1 text-sm text-neutral-600">
          Tu dosis personalizada de gel. Tómala a las {profile.hora_despertar}, 30 min antes de la comida.
        </p>
        <a href="/app/recipe" className="mt-2 inline-block text-sm font-bold text-brand">
          Ver receta completa →
        </a>
      </div>

      <div className="mt-4">
        <CheckinButton userId={profile.id} alreadyCheckedInToday={checkinDates.includes(today)} />
      </div>

      <div className="mt-4">
        <MonthCalendar checkinDates={checkinDates} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run full suite + tsc + lint**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/types/profile.ts src/app/app/page.tsx src/app/app/page.test.tsx
git commit -m "feat: wire reminders opt-out toggle into Início page"
```

---

### Task 5: Edge Function — `send-daily-reminders`

**Files:**
- Create: `supabase/functions/send-daily-reminders/index.ts`
- Modify: `tsconfig.json`

**Interfaces:**
- Consumes: `isEligibleForReminder` and `getMexicoCityDate` from `src/lib/reminders.ts` (Task 2), imported via the relative path `../../../src/lib/reminders.ts` (Deno resolves local relative TypeScript imports natively — no bundler or import map needed).
- This task has **no automated test** — Deno Edge Functions run outside this project's Vitest/Node setup, and this repo has no Deno test runner configured. Verifying it is a manual step for the human partner (deploy with `supabase functions deploy send-daily-reminders`, then invoke it manually once via the Supabase dashboard or `supabase functions invoke` and confirm the response body and that `last_reminder_sent_at` updates for a test profile). Say so explicitly in the task's report.

- [ ] **Step 1: Exclude Supabase Edge Functions from the Next.js TypeScript project**

This step must happen first: `tsconfig.json`'s `include` is `["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]`, which is broad enough to also pick up the new Deno file in the next step — and Deno-only syntax (`Deno.serve`, `Deno.env`, `npm:` specifiers) will fail `tsc --noEmit` for the *entire* project once that file exists, breaking every other task's verification step.

Modify `tsconfig.json`'s `exclude` array:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "supabase/functions"]
}
```

- [ ] **Step 2: Run tsc to confirm the exclusion works before adding the Deno file**

Run: `npx tsc --noEmit`
Expected: PASS (no change in behavior yet, just confirms the config is valid).

- [ ] **Step 3: Write the Edge Function**

`supabase/functions/send-daily-reminders/index.ts`:
```ts
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { isEligibleForReminder, getMexicoCityDate, type ReminderCandidate } from '../../../src/lib/reminders.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const APP_URL = 'https://www.protocologelmetabolicodechia.com/app';
const FROM_EMAIL = 'Protocolo Gel Metabólico de Chía <protocolo@protocologelmetabolicodechia.com>';

function buildEmailHtml(nombre: string | null, horaDespertar: string): string {
  const saludo = nombre ? `¡Hola, ${nombre}!` : '¡Hola!';
  return `
    <div style="background-color:#FAF6EE;padding:24px;font-family:sans-serif;color:#2B2013;">
      <p style="font-size:18px;font-weight:bold;">${saludo}</p>
      <p>Es hora de tu dosis de hoy — <strong>${horaDespertar}</strong>, 30 minutos antes de tu comida.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${APP_URL}" style="background-color:#C9A227;color:#2B2013;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;">VER MI PROTOCOLO</a>
      </p>
      <p>💡 Consejo del Dr. Renan: la constancia es lo que hace la diferencia — un día a la vez.</p>
      <p style="font-size:13px;color:#6b6b6b;">¿Ya no quieres recibir este recordatorio? Puedes desactivarlo desde tu app, en Início.</p>
    </div>
  `;
}

async function sendReminderEmail(email: string, nombre: string | null, horaDespertar: string): Promise<boolean> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: email,
      subject: 'Es hora de tu dosis de hoy 🌱',
      html: buildEmailHtml(nombre, horaDespertar),
    }),
  });
  return response.ok;
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, nombre, hora_despertar, reminders_enabled, last_reminder_sent_at, protocol_start_date')
    .eq('reminders_enabled', true);

  if (error) {
    console.error('Failed to fetch profiles for reminders', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const profile of profiles ?? []) {
    const candidate: ReminderCandidate = {
      horaDespertar: profile.hora_despertar,
      remindersEnabled: profile.reminders_enabled,
      lastReminderSentAt: profile.last_reminder_sent_at,
      protocolStartDate: profile.protocol_start_date,
    };

    if (!isEligibleForReminder(candidate, now)) continue;

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id);
    if (userError || !userData?.user?.email) {
      console.error(`No email found for profile ${profile.id}`, userError);
      failed += 1;
      continue;
    }

    const ok = await sendReminderEmail(userData.user.email, profile.nombre, profile.hora_despertar);
    if (!ok) {
      console.error(`Resend request failed for profile ${profile.id}`);
      failed += 1;
      continue;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ last_reminder_sent_at: getMexicoCityDate(now) })
      .eq('id', profile.id);
    if (updateError) {
      console.error(`Failed to update last_reminder_sent_at for profile ${profile.id}`, updateError);
    }

    sent += 1;
  }

  return new Response(JSON.stringify({ sent, failed }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
```

- [ ] **Step 4: Run tsc to confirm the rest of the project is still unaffected**

Run: `npx tsc --noEmit`
Expected: PASS — the new Deno file is excluded, so its `Deno`/`npm:` syntax doesn't get type-checked by this project's TypeScript config (and isn't meant to be; Deno has its own type-checking at deploy/run time).

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/send-daily-reminders/index.ts tsconfig.json
git commit -m "feat: add send-daily-reminders Edge Function"
```

Report to the human partner: this function needs two secrets set before it can run — `RESEND_API_KEY` (via `supabase secrets set RESEND_API_KEY=<key>`) and the service role key, which every Edge Function already receives automatically as `SUPABASE_SERVICE_ROLE_KEY` — no action needed for that one. Deploying and invoking it is also manual (`supabase functions deploy send-daily-reminders`); this repo has no Supabase CLI/API access from the agent side.

---

### Task 6: Schedule the function with `pg_cron`

**Files:**
- Create: `supabase/migrations/0004_schedule_reminders.sql`

**Interfaces:**
- Produces: a `pg_cron` job named `send-daily-reminders` that calls the Task 5 Edge Function every 15 minutes.
- This task has **no tests** — it is SQL/infrastructure, not application code. It also has a **hard prerequisite the implementer cannot satisfy alone**: the `pg_cron` and `pg_net` Postgres extensions must be enabled for the project (this generally requires a paid Supabase plan, not the free tier) before this migration can run. Verifying that is a manual step for the human partner — do not attempt to check or enable it yourself.

- [ ] **Step 1: Write the migration**

`supabase/migrations/0004_schedule_reminders.sql`:
```sql
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Run this select once, replacing the placeholder, before the cron.schedule call below —
-- it stores the service role key in Supabase Vault so it never appears in plain text in
-- cron.job or pg_stat_statements. Do NOT commit a real key into this file.
-- select vault.create_secret('<your-service-role-key>', 'reminders_service_role_key');

select cron.schedule(
  'send-daily-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://<your-project-ref>.supabase.co/functions/v1/send-daily-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'reminders_service_role_key'
      )
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/0004_schedule_reminders.sql
git commit -m "feat: schedule send-daily-reminders via pg_cron"
```

Report to the human partner, explicitly:
1. Confirm `pg_cron` and `pg_net` are available on the current Supabase plan before running this — check Database → Extensions in the Supabase dashboard.
2. Before running the `cron.schedule` call, run the commented-out `vault.create_secret(...)` line once, replacing `<your-service-role-key>` with the actual service role key from Project Settings → API — then remove that line (or leave it commented) so the real key never lands in git history.
3. Replace `<your-project-ref>` with the actual project ref (same one used in `NEXT_PUBLIC_SUPABASE_URL`).
4. This is the last task of the plan — after running it, verify end-to-end by temporarily setting a test profile's `hora_despertar` to a few minutes in the future and confirming the email arrives within 15 minutes.

---

## What this plan deliberately does NOT cover

- Per-user timezone (fixed `America/Mexico_City` for all users — see spec's rationale).
- A "protocol complete" congratulations email — reminders simply stop after day 21.
- Magic-link-style one-click login from the reminder email — the link goes to `/app` and relies on the existing Supabase session (sessions last weeks).
- Retry logic for a Resend failure on a given day — if Resend fails for a user on a given cron tick, that user simply doesn't get a reminder that day; the next day's cycle is unaffected (eligibility is time-window-based, not send-attempt-based).
