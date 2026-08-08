import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNav } from './BottomNav';

const usePathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => usePathname(),
}));

describe('BottomNav', () => {
  it('muestra las 3 pestañas', () => {
    usePathname.mockReturnValue('/app');
    render(<BottomNav />);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Receta')).toBeInTheDocument();
    expect(screen.getByText('Progreso')).toBeInTheDocument();
  });

  it('marca Inicio como activa en /app', () => {
    usePathname.mockReturnValue('/app');
    render(<BottomNav />);
    expect(screen.getByText('Inicio').closest('a')).toHaveClass('text-brand');
  });

  it('marca Receta como activa en /app/recipe/prepare', () => {
    usePathname.mockReturnValue('/app/recipe/prepare');
    render(<BottomNav />);
    expect(screen.getByText('Receta').closest('a')).toHaveClass('text-brand');
    expect(screen.getByText('Inicio').closest('a')).not.toHaveClass('text-brand');
  });
});
