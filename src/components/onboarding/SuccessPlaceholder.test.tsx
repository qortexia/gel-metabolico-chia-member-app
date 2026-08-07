import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SuccessPlaceholder } from './SuccessPlaceholder';

describe('SuccessPlaceholder', () => {
  it('muestra el nombre y el texto exacto', () => {
    render(<SuccessPlaceholder nome="Ana" />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText(/Protocolo pronto/)).toBeInTheDocument();
    expect(
      screen.getByText('Sua dose, horários e checklist de 21 dias estão prontinhos pra você começar agora.')
    ).toBeInTheDocument();
  });
});
