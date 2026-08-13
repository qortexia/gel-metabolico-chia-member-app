import { OfferPage } from '@/components/offer/OfferPage';

export default function UpsellPage() {
  return (
    <OfferPage
      title="PROTOCOLO 90 DÍAS"
      subtitle="Las tres fases: adaptación, resultado y mantenimiento"
      imageSrc="/upsell/protocolo-90-dias.png"
      imageAlt="Protocolo 90 Días — las tres fases"
      imageWidth={1024}
      imageHeight={1536}
      priceLabel="$297 MXN"
      benefits={[
        'Fase 1 — Adaptación (días 1 a 30): instala el hábito sin esfuerzo.',
        'Fase 2 — Resultado (días 31 a 60): movimiento, estructura de comidas y registro semanal.',
        'Fase 3 — Mantenimiento (días 61 a 90): uso estratégico del gel para sostener el resultado.',
      ]}
      acceptHref="https://pay.kiwify.com/RfpEvfO"
      acceptLabel="SÍ, QUIERO MI PROTOCOLO DE 90 DÍAS"
      declineHref="/downsell"
      declineLabel="No, gracias. Continuar →"
    />
  );
}
