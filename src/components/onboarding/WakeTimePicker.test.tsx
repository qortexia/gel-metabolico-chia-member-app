import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WakeTimePicker } from './WakeTimePicker';

describe('WakeTimePicker', () => {
  it('muestra el valor y el texto auxiliar', () => {
    render(<WakeTimePicker value="07:00" onChange={() => {}} />);
    expect(screen.getByLabelText('Hora en que despiertas')).toHaveValue('07:00');
    expect(screen.getByText('toca para ajustar')).toBeInTheDocument();
  });

  it('llama a onChange con el nuevo valor', () => {
    const onChange = vi.fn();
    render(<WakeTimePicker value="07:00" onChange={onChange} />);
    const input = screen.getByLabelText('Hora en que despiertas');
    Object.defineProperty(input, 'value', { value: '08:30', writable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('08:30');
  });
});
