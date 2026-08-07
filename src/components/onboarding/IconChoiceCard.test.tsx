import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconChoiceCard } from './IconChoiceCard';

describe('IconChoiceCard', () => {
  it('muestra el ícono, título y descripción', () => {
    render(
      <IconChoiceCard icon="🌅" title="De manhã" description="antes do almoço" selected={false} onSelect={() => {}} />
    );
    expect(screen.getByText('🌅')).toBeInTheDocument();
    expect(screen.getByText('De manhã')).toBeInTheDocument();
    expect(screen.getByText('antes do almoço')).toBeInTheDocument();
  });

  it('marca aria-pressed cuando está seleccionado', () => {
    render(
      <IconChoiceCard icon="🌅" title="De manhã" description="antes do almoço" selected onSelect={() => {}} />
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('llama a onSelect al hacer clic', async () => {
    const onSelect = vi.fn();
    render(
      <IconChoiceCard icon="🌅" title="De manhã" description="antes do almoço" selected={false} onSelect={onSelect} />
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
