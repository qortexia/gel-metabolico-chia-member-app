import { OfferPage } from '@/components/offer/OfferPage';

export default function DownsellPage() {
  return (
    <OfferPage
      title="KIT DE APOYO"
      subtitle="Las herramientas para no fallar"
      imageSrc="/upsell/kit-de-apoyo.png"
      imageAlt="Kit de Apoyo — las cinco herramientas"
      imageWidth={1536}
      imageHeight={1024}
      priceLabel="$197 MXN"
      benefits={[
        'Lista de compras semanal',
        'Rastreador de 21 días',
        'Guía para comer fuera',
        'Las 12 sustituciones',
        'Recordatorios para imprimir',
      ]}
      acceptHref="https://pay.kiwify.com/IeqleVF"
      acceptLabel="SÍ, QUIERO MI KIT DE APOYO"
      declineHref="/gracias"
      declineLabel="No, gracias. Continuar →"
    />
  );
}
