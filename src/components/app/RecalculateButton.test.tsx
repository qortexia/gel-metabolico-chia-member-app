import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecalculateButton } from './RecalculateButton';

describe('RecalculateButton', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('al hacer clic aplica una animación breve y luego la quita', async () => {
    const user = userEvent.setup();
    render(<RecalculateButton />);
    const button = screen.getByText('↺ Recalcular');
    await user.click(button);
    expect(button).toHaveClass('animate-pulse');
    // Wait for the animation to be removed (400ms + margin)
    await waitFor(
      () => {
        expect(button).not.toHaveClass('animate-pulse');
      },
      { timeout: 600 }
    );
  });
});
