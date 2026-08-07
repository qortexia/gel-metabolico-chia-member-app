import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingStep } from './OnboardingStep';

describe('OnboardingStep', () => {
  it('muestra el título, subtítulo y los children', () => {
    render(
      <OnboardingStep current={1} total={8} title="Título" subtitle="Sub">
        <p>Contenido</p>
      </OnboardingStep>
    );
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Sub')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('no muestra el botón de volver cuando no se pasa onBack', () => {
    render(
      <OnboardingStep current={1} total={8} title="Título">
        <p>x</p>
      </OnboardingStep>
    );
    expect(screen.queryByLabelText('Volver')).not.toBeInTheDocument();
  });

  it('llama a onBack al hacer clic en el botón de volver', async () => {
    const onBack = vi.fn();
    render(
      <OnboardingStep current={2} total={8} title="Título" onBack={onBack}>
        <p>x</p>
      </OnboardingStep>
    );
    await userEvent.click(screen.getByLabelText('Volver'));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renderiza el footer cuando se pasa', () => {
    render(
      <OnboardingStep current={1} total={8} title="Título" footer={<button>Ir</button>}>
        <p>x</p>
      </OnboardingStep>
    );
    expect(screen.getByText('Ir')).toBeInTheDocument();
  });

  it('mueve el foco al título al montar', () => {
    render(
      <OnboardingStep current={1} total={8} title="Título">
        <p>x</p>
      </OnboardingStep>
    );
    expect(screen.getByText('Título')).toHaveFocus();
  });
});
