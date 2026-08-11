import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GraciasPage from './page';

describe('GraciasPage', () => {
  it('muestra el mensaje de confirmación de compra', () => {
    render(<GraciasPage />);
    expect(screen.getByText('¡Gracias por tu compra!')).toBeInTheDocument();
  });

  it('tiene un botón que lleva al inicio del protocolo', () => {
    render(<GraciasPage />);
    expect(screen.getByText('COMENZAR MI PROTOCOLO').closest('a')).toHaveAttribute('href', '/');
  });
});
