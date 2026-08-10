import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuccessScreen } from './SuccessScreen';
import { createClient } from '@/lib/supabase/client';
import { completeSignIn } from '@/lib/completeSignIn';

const signInWithOtp = vi.fn();
const verifyOtp = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOtp: (...args: unknown[]) => signInWithOtp(...args),
      verifyOtp: (...args: unknown[]) => verifyOtp(...args),
    },
  })),
}));

vi.mock('@/lib/completeSignIn', () => ({
  completeSignIn: vi.fn(),
}));

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('SuccessScreen', () => {
  beforeEach(() => {
    signInWithOtp.mockReset();
    verifyOtp.mockReset();
    push.mockReset();
    vi.mocked(completeSignIn).mockReset();
    vi.mocked(createClient).mockImplementation(() => ({
      auth: {
        signInWithOtp: (...args: unknown[]) => signInWithOtp(...args),
        verifyOtp: (...args: unknown[]) => verifyOtp(...args),
      },
    }) as unknown as ReturnType<typeof createClient>);
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

  it('al enviar, llama a signInWithOtp sin emailRedirectTo y muestra el formulario de código', async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<SuccessScreen nombre="Ana" />);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByText('VER MI PROTOCOLO'));
    expect(signInWithOtp).toHaveBeenCalledWith({ email: 'ana@example.com' });
    expect(await screen.findByLabelText('Código de 8 dígitos')).toBeInTheDocument();
  });

  it('muestra un error si signInWithOtp falla, y deja el formulario de email disponible', async () => {
    signInWithOtp.mockResolvedValue({ error: { message: 'network error' } });
    const user = userEvent.setup();
    render(<SuccessScreen nombre="Ana" />);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByText('VER MI PROTOCOLO'));
    expect(await screen.findByText(/No pudimos enviar el código/)).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
  });

  it('recorta espacios del email antes de llamar a signInWithOtp', async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<SuccessScreen nombre="Ana" />);
    await user.type(screen.getByLabelText('Correo electrónico'), '  ana@example.com  ');
    await user.click(screen.getByText('VER MI PROTOCOLO'));
    expect(signInWithOtp).toHaveBeenCalledWith({ email: 'ana@example.com' });
  });

  it('muestra el error existente en vez de crashear si createClient lanza una excepción (env mal configurado)', async () => {
    vi.mocked(createClient).mockImplementation(() => {
      throw new Error('Missing Supabase env vars');
    });
    const user = userEvent.setup();
    render(<SuccessScreen nombre="Ana" />);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByText('VER MI PROTOCOLO'));
    expect(await screen.findByText(/No pudimos enviar el código/)).toBeInTheDocument();
    expect(signInWithOtp).not.toHaveBeenCalled();
  });

  it('al confirmar un código correcto, llama a verifyOtp y a completeSignIn', async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    verifyOtp.mockResolvedValue({
      data: { user: { id: 'user-1' }, session: { access_token: 'fake' } },
      error: null,
    });
    vi.mocked(completeSignIn).mockResolvedValue({ error: false });
    const user = userEvent.setup();
    render(<SuccessScreen nombre="Ana" />);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByText('VER MI PROTOCOLO'));
    await user.type(await screen.findByLabelText('Código de 8 dígitos'), '12345678');
    await user.click(screen.getByText('Confirmar'));

    expect(verifyOtp).toHaveBeenCalledWith({ email: 'ana@example.com', token: '12345678', type: 'email' });
    expect(completeSignIn).toHaveBeenCalledWith(expect.anything(), { id: 'user-1' }, expect.anything());
  });

  it('muestra un error si el código es incorrecto o expiró, y deja el campo disponible para reintentar', async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    verifyOtp.mockResolvedValue({ data: { user: null, session: null }, error: { message: 'invalid otp' } });
    const user = userEvent.setup();
    render(<SuccessScreen nombre="Ana" />);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByText('VER MI PROTOCOLO'));
    await user.type(await screen.findByLabelText('Código de 8 dígitos'), '00000000');
    await user.click(screen.getByText('Confirmar'));

    expect(await screen.findByText(/Código incorrecto o expirado/)).toBeInTheDocument();
    expect(screen.getByLabelText('Código de 8 dígitos')).toBeInTheDocument();
    expect(completeSignIn).not.toHaveBeenCalled();
  });

  it('al hacer clic en "Reenviar código", vuelve a llamar a signInWithOtp', async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<SuccessScreen nombre="Ana" />);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByText('VER MI PROTOCOLO'));
    await screen.findByLabelText('Código de 8 dígitos');

    await user.click(screen.getByText('¿No llegó? Reenviar código'));

    expect(signInWithOtp).toHaveBeenCalledTimes(2);
  });

  it('al reenviar el código, no vuelve a mostrar el formulario de email mientras la petición está en curso', async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<SuccessScreen nombre="Ana" />);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByText('VER MI PROTOCOLO'));
    await screen.findByLabelText('Código de 8 dígitos');

    let resolveOtp: (value: unknown) => void;
    signInWithOtp.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveOtp = resolve;
        })
    );

    await user.click(screen.getByText('¿No llegó? Reenviar código'));

    expect(screen.getByLabelText('Código de 8 dígitos')).toBeInTheDocument();
    expect(screen.queryByLabelText('Correo electrónico')).not.toBeInTheDocument();

    resolveOtp!({ error: null });
    expect(await screen.findByLabelText('Código de 8 dígitos')).toBeInTheDocument();
  });

  it('muestra un error terminal si completeSignIn falla', async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    verifyOtp.mockResolvedValue({
      data: { user: { id: 'user-1' }, session: { access_token: 'fake' } },
      error: null,
    });
    vi.mocked(completeSignIn).mockResolvedValue({ error: true });
    const user = userEvent.setup();
    render(<SuccessScreen nombre="Ana" />);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByText('VER MI PROTOCOLO'));
    await user.type(await screen.findByLabelText('Código de 8 dígitos'), '12345678');
    await user.click(screen.getByText('Confirmar'));

    expect(await screen.findByText(/No pudimos completar tu acceso/)).toBeInTheDocument();
  });

  it('si el reenvío falla, mantiene el campo de código visible (el código original puede seguir siendo válido) y muestra un error de reenvío', async () => {
    signInWithOtp.mockResolvedValueOnce({ error: null });
    signInWithOtp.mockResolvedValueOnce({ error: { message: 'network error' } });
    const user = userEvent.setup();
    render(<SuccessScreen nombre="Ana" />);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByText('VER MI PROTOCOLO'));
    await screen.findByLabelText('Código de 8 dígitos');

    await user.click(screen.getByText('¿No llegó? Reenviar código'));

    expect(await screen.findByText(/No pudimos reenviar el código/)).toBeInTheDocument();
    expect(screen.getByLabelText('Código de 8 dígitos')).toBeInTheDocument();
    expect(screen.getByText('¿No llegó? Reenviar código')).toBeInTheDocument();
  });

  it('muestra un mensaje distinto de límite de intentos cuando Supabase responde 429 al verificar', async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    verifyOtp.mockResolvedValue({
      data: { user: null, session: null },
      error: { status: 429, message: 'rate limited' },
    });
    const user = userEvent.setup();
    render(<SuccessScreen nombre="Ana" />);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByText('VER MI PROTOCOLO'));
    await user.type(await screen.findByLabelText('Código de 8 dígitos'), '00000000');
    await user.click(screen.getByText('Confirmar'));

    expect(await screen.findByText(/Demasiados intentos/)).toBeInTheDocument();
    expect(screen.queryByText(/Código incorrecto o expirado/)).not.toBeInTheDocument();
    expect(completeSignIn).not.toHaveBeenCalled();
  });

  it('no completa el acceso si verifyOtp devuelve un usuario pero sin sesión', async () => {
    signInWithOtp.mockResolvedValue({ error: null });
    verifyOtp.mockResolvedValue({ data: { user: { id: 'user-1' }, session: null }, error: null });
    const user = userEvent.setup();
    render(<SuccessScreen nombre="Ana" />);
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByText('VER MI PROTOCOLO'));
    await user.type(await screen.findByLabelText('Código de 8 dígitos'), '12345678');
    await user.click(screen.getByText('Confirmar'));

    expect(await screen.findByText(/Código incorrecto o expirado/)).toBeInTheDocument();
    expect(completeSignIn).not.toHaveBeenCalled();
  });
});
