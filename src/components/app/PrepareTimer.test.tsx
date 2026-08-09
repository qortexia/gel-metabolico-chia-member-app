import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrepareTimer } from './PrepareTimer';

// NOTE: this suite intentionally does NOT use vi.useFakeTimers() + userEvent.click()
// together. That combination deadlocks under jsdom + React 18 here (no MessageChannel,
// so React's scheduler falls back to setTimeout(0), which act() then waits on forever
// once setTimeout is faked) — same issue hit in RecalculateButton.test.tsx (Task 11).
// Unlike MonthCalendar (which only reads `new Date()` and could scope the fake to
// `toFake: ['Date']`), PrepareTimer genuinely depends on `setInterval`, so real timers
// + waitFor(..., { timeout }) is used instead for the click-then-advance flows.
describe('PrepareTimer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra 05:00 y el botón de iniciar antes de arrancar', () => {
    render(<PrepareTimer durationSeconds={300} />);
    expect(screen.getByText('05:00')).toBeInTheDocument();
    expect(screen.getByText('Iniciar timer de 5 min')).toBeInTheDocument();
  });

  it(
    'al iniciar, cuenta hacia atrás cada segundo',
    async () => {
      const user = userEvent.setup();
      render(<PrepareTimer durationSeconds={300} />);
      await user.click(screen.getByText('Iniciar timer de 5 min'));
      // 3 real seconds must pass for the interval to tick down to 04:57.
      await waitFor(
        () => {
          expect(screen.getByText('04:57')).toBeInTheDocument();
        },
        { timeout: 4500 }
      );
    },
    6000
  );

  it(
    'muestra "¡Listo! ✓" cuando llega a 0',
    async () => {
      const user = userEvent.setup();
      render(<PrepareTimer durationSeconds={2} />);
      await user.click(screen.getByText('Iniciar timer de 5 min'));
      await waitFor(
        () => {
          expect(screen.getByText('¡Listo! ✓')).toBeInTheDocument();
        },
        { timeout: 3500 }
      );
    },
    5000
  );
});
