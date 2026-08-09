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
