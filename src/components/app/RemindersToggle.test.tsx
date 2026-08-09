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
