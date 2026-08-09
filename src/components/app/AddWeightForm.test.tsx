import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddWeightForm } from './AddWeightForm';

const insert = vi.fn();
const refresh = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({ insert: (...args: unknown[]) => insert(...args) }),
  }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

describe('AddWeightForm', () => {
  beforeEach(() => {
    insert.mockReset();
    refresh.mockReset();
  });

  it('muestra el botón "+" inicialmente, sin el formulario', () => {
    render(<AddWeightForm userId="user-1" />);
    expect(screen.getByLabelText('Agregar registro de peso')).toBeInTheDocument();
    expect(screen.queryByLabelText('Peso en kg')).not.toBeInTheDocument();
  });

  it('al hacer clic en "+" muestra el formulario, y al enviar guarda y refresca', async () => {
    insert.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<AddWeightForm userId="user-1" />);

    await user.click(screen.getByLabelText('Agregar registro de peso'));
    await user.type(screen.getByLabelText('Peso en kg'), '68.5');
    await user.click(screen.getByText('Guardar'));

    await waitFor(() =>
      expect(insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1', peso: 68.5 }))
    );
    expect(refresh).toHaveBeenCalled();
  });

  it('muestra error si falla el guardado', async () => {
    insert.mockResolvedValue({ error: { message: 'fail' } });
    const user = userEvent.setup();
    render(<AddWeightForm userId="user-1" />);

    await user.click(screen.getByLabelText('Agregar registro de peso'));
    await user.type(screen.getByLabelText('Peso en kg'), '68.5');
    await user.click(screen.getByText('Guardar'));

    expect(await screen.findByText('Error al guardar')).toBeInTheDocument();
  });

  it('guarda la fecha de Ciudad de México, no la fecha UTC', async () => {
    // 2026-08-10T05:00:00Z es 2026-08-09T23:00:00 en Ciudad de México.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-08-10T05:00:00Z'));
    insert.mockResolvedValue({ error: null });
    const user = userEvent.setup({ delay: null });
    render(<AddWeightForm userId="user-1" />);

    await user.click(screen.getByLabelText('Agregar registro de peso'));
    await user.type(screen.getByLabelText('Peso en kg'), '68.5');
    await user.click(screen.getByText('Guardar'));

    await waitFor(() => expect(insert).toHaveBeenCalled());
    expect(insert).toHaveBeenCalledWith({ user_id: 'user-1', peso: 68.5, date: '2026-08-09' });
    vi.useRealTimers();
  });
});
