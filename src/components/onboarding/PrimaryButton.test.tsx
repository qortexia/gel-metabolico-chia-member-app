import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrimaryButton } from './PrimaryButton';

describe('PrimaryButton', () => {
  it('renderiza los children y llama a onClick', async () => {
    const onClick = vi.fn();
    render(<PrimaryButton onClick={onClick}>CONTINUAR</PrimaryButton>);
    expect(screen.getByText('CONTINUAR')).toBeInTheDocument();
    await userEvent.click(screen.getByText('CONTINUAR'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('respeta disabled', () => {
    render(<PrimaryButton onClick={() => {}} disabled>CONTINUAR</PrimaryButton>);
    expect(screen.getByText('CONTINUAR')).toBeDisabled();
  });
});
