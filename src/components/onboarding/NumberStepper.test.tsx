import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberStepper } from './NumberStepper';

describe('NumberStepper', () => {
  it('muestra el valor y el sufijo', () => {
    render(<NumberStepper value={65} onChange={() => {}} suffix="kg" min={30} max={250} />);
    expect(screen.getByText('65')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('incrementa y decrementa el valor dentro de los límites', async () => {
    const onChange = vi.fn();
    render(<NumberStepper value={65} onChange={onChange} suffix="kg" min={30} max={250} />);
    await userEvent.click(screen.getByLabelText('Aumentar'));
    expect(onChange).toHaveBeenCalledWith(66);
    await userEvent.click(screen.getByLabelText('Disminuir'));
    expect(onChange).toHaveBeenCalledWith(64);
  });

  it('no pasa del mínimo ni del máximo', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<NumberStepper value={30} onChange={onChange} suffix="kg" min={30} max={31} />);
    await userEvent.click(screen.getByLabelText('Disminuir'));
    expect(onChange).toHaveBeenCalledWith(30);
    rerender(<NumberStepper value={31} onChange={onChange} suffix="kg" min={30} max={31} />);
    await userEvent.click(screen.getByLabelText('Aumentar'));
    expect(onChange).toHaveBeenCalledWith(31);
  });
});
