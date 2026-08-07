import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WakeTimeStep } from './WakeTimeStep';

describe('WakeTimeStep', () => {
  it('muestra el título, subtítulo y el botón FINALIZAR', () => {
    render(<WakeTimeStep value="07:00" onChange={() => {}} onFinish={() => {}} current={8} total={8} />);
    expect(screen.getByText('¿A qué hora sueles despertar?')).toBeInTheDocument();
    expect(screen.getByText('Para programar tus recordatorios')).toBeInTheDocument();
    expect(screen.getByText('FINALIZAR')).toBeInTheDocument();
  });

  it('llama a onFinish al hacer clic en FINALIZAR', async () => {
    const onFinish = vi.fn();
    render(<WakeTimeStep value="07:00" onChange={() => {}} onFinish={onFinish} current={8} total={8} />);
    await userEvent.click(screen.getByText('FINALIZAR'));
    expect(onFinish).toHaveBeenCalledOnce();
  });
});
