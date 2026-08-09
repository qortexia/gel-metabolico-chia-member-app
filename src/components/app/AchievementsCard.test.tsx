import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AchievementsCard } from './AchievementsCard';

describe('AchievementsCard', () => {
  it('muestra cada conquista con candado si está bloqueada y trofeo si está desbloqueada', () => {
    render(
      <AchievementsCard
        achievements={[
          { id: 'first-day', title: 'Primer día completo', unlocked: true },
          { id: 'seven-days', title: '7 días seguidos', unlocked: false },
        ]}
      />
    );
    expect(screen.getByText('Primer día completo')).toBeInTheDocument();
    expect(screen.getByText('7 días seguidos')).toBeInTheDocument();
    expect(screen.getAllByText('🏆')).toHaveLength(1);
    expect(screen.getAllByText('🔒')).toHaveLength(1);
  });
});
