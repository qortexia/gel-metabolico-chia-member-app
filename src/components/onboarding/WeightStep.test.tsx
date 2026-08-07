import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeightStep } from './WeightStep';

describe('WeightStep', () => {
  it('muestra el título, subtítulo y el valor con sufijo kg', () => {
    render(<WeightStep value={65} onChange={() => {}} onContinue={() => {}} current={2} total={8} />);
    expect(screen.getByText('Qual seu peso atual hoje?')).toBeInTheDocument();
    expect(screen.getByText('Usamos pra calcular sua dose ideal')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('llama a onContinue al hacer clic en Continuar', async () => {
    const onContinue = vi.fn();
    render(<WeightStep value={65} onChange={() => {}} onContinue={onContinue} current={2} total={8} />);
    await userEvent.click(screen.getByText('CONTINUAR'));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
