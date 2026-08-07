import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CravingSlider } from './CravingSlider';

describe('CravingSlider', () => {
  it('muestra el valor grande y las etiquetas de los extremos', () => {
    render(<CravingSlider value={5} onChange={() => {}} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('controlado')).toBeInTheDocument();
    expect(screen.getByText('descontrolado')).toBeInTheDocument();
  });

  it('muestra el emoji correcto según el rango del valor', () => {
    const { rerender } = render(<CravingSlider value={0} onChange={() => {}} />);
    expect(screen.getByText('😌')).toBeInTheDocument();
    rerender(<CravingSlider value={7} onChange={() => {}} />);
    expect(screen.getByText('😩')).toBeInTheDocument();
    rerender(<CravingSlider value={10} onChange={() => {}} />);
    expect(screen.getByText('🤯')).toBeInTheDocument();
  });

  it('llama a onChange con el nuevo valor al mover el slider', () => {
    const onChange = vi.fn();
    render(<CravingSlider value={5} onChange={onChange} />);
    const slider = screen.getByLabelText('Nivel de antojo de dulce, de 0 a 10');
    Object.defineProperty(slider, 'value', { value: '8', writable: true });
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith(8);
  });
});
