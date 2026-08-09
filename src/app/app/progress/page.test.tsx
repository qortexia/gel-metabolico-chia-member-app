import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressPage from './page';

vi.mock('@/lib/profile', () => ({
  getCurrentProfile: () => Promise.resolve({ id: 'user-1', protocol_start_date: '2026-08-01' }),
}));

const from = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({ from: (...args: unknown[]) => from(...args) }),
}));

vi.mock('@/components/app/AddWeightForm', () => ({
  AddWeightForm: () => <div data-testid="add-weight-form" />,
}));
vi.mock('@/components/app/AchievementsCard', () => ({
  AchievementsCard: () => <div data-testid="achievements-card" />,
}));
vi.mock('@/components/app/ProgressPhotos', () => ({
  ProgressPhotos: () => <div data-testid="progress-photos" />,
}));

function mockTable(rows: unknown[]) {
  return {
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve({ data: rows }),
      }),
    }),
  };
}

describe('ProgressPage', () => {
  it('muestra el estado vacío cuando no hay registros de peso', async () => {
    from.mockImplementation(() => mockTable([]));
    render(await ProgressPage());
    expect(screen.getByText(/Aún no has registrado tu peso/)).toBeInTheDocument();
  });

  it('calcula el día del protocolo con la fecha de Ciudad de México, no UTC', async () => {
    // 2026-08-09T05:00:00Z es 2026-08-08T23:00:00 en Ciudad de México (día anterior en UTC).
    // protocol_start_date 2026-08-01: en MX van 8 días, en UTC (por error) irían 9.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-08-09T05:00:00Z'));
    from.mockImplementation(() => mockTable([]));
    render(await ProgressPage());
    expect(screen.getByText(/Estás en el día 8 de 21/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('muestra Inicial/Actual/Diferencia cuando hay registros', async () => {
    from.mockImplementation((table: string) =>
      mockTable(
        table === 'weight_logs'
          ? [
              { peso: 70, date: '2026-08-01' },
              { peso: 68, date: '2026-08-08' },
            ]
          : []
      )
    );
    render(await ProgressPage());
    expect(screen.getByText('70 kg')).toBeInTheDocument();
    expect(screen.getByText('68 kg')).toBeInTheDocument();
    expect(screen.getByText('-2 kg')).toBeInTheDocument();
  });
});
