import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeightGoalStep } from './WeightGoalStep';

describe('WeightGoalStep', () => {
  it('muestra el título y las 4 opciones exactas', () => {
    render(<WeightGoalStep value={null} onSelect={() => {}} current={7} total={8} />);
    expect(screen.getByText('Quantos quilos você quer eliminar?')).toBeInTheDocument();
    expect(screen.getByText('Até 5 kg')).toBeInTheDocument();
    expect(screen.getByText('5 a 10 kg')).toBeInTheDocument();
    expect(screen.getByText('10 a 20 kg')).toBeInTheDocument();
    expect(screen.getByText('Mais de 20 kg')).toBeInTheDocument();
  });

  it('llama a onSelect con el value correcto', async () => {
    const onSelect = vi.fn();
    render(<WeightGoalStep value={null} onSelect={onSelect} current={7} total={8} />);
    await userEvent.click(screen.getByText('Mais de 20 kg'));
    expect(onSelect).toHaveBeenCalledWith('mais-20');
  });
});
