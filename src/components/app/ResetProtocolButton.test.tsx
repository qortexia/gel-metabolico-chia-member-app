import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetProtocolButton } from './ResetProtocolButton';

const getUser = vi.fn();
const del = vi.fn();
const update = vi.fn();
const refresh = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getUser: () => getUser() },
    from: (table: string) => {
      if (table === 'checkins') {
        return { delete: () => ({ eq: (...args: unknown[]) => del(...args) }) };
      }
      return { update: (...args: unknown[]) => ({ eq: (...eqArgs: unknown[]) => update(...args, ...eqArgs) }) };
    },
  }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

describe('ResetProtocolButton', () => {
  beforeEach(() => {
    getUser.mockReset();
    del.mockReset();
    update.mockReset();
    refresh.mockReset();
  });

  it('muestra el botón inicial sin confirmación', () => {
    render(<ResetProtocolButton />);
    expect(screen.getByText('↺ Recomenzar protocolo')).toBeInTheDocument();
    expect(screen.queryByText('Sí, recomenzar')).not.toBeInTheDocument();
  });

  it('al hacer clic pide confirmación, y cancelar la cierra sin borrar nada', async () => {
    const user = userEvent.setup();
    render(<ResetProtocolButton />);
    await user.click(screen.getByText('↺ Recomenzar protocolo'));
    expect(screen.getByText('Sí, recomenzar')).toBeInTheDocument();
    await user.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('Sí, recomenzar')).not.toBeInTheDocument();
    expect(del).not.toHaveBeenCalled();
  });

  it('al confirmar, borra los checkins, reinicia protocol_start_date y refresca', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    del.mockResolvedValue({ error: null });
    update.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<ResetProtocolButton />);
    await user.click(screen.getByText('↺ Recomenzar protocolo'));
    await user.click(screen.getByText('Sí, recomenzar'));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(del).toHaveBeenCalledWith('user_id', 'user-1');
  });
});
