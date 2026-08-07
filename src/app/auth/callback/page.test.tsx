import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CallbackPage from './page';
import { createClient } from '@/lib/supabase/client';

const getUser = vi.fn();
const from = vi.fn();
const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: () => getUser() },
    from: (...args: unknown[]) => from(...args),
  })),
}));

function mockProfilesTable({ existing }: { existing: boolean }) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: existing ? { id: 'user-1' } : null });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const insert = vi.fn().mockResolvedValue({ error: null });
  from.mockReturnValue({ select, insert });
  return { insert };
}

describe('CallbackPage', () => {
  beforeEach(() => {
    push.mockReset();
    from.mockReset();
    getUser.mockReset();
    localStorage.clear();
    vi.mocked(createClient).mockImplementation(() => ({
      auth: { getUser: () => getUser() },
      from: (...args: unknown[]) => from(...args),
    }) as unknown as ReturnType<typeof createClient>);
  });

  it('redirige a /app directamente si ya existe un perfil para este usuario', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockProfilesTable({ existing: true });
    render(<CallbackPage />);
    await waitFor(() => expect(push).toHaveBeenCalledWith('/app'));
  });

  it('crea el perfil desde localStorage y redirige a /app cuando no existe perfil aún', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const { insert } = mockProfilesTable({ existing: false });
    localStorage.setItem(
      'gel-chia-member-onboarding',
      JSON.stringify({
        state: {
          answers: {
            nombre: 'Ana',
            peso: 70,
            estatura: 165,
            edad: 30,
            horarioHambre: 'tarde',
            antojoDulce: 7,
            metaPeso: '5-10',
            horaDespertar: '07:30',
          },
        },
      })
    );
    render(<CallbackPage />);
    await waitFor(() => expect(insert).toHaveBeenCalledWith({
      id: 'user-1',
      nombre: 'Ana',
      peso: 70,
      estatura: 165,
      edad: 30,
      horario_hambre: 'tarde',
      antojo_dulce: 7,
      meta_peso: '5-10',
      hora_despertar: '07:30',
    }));
    expect(push).toHaveBeenCalledWith('/app');
  });

  it('muestra un error si no hay sesión ni datos guardados', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    render(<CallbackPage />);
    expect(await screen.findByText(/No pudimos completar tu acceso/)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('muestra un error si falla la creación del perfil, y no borra las respuestas guardadas', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const maybeSingle = vi.fn().mockResolvedValue({ data: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const insert = vi.fn().mockResolvedValue({ error: { message: 'constraint violation' } });
    from.mockReturnValue({ select, insert });
    localStorage.setItem(
      'gel-chia-member-onboarding',
      JSON.stringify({
        state: {
          answers: {
            nombre: 'Ana',
            peso: 70,
            estatura: 165,
            edad: 30,
            horarioHambre: 'tarde',
            antojoDulce: 7,
            metaPeso: '5-10',
            horaDespertar: '07:30',
          },
        },
      })
    );
    render(<CallbackPage />);
    expect(await screen.findByText(/No pudimos completar tu acceso/)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(localStorage.getItem('gel-chia-member-onboarding')).not.toBeNull();
  });

  it('muestra el estado de error existente en vez de crashear si createClient lanza una excepción (env mal configurado)', async () => {
    vi.mocked(createClient).mockImplementation(() => {
      throw new Error('Missing Supabase env vars');
    });
    render(<CallbackPage />);
    expect(await screen.findByText(/No pudimos completar tu acceso/)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
