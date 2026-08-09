import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecipePage from './page';

vi.mock('@/lib/profile', () => ({
  getCurrentProfile: () => Promise.resolve({ peso: 60, antojo_dulce: 3, edad: 30 }),
}));

describe('RecipePage', () => {
  it('muestra los ingredientes calculados desde el perfil', async () => {
    render(await RecipePage());
    expect(screen.getByText(/Chía — 1 cucharada/)).toBeInTheDocument();
    expect(screen.getByText(/Psyllium — 1 cucharadita/)).toBeInTheDocument();
    expect(screen.getByText(/Agua filtrada — 250 ml/)).toBeInTheDocument();
  });

  it('tiene un enlace a la página de preparación', async () => {
    render(await RecipePage());
    expect(screen.getByText('VER CÓMO PREPARAR →').closest('a')).toHaveAttribute('href', '/app/recipe/prepare');
  });
});
