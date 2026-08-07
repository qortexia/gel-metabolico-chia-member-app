'use client';

import { OnboardingStep } from './OnboardingStep';
import { CravingSlider } from './CravingSlider';

type CravingStepProps = {
  value: number;
  onChange: (value: number) => void;
  onContinue: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function CravingStep({ value, onChange, onContinue, onBack, current, total }: CravingStepProps) {
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="Em escala de 0 a 10, quão descontrolada é sua vontade de doce?"
      onBack={onBack}
      footer={
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[44px] w-full rounded-full bg-brand px-6 py-3 text-lg font-bold text-white"
        >
          CONTINUAR
        </button>
      }
    >
      <CravingSlider value={value} onChange={onChange} />
    </OnboardingStep>
  );
}
