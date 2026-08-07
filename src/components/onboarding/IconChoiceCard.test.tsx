import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconChoiceCard } from './IconChoiceCard';

describe('IconChoiceCard', () => {
  it('muestra el ícono, título y descripción', () => {
    render(
      <IconChoiceCard icon="🌅" title="Por la mañana" description="antes del almuerzo" selected={false} onSelect={() => {}} />
    );
    expect(screen.getByText('🌅')).toBeInTheDocument();
    expect(screen.getByText('Por la mañana')).toBeInTheDocument();
    expect(screen.getByText('antes del almuerzo')).toBeInTheDocument();
  });

  it('marca aria-pressed cuando está seleccionado', () => {
    render(
      <IconChoiceCard icon="🌅" title="Por la mañana" description="antes del almuerzo" selected onSelect={() => {}} />
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('llama a onSelect al hacer clic', async () => {
    const onSelect = vi.fn();
    render(
      <IconChoiceCard icon="🌅" title="Por la mañana" description="antes del almuerzo" selected={false} onSelect={onSelect} />
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
