import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingFunnel } from './OnboardingFunnel';
import { useOnboardingStore } from '@/lib/store';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('OnboardingFunnel', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it('renderiza la primera pantalla (nombre)', () => {
    render(<OnboardingFunnel />);
    expect(screen.getByText('¿Cuál es tu nombre?')).toBeInTheDocument();
  });

  it('avanza de una pantalla a otra al completar cada paso', async () => {
    render(<OnboardingFunnel />);
    await userEvent.type(screen.getByPlaceholderText('Tu primer nombre'), 'Ana');
    await userEvent.click(screen.getByText('CONTINUAR'));
    expect(screen.getByText('¿Cuál es tu peso actual hoy?')).toBeInTheDocument();
    expect(useOnboardingStore.getState().answers.nombre).toBe('Ana');
  });

  it('recorre las 8 etapas y llega a la pantalla de éxito con el nombre correcto', async () => {
    useOnboardingStore.getState().setAnswer('nombre', 'Ana');
    useOnboardingStore.getState().goToIndex(7);
    render(<OnboardingFunnel />);
    const user = userEvent.setup();
    await user.click(screen.getByText('FINALIZAR'));
    expect(screen.getByText('Armando tu protocolo personalizado…')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Ana')).toBeInTheDocument();
    }, { timeout: 5000 });
    expect(screen.getByText(/Protocolo listo/)).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
  });
});
