import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CravingStep } from './CravingStep';

describe('CravingStep', () => {
  it('muestra el título exacto', () => {
    render(<CravingStep value={5} onChange={() => {}} onContinue={() => {}} current={6} total={8} />);
    expect(
      screen.getByText('Em escala de 0 a 10, quão descontrolada é sua vontade de doce?')
    ).toBeInTheDocument();
  });

  it('llama a onContinue al hacer clic en Continuar', async () => {
    const onContinue = vi.fn();
    render(<CravingStep value={5} onChange={() => {}} onContinue={onContinue} current={6} total={8} />);
    await userEvent.click(screen.getByText('CONTINUAR'));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
