import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HungerTimeStep } from './HungerTimeStep';

describe('HungerTimeStep', () => {
  it('muestra el título y las 4 opciones exactas', () => {
    render(<HungerTimeStep value={null} onSelect={() => {}} current={5} total={8} />);
    expect(screen.getByText('Quando a fome ansiosa mais bate em você?')).toBeInTheDocument();
    expect(screen.getByText('De manhã')).toBeInTheDocument();
    expect(screen.getByText('À tarde')).toBeInTheDocument();
    expect(screen.getByText('À noite')).toBeInTheDocument();
    expect(screen.getByText('O dia inteiro')).toBeInTheDocument();
  });

  it('llama a onSelect con el valor correcto al elegir una opción', async () => {
    const onSelect = vi.fn();
    render(<HungerTimeStep value={null} onSelect={onSelect} current={5} total={8} />);
    await userEvent.click(screen.getByText('À noite'));
    expect(onSelect).toHaveBeenCalledWith('noite');
  });
});
