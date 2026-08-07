import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SuccessPlaceholder } from './SuccessPlaceholder';

describe('SuccessPlaceholder', () => {
  it('muestra el nombre y el texto exacto', () => {
    render(<SuccessPlaceholder nombre="Ana" />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText(/Protocolo listo/)).toBeInTheDocument();
    expect(
      screen.getByText('Tu dosis, horarios y checklist de 21 días ya están listos para que empieces ahora.')
    ).toBeInTheDocument();
  });
});
