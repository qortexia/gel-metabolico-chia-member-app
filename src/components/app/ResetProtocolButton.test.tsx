import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetProtocolButton } from './ResetProtocolButton';

const rpc = vi.fn();
const refresh = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    rpc: (...args: unknown[]) => rpc(...args),
  }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

describe('ResetProtocolButton', () => {
  beforeEach(() => {
    rpc.mockReset();
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
    expect(rpc).not.toHaveBeenCalled();
  });

  it('al confirmar, llama al RPC reset_protocol y refresca', async () => {
    rpc.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<ResetProtocolButton />);
    await user.click(screen.getByText('↺ Recomenzar protocolo'));
    await user.click(screen.getByText('Sí, recomenzar'));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(rpc).toHaveBeenCalledWith('reset_protocol');
  });

  it('si el RPC falla, muestra un mensaje de error y no refresca', async () => {
    rpc.mockResolvedValue({ error: { message: 'fail' } });
    const user = userEvent.setup();
    render(<ResetProtocolButton />);
    await user.click(screen.getByText('↺ Recomenzar protocolo'));
    await user.click(screen.getByText('Sí, recomenzar'));

    expect(await screen.findByText(/No pudimos reiniciar tu protocolo/)).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
    expect(screen.getByText('Sí, recomenzar')).toBeInTheDocument();
  });
});
