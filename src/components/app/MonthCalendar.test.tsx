import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthCalendar } from './MonthCalendar';

describe('MonthCalendar', () => {
  beforeEach(() => {
    // Scoped to 'Date' only: faking setTimeout globally deadlocks userEvent.click()
    // under React 18 here, because jsdom has no MessageChannel, so React's scheduler
    // falls back to setTimeout(0) — which act() then waits on forever once it's faked.
    // Explicit 'Z' (UTC) — a bare local-time string here is timezone-dependent and was a
    // latent flakiness risk; 18:00 UTC is 12:00 in Mexico City (fixed UTC-6), matching the
    // original intent of "midday on Aug 8" but now deterministic regardless of the machine
    // running the tests.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-08-08T18:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el mes y año actuales', () => {
    render(<MonthCalendar checkinDates={[]} />);
    expect(screen.getByText(/agosto de 2026/i)).toBeInTheDocument();
  });

  it('al hacer clic en un día marcado muestra "Marcado"', async () => {
    const user = userEvent.setup({ delay: null });
    render(<MonthCalendar checkinDates={['2026-08-05']} />);
    await user.click(screen.getByText('5'));
    expect(screen.getByText('Marcado ✓')).toBeInTheDocument();
  });

  it('al hacer clic en un día sin marcar muestra "Aún no marcado"', async () => {
    const user = userEvent.setup({ delay: null });
    render(<MonthCalendar checkinDates={[]} />);
    await user.click(screen.getByText('10'));
    expect(screen.getByText('Aún no marcado')).toBeInTheDocument();
  });

  it('navega al mes siguiente y anterior', async () => {
    const user = userEvent.setup({ delay: null });
    render(<MonthCalendar checkinDates={[]} />);
    await user.click(screen.getByLabelText('Mes siguiente'));
    expect(screen.getByText(/septiembre de 2026/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText('Mes anterior'));
    await user.click(screen.getByLabelText('Mes anterior'));
    expect(screen.getByText(/julio de 2026/i)).toBeInTheDocument();
  });

  it('marca "hoy" según la fecha de Ciudad de México, no la fecha UTC', async () => {
    // 2026-08-09T05:00:00Z es 2026-08-08T23:00:00 en Ciudad de México (día anterior en UTC).
    vi.setSystemTime(new Date('2026-08-09T05:00:00Z'));
    const user = userEvent.setup({ delay: null });
    render(<MonthCalendar checkinDates={[]} />);
    // Si usara la fecha UTC (9), el día 8 no mostraría "HOY" al hacer clic.
    await user.click(screen.getByText('8'));
    expect(screen.getByText('HOY')).toBeInTheDocument();
  });
});
