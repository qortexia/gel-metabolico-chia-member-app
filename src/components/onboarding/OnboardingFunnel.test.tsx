import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingFunnel } from './OnboardingFunnel';
import { useOnboardingStore } from '@/lib/store';

describe('OnboardingFunnel', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset();
  });

  it('renderiza la primera pantalla (nombre)', () => {
    render(<OnboardingFunnel />);
    expect(screen.getByText('Qual seu nome?')).toBeInTheDocument();
  });

  it('avanza de una pantalla a otra al completar cada paso', async () => {
    render(<OnboardingFunnel />);
    await userEvent.type(screen.getByPlaceholderText('Seu primeiro nome'), 'Ana');
    await userEvent.click(screen.getByText('CONTINUAR'));
    expect(screen.getByText('Qual seu peso atual hoje?')).toBeInTheDocument();
    expect(useOnboardingStore.getState().answers.nome).toBe('Ana');
  });

  it('recorre las 8 etapas y llega a la pantalla de éxito con el nombre correcto', async () => {
    useOnboardingStore.getState().setAnswer('nome', 'Ana');
    useOnboardingStore.getState().goToIndex(7);
    render(<OnboardingFunnel />);
    const user = userEvent.setup();
    await user.click(screen.getByText('FINALIZAR'));
    expect(screen.getByText('Montando seu protocolo personalizado…')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Ana')).toBeInTheDocument();
    }, { timeout: 5000 });
    expect(screen.getByText(/Protocolo pronto/)).toBeInTheDocument();
  });
});
