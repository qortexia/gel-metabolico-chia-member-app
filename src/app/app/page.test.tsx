import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppPage from './page';
import { redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

let singleResult: { data: { nombre: string } | null } = { data: { nombre: 'Ana' } };

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'user-1' } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve(singleResult),
        }),
      }),
    }),
  }),
}));

describe('AppPage', () => {
  beforeEach(() => {
    vi.mocked(redirect).mockReset();
    singleResult = { data: { nombre: 'Ana' } };
  });

  it('muestra un saludo con el nombre del perfil', async () => {
    render(await AppPage());
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
  });

  it('redirige a / si no existe un perfil para el usuario', async () => {
    singleResult = { data: null };
    render(await AppPage());
    expect(redirect).toHaveBeenCalledWith('/');
  });
});
