import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentProfile } from './profile';

const getUser = vi.fn();
const single = vi.fn();
const redirect = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => redirect(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: () => getUser() },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => single(),
        }),
      }),
    }),
  }),
}));

describe('getCurrentProfile', () => {
  beforeEach(() => {
    getUser.mockReset();
    single.mockReset();
    redirect.mockReset();
  });

  it('devuelve el perfil cuando hay sesión y perfil existente', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    single.mockResolvedValue({ data: { id: 'user-1', nombre: 'Ana', peso: 70 } });
    const profile = await getCurrentProfile();
    expect(profile).toEqual({ id: 'user-1', nombre: 'Ana', peso: 70 });
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirige a / si no hay usuario', async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    single.mockResolvedValue({ data: null });
    await getCurrentProfile();
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('redirige a / si no hay fila de perfil', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    single.mockResolvedValue({ data: null });
    await getCurrentProfile();
    expect(redirect).toHaveBeenCalledWith('/');
  });
});
