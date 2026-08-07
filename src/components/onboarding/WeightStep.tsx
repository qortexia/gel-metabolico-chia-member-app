'use client';

import { OnboardingStep } from './OnboardingStep';
import { NumberStepper } from './NumberStepper';

type WeightStepProps = {
  value: number;
  onChange: (value: number) => void;
  onContinue: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function WeightStep({ value, onChange, onContinue, onBack, current, total }: WeightStepProps) {
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="Qual seu peso atual hoje?"
      subtitle="Usamos pra calcular sua dose ideal"
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
      <NumberStepper value={value} onChange={onChange} suffix="kg" min={30} max={250} />
    </OnboardingStep>
  );
}
