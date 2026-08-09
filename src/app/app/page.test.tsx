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
});
