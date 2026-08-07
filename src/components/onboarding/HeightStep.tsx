'use client';

import { OnboardingStep } from './OnboardingStep';
import { NumberStepper } from './NumberStepper';

type HeightStepProps = {
  value: number;
  onChange: (value: number) => void;
  onContinue: () => void;
  onBack?: () => void;
  current: number;
  total: number;
};

export function HeightStep({ value, onChange, onContinue, onBack, current, total }: HeightStepProps) {
  return (
    <OnboardingStep
      current={current}
      total={total}
      title="Qual sua altura?"
      subtitle="Vai compor seu IMC e meta"
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
      <NumberStepper value={value} onChange={onChange} suffix="cm" min={130} max={220} />
    </OnboardingStep>
  );
}
