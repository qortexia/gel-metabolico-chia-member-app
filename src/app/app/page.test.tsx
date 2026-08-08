import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppPage from './page';

vi.mock('@/lib/profile', () => ({
  getCurrentProfile: () => Promise.resolve({ id: 'user-1', nombre: 'Ana' }),
}));

describe('AppPage', () => {
  it('muestra un saludo con el nombre del perfil', async () => {
    render(await AppPage());
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
  });
});
