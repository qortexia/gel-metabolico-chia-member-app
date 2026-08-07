import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuccessScreen } from './SuccessScreen';

const signInWithOtp = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signInWithOtp: (...args: unknown[]) => signInWithOtp(...args) },
  }),
}));

describe('SuccessScreen', () => {
  beforeEach(() => {
    signInWithOtp.mockReset();
  });

  it('muestra el nombre y el texto exacto de éxito', () => {
    render(<SuccessScreen nombre="Ana" />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText(/Protocolo listo/)).toBeInTheDocument();
    expect(
      screen.getByText('Tu dosis, horarios y checklist de 21 días ya están listos para que empieces ahora.')
    ).toBeInTheDocument();
  });

  it('muestra el formulario de email con el botón VER MI PROTOCOLO', () => {
    render(<SuccessScreen nombre="Ana" />);
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByText('VER MI PROTOCOLO')).toBeInTheDocument();
  });

  it('llama a signInWithOtp con el email y el redirectTo correctos, y muestra el estado enviado', async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    render(<SuccessScreen nombre="Ana" />);
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await userEvent.click(screen.getByText('VER MI PROTOCOLO'));
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'ana@example.com',
      options: { emailRedirectTo: expect.stringContaining('/auth/callback') },
    });
    expect(await screen.findByText(/Revisa tu correo/)).toBeInTheDocument();
  });

  it('muestra un error si signInWithOtp falla, y deja el formulario disponible para reintentar', async () => {
    signInWithOtp.mockResolvedValue({ error: { message: 'network error' } });
    render(<SuccessScreen nombre="Ana" />);
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await userEvent.click(screen.getByText('VER MI PROTOCOLO'));
    expect(await screen.findByText(/No pudimos enviar el enlace/)).toBeInTheDocument();
    expect(screen.getByText('VER MI PROTOCOLO')).toBeInTheDocument();
  });
});
