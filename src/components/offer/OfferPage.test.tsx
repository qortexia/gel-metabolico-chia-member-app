import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfferPage } from './OfferPage';

const baseProps = {
  title: 'PROTOCOLO 90 DÍAS',
  subtitle: 'Las tres fases: adaptación, resultado y mantenimiento',
  imageSrc: '/upsell/protocolo-90-dias.png',
  imageAlt: 'Protocolo 90 Días',
  imageWidth: 1024,
  imageHeight: 1536,
  priceLabel: '$297 MXN',
  benefits: ['Fase 1 — Adaptación', 'Fase 2 — Resultado', 'Fase 3 — Mantenimiento'],
  acceptHref: 'https://pay.kiwify.com/RfpEvfO',
  acceptLabel: 'SÍ, QUIERO MI PROTOCOLO DE 90 DÍAS',
  declineHref: '/downsell',
  declineLabel: 'No, gracias. Continuar →',
};

describe('OfferPage', () => {
  it('muestra el título, subtítulo y precio', () => {
    render(<OfferPage {...baseProps} />);
    expect(screen.getByText('PROTOCOLO 90 DÍAS')).toBeInTheDocument();
    expect(
      screen.getByText('Las tres fases: adaptación, resultado y mantenimiento')
    ).toBeInTheDocument();
    expect(screen.getByText('$297 MXN')).toBeInTheDocument();
  });

  it('muestra todos los beneficios', () => {
    render(<OfferPage {...baseProps} />);
    baseProps.benefits.forEach((benefit) => {
      expect(screen.getByText(benefit)).toBeInTheDocument();
    });
  });

  it('el enlace de aceptar apunta al href recibido', () => {
    render(<OfferPage {...baseProps} />);
    expect(
      screen.getByText('SÍ, QUIERO MI PROTOCOLO DE 90 DÍAS').closest('a')
    ).toHaveAttribute('href', 'https://pay.kiwify.com/RfpEvfO');
  });

  it('el enlace de rechazar apunta al href recibido', () => {
    render(<OfferPage {...baseProps} />);
    expect(screen.getByText('No, gracias. Continuar →').closest('a')).toHaveAttribute(
      'href',
      '/downsell'
    );
  });
});
