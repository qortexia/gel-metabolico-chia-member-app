import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeightGoalGrid } from './WeightGoalGrid';

const OPTIONS = [
  { value: 'hasta-5', label: 'Hasta 5 kg' },
  { value: '5-10', label: '5 a 10 kg' },
];

describe('WeightGoalGrid', () => {
  it('muestra todas las opciones', () => {
    render(<WeightGoalGrid options={OPTIONS} selected={null} onSelect={() => {}} />);
    expect(screen.getByText('Hasta 5 kg')).toBeInTheDocument();
    expect(screen.getByText('5 a 10 kg')).toBeInTheDocument();
  });

  it('marca aria-pressed en la opción seleccionada', () => {
    render(<WeightGoalGrid options={OPTIONS} selected="5-10" onSelect={() => {}} />);
    expect(screen.getByText('5 a 10 kg')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Hasta 5 kg')).toHaveAttribute('aria-pressed', 'false');
  });

  it('llama a onSelect con el value correcto', async () => {
    const onSelect = vi.fn();
    render(<WeightGoalGrid options={OPTIONS} selected={null} onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Hasta 5 kg'));
    expect(onSelect).toHaveBeenCalledWith('hasta-5');
  });
});
