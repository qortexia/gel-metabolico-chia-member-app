import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PreparePage from './page';

vi.mock('@/lib/profile', () => ({
  getCurrentProfile: () => Promise.resolve({ peso: 60, antojo_dulce: 3, edad: 30 }),
}));

describe('PreparePage', () => {
  it('muestra los 5 pasos con las cantidades correctas', async () => {
    render(await PreparePage());
    expect(screen.getByText(/1\. Reúne los ingredientes/)).toBeInTheDocument();
    expect(screen.getByText(/2\. Mezcla las fibras/)).toBeInTheDocument();
    expect(screen.getByText(/1 cucharada de chía/)).toBeInTheDocument();
    expect(screen.getByText(/3\. Agrega el agua/)).toBeInTheDocument();
    expect(screen.getByText(/4\. Espera a que se forme el gel/)).toBeInTheDocument();
    expect(screen.getByText(/5\. Toma todo el vaso/)).toBeInTheDocument();
  });

  it('incluye el consejo del Dr. Renan', async () => {
    render(await PreparePage());
    expect(screen.getByText('Consejo del Dr. Renan')).toBeInTheDocument();
  });
});
