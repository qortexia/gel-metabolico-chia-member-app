import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppPage from './page';

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'user-1' } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { nombre: 'Ana' } }),
        }),
      }),
    }),
  }),
}));

describe('AppPage', () => {
  it('muestra un saludo con el nombre del perfil', async () => {
    render(await AppPage());
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
  });
});
