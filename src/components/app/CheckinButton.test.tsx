import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckinButton } from './CheckinButton';

const insert = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({ insert: (...args: unknown[]) => insert(...args) }),
  }),
}));

const confettiFn = vi.fn();
vi.mock('canvas-confetti', () => ({
  default: (...args: unknown[]) => confettiFn(...args),
}));

const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

describe('CheckinButton', () => {
  beforeEach(() => {
    insert.mockReset();
    confettiFn.mockReset();
    refresh.mockReset();
  });

  it('muestra el estado "hecho" si ya se marcó hoy', () => {
    render(<CheckinButton userId="user-1" alreadyCheckedInToday />);
    expect(screen.getByText('✓ Check-in de hoy hecho')).toBeInTheDocument();
  });

  it('al hacer clic, guarda el check-in, dispara confeti, cambia a "hecho" y refresca la pantalla', async () => {
    insert.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<CheckinButton userId="user-1" alreadyCheckedInToday={false} />);

    await user.click(screen.getByText('Marcar mi check-in'));

    await waitFor(() => expect(screen.getByText('✓ Check-in de hoy hecho')).toBeInTheDocument());
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1' }));
    expect(confettiFn).toHaveBeenCalled();
    expect(refresh).toHaveBeenCalled();
  });

  it('muestra error y no dispara confeti si falla el guardado', async () => {
    insert.mockResolvedValue({ error: { message: 'fail' } });
    const user = userEvent.setup();
    render(<CheckinButton userId="user-1" alreadyCheckedInToday={false} />);

    await user.click(screen.getByText('Marcar mi check-in'));

    expect(await screen.findByText(/No pudimos guardar tu check-in/)).toBeInTheDocument();
    expect(confettiFn).not.toHaveBeenCalled();
    expect(screen.getByText('Marcar mi check-in')).toBeInTheDocument();
  });

  it('vuelve a mostrar "Marcar mi check-in" cuando alreadyCheckedInToday pasa a false (tras reiniciar el protocolo)', () => {
    const { rerender } = render(<CheckinButton userId="user-1" alreadyCheckedInToday />);
    expect(screen.getByText('✓ Check-in de hoy hecho')).toBeInTheDocument();

    rerender(<CheckinButton userId="user-1" alreadyCheckedInToday={false} />);

    expect(screen.getByText('Marcar mi check-in')).toBeInTheDocument();
  });
});
