import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HungerTimeStep } from './HungerTimeStep';

describe('HungerTimeStep', () => {
  it('muestra el título y las 4 opciones exactas', () => {
    render(<HungerTimeStep value={null} onSelect={() => {}} current={5} total={8} />);
    expect(screen.getByText('¿Cuándo te da más el hambre ansiosa?')).toBeInTheDocument();
    expect(screen.getByText('Por la mañana')).toBeInTheDocument();
    expect(screen.getByText('Por la tarde')).toBeInTheDocument();
    expect(screen.getByText('Por la noche')).toBeInTheDocument();
    expect(screen.getByText('Todo el día')).toBeInTheDocument();
  });

  it('llama a onSelect con el valor correcto al elegir una opción', async () => {
    const onSelect = vi.fn();
    render(<HungerTimeStep value={null} onSelect={onSelect} current={5} total={8} />);
    await userEvent.click(screen.getByText('Por la noche'));
    expect(onSelect).toHaveBeenCalledWith('noche');
  });
});
